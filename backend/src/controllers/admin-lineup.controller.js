import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import multer from 'multer';
import { executeQuery } from "../lib/executeQuery.js";
import db from "../lib/db.js";
import { format } from "date-fns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer storage for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../../../uploads/resumes");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `temp-resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const resumeUpload = multer({ storage: resumeStorage }).single("resume");

function getUploadedResumePath(file, candidateId) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = ['.pdf', '.doc', '.docx'];

  if (!allowedTypes.includes(ext)) {
    throw new Error('Only PDF, DOC, and DOCX files are allowed');
  }

  const uploadDir = path.resolve(__dirname, '../../../uploads/resumes');
  const fileName = `${candidateId}_resume${ext}`;
  const targetPath = path.join(uploadDir, fileName);

  fs.renameSync(file.path, targetPath);

  return `/uploads/resumes/${fileName}`;
};

export const getLineups = async (req, res) => {
  const { search, processName, clientName, startDate, endDate, status} = req.body;
  try {
    let query = `SELECT
                ca.id,
                ca.candidate_id,
                c.name AS candidate_name,
                c.phone AS candidate_phone,
                c.resume_pdf_path,
                p.id AS process_id,
                p.process_name,
                cl.client_name,
                ca.assignment_status,
                latest_status.new_status AS latest_status,
                ca.created_at,
                e.full_name
            FROM candidate_assignments ca
            LEFT JOIN candidates c ON ca.candidate_id = c.id
            LEFT JOIN processes p ON ca.process_id = p.id
            LEFT JOIN clients cl ON p.client_id = cl.id
            INNER JOIN (
                SELECT ea1.candidate_id, ea1.employee_id
                FROM employee_assignments ea1
                INNER JOIN (
                    SELECT candidate_id, MAX(assignment_date) AS max_date
                    FROM employee_assignments
                    GROUP BY candidate_id
                ) ea2
                    ON ea1.candidate_id = ea2.candidate_id
                  AND ea1.assignment_date = ea2.max_date
            ) latest_ea ON latest_ea.candidate_id = ca.candidate_id
            INNER JOIN employees e ON e.employee_id = latest_ea.employee_id
            LEFT JOIN (
              SELECT candidate_id, new_status
              FROM (
                  SELECT *,
                        ROW_NUMBER() OVER (PARTITION BY candidate_id ORDER BY changed_at DESC) rn
                  FROM candidate_status_history
              ) t
              WHERE rn = 1
            ) latest_status ON latest_status.candidate_id = ca.candidate_id
            WHERE ca.assignment_status NOT IN (
                'available',
                'joined',
                'clawback',
                'invoice',
                'completely_joined',
                'dropout'
            )`;

  const params = [];

  if (search && search.trim()) {
    query += `
      AND (
        c.name LIKE ?
        OR ca.candidate_id LIKE ?
        OR e.full_name LIKE ?
      )
    `;
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // client name
  if (clientName) {
    query += " AND cl.client_name LIKE ?";
    params.push(`%${clientName}%`);
  }

  // process name
  if (processName) {
    query += " AND p.process_name LIKE ?";
    params.push(`%${processName}%`);
  }

  // created_at date range
  if (startDate && endDate) {
    query += " AND ca.created_at BETWEEN ? AND ?";
    params.push(startDate, endDate);
  }

  if (status) {
    query += " AND latest_status.new_status = ?";
    params.push(status);
  }

  query += " ORDER BY ca.created_at DESC";

  const rows = await executeQuery(query, params);

  return res.status(200).json(rows);
  } catch (error) {
      console.error("Error while fetching line-ups:", error);
      return res.status(500).send(error);
  }
};

export const addCallLog = async (req, res) => {
  const {candidate_id, employee_id} = req.body;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    // 1. Insert call log 
    await connection.query(`INSERT INTO candidate_call_logs (candidate_id, employee_id) VALUES (?, ?)`, [candidate_id, employee_id]);
    // 2. Update candidate_assignments
    await connection.query(`UPDATE candidate_assignments SET assignment_status = 'ringing' WHERE candidate_id = ?`, [candidate_id]);
    // 3. Insert employee_assignments 
    await connection.query(`UPDATE employee_assignments SET status = 'in_progress' WHERE candidate_id = ?`, [candidate_id]);
    // 4. Get assignment id
    const [assignmentRows] = await connection.query(`SELECT id  FROM employee_assignments WHERE candidate_id = ? LIMIT 1`, [candidate_id]);
    if (!assignmentRows.length) {
      throw new Error("Assignment not found");
    }
    const assignment_id = assignmentRows[0].id;
    // 5. Insert work action
    await connection.query(
      `INSERT INTO candidate_work_actions (assignment_id, employee_id, candidate_id, action_type) VALUES (?, ?, ?, 'ring')`,
      [assignment_id, employee_id, candidate_id]
    );
    // 6. Get last old status
    const [statusRows] = await connection.query(
      `SELECT new_status FROM candidate_status_history WHERE candidate_id = ? ORDER BY changed_at DESC LIMIT 1`, [candidate_id]);
    const old_status = statusRows.length ? statusRows[0].new_status : null;
    // 7. Insert status history
    await connection.query(
      `INSERT INTO candidate_status_history (candidate_id, employee_id, old_status, new_status) VALUES (?, ?, ?, 'ring')`,
      [candidate_id, employee_id, old_status]
    );
    await connection.commit();
    return res.json({
      message: "Candidate marked as ring successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while making candidate status as ring",
    });
  } finally {
    connection.release();
  }
};

export const dropCandidate = async (req, res) => {
  const candidate_id = req.query.candidateId;
  const { employee_id, reason } = req.body;

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update candidate assignment
    await connection.query(
      `UPDATE candidate_assignments 
       SET assignment_status = 'dropout' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 2. Update employee assignment
    await connection.query(
      `UPDATE employee_assignments 
       SET status = 'dropped' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 3. Get assignment id
    const [assignmentRows] = await connection.query(
      `SELECT id 
       FROM employee_assignments 
       WHERE candidate_id = ? 
       LIMIT 1`,
      [candidate_id]
    );

    if (!assignmentRows.length) {
      throw new Error("Assignment not found");
    }

    const assignment_id = assignmentRows[0].id;

    // 4. Insert work action
    await connection.query(
      `INSERT INTO candidate_work_actions 
       (assignment_id, employee_id, candidate_id, action_type, drop_reason)
       VALUES (?, ?, ?, 'drop', ?)`,
      [assignment_id, employee_id, candidate_id, reason]
    );

    // 5. Get last old status
    const [statusRows] = await connection.query(
      `SELECT new_status 
       FROM candidate_status_history 
       WHERE candidate_id = ?
       ORDER BY changed_at DESC
       LIMIT 1`,
      [candidate_id]
    );

    const old_status = statusRows.length ? statusRows[0].new_status : null;

    // 6. Insert status history
    await connection.query(
      `INSERT INTO candidate_status_history
       (candidate_id, employee_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, 'dropout', ?)`,
      [candidate_id, employee_id, old_status, reason]
    );

    await connection.commit();

    return res.json({
      message: "Candidate marked as dropout successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while dropping candidate",
    });
  } finally {
    connection.release();
  }
};

export const getLineUpById = async (req, res) => {
  try {
    const assignment_id = req.query.assignment_id;

    const query = `
      SELECT
        ca.candidate_id,
        c.name AS candidate_name,
        c.phone AS candidate_phone,
        p.process_name
      FROM candidate_assignments ca
      LEFT JOIN candidates c ON ca.candidate_id = c.id
      LEFT JOIN processes p ON ca.process_id = p.id
      LEFT JOIN clients cl ON p.client_id = cl.id
      WHERE ca.id = ?
    `;

    const lineUp = await executeQuery(query, [assignment_id]);
    return res.status(200).json(lineUp);
  } catch (error) {
    console.error(error);
    return res.status(500).json({message: "An error occurred while fetching line-up by id"});
  }
};

export const editLineUp = async (req, res) => {
  const { candidate_id, employee_id, assigned_employee, process_id } = req.body;
  if (!candidate_id || !employee_id) {
    return res.status(400).json({
      message: "candidate_id and employee_id are required",
    });
  }
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [employeeIdINT] = await connection.query(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
    const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

    if (assigned_employee) {
      // Check duplicate assignment
      const [existing] = await connection.query(
        `SELECT id FROM employee_assignments 
         WHERE employee_id = ? AND candidate_id = ?`,
        [assigned_employee, candidate_id]
      );

      if (existing.length > 0) {
        throw new Error("Candidate is already assigned to this employee");
      }
    
      const [dataType] = await connection.query(
        `SELECT data_type_id
         FROM candidates 
         WHERE id = ?
         LIMIT 1`,
        [candidate_id]
      );

      const data_type_id = dataType.length ? dataType[0].data_type_id : null;

      if (!data_type_id) {
        throw new Error("data_type_id not found for assignment");
      }
      
      await connection.query(
        `INSERT INTO employee_assignments 
         (employee_id, candidate_id, data_type_id, status, assigned_by)
         VALUES (?, ?, ?, 'assigned', ?)`,
        [assigned_employee, candidate_id, data_type_id, employee_id]
      );
    }

    if (process_id) {
      const [existingAssignment] = await connection.query(
        `SELECT id FROM candidate_assignments WHERE candidate_id = ?`,
        [candidate_id]
      );

      if (existingAssignment.length > 0) {
        await connection.query(
          `UPDATE candidate_assignments
           SET process_id = ?,
               assignment_status = 'process_assigned',
               assigned_by = ?
           WHERE candidate_id = ?`,
          [process_id, employee_id_int, candidate_id]
        );
      } else {
        await connection.query(
          `INSERT INTO candidate_assignments
           (candidate_id, process_id, assignment_status, assigned_by)
           VALUES (?, ?, 'process_assigned', ?)`,
          [candidate_id, process_id, employee_id_int]
        );
      }
    }

    await connection.commit();
    return res.status(200).json({
      message: "Line-up updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Edit LineUp Error:", error.message);

    return res.status(400).json({
      message: error.message || "Failed to update line-up",
    });
  } finally {
    connection.release();
  }
};

export const getProcess = async (req, res) => {
    try {
        const query = `SELECT id as process_id, process_name FROM processes ORDER BY process_name`;
        const processes = await executeQuery(query);
        res.status(200).json(processes);
    } catch (error) {
        console.error("Error while fetching process names:", error);
        res.status(400).send(error);
    }
};

export const getEmployees = async (req, res) => {
    try {
        var query = `SELECT employee_id as assigned_employee, full_name FROM employees WHERE status = 'active' ORDER BY full_name`;
        const employeesForDroupdown = await executeQuery(query);
        if(employeesForDroupdown.length === 0) {
            return res.status(404).json({ message: "No employees found" });
        }
        res.status(200).json(employeesForDroupdown);
    } catch (error) {
        console.error("Error while fetching employees:", error);
        res.status(400).json(error);
    }
}

export const addToTracker = async (req, res) => {
  resumeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'File upload failed',
      });
    }

    const { candidate_id, employee_id, process_id } = req.body;
    const connection = await db.promise().getConnection();
    try {
      await connection.beginTransaction();
      const [employeeIdINT] = await connection.query(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
      const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

      // 1. Update candidate assignment
      // await connection.query(
      //   `UPDATE candidate_assignments 
      //   SET assignment_status = 'joined' 
      //   WHERE candidate_id = ?`,
      //   [candidate_id]
      // );

      if (process_id) {
        const [existingAssignment] = await connection.query(
          `SELECT id FROM candidate_assignments WHERE candidate_id = ?`,
          [candidate_id]
        );

        if (existingAssignment.length > 0) {
          await connection.query(
            `UPDATE candidate_assignments
            SET process_id = ?,
                assignment_status = 'joined',
                assigned_by = ?
            WHERE candidate_id = ?`,
            [process_id, employee_id_int, candidate_id]
          );
        } else {
          await connection.query(
            `INSERT INTO candidate_assignments
            (candidate_id, process_id, assignment_status, assigned_by)
            VALUES (?, ?, 'joined', ?)`,
            [candidate_id, process_id, employee_id_int]
          );
        }
      }

      // 2. Update employee assignment
      await connection.query(
        `UPDATE employee_assignments 
        SET status = 'in_progress' 
        WHERE candidate_id = ?`,
        [candidate_id]
      );

      // 3. Get assignment id
      const [assignmentRows] = await connection.query(
        `SELECT id 
        FROM employee_assignments 
        WHERE candidate_id = ? 
        LIMIT 1`,
        [candidate_id]
      );

      if (!assignmentRows.length) {
        throw new Error("Assignment not found");
      }

      const assignment_id = assignmentRows[0].id;

      // 4. Insert work action
      await connection.query(
        `INSERT INTO candidate_work_actions 
        (assignment_id, employee_id, candidate_id, action_type)
        VALUES (?, ?, ?, 'done')`,
        [assignment_id, employee_id, candidate_id]
      );

      // 5. Get last old status
      const [statusRows] = await connection.query(
        `SELECT new_status 
        FROM candidate_status_history 
        WHERE candidate_id = ?
        ORDER BY changed_at DESC
        LIMIT 1`,
        [candidate_id]
      );

      const old_status = statusRows.length ? statusRows[0].new_status : null;

      // 6. Insert status history
      await connection.query(
        `INSERT INTO candidate_status_history
        (candidate_id, employee_id, old_status, new_status)
        VALUES (?, ?, ?, 'joined')`,
        [candidate_id, employee_id, old_status]
      );

      await connection.commit();

      return res.json({
        message: "Candidate added to tracker successfully",
      });
    } catch (error) {
      await connection.rollback();
      console.error(error);
      return res.status(500).json({
        message: "An error occurred while adding candidate to tacker",
      });
    } finally {
      connection.release();
    }
});
}

export const addNote = async (req, res) => {
  const { candidate_id, note } = req.body;

  if (!candidate_id || !note) {
    return res.status(400).json({
      message: "candidate_id and note are required",
    });
  }

  try {
    const query = `
      UPDATE candidate_assignments
      SET notes = ?
      WHERE candidate_id = ?
    `;

    await executeQuery(query, [note, candidate_id]);

    return res.status(200).json({
      message: "Note added successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while adding note",
    });
  }
};

export const holdCandidate = async (req, res) => {
  const candidate_id = req.query.candidateId;
  const { employee_id, reason } = req.body;

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update candidate assignment
    await connection.query(
      `UPDATE candidate_assignments 
       SET assignment_status = 'hold' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 2. Update employee assignment
    await connection.query(
      `UPDATE employee_assignments 
       SET status = 'in_progress' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 3. Get assignment id
    const [assignmentRows] = await connection.query(
      `SELECT id 
       FROM employee_assignments 
       WHERE candidate_id = ? 
       LIMIT 1`,
      [candidate_id]
    );

    if (!assignmentRows.length) {
      throw new Error("Assignment not found");
    }

    const assignment_id = assignmentRows[0].id;

    // 4. Insert work action
    await connection.query(
      `INSERT INTO candidate_work_actions 
       (assignment_id, employee_id, candidate_id, action_type)
       VALUES (?, ?, ?, 'start_work')`,
      [assignment_id, employee_id, candidate_id]
    );

    // 5. Get last old status
    const [statusRows] = await connection.query(
      `SELECT new_status 
       FROM candidate_status_history 
       WHERE candidate_id = ?
       ORDER BY changed_at DESC
       LIMIT 1`,
      [candidate_id]
    );

    const old_status = statusRows.length ? statusRows[0].new_status : null;

    // 6. Insert status history
    await connection.query(
      `INSERT INTO candidate_status_history
       (candidate_id, employee_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, 'hold', ?)`,
      [candidate_id, employee_id, old_status, reason]
    );

    await connection.commit();

    return res.json({
      message: "Candidate marked as hold successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while marking candidate as hold",
    });
  } finally {
    connection.release();
  }
};

export const passCandidate = async (req, res) => {const candidate_id = req.query.candidateId;
  const { employee_id, reason } = req.body;

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update candidate assignment
    await connection.query(
      `UPDATE candidate_assignments 
       SET assignment_status = 'pass' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 2. Update employee assignment
    await connection.query(
      `UPDATE employee_assignments 
       SET status = 'passed' 
       WHERE candidate_id = ?`,
      [candidate_id]
    );

    // 3. Get assignment id
    const [assignmentRows] = await connection.query(
      `SELECT id 
       FROM employee_assignments 
       WHERE candidate_id = ? 
       LIMIT 1`,
      [candidate_id]
    );

    if (!assignmentRows.length) {
      throw new Error("Assignment not found");
    }

    const assignment_id = assignmentRows[0].id;

    // 4. Insert work action
    await connection.query(
      `INSERT INTO candidate_work_actions 
       (assignment_id, employee_id, candidate_id, action_type)
       VALUES (?, ?, ?, 'pass')`,
      [assignment_id, employee_id, candidate_id]
    );

    // 5. Get last old status
    const [statusRows] = await connection.query(
      `SELECT new_status 
       FROM candidate_status_history 
       WHERE candidate_id = ?
       ORDER BY changed_at DESC
       LIMIT 1`,
      [candidate_id]
    );

    const old_status = statusRows.length ? statusRows[0].new_status : null;

    // 6. Insert status history
    await connection.query(
      `INSERT INTO candidate_status_history
       (candidate_id, employee_id, old_status, new_status, change_reason)
       VALUES (?, ?, ?, 'pass', ?)`,
      [candidate_id, employee_id, old_status, reason]
    );

    await connection.commit();
    return res.json({
      message: "Candidate marked as pass successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while marking candidate as pass",
    });
  } finally {
    connection.release();
  }
};

export const addResume = async (req, res) => {
  resumeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || 'File upload failed',
      });
    }

    const { candidate_id } = req.body;

    try {
      // Move & rename resume
      const resumePath = getUploadedResumePath(req.file, candidate_id);

      // Save path to DB
      const query = `
        UPDATE candidates
        SET resume_pdf_path = ?
        WHERE id = ?
      `;

      await executeQuery(query, [resumePath, candidate_id]);

      return res.status(200).json({
        message: "Resume uploaded successfully",
        resume_path: resumePath,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "An error occurred while uploading resume",
      });
    }
  });
};

export const addCandidate = async (req, res) => {
  resumeUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({message: 'File upload failed'});
    }

    const {name, email, gender, phone, address, experience_level, employee_id} = req.body;
    if(!name || !phone) {
      return res.status(400).json({message: "Name and phone number are mandatory."});
    }
    if(phone.length !== 10) {
      return res.status(400).json({message: "Phone number must contain exactly 10 digits."});
    }
    const employeeIdINT = await executeQuery(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
    const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;
    const data_type_id = await executeQuery(`SELECT id FROM data_types where type_name = ?`, ["Manual addition"]);

    const connection = await db.promise().getConnection(); 
    try {
      await connection.beginTransaction();
      let [data] = await connection.query(`SELECT * FROM candidates WHERE phone = ?`, [phone]);

      if(data.length !== 0){
        if (req.file) {
          const resumePath = getUploadedResumePath(req.file, data[0].id);
          await connection.query(`UPDATE candidates SET resume_pdf_path = ?, status = ?, uploaded_by_employee_id = ?  WHERE id = ?`,[resumePath, experience_level, employee_id_int, data[0].id]);
        }
        await connection.query(`UPDATE candidate_assignments SET assignment_status = 'assigned', assigned_by = ? WHERE candidate_id = ?`, [employee_id_int, data[0].id]);

        const [result] = await connection.query(`SELECT * from employee_assignments WHERE candidate_id = ? AND employee_id = ?`, [data[0].id, employee_id]);
        if(result.length === 0){
          await connection.query(`INSERT INTO employee_assignments (employee_id, candidate_id, data_type_id, status, assigned_by)
            VALUES (?, ?, ?, 'assigned', ?)`, [employee_id, data[0].id, data_type_id[0].id, employee_id]);
        }
        
        const [statusRows] = await connection.query(
          `SELECT new_status FROM candidate_status_history WHERE candidate_id = ? ORDER BY changed_at DESC LIMIT 1`, [data[0].id]);
        const old_status = statusRows.length ? statusRows[0].new_status : null;
        await connection.query(
          `INSERT INTO candidate_status_history
          (candidate_id, employee_id, old_status, new_status, change_reason)
          VALUES (?, ?, ?, 'assigned', 'Maually added candidate')`,
          [data[0].id, employee_id, old_status]
        );

        await connection.commit();
        return res.status(200).json({message: "Candidate already exists and has been assigned to you"});
      }
      else {
        const validGenders = ['male','female','other'];
        const genderValue = validGenders.includes(gender?.toLowerCase()) ? gender.toLowerCase() : null;
        const emailValue = email && email.trim() !== '' ? email.trim() : null;

        const [insertResult] = await connection.query(
          `INSERT INTO candidates (name, email, gender, phone, address, experience_level, uploaded_by_employee_id, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'assigned')`,[name, emailValue, genderValue, phone, address, experience_level, employee_id_int]);
        const candidate_id = insertResult.insertId;

        if (req.file) {
          const resumePath = getUploadedResumePath(req.file, candidate_id);
          await connection.query(
            `UPDATE candidates SET resume_pdf_path = ? WHERE id = ?`,
            [resumePath, candidate_id]
          );
        }

        await connection.query(`INSERT INTO candidate_assignments (candidate_id, assignment_status, assigned_by) 
                                VALUES(?, 'assigned', ?)`,[candidate_id, employee_id_int]);

        await connection.query(`INSERT INTO employee_assignments (employee_id, candidate_id, data_type_id, status, assigned_by)
                            VALUES (?, ?, ?, 'assigned', ?)`, [employee_id, candidate_id, data_type_id[0].id, employee_id]);
        
        const [statusRows] = await connection.query(
          `SELECT new_status FROM candidate_status_history WHERE candidate_id = ? ORDER BY changed_at DESC LIMIT 1`, [candidate_id]);
        const old_status = statusRows.length ? statusRows[0].new_status : null;
        await connection.query(
          `INSERT INTO candidate_status_history
          (candidate_id, employee_id, old_status, new_status, change_reason)
          VALUES (?, ?, ?, 'assigned', 'Maually added candidate')`,
          [candidate_id, employee_id, old_status]
        );
      }

      await connection.commit();
      return res.status(200).json({ message: "Candidate added and has been assigned to you"});
    } catch (error) {
        await connection.rollback();
        console.error(error);
        return res.status(500).json({
          message: "An error occurred while adding or updating the candidate. Please try again.",
        });
    } finally {
      connection.release();
    }
  });
};

export const updateCandidateStatus = async (req, res) => {
  const candidate_id = req.query.candidate_id;
  const { employee_id, reason, status } = req.body;

  const STATUS_CONFIG = {
    pass: {
      candidateStatus: "pass",
      employeeStatus: "passed",
      callStatus: null,
      actionType: "pass",
    },
    ringing: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "ringing",
      actionType: "ring",
    },
    answered: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "answered",
      actionType: "start_work",
    },
    not_answered: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "not_answered",
      actionType: "ring",
    },
    busy: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "busy",
      actionType: "ring",
    },
    switch_off: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "switch_off",
      actionType: "ring",
    },
    wrong_number: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "not_answered",
      actionType: "ring",
    },
    callback_requested: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "callback_requested",
      actionType: "ring",
    },
    no_ring: {
      candidateStatus: null,
      employeeStatus: null,
      callStatus: "no_ring",
      actionType: "ring",
    },
    process_assigned: {
      candidateStatus: "process_assigned",
      employeeStatus: "in_progress",
      callStatus: null,
      actionType: "start_work",
    },
    resume_selected: {
      candidateStatus: "resume_selected",
      employeeStatus: "in_progress",
      callStatus: null,
      actionType: "start_work",
    },
    interview_scheduled: {
      candidateStatus: "interview_scheduled",
      employeeStatus: "in_progress",
      callStatus: null,
      actionType: "start_work",
    },
    selected: {
      candidateStatus: "selected",
      employeeStatus: "in_progress",
      callStatus: null,
      actionType: "start_work",
    },
    hold: {
      candidateStatus: "hold",
      employeeStatus: "in_progress",
      callStatus: null,
      actionType: "start_work",
    },
    dropout: {
      candidateStatus: "dropout",
      employeeStatus: "dropped",
      callStatus: null,
      actionType: "drop",
    },
    not_interested: {
      candidateStatus: "not_interested",
      employeeStatus: "passed",
      callStatus: null,
      actionType: "pass",
    },
  };

  const config = STATUS_CONFIG[status];
  if (!config) {
    return res.status(400).json({ message: "Invalid status" });
  }
  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();
    if(config.candidateStatus){
      await connection.query(`UPDATE candidate_assignments SET assignment_status = ?  WHERE candidate_id = ?`, [config.candidateStatus, candidate_id]);
    }
    if(config.employeeStatus){
      await connection.query(`UPDATE employee_assignments SET status = ? WHERE candidate_id = ? AND employee_id = ?`, [config.employeeStatus, candidate_id, employee_id]);
    }
    if(config.callStatus){
      await connection.query(`INSERT INTO candidate_call_logs (candidate_id, employee_id, call_status)  VALUES (?, ?, ?)`, [candidate_id, employee_id, config.callStatus]);
    }
    if(config.actionType){
      const [assignmentRows] = await connection.query(`SELECT id FROM employee_assignments WHERE candidate_id = ? LIMIT 1`, [candidate_id, employee_id]);
      if (!assignmentRows.length) {
        throw new Error("Assignment not found");
      }
      const assignment_id = assignmentRows[0].id;
        await connection.query(
        `INSERT INTO candidate_work_actions (assignment_id, employee_id, candidate_id, action_type, drop_reason) VALUES (?, ?, ?, ?, ?)`,
        [assignment_id, employee_id, candidate_id, config.actionType, status === "dropout" ? reason : null,]);
    }
    const [statusRows] = await connection.query(`SELECT new_status FROM candidate_status_history WHERE candidate_id = ? ORDER BY changed_at DESC LIMIT 1`,[candidate_id]);
    const old_status = statusRows.length ? statusRows[0].new_status : null;
    const new_status = config.candidateStatus===null ? config.callStatus : config.candidateStatus;
    await connection.query(
      `INSERT INTO candidate_status_history (candidate_id, employee_id, old_status, new_status, change_reason) VALUES (?, ?, ?, ?, ?)`,
      [candidate_id, employee_id, old_status, new_status, reason]
    );

    await connection.commit();
    return res.json({
      message: `Candidate marked as ${config.candidateStatus || config.callStatus} successfully`,
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    return res.status(500).json({
      message: "An error occurred while updating candidate status",
    });
  } finally {
    connection.release();
  }
};

export const exportLineUpCSV = async (req, res) => {
  let connection = await db.promise().getConnection();
  try {
    const query = `SELECT
            ca.id,
            ca.candidate_id,
            c.name AS candidate_name,
            c.phone AS candidate_phone,
            p.id AS process_id,
            p.process_name,
            cl.client_name,
            latest_status.new_status AS latest_status,
            ca.created_at,
            e.full_name
        FROM candidate_assignments ca
        LEFT JOIN candidates c ON ca.candidate_id = c.id
        LEFT JOIN processes p ON ca.process_id = p.id
        LEFT JOIN clients cl ON p.client_id = cl.id
        INNER JOIN (
            SELECT ea1.candidate_id, ea1.employee_id
            FROM employee_assignments ea1
            INNER JOIN (
                SELECT candidate_id, MAX(assignment_date) AS max_date
                FROM employee_assignments
                GROUP BY candidate_id
            ) ea2
                ON ea1.candidate_id = ea2.candidate_id
              AND ea1.assignment_date = ea2.max_date
        ) latest_ea ON latest_ea.candidate_id = ca.candidate_id
        INNER JOIN employees e ON e.employee_id = latest_ea.employee_id
        LEFT JOIN (
          SELECT candidate_id, new_status
          FROM (
              SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY candidate_id ORDER BY changed_at DESC) rn
              FROM candidate_status_history
          ) t
          WHERE rn = 1
        ) latest_status ON latest_status.candidate_id = ca.candidate_id
        WHERE ca.assignment_status NOT IN (
            'available',
            'joined',
            'clawback',
            'invoice',
            'completely_joined',
            'dropout'
        )`;

    const [rows] = await connection.query(query);

    // Convert rows to CSV
    const csvRows = [];

    // Add header
    csvRows.push([
      "Candidate ID",
      "Candidate Name",
      "candidate Mobile No",
      "Employee Name",
      "Client Name",
      "Process ID",
      "Process Name",
      "Current Status",
      "Created At",
    ]);

    // Add data rows
    rows.forEach((row) => {
      csvRows.push([
        row.candidate_id,
        row.candidate_name,
        row.candidate_phone,
        row.full_name,
        row.client_name,
        row.process_id,
        row.process_name,
        row.latest_status,
        row.created_at ? format(new Date(row.created_at), "yyyy-MM-dd") : "",
      ]);
    });

    // Convert array of arrays to CSV string
    const csvString = csvRows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    // Send CSV as download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="lineup_data_${format(new Date(), "yyyy-MM-dd")}.csv"`
    );
    res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Disposition"
    );

    res.send(csvString);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export lineup data" });
  } finally {
    if (connection) connection.release();
  }
};
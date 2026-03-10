import { executeQuery } from '../lib/executeQuery.js';
import db from "../lib/db.js";

// export const getAllCandidates = async (req, res) => {
//     try {
//         const search = req.body.search || "";
//         const search_type = req.body.search_type || "all";
//         const status_filter = req.body.status || "All";

//         let query = `SELECT 
//                         c.*,
//                         ca.assignment_status,
//                         ca.matching_score,
//                         ca.assigned_at,
//                         ca.assigned_by,
//                         p.process_name,
//                         p.client_id,
//                         cl.client_name,
//                         e.employee_id,
//                         e.full_name as assigned_employee_name,
//                         uploader.employee_id as uploader_employee_id,
//                         uploader.full_name as uploader_name
//                     FROM candidates c
//                     LEFT JOIN candidate_assignments ca ON c.id = ca.candidate_id
//                     LEFT JOIN processes p ON ca.process_id = p.id
//                     LEFT JOIN clients cl ON p.client_id = cl.id
//                     LEFT JOIN employees e ON ca.assigned_by = e.id
//                     LEFT JOIN employees uploader ON c.uploaded_by_employee_id = uploader.id`;
//         const whereConditions = [];
//         const params = [];

//         if (search) {
//             switch (search_type) {
//                 case "candidate":
//                     whereConditions.push("(c.name LIKE ? OR c.email LIKE ?)");
//                     params.push(`%${search}%`, `%${search}%`);
//                     break;
//                 case "candidate_id":
//                     whereConditions.push("c.id LIKE ?");
//                     params.push(`%${search}%`);
//                     break;
//                 case "client":
//                     whereConditions.push("cl.client_name LIKE ?");
//                     params.push(`%${search}%`);
//                     break;
//                 case "process":
//                     whereConditions.push("p.process_name LIKE ?");
//                     params.push(`%${search}%`);
//                     break;
//                 case "employee":
//                     whereConditions.push("(e.employee_id LIKE ? OR e.full_name LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ?)");
//                     params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
//                     break;
//                 case "all":
//                 default:
//                     whereConditions.push(`(
//                         c.name LIKE ? OR 
//                         c.email LIKE ? OR 
//                         c.phone LIKE ? OR 
//                         c.id LIKE ? OR
//                         cl.client_name LIKE ? OR 
//                         p.process_name LIKE ? OR 
//                         e.employee_id LIKE ? OR 
//                         e.full_name LIKE ? OR
//                         e.first_name LIKE ? OR
//                         e.last_name LIKE ?
//                     )`);
//                     for (let i = 0; i < 10; i++) {
//                         params.push(`%${search}%`);
//                     }
//                     break;
//             }
//         }

//         if (status_filter !== "All") {
//             whereConditions.push("ca.assignment_status = ?");
//             params.push(status_filter);
//         }

//         if (whereConditions.length > 0) {
//             query += " WHERE " + whereConditions.join(" AND ");
//         }

//         query += " ORDER BY ca.matching_score DESC, c.name";

//         const candidates = await executeQuery(query, params);
//         if(candidates.length === 0) {
//             return res.status(404).json({ message: "No candidates found" });
//         }
//         res.status(200).json(candidates);
//     } catch (error) {
//         console.error('Error while fetching candidates:', error);
//         res.status(400).json(error);
//     }
// }

// export const statsByAssignmentStatus = async (req, res) => {
//     try {
//         let query = `SELECT 
//                     assignment_status, 
//                     COUNT(*) as count 
//                     FROM candidate_assignments ca
//                     LEFT JOIN candidates c ON ca.candidate_id = c.id
//                     GROUP BY assignment_status 
//                     ORDER BY count DESC`;
//         const stats = await executeQuery(query);
//         res.status(200).json(stats);
//     } catch (error) {
//         console.error('Error fetching candidate stats:', error);
//         res.status(400).json(error);
//     }
// }

// export const getCandidateById = async (req, res) => {
//     try {
//         const candidateId = req.query.candidateId;
//         if(!candidateId) {
//             return res.status(400).json({ message: "Candidate ID is required" });
//         }

//         let query = `SELECT 
//                     c.*,
//                     ca.assignment_status,
//                     ca.matching_score,
//                     ca.assigned_at,
//                     ca.assigned_by,
//                     p.process_name,
//                     p.client_id,
//                     cl.client_name,
//                     e.employee_id,
//                     e.full_name as assigned_employee_name,
//                     e.email as assigned_employee_email
//                     FROM candidates c
//                     LEFT JOIN candidate_assignments ca ON c.id = ca.candidate_id
//                     LEFT JOIN processes p ON ca.process_id = p.id
//                     LEFT JOIN clients cl ON p.client_id = cl.id
//                     LEFT JOIN employees e ON ca.assigned_by = e.id
//                     WHERE c.id = ?`;
//         const condidateDetalis = await executeQuery(query, candidateId);
//         if(condidateDetalis.length === 0) {
//             return res.status(404).json({ message: "Candidate not found" });
//         }
//         res.status(200).json(condidateDetalis);
//     } catch (error) {
//         console.error('Error while fetching candidate by ID:', error);
//         res.status(400).json(error);
//     }
// }

// export const candidateHistory = async (req, res) => {
//     try {
//         const candidateId = req.query.candidateId;
//         if(!candidateId) {
//             return res.status(400).json({ message: "Candidate ID is required" });
//         }

//         let query = `SELECT 
//                     csh.id,
//                     csh.candidate_id,
//                     csh.employee_id,
//                     csh.old_status,
//                     csh.new_status,
//                     csh.change_reason,
//                     csh.changed_at,
//                     e.first_name,
//                     e.last_name
//                     FROM candidate_status_history csh
//                     LEFT JOIN employees e ON csh.employee_id = e.employee_id
//                     WHERE csh.candidate_id = ?
//                     ORDER BY csh.changed_at DESC`;
//         const history = await executeQuery(query, candidateId);
//         if(history.length === 0) {
//             return res.status(404).json({ message: "No history found" });
//         }
//         res.status(200).json(history);
//     } catch (error) {
//         console.error('Error while fetching candidate history:', error);
//         res.status(400).json(error);
//     }
// }

// export const getMatchingScore = async (req, res) => {
//     try {
//         const candidateId = req.query.candidateId;
//         if(!candidateId) {
//             return res.status(400).json({ message: "Candidate ID is required" });
//         }

//         let query = `SELECT 
//                         cpm.id,
//                         cpm.candidate_id,
//                         cpm.process_id,
//                         cpm.matching_score,
//                         cpm.matched_keywords,
//                         cpm.total_candidate_keywords,
//                         cpm.total_process_keywords,
//                         cpm.skill_matches,
//                         cpm.language_matches,
//                         cpm.education_matches,
//                         cpm.location_matches,
//                         cpm.hiring_type_matches,
//                         cpm.created_at,
//                         cpm.updated_at,
//                         p.process_name,
//                         p.payout_amount,
//                         p.hiring_type,
//                         p.status as process_status,
//                         c.client_name
//                         FROM candidate_process_matches cpm
//                         JOIN processes p ON cpm.process_id = p.id
//                         JOIN clients c ON p.client_id = c.id
//                         WHERE cpm.candidate_id = ?
//                         ORDER BY cpm.matching_score DESC, p.process_name ASC`;
//         const matchingScores = await executeQuery(query, candidateId);
//         if(matchingScores.length === 0) {
//             return res.status(404).json({ message: "No matching scores found" });
//         }
//         res.status(200).json(matchingScores);
//     } catch (error) {
//         console.error('Error while fatching matching scores:', error);
//         res.status(400).json(error);
//     }
// }

// export const assignProcessToCandidate = async (req, res) => {
//     try {
//         const candidateId = req.query.candidateId;
//         const { processId, admin_id } = req.body;
//         if(!candidateId || !processId) {
//             return res.status(400).json({ message: "Candidate ID and Process ID are required" });
//         }

//         let query  = `SELECT id, process_id, assigned_by FROM candidate_assignments WHERE candidate_id = ? AND process_id = ?`;
//         const existingAssignment = await executeQuery(query, [candidateId, processId]);
//         if (existingAssignment.length > 0) {
//             return res.status(400).json({ message: "Candidate is already assigned this a process" });
//         }

//         query = `SELECT matching_score FROM candidate_process_matches WHERE candidate_id = ? AND process_id = ?`;
//         const matchingScore = await connection.query(query, [candidateId, processId]);

//         const matching_score_value = matchingScore.length > 0 ? matchingScore[0].matching_score : null;

//         query = `INSERT INTO candidate_assignments 
//                         (candidate_id, process_id, assignment_status, matching_score,
//                         assigned_at, assigned_by, created_at, updated_at)
//                         VALUES (?, ?, 'assigned', ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
//         const processAssignResult = await executeQuery(query, [candidateId, processId, matching_score_value, admin_id]);
//         if(processAssignResult.affectedRows === 0) {
//             return res.status(500).json({ message: "Failed to assign candidate to process" });
//         }

//         res.status(200).json({ message: "Candidate assigned to process successfully" });

//     } catch (error) {
//         console.error('Error while assigning process to candidate:', error);
//         res.status(400).json(error);
//     }
// }

export const getCandidatesByStatus = async (req, res) => {
  const { status, search, fromDate, toDate, employee, timesChanged } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    let query = `
      WITH ranked_status AS (
          SELECT
              csh.candidate_id,
              csh.employee_id,
              csh.change_reason,
              csh.changed_at,
              ROW_NUMBER() OVER (
                  PARTITION BY csh.candidate_id
                  ORDER BY csh.changed_at DESC
              ) AS rn,
              COUNT(*) OVER ( PARTITION BY csh.candidate_id ) AS times_reached
          FROM candidate_status_history csh
          WHERE csh.new_status = ?
      )

      SELECT
          c.id AS candidate_id,
          c.name AS candidate_name,
          e.employee_id,
          e.full_name AS employee_name,
          rs.change_reason,
          rs.changed_at AS last_changed_at,
          rs.times_reached
      FROM ranked_status rs
      JOIN candidate_assignments ca ON ca.candidate_id = rs.candidate_id
      JOIN candidates c ON c.id = rs.candidate_id
      JOIN employees e ON e.employee_id = rs.employee_id
      WHERE rs.rn = 1 AND ca.assignment_status = ?
    `;

    const params = [status, status];

    // 🔍 Search by candidate name
    if (search) {
      query += `AND (c.name LIKE ? OR rs.change_reason LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    // 📅 Date filtering (index safe)
    if (fromDate) {
      query += ` AND rs.changed_at >= ?`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND rs.changed_at < DATE_ADD(?, INTERVAL 1 DAY)`;
      params.push(toDate);
    }

    // 👤 Filter by employee who changed status
    if (employee) {
      query += ` AND e.employee_id = ?`;
      params.push(employee);
    }

    // 🔁 Filter by times reached
    if (timesChanged) {
      query += ` AND rs.times_reached = ?`;
      params.push(timesChanged);
    }

    query += ` ORDER BY rs.changed_at DESC`;

    const result = await executeQuery(query, params);

    return res.status(200).json(result);

  } catch (error) {
    console.error("Error fetching candidates by status:", error);
    return res.status(500).json({
      message: "Failed to fetch candidates",
      error: error.message
    });
  }
};

export const getEmployeesForCandidateFilter = async (req, res) => {
  try {
    const employees = await executeQuery(`SELECT employee_id, full_name FROM employees ORDER BY full_name`);
    return res.status(200).json(employees);
  } catch (error) {
    console.error("Error while fetching employees: ", error);
    return res.status(500).json(error);
  }
};

export const reassignCandidateToEmployee = async (req, res) => {
  const { candidate_ids, employee_id, assigned_employee } = req.body;

  if (!candidate_ids || !candidate_ids.length || !employee_id || !assigned_employee) {
    return res.status(400).json({
      message: "candidate_ids, employee_id and assigned_employee are required"
    });
  }

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    for (const candidate_id of candidate_ids) {

      // Check duplicate
      const [existing] = await connection.query(
        `SELECT id FROM employee_assignments
         WHERE employee_id = ? AND candidate_id = ?`,
        [assigned_employee, candidate_id]
      );

      if (existing.length > 0) continue; // skip duplicate

      const [dataType] = await connection.query(
        `SELECT data_type_id FROM candidates WHERE id = ? LIMIT 1`,
        [candidate_id]
      );

      if (!dataType.length || !dataType[0].data_type_id) continue;

      await connection.query(
        `INSERT INTO employee_assignments
         (employee_id, candidate_id, data_type_id, status, assigned_by)
         VALUES (?, ?, ?, 'assigned', ?)`,
        [assigned_employee, candidate_id, dataType[0].data_type_id, employee_id]
      );

      await connection.query(
        `UPDATE candidate_assignments
         SET assignment_status = 'assigned'
         WHERE candidate_id = ?`,
        [candidate_id]
      );

      const [statusRows] = await connection.query(
        `SELECT new_status
         FROM candidate_status_history
         WHERE candidate_id = ?
         ORDER BY changed_at DESC
         LIMIT 1`,
        [candidate_id]
      );

      const old_status = statusRows.length ? statusRows[0].new_status : null;

      await connection.query(
        `INSERT INTO candidate_status_history
         (candidate_id, employee_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, 'assigned', 'Bulk action')`,
        [candidate_id, employee_id, old_status]
      );
    }

    await connection.commit();

    return res.json({ message: "Bulk reassignment completed successfully" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const markAsAvailable = async (req, res) => {
  const { candidate_ids, employee_id, reason } = req.body;

  if (!candidate_ids || !candidate_ids.length) {
    return res.status(400).json({ message: "candidate_ids required" });
  }

  const connection = await db.promise().getConnection();

  try {
    await connection.beginTransaction();

    for (const candidate_id of candidate_ids) {

      await connection.query(
        `UPDATE candidates
         SET status = 'available'
         WHERE candidate_id = ?`,
        [candidate_id]
      );

      await connection.query(
        `UPDATE candidate_assignments
         SET assignment_status = 'available'
         WHERE candidate_id = ?`,
        [candidate_id]
      );

      const [statusRows] = await connection.query(
        `SELECT new_status
         FROM candidate_status_history
         WHERE candidate_id = ?
         ORDER BY changed_at DESC
         LIMIT 1`,
        [candidate_id]
      );

      const old_status = statusRows.length ? statusRows[0].new_status : null;

      await connection.query(
        `INSERT INTO candidate_status_history
         (candidate_id, employee_id, old_status, new_status, change_reason)
         VALUES (?, ?, ?, 'available', ?)`,
        [candidate_id, employee_id, old_status, reason]
      );
    }

    await connection.commit();
    return res.json({ message: "Bulk mark as available completed" });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const bulkDropCandidate = async (req, res) => {
  const { candidate_ids, employee_id, reason } = req.body;
  if (!candidate_ids || !candidate_ids.length) {
    return res.status(400).json({
      message: "candidate_ids are required"
    });
  }
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    for (const candidate_id of candidate_ids) {
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
      // 3. Get latest assignment id (most recent one)
      const [assignmentRows] = await connection.query(
        `SELECT id 
        FROM employee_assignments 
        WHERE candidate_id = ?
        ORDER BY assignment_date DESC
        LIMIT 1`,
        [candidate_id]
      );
      if (!assignmentRows.length) continue;
      const assignment_id = assignmentRows[0].id;
      // 4. Insert work action
      await connection.query(
        `INSERT INTO candidate_work_actions 
        (assignment_id, employee_id, candidate_id, action_type, drop_reason)
        VALUES (?, ?, ?, 'drop', ?)`,
        [assignment_id, employee_id, candidate_id, reason]
      );
      // 5. Get previous status
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
    }
    await connection.commit();
    return res.json({ message: "Bulk dropout completed successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    return res.status(500).json({message: error.message || "Bulk drop failed"});
  } finally {
    connection.release();
  }
};

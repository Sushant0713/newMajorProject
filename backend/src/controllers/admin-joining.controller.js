import { executeQuery } from "../lib/executeQuery.js";
import db from "../lib/db.js";
import { format } from "date-fns";

export const getJoinings = async(req, res) =>{
    const { search, status} = req.body;
    try {
        let query = `SELECT
                    ca.id,
                    ca.candidate_id,
                    c.name AS candidate_name,
                    c.email as candidate_email,
                    c.phone AS candidate_phone,
                    c.resume_pdf_path,
                    e.full_name,
                    p.id as process_id,
                    p.process_name,
                    p.locations,
                    p.real_payout_amount,
                    cl.client_name,
                    ca.assignment_status
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
                    WHERE ca.assignment_status IN (
                    'joined',
                    'clawback',
                    'invoice',
                    'completely_joined',
                    'pass',
                    'hold',
                    'dropout'
                    )`;

    const params = [];

    if (search && search.trim()) {
        query += `
        AND (
            c.name LIKE ?
            OR c.phone LIKE ?
            OR e.full_name LIKE ?
            OR p.process_name LIKE ?
            OR cl.client_name LIKE ?
            OR p.locations LIKE ?
        )
        `;
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status) {
        query += " AND ca.assignment_status LIKE ?";
        params.push(`${status}`);
    }

    query += " ORDER BY ca.updated_at DESC";
    const rows = await executeQuery(query, params);
    return res.status(200).json(rows);
    } catch (error) {
        console.error("Error while fetching joinings:", error);
        return res.status(500).send(error);
    }
};

export const editJoining = async (req, res) => {
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
               assigned_by = ?
           WHERE candidate_id = ?`,
          [process_id, employee_id_int, candidate_id]
        );
      } else {
        await connection.query(
          `INSERT INTO candidate_assignments
           (candidate_id, process_id, assigned_by)
           VALUES (?, ?, ?)`,
          [candidate_id, process_id, employee_id_int]
        );
      }
    }

    await connection.commit();
    return res.status(200).json({
      message: "Joining updated successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Edit joinigs Error:", error.message);

    return res.status(400).json({
      message: error.message || "Failed to update joining",
    });
  } finally {
    connection.release();
  }
};

export const exportJoiningUpCSV = async (req, res) => {
  let connection = await db.promise().getConnection();
  try {
    const query = `SELECT
                    ca.id,
                    ca.candidate_id,
                    c.name AS candidate_name,
                    c.phone AS candidate_phone,
                    e.full_name,
                    p.id as process_id,
                    p.process_name,
                    p.locations,
                    p.real_payout_amount,
                    cl.client_name,
                    ca.assignment_status
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
                    WHERE ca.assignment_status IN (
                    'joined',
                    'clawback',
                    'invoice',
                    'completely_joined',
                    'pass',
                    'hold',
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
      "Locations",
      "Client Name",
      "Process ID",
      "Process Name",
      "Employee Name",
      "Current Status",
      "Revenue",
    ]);

    // Add data rows
    rows.forEach((row) => {
      csvRows.push([
        row.candidate_id,
        row.candidate_name,
        row.candidate_phone,
        row.locations,
        row.client_name,
        row.process_id,
        row.process_name,
        row.full_name,
        row.assignment_status,
        row.real_payout_amount,
      ]);
    });

    // Convert array of arrays to CSV string
    const csvString = csvRows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    // Send CSV as download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="joining_data_${format(new Date(), "yyyy-MM-dd")}.csv"`
    );
    res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Disposition"
    );

    res.send(csvString);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export joining data" });
  } finally {
    if (connection) connection.release();
  }
};
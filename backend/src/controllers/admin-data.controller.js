import XLSX from 'xlsx';
import db from '../lib/db.js';
import {executeQuery} from '../lib/executeQuery.js';
import { format } from "date-fns";

function normalizeGender(gender) {
  if (!gender) return 'other';
  const g = gender.toLowerCase();
  if (g === 'male') return 'male';
  if (g === 'female') return 'female';
  return 'other';
}

function normalizeStatus(status) {
  if (!status) return 'fresher';
  return status.toLowerCase().includes('experience')
    ? 'experienced'
    : 'fresher';
}

function parseLanguages(value) {
  if (!value) return JSON.stringify([]);

  return JSON.stringify(
    value
      .split(',')              // split by comma
      .map(lang => lang.trim().toLowerCase()) // clean + normalize
      .filter(Boolean)         // remove empty values
  );
}

export const importData = async(req, res) => {
    const { employee_id, data_type_id } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: 'Excel file is required' });
    }
    if (!employee_id) {
        return res.status(400).json({ message: 'employee_id is required' });
    }

    const duplicateCandidates  = [];
    const invalidCandidates = [];
    let insertedCount = 0;
    let index = 0;

    try {
        // XLSX handles xlsx, xls, csv
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows.length) {
        return res.status(400).json({ message: 'Excel sheet is empty' });
        }

        const connection = await db.promise().getConnection();
        await connection.beginTransaction();
        
        const [employeeIdINT] = await connection.query(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
        const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

        const checkQuery = `
        SELECT id FROM candidates
        WHERE email = ? OR phone = ?
        LIMIT 1
        `;

        const insertQuery = `
        INSERT INTO candidates
        (name, phone, email, gender, address, experience_level, languages, age, job_title, uploaded_by_employee_id, status, data_type_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', ?)
        `;

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            const name = row['Full Name']?.trim();
            const phone = row['Mobile Number']?.toString().trim();
            const email = row['Email ID']?.trim();
            const address = row['Address']?.trim();
            const gender = normalizeGender(row['Gender'])?.trim();

            const missingFields = [];
            let rowNumber = index +2;
            if (!phone) missingFields.push('Mobile Number');
            // mandatory fields
            if (missingFields.length > 0) {
                invalidCandidates.push({
                    rowNumber: rowNumber, // Excel row (header = row 1)
                    missingFields,
                    message: 'Compulsory field missing'
                });
                continue;
            }

            const [existing] = await connection.query(checkQuery, [email, phone]);

            if (existing.length > 0) {
                duplicateCandidates.push({ email, phone });
                continue;
            }

            const data = [
                name,
                phone,
                email,
                gender,
                address,
                normalizeStatus(row['Experience Level']),
                parseLanguages(row['Languages Known']),
                row['Age'] ? parseInt(row['Age']) : null,
                row['Job Title']?.trim(),
                employee_id_int, 
                data_type_id,
            ];

            await connection.query(insertQuery, data);
            insertedCount++;
        }

        await connection.commit();
        connection.release();

        res.json({
            message: 'Import completed',
            insertedRecords: insertedCount,
            duplicateCandidates,
            invalidCandidates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
        message: 'Failed to import candidates',
        error: error.message
        });
    }
}

export const getDataTypes = async (req, res) => {
    try {
        let dataTypes = await executeQuery(`SELECT DISTINCT id, type_name FROM data_types ORDER BY id`);
        return res.json(dataTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Failed to get data types',error: error.message});
    }
}

export const createDataType = async (req, res) => {
    const { type_name, description, created_by, employee_view_limit } = req.body;
    if (!type_name || !employee_view_limit) {
        return res.status(400).json({ message: 'type_name and employee_view_limit are required' });
    }
    try {
        let query = `INSERT INTO data_types (type_name, description, created_by, employee_view_limit) VALUES (?, ?, ?, ?)`;
        await executeQuery(query, [type_name, description, created_by, employee_view_limit]);
        return res.json({ message: 'Data type created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'Failed to create data type',error: error.message});
    }
}

export const getStats = async (req, res) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM candidate_assignments WHERE assignment_status = 'pass') AS passedCandidates,
        (SELECT COUNT(*) FROM candidate_assignments WHERE assignment_status = 'dropout') AS droppedCandidates,
        (SELECT COUNT(*) FROM candidate_assignments WHERE assignment_status = 'hold') AS holdCandidates,
        (SELECT COUNT(*) FROM candidate_assignments 
          WHERE assignment_status NOT IN ('available','matched','pass','hold','dropout','not_interested')
        ) AS pipelinedCandidates,
        (SELECT COUNT(*) FROM candidates) AS totalCandidates,
        (SELECT COUNT(*) FROM candidates WHERE status IN ('available', 'reserved')) AS availableCandidates,
        (SELECT COUNT(*) FROM candidates WHERE status = 'assigned') AS assignedCandidates
    `;
    const rows = await executeQuery(query);
    return res.status(200).json(rows[0]); // single row object
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      message: "Failed to fetch stats",
    });
  }
};

export const getEmployeeWorkload = async (req, res) => {
    const { search } = req.body;
    try {
    let query = `
      SELECT e.employee_id, e.full_name,
        COUNT(DISTINCT CASE WHEN c.status = 'assigned' THEN c.id END) AS assignedCount,
        COUNT(DISTINCT CASE WHEN ca.assignment_status NOT IN ('available','matched','pass','hold','dropout','not_interested') THEN ca.candidate_id END) AS pipelineCount,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'pass' THEN ca.candidate_id END) AS passCount,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'hold' THEN ca.candidate_id END) AS holdCount,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'dropout' THEN ca.candidate_id END) AS dropCount
      FROM employee_assignments ea
      INNER JOIN employees e ON e.employee_id = ea.employee_id
      LEFT JOIN candidates c ON c.id = ea.candidate_id
      LEFT JOIN candidate_assignments ca ON ca.candidate_id = ea.candidate_id
      WHERE 1 = 1
    `;

    const params = [];

    // 🔍 Filter by employee name
    if (search && search.trim()) {
      query += ` AND e.full_name LIKE ?`;
      params.push(`%${search.trim()}%`);
    }

    query += `
      GROUP BY e.employee_id, e.full_name
      ORDER BY e.full_name ASC
    `;
    const rows = await executeQuery(query, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching employee workload:", error);
    return res.status(500).json({
      message: "Failed to fetch employee workload",
    });
  }
}

export const getDataTypeOverview = async (req, res) => {
    try {
    const query = `
      SELECT dt.id AS data_type_id, dt.type_name,
        COUNT(DISTINCT c.id) AS totalCandidates,
        COUNT(DISTINCT CASE WHEN c.status IN ('available','reserved') THEN c.id END) AS availableCandidates,
        COUNT(DISTINCT CASE WHEN c.status = 'assigned' THEN c.id END) AS assignedCandidates,
        COUNT(DISTINCT CASE WHEN ca.assignment_status NOT IN ('available','matched','pass','hold','dropout','not_interested') THEN ca.candidate_id END) AS pipelineCandidates,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'pass' THEN ca.candidate_id END) AS passCandidates,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'hold' THEN ca.candidate_id END) AS holdCandidates,
        COUNT(DISTINCT CASE WHEN ca.assignment_status = 'dropout' THEN ca.candidate_id END) AS dropoutCandidates
      FROM data_types dt
      LEFT JOIN candidates c ON c.data_type_id = dt.id
      LEFT JOIN candidate_assignments ca ON ca.candidate_id = c.id
      GROUP BY dt.id, dt.type_name
      ORDER BY dt.type_name ASC
    `;

    const rows = await executeQuery(query);
    return res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching data type overview:", error);
    return res.status(500).json({message: "Failed to fetch data type overview"});
  }
}

export const getDataTypesDetails = async (req, res) => {
    try {
        const data_type_id = req.query.data_type_id;
        if (!data_type_id) {
            return res.status(400).json({ message: "Data type ID is required" });
        }
        var query = `SELECT * FROM data_types WHERE id = ?`;
        const dataTypeDetails = await executeQuery(query, [data_type_id]);
        return res.status(200).json(dataTypeDetails[0]);
    } catch (error) {
        console.error("Error while fetching data type details:", error);
        return res.status(500).send(error);
    }
}

export const updateDataType = async (req, res) => {
    const { data_type_id, type_name, description, is_active, employee_view_limit } = req.body;
    if (!data_type_id) {
      return res.status(400).json({ message: "data_type_id is required" });
    }
    try {
        const result = await executeQuery(
        `UPDATE data_types
          SET type_name = ?, 
              description = ?, 
              is_active = ?, 
              employee_view_limit = ?
          WHERE id = ?`,
        [type_name, description, is_active, employee_view_limit, data_type_id]
        );

        if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Data type not found" });
        }

        return res.status(200).json({ message: "Data type updated successfully" });
    } catch (error) {
        console.error("Error updating data type:", error);
        return res.status(500).json({message: "Failed to update data type"});
    }
}

export const assignDataTypes = async (req, res) => {
    const {employee_id, data_type_id} = req.body;
    try {
        if (!data_type_id) {
            return res.status(400).json({ message: "Data Type ID is required" });
        }
        if (!employee_id) {
            return res.status(400).json({ message: "Employee ID is required" });
        }
        let query = `INSERT INTO employee_data_types (employee_id, data_type_id) VALUES (?, ?)`;
        await executeQuery(query, [employee_id, data_type_id]);
        return res.status(200).json({ message: "Data Types assigned to employees successfully" });
    } catch (error) {
        console.error("Error while assigning data types to employees:", error);
        return res.status(500).send(error);
    }
}

export const exportCandidatesCSV = async (req, res) => {
  const {data_type_id} = req.body;
  console.log(data_type_id);
  let connection = await db.promise().getConnection();
  try {
    const query = `SELECT 
                    dt.id AS data_type_id,
                    dt.type_name,
                    c.id AS candidate_id,
                    c.name,
                    c.phone,
                    COALESCE(ca.assignment_status, c.status) AS current_status,
                    COALESCE(ca.updated_at, c.updated_at) AS status_updated_at,
                    p.process_name,
                    cl.client_name,
                    e.full_name
                FROM candidates c
                JOIN data_types dt ON c.data_type_id = dt.id
                LEFT JOIN candidate_assignments ca ON ca.candidate_id = c.id
                LEFT JOIN processes p ON p.id = ca.process_id
                LEFT JOIN clients cl ON cl.id = p.client_id
                JOIN employees e ON e.id = c.uploaded_by_employee_id
                WHERE c.data_type_id = ?`;

    const [rows] = await connection.query(query, [data_type_id]);

    if (!rows.length) {
      throw new NoData(404, "No data present for this data type");
    }

    // Convert rows to CSV
    const csvRows = [];

    // Add header
    csvRows.push([
      "Datatype ID",
      "Datatype Name",
      "Candidate ID",
      "Candidate Name",
      "candidate Mobile No",
      "Current Status",
      "Status Updated at",
      "Process Name",
      "Client Name",
      "Added By"
    ]);

    // Add data rows
    rows.forEach((row) => {
      csvRows.push([
        row.data_type_id,
        row.type_name,
        row.candidate_id,
        row.name,
        row.phone,
        row.current_status,
        row.status_updated_at ? format(new Date(row.status_updated_at), "yyyy-MM-dd") : "",
        row.process_name,
        row.client_name,
        row.full_name
      ]);
    });

    // Convert array of arrays to CSV string
    const csvString = csvRows.map((r) => r.map((v) => `"${v ?? ""}"`).join(",")).join("\n");

    // Send CSV as download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
    "Content-Disposition",
    `attachment; filename="${rows[0].type_name}_${format(new Date(), "yyyy-MM-dd")}.csv"`
    );
    res.setHeader(
    "Access-Control-Expose-Headers",
    "Content-Disposition"
    );

    res.send(csvString);
  } catch (err) {
  console.error(err);
  res.status(err.status || 500).json({message: err.message || "Failed to export lineup data",});
  } finally {
    if (connection) connection.release();
  }
};
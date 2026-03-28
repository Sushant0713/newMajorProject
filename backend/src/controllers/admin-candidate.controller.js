import { executeQuery } from '../lib/executeQuery.js';
import db from "../lib/db.js";

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

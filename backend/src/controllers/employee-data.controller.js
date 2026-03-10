import db from '../lib/db.js';
import { executeQuery } from '../lib/executeQuery.js';

export const getEmployeeDataTypes = async (req, res) => {
  const employee_id = req.query.employee_id;
  try {
    const employeeIdINT = await executeQuery(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
    const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;
    const data_types = await executeQuery(`SELECT dt.id, dt.type_name FROM employee_data_types edt
                                          JOIN data_types dt ON dt.id = edt.data_type_id
                                          WHERE edt.employee_id = ? AND dt.is_active = 1`, [employee_id_int]);
    return res.status(200).json(data_types);
  } catch (error) {
    console.error("Error while fetching employee data types: ",error);
    return res.status(500).send(error);

  }
}

const getEmployeeDataTypeLimits = async (connection, employeeId) => {
  const [rows] = await connection.query(`
    SELECT 
      dt.id AS data_type_id,
      dt.employee_view_limit
    FROM employee_data_types edt
    JOIN data_types dt ON dt.id = edt.data_type_id
    WHERE edt.employee_id = ?
  `, [employeeId]);

  return rows;
};

const allocateSlots = (dataTypes, totalLimit) => {
  const allocation = {};
  let remaining = totalLimit;

  // Shuffle data types for randomness
  const shuffled = [...dataTypes].sort(() => Math.random() - 0.5);

  for (const dt of shuffled) {
    if (remaining <= 0) break;

    const maxForThis = Math.min(dt.employee_view_limit, remaining);

    // Random allocation between 1 and maxForThis
    const allocated = Math.floor(Math.random() * maxForThis) + 1;

    allocation[dt.data_type_id] = allocated;
    remaining -= allocated;
  }

  return allocation;
};

const fetchCandidatesForDataType = async (
  connection,
  dataTypeId,
  limit,
  minId,
  maxId
) => {
  const startId =
    Math.floor(Math.random() * (maxId - minId + 1)) + minId;

  let [rows] = await connection.query(`
    SELECT *
    FROM candidates
    WHERE
      data_type_id = ?
      AND status = 'available'
      AND id >= ?
    ORDER BY id
    LIMIT ?
    FOR UPDATE
  `, [dataTypeId, startId, limit]);

  if (rows.length < limit) {
    const remaining = limit - rows.length;

    const [extra] = await connection.query(`
      SELECT *
      FROM candidates
      WHERE
        data_type_id = ?
        AND status = 'available'
        AND id < ?
      ORDER BY id
      LIMIT ?
      FOR UPDATE
    `, [dataTypeId, startId, remaining]);

    rows = rows.concat(extra);
  }

  return rows;
};

// const getFinalViewLimit = async (connection, employee_id) => {
//   const [rows] = await connection.query(`
//     SELECT 
//       e.view_limit AS emp_limit,
//       MIN(dt.employee_view_limit) AS dt_limit
//     FROM employees e
//     JOIN employee_data_types edt ON edt.employee_id = e.id
//     JOIN data_types dt ON dt.id = edt.data_type_id
//     WHERE e.id = ?
//     GROUP BY e.id
//   `, [employee_id]);

//   if (!rows.length) return 0;

//   return Math.min(
//     rows[0].emp_limit ?? Infinity,
//     rows[0].dt_limit ?? Infinity
//   );
// };

// const fetchRandomCandidates = async (connection, employee_id, limit, minId, maxId) => {
//   const startId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;

//   let [rows] = await connection.query(`
//     SELECT c.*
//     FROM candidates c
//     JOIN employee_data_types edt
//       ON edt.data_type_id = c.data_type_id
//     WHERE
//       edt.employee_id = ?
//       AND c.status = 'available'
//       AND c.id >= ?
//     ORDER BY c.id
//     LIMIT ?
//     FOR UPDATE
//   `, [employee_id, startId, limit]);

//   if (rows.length < limit) {
//     const remaining = limit - rows.length;

//     const [extra] = await connection.query(`
//       SELECT c.*
//       FROM candidates c
//       JOIN employee_data_types edt
//         ON edt.data_type_id = c.data_type_id
//       WHERE
//         edt.employee_id = ?
//         AND c.status = 'available'
//         AND c.id < ?
//       ORDER BY c.id
//       LIMIT ?
//       FOR UPDATE
//     `, [employee_id, startId, remaining]);

//     rows = rows.concat(extra);
//   }

//   return rows;
// };

export const getCandidates = async (req, res) => {
  const startTime = process.hrtime.bigint();
  const { employee_id, data_type_id } = req.body; // EMPxxx from frontend

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();

    /* 1️⃣ resolve employee INT id */
    const [[emp]] = await connection.query(
      `SELECT id, view_limit FROM employees WHERE employee_id = ?`,
      [employee_id]
    );
    if (!emp) {
      await connection.rollback();
      return res.status(404).json({ error: "Employee not found" });
    }

    const employeeId = emp.id;
    const employeeLimit = emp.view_limit;

    /* 2️⃣ release previous reserved candidates of this employee */
    await connection.query(`
      DELETE cr
      FROM candidate_reservations cr
      JOIN candidates c ON c.id = cr.candidate_id
      WHERE cr.employee_id = ?
      AND c.status = 'reserved'
    `, [employeeId]);

    await connection.query(`
      UPDATE candidates
      SET status = 'available'
      WHERE status = 'reserved'
      AND id NOT IN (SELECT candidate_id FROM candidate_reservations)
    `);

    let allocation = {};
    /* 3️⃣ get assigned data types + limits */
    const dataTypes = await getEmployeeDataTypeLimits(connection, employeeId);
    if (!dataTypes.length) {
      await connection.commit();
      return res.json([]);
    }

    if (data_type_id !== null && data_type_id !== undefined) {
      // User selected specific data type
      const selected = dataTypes.find(
        dt => dt.data_type_id === Number(data_type_id)
      );
      if (!selected) {
        await connection.rollback();
        return res.status(403).json({ error: "Data type not assigned to employee" });
      }
      // limit = min(employee limit, that data type limit)
      const finalLimit = Math.min(
        employeeLimit,
        selected.employee_view_limit
      );
      allocation[selected.data_type_id] = finalLimit;
    } else {
      // Default behavior (all data types)
      allocation = allocateSlots(dataTypes, employeeLimit);
    }

    /* 5️⃣ get candidate id bounds (cache in prod) */
    const [[{ minId, maxId }]] = await connection.query(`
      SELECT MIN(id) AS minId, MAX(id) AS maxId FROM candidates
    `);

    /* 6️⃣ fetch candidates per data type */
    let candidates = [];
    for (const [dataTypeId, limit] of Object.entries(allocation)) {
      const rows = await fetchCandidatesForDataType(
        connection,
        Number(dataTypeId),
        limit,
        minId,
        maxId
      );
      candidates = candidates.concat(rows);
    }

    // absolute safety cap
    candidates = candidates.slice(0, employeeLimit);

    if (!candidates.length) {
      await connection.commit();
      return res.json([]);
    }

    /* 7️⃣ reserve candidates (CRITICAL SECTION) */
    const ids = [...new Set(candidates.map(c => c.id))];

    const reservationValues = ids.map(id => [id, employeeId]);
    await connection.query(`
      INSERT INTO candidate_reservations (candidate_id, employee_id)
      VALUES ?
    `, [reservationValues]);

    await connection.query(`
      UPDATE candidates
      SET status = 'reserved'
      WHERE id IN (?)
    `, [ids]);

    await connection.commit();
    res.json(candidates);

    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1_000_000;
    console.log(`getCandidates total time: ${durationMs.toFixed(2)} ms`);
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  } finally {
    connection.release();
  }
};

export const assignCandidate = async (req, res) => {
  const {employee_id, data_type_id} = req.body;
  const candidate_id = req.query.candidate_id;
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    
    const [employeeIdINT] = await connection.query(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
    const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

    const [result] = await connection.query(`
      UPDATE candidates
      SET status = 'assigned'
      WHERE id = ?
      AND status = 'reserved'
      AND id IN (
        SELECT candidate_id
        FROM candidate_reservations
        WHERE employee_id = ?
      )
    `, [candidate_id, employee_id_int]);

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(403).json({ error: "Not allowed" });
    }

    await connection.query(
        `INSERT INTO employee_assignments 
         (employee_id, candidate_id, data_type_id, status, assigned_by)
         VALUES (?, ?, ?, 'assigned', ?)`,
        [employee_id, candidate_id, data_type_id, employee_id]
    );

    await connection.query(`INSERT INTO candidate_assignments (candidate_id, assignment_status, assigned_by) VALUES(?, 'assigned', ?)`,[candidate_id, employee_id_int]);

    await connection.query(`
      DELETE FROM candidate_reservations
      WHERE candidate_id = ?
      AND employee_id = ?
    `, [candidate_id, employee_id_int]);

    await connection.commit();
    return res.status(200).json({ message: "Candidate has been successfully assigned to you." });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    return res.status(500).json({ error: "Assignment failed" });
  } finally {
    connection.release();
  }
};


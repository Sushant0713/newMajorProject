import { executeQuery } from "../lib/executeQuery.js";

export const getLineupsEmployee = async (req, res) => {
  const { search, processName, clientName, startDate, endDate, status } = req.body;
  const employee_id = req.query.employee_id;

  try {

    let query = `
      SELECT
        ca.id,
        ca.candidate_id,
        c.name AS candidate_name,
        c.phone AS candidate_phone,
        c.email AS candidate_email,
        c.resume_pdf_path,
        p.id AS process_id,
        p.process_name,
        cl.client_name,
        ca.assignment_status,
        latest_status.new_status AS latest_status,
        ca.created_at
      FROM candidate_assignments ca
      JOIN (
          SELECT candidate_id, MAX(id) AS latest_id
          FROM employee_assignments
          GROUP BY candidate_id
      ) latest ON latest.candidate_id = ca.candidate_id
      JOIN employee_assignments ea ON ea.id = latest.latest_id
      LEFT JOIN candidates c ON c.id = ca.candidate_id
      LEFT JOIN processes p ON p.id = ca.process_id
      LEFT JOIN clients cl ON cl.id = p.client_id
      LEFT JOIN (
        SELECT candidate_id, new_status
        FROM (
          SELECT *,
            ROW_NUMBER() OVER (
              PARTITION BY candidate_id
              ORDER BY changed_at DESC
            ) rn
          FROM candidate_status_history
        ) t WHERE rn = 1
      ) latest_status ON latest_status.candidate_id = ca.candidate_id
      WHERE ea.employee_id = ?
      AND ca.assignment_status NOT IN (
        'available',
        'joined',
        'clawback',
        'invoice',
        'completely_joined',
        'dropout'
      )`;

    const params = [employee_id];

    // search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query += `
        AND (
          c.name LIKE ?
          OR ca.candidate_id LIKE ?
          OR c.phone LIKE ?
        )
      `;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // client filter
    if (clientName) {
      query += ` AND cl.client_name LIKE ?`;
      params.push(`%${clientName}%`);
    }

    // process filter
    if (processName) {
      query += ` AND p.process_name LIKE ?`;
      params.push(`%${processName}%`);
    }

    // date filter
    if (startDate && endDate) {
      query += ` AND ca.created_at BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    // status filter
    if (status) {
      query += ` AND latest_status.new_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY ca.created_at DESC`;

    const rows = await executeQuery(query, params);

    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error while fetching line-ups:", error);
    return res.status(500).send(error);
  }
};

export const getJoiningsEmployee = async (req, res) => {
  const { search, status } = req.body;
  const employee_id = req.query.employee_id;

  try {
    let query = `
      SELECT
        ca.id,
        ca.candidate_id,
        c.name AS candidate_name,
        c.email AS candidate_email,
        c.phone AS candidate_phone,
        c.resume_pdf_path,
        p.id AS process_id,
        p.process_name,
        p.locations,
        p.real_payout_amount,
        cl.client_name,
        ca.assignment_status
      FROM candidate_assignments ca
      JOIN (
          SELECT candidate_id, MAX(id) AS latest_id
          FROM employee_assignments
          GROUP BY candidate_id
      ) latest ON latest.candidate_id = ca.candidate_id
      JOIN employee_assignments ea ON ea.id = latest.latest_id
      LEFT JOIN candidates c ON c.id = ca.candidate_id
      LEFT JOIN processes p ON p.id = ca.process_id
      LEFT JOIN clients cl ON cl.id = p.client_id
      WHERE ea.employee_id = ?
      AND ca.assignment_status IN (
        'joined',
        'clawback',
        'invoice',
        'completely_joined',
        'pass',
        'hold',
        'dropout'
      )
    `;

    const params = [employee_id];

    // search filter
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;

      query += `
        AND (
          c.name LIKE ?
          OR c.phone LIKE ?
          OR p.process_name LIKE ?
          OR cl.client_name LIKE ?
          OR p.locations LIKE ?
        )
      `;

      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // status filter
    if (status) {
      query += ` AND ca.assignment_status = ?`;
      params.push(status);
    }
    query += ` ORDER BY ca.updated_at DESC`;
    const rows = await executeQuery(query, params);
    return res.status(200).json(rows);

  } catch (error) {
    console.error("Error while fetching joinings:", error);
    return res.status(500).send(error);
  }
};

export const getProcessForEmployee = async (req, res) => {
  const employee_id = req.query.employee_id;
    try {
        const query = `SELECT p.id AS process_id, p.process_name FROM processes p
                        JOIN client_employee_assignments cea ON cea.client_id = p.client_id
                        JOIN employees e ON e.id = cea.employee_id
                        WHERE p.status = 'active' AND e.employee_id = ? ORDER BY p.process_name`;
        const processes = await executeQuery(query, [employee_id]);
        return res.status(200).json(processes);
    } catch (error) {
        console.error("Error while fetching process names:", error);
        return res.status(400).send(error);
    }
};

export const getClientsForEmployee = async (req, res) => {
  const employee_id = req.query.employee_id;
    try {
        const query = `SELECT cl.client_name FROM clients cl
                    INNER JOIN client_employee_assignments cea ON cl.id = cea.client_id
                    INNER JOIN employees e ON cea.employee_id = e.id
                    WHERE e.employee_id = ? AND cl.status = 'active'`;
        const rows = await executeQuery(query, [employee_id]);
        const clientNames = rows.map(row => row.client_name);
        res.status(200).json(clientNames);
    } catch (error) {
        console.error("Error while fetching process names:", error);
        res.status(400).send(error);
    }
};

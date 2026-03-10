import { executeQuery } from '../lib/executeQuery.js';
import db from '../lib/db.js';

// Get all processes with client names and SPOC counts
export const getAllProcesses = async (req, res) => {
    try {
        var query = `SELECT 
                    p.id,
                    c.client_name,
                    p.process_name,
                    p.hiring_type,
                    p.salary,
                    p.status,
                    c.approx_revenue AS display_amount,
                    p.real_payout_amount AS real_amount,
                    COUNT(DISTINCT ca.id) AS total_assigned_candidates,
                    GROUP_CONCAT(DISTINCT s.name ORDER BY s.name SEPARATOR ',') AS spoc_names
                FROM processes p
                LEFT JOIN candidate_assignments ca 
                    ON p.id = ca.process_id
                LEFT JOIN clients c 
                    ON p.client_id = c.id
                LEFT JOIN spocs s
                    ON p.id = s.process_id
                GROUP BY 
                    p.id,
                    c.client_name,
                    p.process_name,
                    p.hiring_type,
                    p.salary,
                    p.status,
                    p.payout_amount,
                    p.real_payout_amount
                ORDER BY 
                    p.created_at DESC`;
        const processes = await executeQuery(query);

        res.status(200).json(processes);
    } catch (error) {
        console.error('Error fetching processes:', error);
        res.status(400).json(error);
    }
}

// Add a new process along with its SPOC details
export const addProcess = async (req, res) => {
    const { 
        client_name, 
        process_name, 
        process_description, 
        hiring_type, 
        openings, 
        locations, 
        requirements, 
        salary, 
        interview_dates, 
        clawback_duration, 
        invoice_clear_time, 
        payout_type, 
        payout_amount, 
        real_payout_amount, 
        spocs = []   // array of spoc objects
    } = req.body;

    const requiredFields = [
        client_name, process_name, hiring_type, openings, 
        locations, requirements, salary, interview_dates, clawback_duration, 
        invoice_clear_time, payout_type, real_payout_amount
    ];

    if (requiredFields.some(field => !field) && spocs.length === 0) {
        return res.status(400).json({ message: "All process fields are required" });
    }

    let connection;

    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        
        // Fetch client ID
        const [clientRows] = await connection.query(
            `SELECT id FROM clients WHERE client_name = ?`, 
            [client_name]
        );
        if (clientRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Client not found" });
        }
        const clientId = clientRows[0].id;

        // Check if process already exists for this client
        const [existingProcesses] = await connection.query(
            `SELECT id FROM processes WHERE client_id = ? AND process_name = ?`,
            [clientId, process_name]
        );
        if (existingProcesses.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Process already exists for this client" });
        }

        // Insert new process
        const [processResult] = await connection.query(
            `INSERT INTO processes (
                client_id, process_name, process_description, hiring_type,
                openings, locations, requirements, salary, interview_dates,
                clawback_duration, invoice_clear_time, payout_type, payout_amount,
                real_payout_amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', NOW())`,
            [
                clientId, process_name, process_description, hiring_type,
                openings, locations, requirements, salary, interview_dates,
                clawback_duration, invoice_clear_time, payout_type, payout_amount,
                real_payout_amount
            ]
        );

        // Get process ID of the newly inserted process
        const process_id = processResult.insertId;

        // Insert SPOC details (loop through objects)
        for (const spoc of spocs) {
            if (spoc.spoc_name && spoc.spoc_phone && spoc.spoc_email && spoc.spoc_role) {
                const [spocResult] = await connection.query(
                    `INSERT INTO spocs (process_id, name, phone, email, role, note, status, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())`,
                    [
                        process_id,
                        spoc.spoc_name,
                        spoc.spoc_phone,
                        spoc.spoc_email,
                        spoc.spoc_role,
                        spoc.spoc_note || null
                    ]
                );

                if (spocResult.affectedRows === 0) {
                    await connection.rollback();
                    return res.status(500).json({ message: 'Failed to add SPOC details' });
                }
            }
        }

        await connection.commit();
        return res.status(200).json({ message: "Process added successfully" });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error adding process:', error);
        return res.status(400).json({ message: error.message || "Failed to add process" });
    } finally {
        if (connection) connection.release();
    }
}

// View detailed information about a specific process
export const viewProcessDetails = async (req, res) => {
    try {
        const processId = req.query.processId;
        var query = `SELECT p.*, c.client_name FROM processes p JOIN clients c ON p.client_id = c.id WHERE p.id = ?`;
        const processDetails = await executeQuery(query, [processId]);
        if (processDetails.length === 0) {
            return res.status(404).json({ message: 'Process not found' });
        }
        res.status(200).json(processDetails[0]);
    } catch (error) {
        console.error("Error in fetching process details:", error);
        res.status(400).json(error);
    }
}

// Get SPOCs associated with a specific process
export const getProcessSpocs = async (req, res) => {
    try {
        const processId = req.query.processId;
        var query = `SELECT * FROM spocs WHERE process_id = ? ORDER BY created_at`;
        const spocs = await executeQuery(query, [processId]);
        if (spocs.length === 0) {
            return res.status(404).json({ message: 'No SPOCs found for this process' });
        }
        res.status(200).json(spocs);
    } catch (error) {
        console.error("Error in fetching process SPOCs:", error);
        res.status(400).json(error);
    }
}

export const getProcessCandidates = async (req, res) => {
    const process_id = req.query.process_id;
    const {candidate_name } = req.body;
    try {
        let query = `SELECT 
                        c.id AS candidate_id,
                        c.name AS candidate_name,
                        e.employee_id,
                        e.full_name,
                        ca.assignment_status,
                        MAX(ccl.created_at) AS last_contacted_date
                    FROM candidate_assignments ca
                    JOIN candidates c ON c.id = ca.candidate_id
                    LEFT JOIN (
                        SELECT candidate_id, MAX(id) AS latest_id
                        FROM employee_assignments
                        GROUP BY candidate_id
                    ) latest ON latest.candidate_id = c.id
                    LEFT JOIN employee_assignments ea ON ea.id = latest.latest_id
                    LEFT JOIN employees e ON e.employee_id = ea.employee_id
                    LEFT JOIN candidate_call_logs ccl 
                        ON ccl.candidate_id = c.id 
                        AND ccl.employee_id = e.employee_id
                    WHERE ca.process_id = ?
                    `;
    const params = [];
    params.push(process_id);
    if(candidate_name) {
        query += `AND c.name LIKE ?`;
        params.push(`%${candidate_name}%`);
    }
    query += `GROUP BY c.id, c.name, e.employee_id, e.full_name`;
    const candidates = await executeQuery(query, params);
    return res.status(200).json(candidates);
    } catch (error) {
        console.error("Error in fetching candidates for process", error);
        return res.status(400).send(error);
    }
}

export const getCandidateDetails = async (req, res) => {
    const candidate_id = req.query.candidate_id;
    try{
        let query = `SELECT * FROM candidates WHERE id = ?`;
        const candidateDetails = await executeQuery(query, [candidate_id]);
        return res.status(200).json(candidateDetails[0]);
    } catch (error) {
        console.error("Error in fetching candidate details: ", error);
        return res.status(500).send(error);
    }
}

// Edit existing process and its SPOC details
export const updateProcess = async (req, res) => {
    const processId = req.query.processId;
    const { 
        process_name, 
        process_description, 
        hiring_type, 
        openings, 
        locations, 
        requirements, 
        salary, 
        interview_dates, 
        clawback_duration, 
        invoice_clear_time, 
        payout_type, 
        payout_amount, 
        real_payout_amount, 
        new_status,
        spocs = []   
    } = req.body;

    const requiredFields = [
        process_name, process_description, hiring_type, openings, 
        locations, requirements, salary, interview_dates, clawback_duration, 
        invoice_clear_time, payout_type, payout_amount, real_payout_amount, new_status
    ];

    if (requiredFields.some(field => !field)) {
        return res.status(400).json({ message: "All process fields are required" });
    }

    let connection;

    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // Update process details
        const [updateProcessResult] = await connection.query(
            `UPDATE processes SET 
                process_name = ?, 
                process_description = ?, 
                hiring_type = ?, 
                openings = ?, 
                locations = ?, 
                requirements = ?, 
                salary = ?, 
                interview_dates = ?, 
                clawback_duration = ?, 
                invoice_clear_time = ?, 
                payout_type = ?, 
                payout_amount = ?, 
                real_payout_amount = ?, 
                status = ?, 
                updated_at = NOW()
            WHERE id = ?`,
            [
                process_name, process_description, hiring_type, openings,
                locations, requirements, salary, interview_dates,
                clawback_duration, invoice_clear_time, payout_type,
                payout_amount, real_payout_amount, new_status, processId
            ]
        );
        if (updateProcessResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Failed to update process' });
        }

        // Delete existing SPOCs 
        await connection.query(`DELETE FROM spocs WHERE process_id = ?`, [processId]);

        // Insert new SPOC details
        for (const spoc of spocs) {
            if (spoc.spoc_name && spoc.spoc_phone && spoc.spoc_email && spoc.spoc_role) {
                const [updateSpocResult] = await connection.query(
                    `INSERT INTO spocs (process_id, name, phone, email, role, note, status, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, 'Active', NOW())`,
                    [
                        processId,
                        spoc.spoc_name,
                        spoc.spoc_phone,
                        spoc.spoc_email,
                        spoc.spoc_role,
                        spoc.spoc_note || null
                    ]
                );

                if (updateSpocResult.affectedRows === 0) {
                    await connection.rollback();
                    return res.status(500).json({ message: 'Failed to update SPOC details' });
                }
            }
        }

        // Commit transaction
        await connection.commit();

        // // Fetch updated process
        // const [updatedProcess] = await connection.query(
        //     `SELECT p.*, c.client_name 
        //         FROM processes p 
        //         JOIN clients c ON p.client_id = c.id 
        //         WHERE p.id = ?`,
        //     [processId]
        // );

        // // Fetch updated SPOCs
        // const [updatedSpocs] = await connection.query(
        //     `SELECT * FROM spocs WHERE process_id = ? ORDER BY id`,
        //     [processId]
        // );

        return res.status(200).json({
            message: "Process updated successfully",
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Error updating process:', error);
        return res.status(400).json({ message: error.message || "Failed to update process" });
    } finally {
        if (connection) connection.release();
    }
}

// Delete a process and its associated SPOCs
export const deleteProcess = async (req, res) => {
    const processId = req.query.processId;
    try {
        const deleteProcessResult = await executeQuery(`DELETE FROM processes WHERE id = ?`, [processId]);
        if (deleteProcessResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Failed to delete process' });
        }
        return res.status(200).json({ message: "Process deleted successfully" });
    } catch (error) {
        console.error("Error in deleting process:", error);
        res.status(400).json(error);
    }
}

export const getClientNames = async (req, res) => {
    try {
        let query = `SELECT DISTINCT client_name FROM clients`;
        const rows = await executeQuery(query);
        const clientNames = rows.map(row => row.client_name);
        res.status(200).json(clientNames);
    } catch (error) {
        console.error("Error while fetching client names:", error);
        res.status(400).send(error);
    }
}
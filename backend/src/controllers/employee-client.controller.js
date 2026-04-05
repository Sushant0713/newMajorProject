import {executeQuery} from "../lib/executeQuery.js";

export const getAllProcesses = async (req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `SELECT p.id, p.process_name, cl.id as client_id, cl.client_name, p.hiring_type, p.openings, p.salary, cl.approx_revenue, p.locations
                        FROM processes p
                        INNER JOIN client_employee_assignments cea ON p.client_id = cea.client_id
                        INNER JOIN employees e ON cea.employee_id = e.id
                        INNER JOIN clients cl ON p.client_id = cl.id  
                        WHERE e.employee_id = ?
                        AND p.status = 'Active' AND cl.status = 'Active'
                        ORDER BY cea.assigned_at DESC`;
        const processes = await executeQuery(query, employee_id);
        res.status(200).json(processes);
    } catch (error) {
        console.error("Error while fetching all processes:", error);
        res.status(400).send(error);
    }
}

export const getProcessDetails = async (req, res) => {
    try {
        const process_id = req.query.processId;
        let query = `SELECT p.*, c.client_name, c.cp_name, c.cp_email, c.cp_phone, c.address, c.website,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', s.name,
                            'phone', s.phone,
                            'email', s.email,
                            'role', s.role,
                            'note', s.note
                        )
                    ) AS spocs FROM processes p
                LEFT JOIN clients c ON p.client_id = c.id
                LEFT JOIN spocs s ON p.id = s.process_id AND s.status = 'Active'
                WHERE p.id = ? GROUP BY p.id`;
        const [processDetails] = await executeQuery(query, process_id);
        res.status(200).json(processDetails);
    } catch (error) {
        console.error("Error while fetching process details:", error);
        res.status(400).send(error);
    }
}

export const getClientNames = async (req, res) => {
    const employee_id = req.query.employee_id;
    try {
        let query = `SELECT 
                        cl.client_name,
                        cl.approx_revenue,
                        COUNT(p.id) AS processCount
                    FROM clients cl
                    JOIN client_employee_assignments cea ON cl.id = cea.client_id
                    JOIN employees e ON e.id = cea.employee_id
                    LEFT JOIN processes p ON p.client_id = cl.id
                    WHERE e.employee_id = ? AND cl.status = 'active'
                    GROUP BY cl.id, cl.client_name, cl.approx_revenue`;
        const clientNames = await executeQuery(query, [employee_id]);
        // const clientNames = rows.map(row => row.client_name);
        res.status(200).json(clientNames);
    } catch (error) {
        console.error("Error while fetching client names:", error);
        res.status(400).send(error);
    }
}

export const getLocations = async (req, res) => {
    try {
        let query = `SELECT DISTINCT locations FROM processes`;
        const rows = await executeQuery(query);
        const locations = [
            ...new Set(rows.flatMap(row => row.locations ? row.locations.split(',').map(loc => loc.trim()) : []))
        ];
        res.status(200).json(locations);
    } catch (error) {
        console.error("Error while fetching locations:", error);
        res.status(400).send(error);
    }
}

export const getStats = async (req, res) => {
    const {employee_id} = req.body;
    try {
        let query = `SELECT COUNT(*) AS total_processes FROM processes p
                        JOIN client_employee_assignments cea ON cea.client_id = p.client_id
                        JOIN employees e ON e.id = cea.employee_id
                        WHERE p.status = 'active' AND e.employee_id = ?`;
        const totalProcesses = await executeQuery(query, [employee_id]);

        query = `SELECT COALESCE(SUM(p.openings), 0) AS total_openings FROM processes p
                    JOIN client_employee_assignments cea ON cea.client_id = p.client_id
                    JOIN employees e ON e.id = cea.employee_id
                    WHERE p.status = 'Active' AND e.employee_id = ?`;
        const totalOpenings = await executeQuery(query, [employee_id]);

        query = `SELECT COUNT(*) AS filled_positions FROM candidate_assignments ca
                JOIN processes p ON p.id = ca.process_id
                JOIN client_employee_assignments cea ON cea.client_id = p.client_id
                JOIN employees e ON e.id = cea.employee_id
                WHERE ca.assignment_status IN ('joined','clawback','invoice','completely_joined') AND p.status = 'Active' AND cea.employee_id = ?`;
        const filledPositions = await executeQuery(query, [employee_id]);

        const fillRate = totalOpenings[0].total_openings > 0 ? (filledPositions[0].filled_positions / totalOpenings[0].total_openings) * 100 : 0;

        res.status(200).json({
            total_processes: totalProcesses[0].total_processes,
            total_openings: totalOpenings[0].total_openings,
            filled_positions: filledPositions[0].filled_positions,
            fill_rate: fillRate
        });
    } catch (error) {
        console.error("Error while fetching stats:", error);
        res.status(400).send(error);
    }
}

export const getContactPersonDetails = async (req, res) => {
    const employee_id = req.query.employee_id;
    try {
        let query = `SELECT c.client_name, c.cp_name, c.cp_email, c.cp_phone FROM clients c
                    JOIN client_employee_assignments cea ON c.id = cea.client_id
                    JOIN employees e ON cea.employee_id = e.id
                    WHERE e.employee_id = ? AND c.status = 'active'`;
        const contactPersonDetails = await executeQuery(query, [employee_id]);
        res.status(200).json(contactPersonDetails);
    } catch (error) {
        console.error("Error while fetching contact person details:", error);
        res.status(400).send(error);
    }
}

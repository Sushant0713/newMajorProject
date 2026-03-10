import { executeQuery } from "../lib/executeQuery.js";

export const getPayouts = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        const {search, process_name, client_name, status, fromDate, toDate} = req.body;

        let query = `SELECT 
                        c.name AS candidate_name,
                        c.id AS candidate_id,
                        pr.process_name,
                        pr.id AS process_id,
                        cl.client_name,
                        p.id AS payout_id,
                        p.joined_date,
                        cl.approx_revenue AS revenue,
                        p.status,
                        p.generated_at
                    FROM candidate_assignments ca
                    JOIN candidates c ON c.id = ca.candidate_id
                    JOIN processes pr ON pr.id = ca.process_id
                    JOIN clients cl ON cl.id = pr.client_id
                    JOIN (
                        SELECT candidate_id, MAX(id) AS latest_id
                        FROM employee_assignments
                        GROUP BY candidate_id
                    ) latest ON latest.candidate_id = ca.candidate_id
                    JOIN employee_assignments ea  ON ea.id = latest.latest_id
                    LEFT JOIN payouts p ON p.candidate_id = ca.candidate_id AND p.employee_id = ea.employee_id
                    WHERE ea.employee_id = ? AND ca.assignment_status IN  ('joined','clawback','invoice','approved','completely_joined','rejected')`;
                    
        const params = [employee_id];
        if(search){
            query += ` AND (c.name LIKE ? OR c.id LIKE ? OR pr.process_name LIKE ? OR cl.client_name LIKE ? )`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); 
        }
        if(process_name){
            query += ` AND pr.process_name = ?`;
            params.push(process_name);
        }
        if(client_name){
            query += ` AND cl.client_name = ?`;
            params.push(client_name);
        }   
        if(status){
            query += ` AND p.status = ?`;
            params.push(status);
        }
        if(fromDate || toDate){
            if(fromDate && toDate){
                query += ` AND p.generated_at BETWEEN ? AND ?`;
                params.push(fromDate, toDate);
            }
            else if(fromDate){
                query += ` AND p.generated_at >= ?`;
                params.push(fromDate);
            }
            else if(toDate){
                query += ` AND p.generated_at <= ?`;
                params.push(toDate);
            }
        }
        const payouts = await executeQuery(query, params);
        return res.json(payouts);
    } catch (error) {
        console.error("Error fetching payouts:", error);
        return res.status(500).send(error);
    }
}

export const payoutHistory = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        const candidate_id = req.body.candidateId;
        if(!employee_id || !candidate_id){
            return res.status(400).send("Employee ID and Candidate ID are required");
        }
        var query = `SELECT 
                        csh.new_status,
                        csh.change_reason,
                        csh.changed_at,
                        c.name as candidate_name
                    FROM candidate_status_history csh
                    JOIN candidates c ON csh.candidate_id = c.id
                    WHERE csh.candidate_id = ? AND csh.employee_id = ?
                    ORDER BY csh.changed_at DESC`;
        const employeePayoutHistory = await executeQuery(query, [candidate_id, employee_id]);
        return res.json(employeePayoutHistory);
    } catch (error) {
        console.error("Error fetching payout history:", error);
        return res.status(500).send(error);
    }
}

export const getProcessNames = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `SELECT DISTINCT pr.process_name FROM processes pr 
                    JOIN payouts p ON p.process_id = pr.id WHERE p.employee_id = ?`;
        const result = await executeQuery(query, [employee_id]);
        const processNames = result.map(row => row.process_name);
        return res.json(processNames);
    } catch (error) {
        console.error("Error fetching process names:", error);
        return res.status(500).send(error);
    }
}

export const getClientNames = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `SELECT DISTINCT cl.client_name
                    FROM payouts p
                    JOIN processes pr ON p.process_id = pr.id
                    JOIN clients cl ON pr.client_id = cl.id
                    WHERE p.employee_id = ?`;
        const result = await executeQuery(query, [employee_id]);
        const clientNames = result.map(row => row.client_name);
        return res.json(clientNames);
    } catch (error) {
        console.error("Error fetching clients name:", error);
        return res.status(500).send(error);
    }
}

export const getStatusOptions = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `SELECT DISTINCT status FROM payouts WHERE employee_id = ?`;
        const result = await executeQuery(query, [employee_id]);
        const statusOptions = result.map(row => row.status);
        return res.json(statusOptions);
    } catch (error) {
        console.error("Error fetching status options:", error);
        return res.status(500).send(error);
    }
}

export const getCountByStatus = async(req, res) => {
    try {
        const employee_id = req.query.empId;
        var query = `SELECT status, COUNT(*) AS count FROM payouts WHERE employee_id = ? GROUP BY status`;
        const result = await executeQuery(query, [employee_id]);
        const countsByStatus = {};
        result.forEach(row => {
            countsByStatus[row.status] = row.count;
        });
        return res.json(countsByStatus);
    } catch (error) {
        console.error("Error fetching counts of payouts according to status:", error);
        return res.status(500).send(error);
    }
}
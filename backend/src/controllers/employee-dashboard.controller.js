import { executeQuery } from "../lib/executeQuery.js";

//Get total assigned calients to an employee
export const totalAssignedClients = async (req, res) => {
    try {
        const empId = req.query.empId;
        var query = `SELECT COUNT(DISTINCT c.id) as total_clients
                    FROM clients c
                    INNER JOIN client_employee_assignments cea ON c.id = cea.client_id
                    INNER JOIN employees e ON cea.employee_id = e.id
                    WHERE e.employee_id = ? AND c.status = 'active'`;
        const assignedClients = await executeQuery(query, [empId]);

        if (assignedClients.length > 0) {
            return res.status(200).json({ total_clients: assignedClients[0].total_clients });
        } else {
            return res.status(200).json({ total_clients: 0 });
        }
    } catch (error) {
        console.error("Error while fetching assigned clients", error);
        return res.status(500).send("Error while fetching assigned clients");
    }
}

//Get assigned candidates to an employee
export const totalAssignedCandidates = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;
        let query = `SELECT COUNT(*) AS total_candidates
                FROM employee_assignments ea
                JOIN (
                    SELECT candidate_id, MAX(id) AS latest_id
                    FROM employee_assignments
                    GROUP BY candidate_id
                ) latest ON ea.id = latest.latest_id
                WHERE ea.employee_id = ?`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ea.updated_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        const assignedCandidates = await executeQuery(query, params);

        if (assignedCandidates.length > 0) {
            return res.status(200).json({ total_candidates: assignedCandidates[0].total_candidates });
        } else {
            return res.status(200).json({ total_candidates: 0 });
        }
    } catch (error) {
        console.error("Error while fetching assigned candidates", error);
        return res.status(500).send("Error while fetching assigned candidates");
    }
}

//Get assigned processes to an employee
export const totalassignedProcesses = async (req, res) => {
    try {
        const empId = req.query.empId;
        var query = `SELECT COUNT(*) AS total_processes FROM processes p
                        JOIN client_employee_assignments cea ON cea.client_id = p.client_id
                        JOIN employees e ON e.id = cea.employee_id
                        WHERE p.status = 'active' AND e.employee_id = ?`;
        const assignedProcesses = await executeQuery(query, [empId]);

        if (assignedProcesses.length > 0) {
            return res.status(200).json({ total_processes: assignedProcesses[0].total_processes });
        } else {
            return res.status(200).json({ total_processes: 0 });
        }
    } catch (error) {
        console.error("Error while fetching assigned processes", error);
        return res.status(500).send("Error while fetching assigned processes");
    }
}

//Get conversion rate of an employee
export const conversionRate = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;
        let query = `SELECT 
                        COUNT(CASE WHEN ca.assignment_status IN ('completely_joined', 'dropout') THEN 1 END) as completed,
                        COUNT(*) as total
                    FROM candidate_assignments ca
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    WHERE e.employee_id = ?`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ca.assigned_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        const result = await executeQuery(query, params);

        const conversionRate = result[0].total > 0 ? Number(((result[0].completed / result[0].total) * 100).toFixed(1)) : 0;

        return res.status(200).json({ conversion_rate: conversionRate });
    } catch (error) {
        console.error("Error while calculating conversion rate", error);
        return res.status(500).send("Error while calculating conversion rate");
    }
}

//Get success rate of an employee
export const successRate = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;

        let query = `SELECT 
                COUNT(*) AS total,
                COUNT(CASE WHEN ca.assignment_status = 'completely_joined' THEN 1 END) AS completely_joined,
                COUNT(CASE WHEN ca.assignment_status = 'joined' THEN 1 END) AS joined_count
            FROM candidate_assignments ca
            INNER JOIN employees e ON ca.assigned_by = e.id
            WHERE e.employee_id = ?`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ca.assigned_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        const result = await executeQuery(query, params);

        const total = result[0].total;
        const completelyJoined = result[0].completely_joined;
        const joinedCount = result[0].joined_count;

        const successRate = total > 0 ? Number((((completelyJoined + joinedCount) / total) * 100).toFixed(1)) : 0;

        return res.status(200).json({ success_rate: successRate });
    } catch (error) {
        console.error("Error while calculating success rate", error);
        return res.status(500).send("Error while calculating success rate");
    }
}

//Get dropout rate of an employee
export const dropoutRate = async (req, res) => {
    try {
        const empId = req.query.empId;

        const query = `SELECT 
                COUNT(*) AS total,
                COUNT(CASE WHEN ca.assignment_status = 'dropout' THEN 1 END) AS dropout_count
            FROM candidate_assignments ca
            INNER JOIN employees e ON ca.assigned_by = e.id
            WHERE e.employee_id = ? `;

        const result = await executeQuery(query, [empId]);

        const total = result[0].total;
        const dropoutCount = result[0].dropout_count;

        const dropoutRate = total > 0
            ? Number(((dropoutCount / total) * 100).toFixed(1))
            : 0;

        return res.status(200).json({ dropout_rate: dropoutRate });
    } catch (error) {
        console.error("Error while calculating dropout rate", error);
        return res.status(500).send("Error while calculating dropout rate");
    }
}

//Get today's assignments count for an employee (or count in range)
export const todaysAssignment = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;
        let query = `SELECT COUNT(*) as today_assignments
                    FROM candidate_assignments ca
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    WHERE e.employee_id = ?`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ca.assigned_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else {
            query += ` AND DATE(ca.assigned_at) = CURDATE()`;
        }

        const assignments = await executeQuery(query, params);

        if (assignments.length > 0) {
            return res.status(200).json({ today_assignments: assignments[0].today_assignments });
        } else {
            return res.status(200).json({ today_assignments: 0 });
        }
    } catch (error) {
        console.error("Error while fatching today's assingnments", error);
        return res.status(500).send("Error while fatching today's assingnments");
    }
}

//Get completed this week count for an employee (or count in range)
export const completedThisWeek = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;
        let query = `SELECT COUNT(*) as week_completed
                    FROM candidate_assignments ca
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    WHERE e.employee_id = ? 
                    AND ca.assignment_status = 'completely_joined'`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ca.updated_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        } else {
            query += ` AND ca.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
        }

        const thisWeekCompletion = await executeQuery(query, params);

        if (thisWeekCompletion.length > 0) {
            return res.status(200).json({ week_completed: thisWeekCompletion[0].week_completed });
        } else {
            return res.status(200).json({ week_completed: 0 });
        }
    } catch (error) {
        console.error("Error while fatching this week's completion", error);
        return res.status(500).send("Error while fatching this week's completion");
    }
}

//Get commission rate for an employee
export const commissionRate = async (req, res) => {
    try {
        const empId = req.query.empId;
        var query = `SELECT percentage as commission_rate FROM employees WHERE employee_id=?;`;
        const commission = await executeQuery(query, [empId]);
        return res.status(200).json(commission);
    } catch (error) {
        console.error("Error while fatching commission rate", error);
        return res.status(500).send("Error while fatching commission rate");
    }
}

//Get recruitment pipeline for an employee
export const recruitmentPipeline = async (req, res) => {
    try {
        const { empId, start_date, end_date } = req.query;
        let query = `SELECT 
                        COUNT(CASE WHEN ca.assignment_status = 'assigned' THEN 1 END) as new,
                        COUNT(CASE WHEN ca.assignment_status = 'selected' THEN 1 END) as selected,
                        COUNT(CASE WHEN ca.assignment_status = 'interview_scheduled' THEN 1 END) as interview,
                        COUNT(CASE WHEN ca.assignment_status = 'joined' THEN 1 END) as joined,
                        COUNT(CASE WHEN ca.assignment_status = 'dropout' THEN 1 END) as dropout,
                        COUNT(CASE WHEN ca.assignment_status = 'clawback' THEN 1 END) as clawback
                    FROM candidate_assignments ca
                    INNER JOIN candidates c ON ca.candidate_id = c.id
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    WHERE e.employee_id = ?`;
        let params = [empId];

        if (start_date && end_date) {
            query += ` AND DATE(ca.assigned_at) BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        const pipeline = await executeQuery(query, params);

        if (pipeline.length > 0) {
            return res.status(200).json({ pipeline: pipeline[0] });
        } else {
            return res.status(200).json({
                pipeline: {
                    new: 0,
                    selected: 0,
                    interview: 0,
                    joined: 0,
                    dropout: 0,
                    clawback: 0
                }
            });
        }
    } catch (error) {
        console.error("Error while fatching recruitment pipeline", error);
        return res.status(500).send("Error while fatching recruitment pipeline");
    }
}

//Get monthly success logs for an employee
export const monthlySuccessLogs = async (req, res) => {
    try {
        const empId = req.query.empId;

        // 1. Query only existing logs
        var query = `SELECT 
                        DATE_FORMAT(ca.assigned_at, '%Y-%m') AS month,
                        COUNT(*) AS total,
                        COUNT(CASE WHEN ca.assignment_status = 'completely_joined' THEN 1 END) AS completely_joined,
                        COUNT(CASE WHEN ca.assignment_status = 'joined' THEN 1 END) AS joined_count
                    FROM candidate_assignments ca
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    WHERE 
                        e.employee_id = ?
                        AND ca.assigned_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
                    GROUP BY DATE_FORMAT(ca.assigned_at, '%Y-%m')
                    ORDER BY month ASC`;
        const logs = await executeQuery(query, [empId]);

        // 1.5 Query for interviews (Conversion Rate basis)
        var interviewQuery = `SELECT 
                        DATE_FORMAT(csh.changed_at, '%Y-%m') AS month,
                        COUNT(DISTINCT csh.candidate_id) AS interviews
                    FROM candidate_status_history csh
                    WHERE 
                        csh.employee_id = ?
                        AND csh.new_status = 'interview_scheduled'
                        AND csh.changed_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
                    GROUP BY DATE_FORMAT(csh.changed_at, '%Y-%m')`;
        const interviewLogs = await executeQuery(interviewQuery, [empId]);

        // 2. Generate last 12 months array
        const now = new Date();
        const last12Months = [];

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

            const key = d.toISOString().slice(0, 7); // YYYY-MM

            last12Months.push({
                month: key,
                successRate: 0,
                conversionRate: 0,
            });
        }

        // 3. Merge SQL data into the 12-month array
        for (const m of last12Months) {
            const found = logs.find((r) => r.month === m.month);
            if (found) {
                m.successRate = found.total > 0
                    ? Number((((found.completely_joined + found.joined_count) / found.total) * 100).toFixed(2))
                    : 0;
            }

            const foundInterview = interviewLogs.find((r) => r.month === m.month);
            if (foundInterview && found && found.total > 0) {
                // Conversion rate = (Interviews / Total Assignments) * 100
                m.conversionRate = Number(Math.min(((foundInterview.interviews / found.total) * 100), 100).toFixed(2));
            } else if (foundInterview) {
                m.conversionRate = 100; // Rare edge case where interviews happen in a month with 0 assignments
            }
        }

        // 4. Send response
        res.json({ empId, months: last12Months, });

    } catch (error) {
        console.error("Error while fetching monthly success logs", error);
        return res.status(500).send("Error while fetching monthly success logs");
    }
}

export const getMonthlyTargetAchievement = async (req, res) => {
    const { employee_id, start_date, end_date } = req.body;
    try {
        let query = `SELECT 
                        COUNT(*) AS total_joined_candidates,
                        COALESCE(SUM(cl.approx_revenue), 0) AS total_revenue
                    FROM candidate_assignments ca
                    INNER JOIN employees e ON ca.assigned_by = e.id
                    JOIN processes p ON p.id = ca.process_id
                    JOIN clients cl ON cl.id = p.client_id
                    WHERE 
                        e.employee_id = ?
                        AND ca.assignment_status IN ('joined', 'completely_joined')`;
        let achievementParams = [employee_id];

        if (start_date && end_date) {
            query += ` AND DATE(ca.updated_at) BETWEEN ? AND ?`;
            achievementParams.push(start_date, end_date);
        } else {
            query += ` AND ca.updated_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                       AND ca.updated_at < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`;
        }

        const achievementResult = await executeQuery(query, achievementParams);

        const employeeIdINT = await executeQuery(`SELECT id FROM employees WHERE employee_id = ?`, [employee_id]);
        const employee_id_int = employeeIdINT.length ? employeeIdINT[0].id : null;

        query = `SELECT revenue_target, candidate_target FROM monthly_target WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1`;
        const targetResult = await executeQuery(query, [employee_id_int]);

        query = `SELECT COUNT(*) AS interviewCount FROM candidate_status_history csh
                    JOIN (
                        SELECT candidate_id, MAX(id) AS latest_id
                        FROM employee_assignments
                        GROUP BY candidate_id
                    ) latest ON latest.candidate_id = csh.candidate_id
                    JOIN employee_assignments ea ON ea.id = latest.latest_id
                    WHERE csh.new_status = 'interview_scheduled'
                        AND ea.employee_id = ?`;
        let interviewParams = [employee_id];
        
        if (start_date && end_date) {
            query += ` AND DATE(csh.changed_at) BETWEEN ? AND ?`;
            interviewParams.push(start_date, end_date);
        } else {
            query += ` AND csh.changed_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                        AND csh.changed_at < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`;
        }

        const interviewCount = await executeQuery(query, interviewParams);

        query = `SELECT COUNT(*) AS assignedCandidate
                FROM employee_assignments ea
                JOIN (
                    SELECT candidate_id, MAX(id) AS latest_id
                    FROM employee_assignments
                    GROUP BY candidate_id
                ) latest ON ea.id = latest.latest_id
                WHERE ea.employee_id = ?`;
        let assignedParams = [employee_id];

        if (start_date && end_date) {
            query += ` AND DATE(ea.created_at) BETWEEN ? AND ?`;
            assignedParams.push(start_date, end_date);
        } else {
            query += ` AND ea.created_at >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
                AND ea.created_at < DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 1 DAY)`;
        }

        const assignedCandidate = await executeQuery(query, assignedParams);

        const response = {
            generatedRevenue: achievementResult[0].total_revenue ? achievementResult[0].total_revenue : 0,
            revenueTarget: targetResult[0]?.revenue_target ? targetResult[0].revenue_target : 0,
            assignedCandidate: assignedCandidate[0].assignedCandidate ? assignedCandidate[0].assignedCandidate : 0,
            interviewCount: interviewCount[0].interviewCount ? interviewCount[0].interviewCount : 0,
            completelyJoined: achievementResult[0].total_joined_candidates ? achievementResult[0].total_joined_candidates : 0,
            candidateTarget: targetResult[0]?.candidate_target ? targetResult[0].candidate_target : 0,
        };

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error calculating achievement:", error);
        return res.status(500).json({
            message: "Failed to calculate achievement",
        });
    }
};

export const employeeProfile = async (req, res) => {
    try {
        const empId = req.query.empId;
        let query = `select first_name, middle_name, last_name, employee_id, designation, email, phone, joining_date, 
                    percentage as commission_rate, status, aadhar_address from employees where employee_id='${empId}'`;
        const [profile] = await executeQuery(query, [empId]);
        return res.status(200).json(profile);
    } catch (error) {
        console.error("Error while fetching employee profile", error);
        return res.status(500).send("Error while fatching employee profile");
    }
}

export const updateEmployeeProfile = async (req, res) => {
    try {
        const empId = req.query.empId;
        const { email, phone, aadhar_address } = req.body;
        var query = `UPDATE employees SET email = ?, phone = ?, aadhar_address = ? WHERE employee_id = ?`
        const updatedProfile = await executeQuery(query, [email, phone, aadhar_address, empId]);
        if (updatedProfile.affectedRows > 0) {
            return res.status(200).json({ message: "Employee profile updated successfully" });
        } else {
            return res.status(200).json({ message: "Failed to update employee profile" });
        }
    } catch (error) {
        console.error("Error while updating employee profile", error);
        return res.status(500).send("Error while updating employee profile");
    }
}
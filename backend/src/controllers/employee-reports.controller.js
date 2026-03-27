import { executeQuery } from "../lib/executeQuery.js";

/**
 * GET /api/employee/reports/summary?empId=EMP002
 * Returns all data needed for the Employee Reports page in one call.
 */
export const getEmployeeReportsSummary = async (req, res) => {
    try {
        const empId = req.query.empId;
        const clientFilter = req.query.client !== "All" && req.query.client ? req.query.client : null;
        const processFilter = req.query.process !== "All" && req.query.process ? req.query.process : null;

        if (!empId) {
            return res.status(400).json({ message: "empId is required" });
        }

        let joinClauses = `
            LEFT JOIN candidate_assignments ca ON ca.candidate_id = ea.candidate_id
            LEFT JOIN processes p ON p.id = ca.process_id
            LEFT JOIN clients cl ON cl.id = p.client_id
        `;
        let whereClauses = ``;
        let queryParams = [empId];

        if (clientFilter) {
            whereClauses += ` AND cl.client_name = ?`;
            queryParams.push(clientFilter);
        }
        if (processFilter) {
            whereClauses += ` AND p.process_name = ?`;
            queryParams.push(processFilter);
        }

        // ── 1. Monthly performance (last 12 months) ──────────────────────────
        const monthlyQuery = `
            SELECT
                DATE_FORMAT(ea.created_at, '%Y-%m') AS month_key,
                DATE_FORMAT(ea.created_at, '%b')     AS month,
                COUNT(*)                              AS assigned,
                COUNT(CASE WHEN ca.assignment_status = 'interview_scheduled' THEN 1 END) AS interviews,
                COUNT(CASE WHEN ca.assignment_status IN ('joined','completely_joined') THEN 1 END) AS joins
            FROM employee_assignments ea
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest ON ea.id = latest.latest_id
            ${joinClauses}
            WHERE ea.employee_id = ?
              AND ea.created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 11 MONTH), '%Y-%m-01')
              ${whereClauses}
            GROUP BY DATE_FORMAT(ea.created_at, '%Y-%m'), DATE_FORMAT(ea.created_at, '%b')
            ORDER BY month_key ASC
        `;
        const monthlyRaw = await executeQuery(monthlyQuery, queryParams);

        // Fill all 12 months (even empty ones)
        const now = new Date();
        const performanceData = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toISOString().slice(0, 7);
            const label = d.toLocaleString('default', { month: 'short' });
            const found = monthlyRaw.find(r => r.month_key === key);
            performanceData.push({
                month: label,
                joins: found ? Number(found.joins) : 0,
                interviews: found ? Number(found.interviews) : 0,
                cvs: found ? Number(found.assigned) : 0,   // assigned = CVs worked
                target: 0,  // filled from monthly_target below
            });
        }

        // ── 2. Monthly target for this employee ───────────────────────────────
        const empIntQuery = `SELECT id FROM employees WHERE employee_id = ?`;
        const empIntRows = await executeQuery(empIntQuery, [empId]);
        const empIntId = empIntRows.length ? empIntRows[0].id : null;

        let candidateTarget = 0;
        if (empIntId) {
            const targetQuery = `SELECT candidate_target FROM monthly_target WHERE employee_id = ? ORDER BY created_at DESC LIMIT 1`;
            const targetRows = await executeQuery(targetQuery, [empIntId]);
            if (targetRows.length) candidateTarget = Number(targetRows[0].candidate_target);
        }
        // Inject target into all months
        performanceData.forEach(m => { m.target = candidateTarget; });

        // ── 3. Overall stats ──────────────────────────────────────────────────
        const statsQuery = `
            SELECT
                COUNT(*) AS total_assignments,
                COUNT(CASE WHEN ca.assignment_status = 'interview_scheduled' THEN 1 END) AS total_interviews,
                COUNT(CASE WHEN ca.assignment_status IN ('joined','completely_joined') THEN 1 END) AS total_joins,
                COUNT(CASE WHEN ca.assignment_status = 'completely_joined' THEN 1 END) AS completely_joined,
                COUNT(CASE WHEN ca.assignment_status = 'dropout' THEN 1 END) AS dropout
            FROM employee_assignments ea
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest ON ea.id = latest.latest_id
            ${joinClauses}
            WHERE ea.employee_id = ?
            ${whereClauses}
        `;
        const statsRows = await executeQuery(statsQuery, queryParams);
        const s = statsRows[0] || {};
        const totalAssignments = Number(s.total_assignments) || 0;
        const totalJoins = Number(s.total_joins) || 0;
        const totalInterviews = Number(s.total_interviews) || 0;
        const totalCVs = performanceData.reduce((a, m) => a + m.cvs, 0);
        const conversionRate = totalInterviews > 0
            ? Number(((totalJoins / totalInterviews) * 100).toFixed(1)) : 0;
        const targetAchievement = candidateTarget > 0
            ? Math.min(Number(((totalJoins / candidateTarget) * 100).toFixed(1)), 100) : 0;

        // ── 4. Client-wise performance ────────────────────────────────────────
        const clientQuery = `
            SELECT
                cl.client_name AS client,
                COUNT(*) AS joins,
                COUNT(*) AS cvs,
                ROUND(
                    COUNT(CASE WHEN ca.assignment_status = 'completely_joined' THEN 1 END) * 100.0 /
                    NULLIF(COUNT(*), 0)
                , 0) AS success
            FROM employee_assignments ea
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest ON ea.id = latest.latest_id
            LEFT JOIN candidate_assignments ca ON ca.candidate_id = ea.candidate_id
            LEFT JOIN processes p ON p.id = ca.process_id
            LEFT JOIN clients cl ON cl.id = p.client_id
            WHERE ea.employee_id = ?
              AND cl.client_name IS NOT NULL
              ${whereClauses}
            GROUP BY cl.id, cl.client_name
            ORDER BY joins DESC
            LIMIT 10
        `;
        const clientWiseData = await executeQuery(clientQuery, queryParams);

        // ── 5. Process-wise distribution ──────────────────────────────────────
        const processQuery = `
            SELECT
                p.process_name AS process,
                COUNT(*) AS count
            FROM employee_assignments ea
            JOIN (
                SELECT candidate_id, MAX(id) AS latest_id
                FROM employee_assignments
                GROUP BY candidate_id
            ) latest ON ea.id = latest.latest_id
            LEFT JOIN candidate_assignments ca ON ca.candidate_id = ea.candidate_id
            LEFT JOIN processes p ON p.id = ca.process_id
            LEFT JOIN clients cl ON cl.id = p.client_id
            WHERE ea.employee_id = ?
              AND p.process_name IS NOT NULL
              ${whereClauses}
            GROUP BY p.id, p.process_name
            ORDER BY count DESC
            LIMIT 8
        `;
        const processRaw = await executeQuery(processQuery, queryParams);
        const totalProcessCount = processRaw.reduce((a, r) => a + Number(r.count), 0);
        const processWiseData = processRaw.map(r => ({
            process: r.process,
            count: Number(r.count),
            percentage: totalProcessCount > 0
                ? Math.round((Number(r.count) / totalProcessCount) * 100) : 0,
        }));

        // ── 6. Recent activities (last 20 status-change events) ───────────────
        const activitiesQuery = `
            SELECT
                csh.id,
                DATE_FORMAT(csh.changed_at, '%Y-%m-%d') AS date,
                csh.new_status,
                csh.old_status,
                c.name AS candidate_name,
                p.process_name
            FROM candidate_status_history csh
            JOIN candidates c ON c.id = csh.candidate_id
            LEFT JOIN candidate_assignments ca ON ca.candidate_id = c.id
            LEFT JOIN processes p ON p.id = ca.process_id
            LEFT JOIN clients cl ON cl.id = p.client_id
            WHERE csh.employee_id = ?
            ${whereClauses}
            ORDER BY csh.changed_at DESC
            LIMIT 20
        `;
        const activitiesRaw = await executeQuery(activitiesQuery, queryParams);

        const statusLabels = {
            assigned: { label: 'Assigned', type: 'update', color: '#3b82f6' },
            ring: { label: 'Called', type: 'client', color: '#f59e0b' },
            resume_selected: { label: 'Resume Selected', type: 'screening', color: '#14b8a6' },
            interview_scheduled: { label: 'Interview Scheduled', type: 'interview', color: '#8b5cf6' },
            joined: { label: 'Joined', type: 'joining', color: '#10b981' },
            completely_joined: { label: 'Completely Joined', type: 'joining', color: '#059669' },
            dropout: { label: 'Dropout', type: 'submission', color: '#ef4444' },
            pass: { label: 'Passed', type: 'update', color: '#64748b' },
            hold: { label: 'On Hold', type: 'update', color: '#f59e0b' },
            callback_requested: { label: 'Callback Requested', type: 'client', color: '#f97316' },
            not_answered: { label: 'Not Answered', type: 'client', color: '#94a3b8' },
            clawback: { label: 'Clawback', type: 'update', color: '#dc2626' },
        };

        const recentActivities = activitiesRaw.map(r => {
            const meta = statusLabels[r.new_status] || { label: r.new_status, type: 'update', color: '#6366f1' };
            return {
                id: r.id,
                date: r.date,
                activity: `${meta.label}: ${r.candidate_name}${r.process_name ? ` (${r.process_name})` : ''}`,
                type: meta.type,
                color: meta.color,
            };
        });

        // ── 7. Send all data ──────────────────────────────────────────────────
        return res.status(200).json({
            stats: {
                totalJoins,
                totalInterviews,
                totalCVs,
                conversionRate,
                targetAchievement,
                totalAssignments,
            },
            performanceData,
            clientWiseData: clientWiseData.map(r => ({
                client: r.client,
                joins: Number(r.joins),
                cvs: Number(r.cvs),
                success: Number(r.success) || 0,
            })),
            processWiseData,
            recentActivities,
        });

    } catch (error) {
        console.error("Error in getEmployeeReportsSummary:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

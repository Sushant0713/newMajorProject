import { executeQuery } from "../lib/executeQuery.js";
import db from "../lib/db.js";

async function calculateEmployeeRevenue(employeeId, showPayout, fromDate, toDate) {
    const query = `
        SELECT p.payout_amount, p.real_payout_amount
        FROM candidate_assignments ca
        JOIN processes p ON ca.process_id = p.id
        WHERE ca.assigned_by = ?
        AND ca.assignment_status = 'completely_joined'
        AND DATE(ca.updated_at) BETWEEN ? AND ?
    `;

    const rows = await executeQuery(query, [employeeId, fromDate, toDate]);

    let revenue = 0;
    let actualRevenue = 0;

    for (const row of rows) {
        const fake = Number(row.payout_amount || 0);
        const real = Number(row.real_payout_amount ?? row.payout_amount ?? 0);

        revenue += showPayout === "fake" ? fake : real;
        actualRevenue += real;
    }

    return { revenue, actualRevenue };
}

// Get all teams with optional filters
export const getAllTeams = async (req, res) => {
    try {
        let { search, fromDate, toDate, type } = req.body || {};
        if (!fromDate) fromDate = "2000-01-01";
        if (!toDate) toDate = new Date().toISOString().split("T")[0];
        let whereClauses = [];
        let params = [];

        if (search) {
            whereClauses.push(
                "(t.team_name LIKE ? OR e.full_name LIKE ?)"
            );
            params.push(`%${search}%`, `%${search}%`);
        }

        if (type) {
            whereClauses.push("t.team_type = ?");
            params.push(type);
        }

        if (fromDate && toDate) {
            whereClauses.push("DATE(t.created_at) BETWEEN ? AND ?");
            params.push(fromDate, toDate);
        }

        const whereSQL = whereClauses.length
            ? `WHERE ${whereClauses.join(" AND ")}`
            : "";

        const query = `
            SELECT 
                t.*,
                e.full_name AS leader_name,
                COUNT(tm.id) AS member_count
            FROM teams t
            LEFT JOIN employees e ON t.leader_id = e.id
            LEFT JOIN team_members tm ON t.id = tm.team_id
            ${whereSQL}
            GROUP BY t.id
            ORDER BY t.created_at DESC
        `;

        const teams = await executeQuery(query, params);

        if (teams.length === 0) {
            return res.status(404).json({ message: "No teams found" });
        }

        for (const team of teams) {
            const membersQuery = `
                SELECT e.id, e.show_payout
                FROM team_members tm
                JOIN employees e ON tm.employee_id = e.id
                WHERE tm.team_id = ?
            `;
            const members = await executeQuery(membersQuery, [team.id]);
            let totalRevenue = 0;
            let totalActualRevenue = 0;

            for (const member of members) {
                const { revenue, actualRevenue } =
                    await calculateEmployeeRevenue(
                        member.id,
                        member.show_payout,
                        fromDate,
                        toDate
                    );

                totalRevenue += revenue;
                totalActualRevenue += actualRevenue;
            }

            team.total_revenue = totalRevenue;
            team.total_actual_revenue = totalActualRevenue;
        }

        teams.sort((a, b) => b.total_revenue - a.total_revenue);
        res.status(200).json(teams);

    } catch (error) {
        console.error("Error while fetching teams:", error);
        res.status(400).json({
            message: "Failed to fetch teams",
            error
        });
    }
};

// Get all members of a specific team
export const getTeamMembers = async (req, res) => {
    try {
        const teamId = req.query.teamId;
        let {fromDate, toDate} = req.body;
        if(!fromDate){
            fromDate = '2000-01-01';
        }
        if (!toDate) {
            toDate = new Date().toISOString().split('T')[0];
        }
        if(!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }
        var query = `SELECT e.id as employee_id, e.full_name, e.show_payout, e.designation, tm.joined_at
                    FROM team_members tm
                    JOIN employees e ON tm.employee_id = e.id
                    WHERE tm.team_id = ?
                    ORDER BY tm.joined_at ASC`;
        const teamMembers = await executeQuery(query, [teamId]);
        if(teamMembers.length === 0) {
            return res.status(404).json({ message: "No team members found" });
        }

        for (const member of teamMembers) {
            const { revenue, actualRevenue } =
                await calculateEmployeeRevenue(
                    member.employee_id,
                    member.show_payout,
                    fromDate,
                    toDate
                );

            member.revenue = revenue;
            member.actual_revenue = actualRevenue;
        }
        res.status(200).json(teamMembers);
    } catch (error) {
        console.error("Error while fetching team members:", error);
        res.status(400).json(error);
    }
}

// Get all active employees for dropdown and checkbox lists
export const getAllEmployees = async (req, res) => {
    try {
        var query = `SELECT id, full_name, designation FROM employees WHERE designation != 'admin' AND status = 'active' ORDER BY full_name`;
        const employeesForDroupdown = await executeQuery(query);
        if(employeesForDroupdown.length === 0) {
            return res.status(404).json({ message: "No employees found" });
        }
        res.status(200).json(employeesForDroupdown);
    } catch (error) {
        console.error("Error while fetching employees:", error);
        res.status(400).json(error);
    }
}

// Add a new team with members
export const addteam = async (req, res) => {
    const { team_name, team_type, destination, leader_id, members = [] } = req.body;
    if(!team_name && !team_type && !destination && !leader_id && members.length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
        // Create a new database connection
        connection = await db.promise().getConnection();
        // Start transaction
        await connection.beginTransaction();

        // Insert new team
        var query = `INSERT INTO teams (team_name, team_type, destination, leader_id) VALUES (?, ?, ?, ?)`;
        const addTeamResult = await connection.query(query, [team_name, team_type, destination, leader_id]);
        if(addTeamResult[0].affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Failed to add team" });
        }

        // Get the ID of the newly inserted team
        const team_id = addTeamResult[0].insertId;
        // Insert team members
        for (const member of members) {
            const addMemberResult = await connection.query(`INSERT INTO team_members (team_id, employee_id) VALUES (?, ?)`,[team_id, member.member_id] );
            if(addMemberResult[0].affectedRows === 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: "Failed to add team member" });
            }
        }

        // Commit transaction
        await connection.commit();
        connection.release();
        res.status(200).json({ message: "Team added successfully" });

    } catch (error) {
        if(connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error while adding team:", error);
        res.status(400).json(error);
    }
}

// Get details of a specific team
export const getTeamDetails = async (req, res) => {
    try {
        const teamId = req.query.teamId;
        if(!teamId) {
            return res.status(400).json({ message: "Team ID is required" });
        }
        var query = ` SELECT t.*, e.full_name as leader_name FROM teams t LEFT JOIN employees e ON t.leader_id = e.id WHERE t.id = ?`;
        const teamDetails = await executeQuery(query, [teamId]);  
        res.status(200).json(teamDetails);
    } catch (error) {
        console.error("Error while fetching team details:", error);
        res.status(400).json(error);
    }
}

// Edit an existing team and its members
export const updateTeam = async (req, res) => {
    const teamId = req.query.teamId;
    if(!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
    }
    const { team_name, team_type, destination, leader_id, members = [] } = req.body;
    if(!team_name && !team_type && !destination && !leader_id && members.length === 0) {
        return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // Update team details
        var query = `UPDATE teams SET team_name = ?, team_type = ?, destination = ?, leader_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
        const updateTeamResult = await connection.query(query, [team_name, team_type, destination, leader_id, teamId]);
        if(updateTeamResult[0].affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Failed to update team" });
        }

        //Detele existing team members
        await connection.query(`DELETE FROM team_members WHERE team_id = ?`, [teamId]);

        // Insert new team members
        for (const member of members) {
            const addMemberResult = await connection.query(`INSERT INTO team_members (team_id, employee_id) VALUES (?, ?)`,[teamId, member.member_id] );
            if(addMemberResult[0].affectedRows === 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ message: "Failed to add team member" });
            }
        }

        await connection.commit();
        connection.release();
        res.status(200).json({ message: "Team updated successfully" });

    } catch (error) {
        if(connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error while updating team:", error); 
        res.status(400).json(error);
    }
}

// Delete a team and its members
export const deleteTeam = async (req, res) => {
    const teamId = req.query.teamId;
    if(!teamId) {
        return res.status(400).json({ message: "Team ID is required" });
    }
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        var query = `DELETE FROM teams WHERE id = ?`;
        const deleteTeamResult = await connection.query(query, [teamId]);
        if(deleteTeamResult[0].affectedRows === 0) {
            await connection.rollback();
            connection.release();
            return res.status(400).json({ message: "Failed to delete team" });
        }

        await connection.commit();
        connection.release();
        res.status(200).json({ message: "Team deleted successfully" });
        
    } catch (error) {
        if(connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Error while deleting team:", error);
        res.status(400).json(error);
    }
}


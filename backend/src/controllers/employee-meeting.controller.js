import { executeQuery } from "../lib/executeQuery.js";

export const getAllMeetingsForEmployee = async (req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `
            SELECT *
            FROM meetings
            WHERE
                JSON_SEARCH(members, 'one', ?) IS NOT NULL
                OR
                CONCAT(',', REPLACE(REPLACE(REPLACE(members, '[', ''), ']', ''), '"', ''), ',')
                LIKE ?
            ORDER BY meeting_date DESC`;

        const meetings = await executeQuery(query, [
            employee_id,          // JSON_SEARCH
            `%,${employee_id},%`  // string fallback
        ]);
        return res.json(meetings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error while fetching meetings' });
    }
};


export const getUpcomingMeetings = async (req, res) => {
    try {
        const employee_id = req.query.empId;
        let query = `
            SELECT *
            FROM meetings
            WHERE meeting_date >= NOW()
              AND meeting_date <= DATE_ADD(NOW(), INTERVAL 7 DAY)
              AND status = 'scheduled'
              AND (
                    JSON_SEARCH(members, 'one', ?) IS NOT NULL
                    OR
                    CONCAT(',', REPLACE(REPLACE(REPLACE(members, '[', ''), ']', ''), '"', ''), ',')
                    LIKE ?
                  )
            ORDER BY meeting_date ASC`;

        const meetings = await executeQuery(query, [
            employee_id,
            `%,${employee_id},%`
        ]);
        return res.json(meetings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching upcoming meetings' });
    }
};


export const getTodaysMeetings = async (req, res) => {
    try {
        const employee_id = req.query.empId;
        const query = `
            SELECT *
            FROM meetings
            WHERE DATE(meeting_date) = CURDATE()
              AND status IN ('scheduled', 'ongoing')
              AND (
                    JSON_SEARCH(members, 'one', ?) IS NOT NULL
                    OR
                    CONCAT(',', REPLACE(REPLACE(REPLACE(members, '[', ''), ']', ''), '"', ''), ',')
                    LIKE ?
                  )
            ORDER BY meeting_date ASC`;

        const meetings = await executeQuery(query, [
            employee_id,
            `%,${employee_id},%`
        ]);
        return res.json(meetings);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching today\'s meetings' });
    }
};
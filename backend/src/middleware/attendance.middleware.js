import cron from "node-cron";
import { executeQuery } from "../lib/executeQuery.js";
import { UAParser } from "ua-parser-js";

export const startSession = async (req, employeeId) => {
    const parser = new UAParser(req.headers["user-agent"]);
    const device = parser.getDevice();
    const browser = parser.getBrowser();
    const deviceType = device.type || "desktop";
    const browserName = browser.name || "unknown";

    const temp = await executeQuery(`
        UPDATE attendance_sessions
        SET 
        logout_time = NOW(),
        total_minutes = TIMESTAMPDIFF(MINUTE, login_time, NOW()),
        status='expired'
        WHERE employee_id=? AND status='active'
    `,[employeeId]);
    if (temp.affectedRows > 0) {
        console.log(`Previous active session expired for employee: ${employeeId}`);
    }

    const result = await executeQuery(`
        INSERT INTO attendance_sessions
        (employee_id, login_time, last_activity_time, device, browser)
        VALUES (?, NOW(), NOW(), ?, ?)
    `,[employeeId, deviceType, browserName]);
    
    return result.insertId;
};

export const updateHeartbeat = async (sessionId) => {
    console.log("inside update heartbeat");
    if (!sessionId) throw new Error("sessionId is required");

    const result = await executeQuery(`
        UPDATE attendance_sessions
        SET last_activity_time = NOW()
        WHERE id = ? AND status = 'active'
    `, [sessionId]);

    if (result.affectedRows === 0) {
        console.warn(`Heartbeat: no active session found for id=${sessionId}`);
    }
    console.log("heartbeat updated successfully");
};

export const closeSession = async (sessionId) => {
    if (!sessionId) throw new Error("sessionId is required");

    await executeQuery(`
        UPDATE attendance_sessions
        SET 
            logout_time = NOW(),
            total_minutes = TIMESTAMPDIFF(MINUTE, login_time, NOW()),
            status = 'expired'
        WHERE id = ? AND status = 'active'
    `, [sessionId]);
};

cron.schedule("*/5 * * * *", async () => {
    try {
        const query = `
            UPDATE attendance_sessions
            SET
                logout_time = last_activity_time,
                total_minutes = TIMESTAMPDIFF(MINUTE, login_time, last_activity_time),
                status='expired'
            WHERE
                status='active'
                AND last_activity_time < NOW() - INTERVAL 10 MINUTE
        `;
        const result = await executeQuery(query);
        if (result.affectedRows > 0) {
            console.log(`Cron: expired ${result.affectedRows} idle session(s)`);
        }
    } catch (error) {
        console.error(error);
    }
});
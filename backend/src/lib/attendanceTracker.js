// import ExcelJS from "exceljs";
// import { executeQuery } from "./executeQuery.js";
// import nodemailer from "nodemailer";
// import cron from "node-cron";

// export const generateMonthlyAttendanceReport = async () => {
//     const query = `SELECT 
//                     a.id AS session_id,
//                     a.employee_id,
//                     e.full_name AS employee_name,
//                     DATE(a.login_time) AS date,
//                     TIME_FORMAT(a.login_time,'%h:%i %p') AS login_time,
//                     TIME_FORMAT(a.logout_time,'%h:%i %p') AS logout_time,
//                     a.device_type,
//                     a.browser_name,
//                     ROUND(a.total_minutes/60,2) AS session_lifespan
//                 FROM attendance_sessions a
//                 JOIN employees e ON a.employee_id = e.employee_id
//                 WHERE MONTH(a.login_time) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH) AND YEAR(a.login_time) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
//                 ORDER BY a.employee_id, a.login_time`;

//     const rows = await executeQuery(query);

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Attendance");

//     sheet.columns = [
//         { header: "Session ID", key: "session_id", width: 10 },
//         { header: "Employee ID", key: "employee_id", width: 12 },
//         { header: "Employee Name", key: "employee_name", width: 20 },
//         { header: "Date", key: "date", width: 15 },
//         { header: "Login Time", key: "login_time", width: 12 },
//         { header: "Logout Time", key: "logout_time", width: 12 },
//         { header: "Device Type", key: "device_type", width: 12 },
//         { header: "Browser", key: "browser_name", width: 12 },
//         { header: "Session Lifespan", key: "session_lifespan", width: 15 },
//         { header: "Working Hrs/Day", key: "working_day", width: 15 },
//         { header: "Working Hrs/Month", key: "working_month", width: 18 }
//     ];

//     const dayTotals = {};
//     const monthTotals = {};

//     rows.forEach(row => {
//         const key = `${row.employee_id}_${row.date}`;
//         if(!dayTotals[key]) dayTotals[key] = 0;
//         if(!monthTotals[row.employee_id]) monthTotals[row.employee_id] = 0;
//         dayTotals[key] += Number(row.session_lifespan);
//         monthTotals[row.employee_id] += Number(row.session_lifespan);
//     });

//     rows.forEach(row => {
//         const key = `${row.employee_id}_${row.date}`;
//         sheet.addRow({
//             ...row,
//             working_day: dayTotals[key].toFixed(2),
//             working_month: monthTotals[row.employee_id].toFixed(2)
//         });

//     });

//     const filePath = `./reports/attendance_${Date.now()}.xlsx`;
//     await workbook.xlsx.writeFile(filePath);
//     return filePath;
// };


// const sendEmailToAdmins = async (filePath) => {
//     const admins = await executeQuery(`SELECT email FROM admins`);
//     const transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.COMPANY_EMAIL,
//             pass: process.env.COMPANY_APP_PASSWORD,
//         }
//     });
//     for (const admin of admins) {
//         await transporter.sendMail({
//             from: process.env.COMPANY_EMAIL,
//             to: admin.email,
//             subject: "Monthly Employee Attendance Report",
//             text: "Please find the attached monthly attendance report.",
//             attachments: [
//                 {
//                     filename: "attendance_report.xlsx",
//                     path: filePath
//                 }
//             ]
//         });
//     }
// };


// cron.schedule("0 2 1 * *", async () => {
//     console.log("Running Monthly Attendance Report Cron...");
//     try {
//         const filePath = await generateMonthlyAttendanceReport();
//         await sendEmailToAdmins(filePath);
//         console.log("Monthly attendance report sent successfully.");
//     } catch (error) {
//         console.error("Error in monthly attendance cron:", error);
//     }
// });


import ExcelJS from "exceljs";
import { executeQuery } from "./executeQuery.js";
import nodemailer from "nodemailer";
import cron from "node-cron";
import fs from "fs";
import path from "path";

export const generateMonthlyAttendanceReport = async () => {
    const query = `
        SELECT 
            a.id AS session_id,
            a.employee_id,
            e.full_name AS employee_name,
            DATE(a.login_time) AS date,
            TIME_FORMAT(a.login_time, '%h:%i %p') AS login_time,
            TIME_FORMAT(a.logout_time, '%h:%i %p') AS logout_time,
            a.device AS device_type,
            a.browser AS browser_name,
            ROUND(a.total_minutes / 60, 2) AS session_lifespan
        FROM attendance_sessions a
        JOIN employees e ON a.employee_id COLLATE utf8mb4_unicode_ci = e.employee_id
        WHERE 
            MONTH(a.login_time) = MONTH(CURRENT_DATE - INTERVAL 1 MONTH)
            AND YEAR(a.login_time) = YEAR(CURRENT_DATE - INTERVAL 1 MONTH)
        ORDER BY a.employee_id, a.login_time
    `;

    const rows = await executeQuery(query);

    // BUG FIX: Create reports directory if it doesn't exist
    const reportsDir = "./reports";
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Attendance");

    sheet.columns = [
        { header: "Session ID",          key: "session_id",       width: 10 },
        { header: "Employee ID",         key: "employee_id",      width: 12 },
        { header: "Employee Name",       key: "employee_name",    width: 20 },
        { header: "Date",                key: "date",             width: 15 },
        { header: "Login Time",          key: "login_time",       width: 12 },
        { header: "Logout Time",         key: "logout_time",      width: 12 },
        { header: "Device Type",         key: "device_type",      width: 12 },
        { header: "Browser",             key: "browser_name",     width: 12 },
        { header: "Session Lifespan(Hrs)",key: "session_lifespan",width: 18 },
        { header: "Working Hrs/Day",     key: "working_day",      width: 15 },
        { header: "Working Hrs/Month",   key: "working_month",    width: 18 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" }
    };

    const dayTotals = {};
    const monthTotals = {};

    rows.forEach(row => {
        const key = `${row.employee_id}_${row.date}`;
        if (!dayTotals[key]) dayTotals[key] = 0;
        if (!monthTotals[row.employee_id]) monthTotals[row.employee_id] = 0;
        dayTotals[key] += Number(row.session_lifespan);
        monthTotals[row.employee_id] += Number(row.session_lifespan);
    });

    rows.forEach(row => {
        const key = `${row.employee_id}_${row.date}`;
        sheet.addRow({
            ...row,
            working_day: dayTotals[key].toFixed(2),
            working_month: monthTotals[row.employee_id].toFixed(2),
        });
    });

    const filePath = path.resolve(`./reports/attendance_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    console.log(`Report generated: ${filePath}`);
    return filePath;
};


const sendEmailToAdmins = async (filePath) => {
    const admins = await executeQuery(`SELECT email FROM admins`);

    if (admins.length === 0) {
        console.warn("No admins found to send report to.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.COMPANY_EMAIL,
            pass: process.env.COMPANY_APP_PASSWORD,
        },
    });

    for (const admin of admins) {
        await transporter.sendMail({
            from: process.env.COMPANY_EMAIL,
            to: admin.email,
            subject: "Monthly Employee Attendance Report",
            text: "Please find the attached monthly attendance report.",
            attachments: [
                {
                    filename: "attendance_report.xlsx",
                    path: filePath,
                },
            ],
        });
        console.log(`Report sent to: ${admin.email}`);
    }

    // BUG FIX: Delete the file after sending to avoid disk buildup
    fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete report file:", err);
        else console.log("Report file cleaned up.");
    });
};

export const deleteSessionHistory = async () => {
    const query = `TRUNCATE TABLE attendance_sessions`;
    await executeQuery(query);
}

cron.schedule("0 2 1 * *", async () => {
    console.log("Running Monthly Attendance Report Cron...");
    try {
        const filePath = await generateMonthlyAttendanceReport();
        await sendEmailToAdmins(filePath);
        await deleteSessionHistory();
        console.log("Monthly attendance report sent successfully.");
    } catch (error) {
        console.error("Error in monthly attendance cron:", error);
    }
}, {
    timezone: "Asia/Kolkata"
});
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"; 
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "./lib/attendanceTracker.js";
import authRouters from "./routers/auth.router.js";
import admin_employeeRouters from "./routers/admin-employee.router.js";
import admin_dashboardRouters from "./routers/admin-dashboard.router.js";
import admin_profileRouter from "./routers/admin-profile.router.js";
import admin_clientRouter from "./routers/admin-client.router.js";
import admin_processRouter from "./routers/admin-process.router.js";
import admin_teamRouter from "./routers/admin-team.router.js";
import admin_candidateRouter from "./routers/admin-candidate.router.js";
import admin_meetingsRouter from "./routers/admin-meetings.router.js";
import admin_teamrevenueRouter from "./routers/admin-teamrevenue.router.js";
import admin_payoutRouter from "./routers/admin-payout.router.js";
import admin_lopRouter from "./routers/admin-lop.router.js";
import admin_lineupRouter from "./routers/admin-lineup.router.js";
import admin_joiningRouter from "./routers/admin-joining.router.js";
import admin_dataRouter from "./routers/admin-data.router.js";
import employee_dashboardRouter from "./routers/employee-dashboard.router.js";
import employee_resumeRouter from "./routers/employee-resume.router.js";
import employee_meetingsRouter from "./routers/employee-meetings.router.js";
import employee_clientRouter from "./routers/employee-client.router.js";
import employee_payoutRouter from "./routers/employee-payout.router.js";
import employee_trackerRouter from "./routers/employee-tracker.router.js";
import employee_dataRouter from "./routers/employee-data.router.js";
import employee_reportsRouter from "./routers/employee-reports.router.js";

dotenv.config();

const app = express();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin : 'http://localhost:5173',
    // origin : 'http://192.168.1.12:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const uploadsPath = path.resolve(__dirname, "../../uploads");
app.use("/uploads", express.static(uploadsPath));

app.use("/api/auth", authRouters);
app.use("/api/admin/employee", admin_employeeRouters);
app.use("/api/admin/dashboard", admin_dashboardRouters);
app.use("/api/admin/profile", admin_profileRouter);
app.use("/api/admin/client", admin_clientRouter);
app.use("/api/admin/process", admin_processRouter);
app.use("/api/admin/team", admin_teamRouter);
app.use("/api/admin/candidate", admin_candidateRouter);
app.use("/api/admin/meetings", admin_meetingsRouter);
app.use("/api/admin/teamrevenue", admin_teamrevenueRouter);
app.use("/api/admin/payout", admin_payoutRouter);
app.use("/api/admin/lop", admin_lopRouter);
app.use("/api/admin/lineup", admin_lineupRouter);
app.use("/api/admin/joining", admin_joiningRouter);
app.use("/api/admin/data", admin_dataRouter);
app.use("/api/employee/dashboard", employee_dashboardRouter);
app.use('/api/employee/resume', employee_resumeRouter);
app.use('/api/employee/meetings', employee_meetingsRouter);
app.use('/api/employee/client', employee_clientRouter);
app.use('/api/employee/payout', employee_payoutRouter);
app.use('/api/employee/tracker', employee_trackerRouter);
app.use('/api/employee/data', employee_dataRouter);
app.use('/api/employee/reports', employee_reportsRouter);
app.listen(process.env.PORT, () => {
    console.log("server is running at port: "+process.env.PORT);
});
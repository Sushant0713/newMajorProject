import express from "express";
import { getEmployeeReportsSummary } from "../controllers/employee-reports.controller.js";

const router = express.Router();

router.get('/summary', getEmployeeReportsSummary);

export default router;

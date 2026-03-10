import express from "express";
import { dashboardStatistics, getTopPerformers, monthlyOverallSuccessLogs } from "../controllers/admin-dashboard.controller.js";

const router = express.Router();

router.get('/dashboardStatistics', dashboardStatistics);
router.post('/getTopPerformers', getTopPerformers);
router.get('/monthlyOverallSuccessLogs', monthlyOverallSuccessLogs);

export default router;
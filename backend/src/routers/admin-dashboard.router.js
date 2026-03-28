import express from "express";
import { dashboardStatistics, getTopPerformers, monthlyOverallSuccessLogs } from "../controllers/admin-dashboard.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/dashboardStatistics', protectRoute, dashboardStatistics);
router.post('/getTopPerformers', protectRoute, getTopPerformers);
router.get('/monthlyOverallSuccessLogs', protectRoute, monthlyOverallSuccessLogs);

export default router;
import express from "express";
import {
        totalAssignedClients, totalAssignedCandidates, totalassignedProcesses, conversionRate, successRate, dropoutRate,
        todaysAssignment, completedThisWeek, commissionRate, recruitmentPipeline, monthlySuccessLogs, employeeProfile, 
        updateEmployeeProfile, getMonthlyTargetAchievement
    } from '../controllers/employee-dashboard.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/totalAssignedClients', protectRoute, totalAssignedClients);
router.get('/totalAssignedCandidates', protectRoute, totalAssignedCandidates);
router.get('/totalassignedProcesses', protectRoute, totalassignedProcesses);
router.get('/conversionRate', protectRoute, conversionRate);
router.get('/successRate', protectRoute, successRate);
router.get('/dropoutRate', protectRoute, dropoutRate);
router.get('/todaysAssignment', protectRoute, todaysAssignment);
router.get('/completedThisWeek', protectRoute, completedThisWeek);
router.get('/commissionRate', protectRoute, commissionRate);
router.get('/recruitmentPipeline', protectRoute, recruitmentPipeline);
router.get('/monthlySuccessLogs', protectRoute, monthlySuccessLogs);
router.post('/getMonthlyTargetAchievement', protectRoute, getMonthlyTargetAchievement);
router.get('/employeeProfile', protectRoute, employeeProfile);
router.put('/updateEmployeeProfile', protectRoute, updateEmployeeProfile);

export default router;

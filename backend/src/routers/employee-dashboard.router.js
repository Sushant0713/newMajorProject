import express from "express";
import {
        totalAssignedClients, totalAssignedCandidates, totalassignedProcesses, conversionRate, successRate, dropoutRate,
        todaysAssignment, completedThisWeek, commissionRate, recruitmentPipeline, monthlySuccessLogs, employeeProfile, 
        updateEmployeeProfile, getMonthlyTargetAchievement
    } from '../controllers/employee-dashboard.controller.js';

const router = express.Router();

router.get('/totalAssignedClients', totalAssignedClients);
router.get('/totalAssignedCandidates', totalAssignedCandidates);
router.get('/totalassignedProcesses', totalassignedProcesses);
router.get('/conversionRate', conversionRate);
router.get('/successRate', successRate);
router.get('/dropoutRate', dropoutRate);
router.get('/todaysAssignment', todaysAssignment);
router.get('/completedThisWeek', completedThisWeek);
router.get('/commissionRate', commissionRate);
router.get('/recruitmentPipeline', recruitmentPipeline);
router.get('/monthlySuccessLogs', monthlySuccessLogs);
router.post('/getMonthlyTargetAchievement', getMonthlyTargetAchievement);
router.get('/employeeProfile', employeeProfile);
router.put('/updateEmployeeProfile', updateEmployeeProfile);

export default router;

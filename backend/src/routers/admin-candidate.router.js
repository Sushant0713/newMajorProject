import express from 'express';
import {  getCandidatesByStatus, getEmployeesForCandidateFilter, reassignCandidateToEmployee, markAsAvailable, bulkDropCandidate } from '../controllers/admin-candidate.controller.js';

const router = express.Router();

router.post('/getCandidatesByStatus', getCandidatesByStatus);
router.get('/getEmployeesForCandidateFilter', getEmployeesForCandidateFilter);
router.post('/reassignCandidateToEmployee', reassignCandidateToEmployee);
router.post('/markAsAvailable', markAsAvailable);
router.post('/bulkDropCandidate', bulkDropCandidate);


export default router;
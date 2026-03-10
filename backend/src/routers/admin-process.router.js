import express from "express";
import { getAllProcesses, addProcess, viewProcessDetails, getProcessSpocs, getProcessCandidates, getCandidateDetails, updateProcess, 
    deleteProcess, getClientNames } from '../controllers/admin-process.controller.js';

const router = express.Router();
router.get('/getAllProcesses', getAllProcesses);
router.post('/addProcess', addProcess);
router.get('/viewProcessDetails', viewProcessDetails);
router.get('/getProcessSpocs', getProcessSpocs);
router.post('/getProcessCandidates', getProcessCandidates);
router.get('/getCandidateDetails', getCandidateDetails);
router.post('/updateProcess', updateProcess);
router.delete('/deleteProcess', deleteProcess);
router.get('/getClientNames', getClientNames);

export default router;
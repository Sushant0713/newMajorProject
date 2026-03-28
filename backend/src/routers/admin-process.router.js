import express from "express";
import { getAllProcesses, addProcess, viewProcessDetails, getProcessSpocs, getProcessCandidates, getCandidateDetails, updateProcess, 
    deleteProcess, getClientNames } from '../controllers/admin-process.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/getAllProcesses', protectRoute, getAllProcesses);
router.post('/addProcess', protectRoute, addProcess);
router.get('/viewProcessDetails', protectRoute, viewProcessDetails);
router.get('/getProcessSpocs', protectRoute, getProcessSpocs);
router.post('/getProcessCandidates', protectRoute, getProcessCandidates);
router.get('/getCandidateDetails', protectRoute, getCandidateDetails);
router.post('/updateProcess', protectRoute, updateProcess);
router.delete('/deleteProcess', protectRoute, deleteProcess);
router.get('/getClientNames', protectRoute, getClientNames);

export default router;
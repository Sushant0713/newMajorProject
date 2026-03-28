import express from 'express';
import { getLineups, addCallLog, dropCandidate, getLineUpById, editLineUp, addToTracker, addNote, holdCandidate, passCandidate, 
    addResume, getProcess, getEmployees, addCandidate, updateCandidateStatus, exportLineUpCSV } from '../controllers/admin-lineup.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/getLineups', protectRoute, getLineups);
router.post('/addCallLog', protectRoute, addCallLog);
router.post('/dropCandidate', protectRoute, dropCandidate);
router.get('/getLineUpById', protectRoute, getLineUpById);
router.post('/editLineUp', protectRoute, editLineUp);
router.post('/addToTracker', protectRoute, addToTracker);
router.post('/addNote', protectRoute, addNote);
router.post('/holdCandidate', protectRoute, holdCandidate);
router.post('/passCandidate', protectRoute, passCandidate);
router.post('/addResume', protectRoute, addResume);
router.get('/getProcess', protectRoute, getProcess);
router.get('/getEmployees', protectRoute, getEmployees);
router.post('/addCandidate', protectRoute, addCandidate);
router.post('/updateCandidateStatus', protectRoute, updateCandidateStatus);
router.get('/exportLineUpCSV', protectRoute, exportLineUpCSV)

export default router;
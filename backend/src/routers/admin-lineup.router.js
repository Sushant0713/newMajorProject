import express from 'express';
import { getLineups, addCallLog, dropCandidate, getLineUpById, editLineUp, addToTracker, addNote, holdCandidate, passCandidate, 
    addResume, getProcess, getEmployees, addCandidate, updateCandidateStatus, exportLineUpCSV } from '../controllers/admin-lineup.controller.js';

const router = express.Router();

router.post('/getLineups', getLineups);
router.post('/addCallLog', addCallLog);
router.post('/dropCandidate', dropCandidate);
router.get('/getLineUpById', getLineUpById);
router.post('/editLineUp', editLineUp);
router.post('/addToTracker', addToTracker);
router.post('/addNote', addNote);
router.post('/holdCandidate', holdCandidate);
router.post('/passCandidate', passCandidate);
router.post('/addResume', addResume);
router.get('/getProcess', getProcess);
router.get('/getEmployees', getEmployees);
router.post('/addCandidate', addCandidate);
router.post('/updateCandidateStatus', updateCandidateStatus);
router.get('/exportLineUpCSV', exportLineUpCSV)


export default router;
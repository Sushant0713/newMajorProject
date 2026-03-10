import express from 'express';
import { getAllTeams, getTeamMembers, getAllEmployees, addteam, getTeamDetails, updateTeam, deleteTeam } from '../controllers/admin-team.controller.js';

const router = express.Router();

router.post('/getAllTeams', getAllTeams);
router.post('/getTeamMembers', getTeamMembers);
router.get('/getAllEmployees', getAllEmployees);
router.post('/addteam', addteam);
router.get('/getTeamDetails', getTeamDetails);
router.post('/updateTeam', updateTeam); 
router.delete('/deleteTeam', deleteTeam);

export default router;
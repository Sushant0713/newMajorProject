import express from 'express';
import { getAllTeams, getTeamMembers, getAllEmployees, addteam, getTeamDetails, updateTeam, deleteTeam } from '../controllers/admin-team.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/getAllTeams', protectRoute, getAllTeams);
router.post('/getTeamMembers', protectRoute, getTeamMembers);
router.get('/getAllEmployees', protectRoute, getAllEmployees);
router.post('/addteam', protectRoute, addteam);
router.get('/getTeamDetails', protectRoute, getTeamDetails);
router.post('/updateTeam', protectRoute, updateTeam); 
router.delete('/deleteTeam', protectRoute, deleteTeam);

export default router;
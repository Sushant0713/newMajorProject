import express from 'express';
import { getLineupsEmployee, getJoiningsEmployee, getProcessForEmployee, getClientsForEmployee } from '../controllers/employee-tracker.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/getLineupsEmployee',  protectRoute, getLineupsEmployee);
router.post('/getJoiningsEmployee',  protectRoute, getJoiningsEmployee);
router.get('/getProcessForEmployee',  protectRoute, getProcessForEmployee);
router.get('/getClientsForEmployee',  protectRoute, getClientsForEmployee);

export default router;
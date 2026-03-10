import express from 'express';
import { getLineupsEmployee, getJoiningsEmployee, getProcessForEmployee, getClientsForEmployee } from '../controllers/employee-tracker.controller.js';

const router = express.Router();
router.post('/getLineupsEmployee', getLineupsEmployee);
router.post('/getJoiningsEmployee', getJoiningsEmployee);
router.get('/getProcessForEmployee', getProcessForEmployee);
router.get('/getClientsForEmployee', getClientsForEmployee);

export default router;
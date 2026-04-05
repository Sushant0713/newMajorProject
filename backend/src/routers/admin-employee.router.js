import express from 'express';
import { addEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee, markAsPIP, getEmployeePortfolio, 
    addLOP, endPIP, employeeCallHistory, completedCandidates, registerEmployee
 } from '../controllers/admin-employee.controller.js';
 import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/addEmployee', protectRoute, addEmployee);
router.get('/getEmployeeById', protectRoute, getEmployeeById);
router.get('/getAllEmployees', protectRoute, getAllEmployees);
router.put('/updateEmployee', protectRoute, updateEmployee);
router.delete('/deleteEmployee', protectRoute, deleteEmployee);
router.post('/markAsPIP', protectRoute, markAsPIP);
router.post('/endPIP', protectRoute, endPIP);
router.post('/addLOP', protectRoute, addLOP);
router.post('/getEmployeePortfolio', protectRoute, getEmployeePortfolio);
router.post('/employeeCallHistory', protectRoute, employeeCallHistory);
router.post('/completedCandidates', protectRoute, completedCandidates);
router.post('/registerEmployee', protectRoute, registerEmployee);

export default router;
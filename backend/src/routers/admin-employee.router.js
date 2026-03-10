import express from 'express';
import { addEmployee, getEmployeeById, getAllEmployees, updateEmployee, deleteEmployee, markAsPIP, getEmployeePortfolio, 
    addLOP, endPIP, employeeCallHistory, completedCandidates, registerEmployee
 } from '../controllers/admin-employee.controller.js';

const router = express.Router();

router.post('/addEmployee', addEmployee);
router.get('/getEmployeeById', getEmployeeById);
router.get('/getAllEmployees', getAllEmployees);
router.put('/updateEmployee', updateEmployee);
router.delete('/deleteEmployee', deleteEmployee);
router.post('/markAsPIP', markAsPIP);
router.post('/endPIP', endPIP);
router.post('/addLOP', addLOP);
router.post('/getEmployeePortfolio', getEmployeePortfolio);
router.post('/employeeCallHistory', employeeCallHistory);
router.post('/completedCandidates', completedCandidates);
router.post('/registerEmployee', registerEmployee);

export default router;
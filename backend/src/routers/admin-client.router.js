import express from "express";
import {getAllClients, getClientDetails, getAllEmployeesForAssignment, assignedEmployees, assignNewEmployee, removeAssignedEmployee, 
        processesOfClient, addClient, updateClient, deletedClient } from "../controllers/admin-client.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/getAllClients", protectRoute, getAllClients);
router.get("/getClientDetails", protectRoute, getClientDetails);
router.get("/getAllEmployeesForAssignment", protectRoute, getAllEmployeesForAssignment)
router.get("/assignedEmployees", protectRoute, assignedEmployees);
router.post("/assignNewEmployee", protectRoute, assignNewEmployee);
router.delete("/removeAssignedEmployee", protectRoute, removeAssignedEmployee);
router.get("/processesOfClient", protectRoute, processesOfClient);
router.post("/addClient", protectRoute, addClient);
router.post("/updateClient", protectRoute, updateClient);
router.put("/updateClient", protectRoute, updateClient);
router.delete("/deletedClient", protectRoute, deletedClient);

export default router;
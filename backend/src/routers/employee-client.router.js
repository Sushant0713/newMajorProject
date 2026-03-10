import express from "express";
import { getAllProcesses, getProcessDetails, getClientNames, getLocations, getStats, getContactPersonDetails } from "../controllers/employee-client.controller.js";
const router = express.Router();

router.get("/getAllProcesses", getAllProcesses);
router.get("/getProcessDetails", getProcessDetails);
router.get("/getClientNames", getClientNames);
router.get("/getLocations", getLocations);
router.post("/getStats", getStats);
router.get("/getContactPersonDetails", getContactPersonDetails);

export default router;
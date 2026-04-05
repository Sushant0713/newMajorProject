import express from "express";
import { getAllProcesses, getProcessDetails, getClientNames, getLocations, getStats, getContactPersonDetails } from "../controllers/employee-client.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/getAllProcesses", protectRoute, getAllProcesses);
router.get("/getProcessDetails",  protectRoute, getProcessDetails);
router.get("/getClientNames",  protectRoute, getClientNames);
router.get("/getLocations",  protectRoute, getLocations);
router.post("/getStats",  protectRoute, getStats);
router.get("/getContactPersonDetails",  protectRoute, getContactPersonDetails);

export default router;
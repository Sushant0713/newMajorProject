import express from "express";
import {getEmployeeDataTypes, getCandidates, assignCandidate} from "../controllers/employee-data.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/getEmployeeDataTypes",  protectRoute, getEmployeeDataTypes);
router.post("/getCandidates",  protectRoute, getCandidates);
router.post("/assignCandidate",  protectRoute, assignCandidate);

export default router;
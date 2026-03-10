import express from "express";
import {getEmployeeDataTypes, getCandidates, assignCandidate} from "../controllers/employee-data.controller.js";

const router = express.Router();

router.get("/getEmployeeDataTypes", getEmployeeDataTypes);
router.post("/getCandidates", getCandidates);
router.post("/assignCandidate", assignCandidate);

export default router;
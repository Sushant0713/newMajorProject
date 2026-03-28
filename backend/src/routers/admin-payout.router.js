import express from "express";
import {
    getPayouts,
    getProcessNames,
    getStatusOptions,
    getCandidateStatusHistory,
    generatePayout,
    rejectPayout,
    batchApprove,
    exportCSV,
    startClawback,
    markInvoiceClear,
    markApproved,
    markCompletelyJoined,
    markDropout,
} from '../controllers/admin-payout.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/getPayouts", protectRoute, getPayouts);
router.get("/getProcessNames", protectRoute, getProcessNames);
router.get("/getStatusOptions", protectRoute, getStatusOptions);
router.get("/getCandidateStatusHistory", protectRoute, getCandidateStatusHistory);
router.post("/generatePayout", protectRoute, generatePayout);
router.post("/startClawback", protectRoute, startClawback);
router.post("/markInvoiceClear", protectRoute, markInvoiceClear);
router.post("/markApproved", protectRoute, markApproved);
router.post("/rejectPayout", protectRoute, rejectPayout);
router.post("/markCompletelyJoined", protectRoute, markCompletelyJoined);
router.post("/markDropout", protectRoute, markDropout);
router.post("/batchApprove", protectRoute, batchApprove);
router.get("/exportCSV", protectRoute, exportCSV);
//router.post("/markClawback", markClawback);
//router.post("/approvePayout", approvePayout);
//router.post("/emergencyClawback", emergencyClawback);

export default router;


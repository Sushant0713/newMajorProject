import express from "express";
import {
    getPayouts,
    getProcessNames,
    getStatusOptions,
    getCandidateStatusHistory,
    generatePayout,
    markClawback,
    approvePayout,
    rejectPayout,
    batchApprove,
    exportCSV,
    startClawback,
    markInvoiceClear,
    markApproved,
    markCompletelyJoined,
    emergencyClawback,
    markDropout,
} from '../controllers/admin-payout.controller.js';

const router = express.Router();

router.post("/getPayouts", getPayouts);
router.get("/getProcessNames", getProcessNames);
router.get("/getStatusOptions", getStatusOptions);
router.get("/getCandidateStatusHistory", getCandidateStatusHistory);
router.post("/generatePayout", generatePayout);
router.post("/startClawback", startClawback);
router.post("/markClawback", markClawback);
router.post("/markInvoiceClear", markInvoiceClear);
router.post("/markApproved", markApproved);
router.post("/approvePayout", approvePayout);
router.post("/rejectPayout", rejectPayout);
router.post("/markCompletelyJoined", markCompletelyJoined);
router.post("/emergencyClawback", emergencyClawback);
router.post("/markDropout", markDropout);
router.post("/batchApprove", batchApprove);
router.get("/exportCSV", exportCSV);

export default router;


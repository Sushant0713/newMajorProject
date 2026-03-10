import express from "express";
import {getPayouts, payoutHistory, getProcessNames, getClientNames, getStatusOptions, getCountByStatus} from "../controllers/employee-payout.controller.js";

const router = express.Router();

router.post('/getPayouts', getPayouts);
router.post('/payoutHistory', payoutHistory);
router.get('/getProcessNames', getProcessNames);
router.get('/getClientNames', getClientNames);
router.get('/getStatusOptions', getStatusOptions);
router.get('/getCountByStatus', getCountByStatus);

export default router;
import express from "express";
import {getPayouts, payoutHistory, getProcessNames, getClientNames, getStatusOptions, getCountByStatus} from "../controllers/employee-payout.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/getPayouts', protectRoute, getPayouts);
router.post('/payoutHistory', protectRoute, payoutHistory);
router.get('/getProcessNames', protectRoute, getProcessNames);
router.get('/getClientNames',  protectRoute, getClientNames);
router.get('/getStatusOptions', protectRoute, getStatusOptions);
router.get('/getCountByStatus', protectRoute, getCountByStatus);

export default router;
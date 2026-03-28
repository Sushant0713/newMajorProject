import express from "express";
import { loginAsAdmin, loginAsEmployee, logout, heartbeat, forgotPasswordForEmp, verifyOTP, resetPasswordForEmp, 
    forgotPasswordForAdmin, resetPasswordForAdmin, logoutBeacon } from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/loginAsAdmin', loginAsAdmin );
router.post('/loginAsEmployee', loginAsEmployee );
router.post('/logout', logout);
router.post("/heartbeat",protectRoute, heartbeat);
router.get('/protectRoute', protectRoute);
router.post('/forgotPasswordForEmp', forgotPasswordForEmp);
router.post('/verifyOTP', verifyOTP);
router.post('/resetPasswordForEmp', resetPasswordForEmp);
router.post('/forgotPasswordForAdmin', forgotPasswordForAdmin);
router.post('/resetPasswordForAdmin', resetPasswordForAdmin);
router.post('/logoutBeacon', express.text({ type: "*/*" }), logoutBeacon);

export default router;
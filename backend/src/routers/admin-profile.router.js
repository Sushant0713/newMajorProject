import express from "express";
import { getProfile, updateProfile, updatePassword } from '../controllers/admin-profile.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get('/getProfile', protectRoute, getProfile);
router.post('/updateProfile', protectRoute, updateProfile);
router.post('/updatePassword', protectRoute, updatePassword);

export default router;
import express from "express";
import { getProfile, updateProfile, updatePassword } from '../controllers/admin-profile.controller.js';

const router = express.Router();

router.get('/getProfile', getProfile);
router.post('/updateProfile', updateProfile);
router.post('/updatePassword', updatePassword);

export default router;
import express from "express";
import {addNewMeeting, updateMeeting, deleteMeeting, getAllMeetings, getMeetingById, getMembers, getEmployeeNamesByIds } from '../controllers/admin-meetings.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/addNewMeeting', protectRoute, addNewMeeting);
router.post('/updateMeeting', protectRoute, updateMeeting);
router.delete('/deleteMeeting', protectRoute, deleteMeeting);
router.get('/getAllMeetings', protectRoute, getAllMeetings);
router.get('/getMeetingById', protectRoute, getMeetingById);
router.get('/getMembers', protectRoute, getMembers);
router.get('/getEmployeeNamesByIds', protectRoute, getEmployeeNamesByIds);

export default router;
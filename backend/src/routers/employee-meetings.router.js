import express from "express";
import { getAllMeetingsForEmployee, getUpcomingMeetings, getTodaysMeetings } from "../controllers/employee-meeting.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
router.get('/getAllMeetingsForEmployee', protectRoute, getAllMeetingsForEmployee);
router.get('/getUpcomingMeetings', protectRoute, getUpcomingMeetings);
router.get('/getTodaysMeetings', protectRoute, getTodaysMeetings);

export default router;
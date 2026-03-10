import express from "express";
import { getAllMeetingsForEmployee, getUpcomingMeetings, getTodaysMeetings } from "../controllers/employee-meeting.controller.js";

const router = express.Router();
router.get('/getAllMeetingsForEmployee', getAllMeetingsForEmployee);
router.get('/getUpcomingMeetings', getUpcomingMeetings);
router.get('/getTodaysMeetings', getTodaysMeetings);

export default router;
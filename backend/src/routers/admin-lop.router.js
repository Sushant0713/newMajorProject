import express from "express";
import { getAllLops, addLop, deleteLop, getSalaryEmployee } from "../controllers/admin-lop.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/getAllLops', protectRoute, getAllLops);
router.post('/addLop', protectRoute, addLop);
router.delete('/deleteLop', protectRoute, deleteLop);
router.get('/getSalaryEmployee', protectRoute, getSalaryEmployee);

export default router;
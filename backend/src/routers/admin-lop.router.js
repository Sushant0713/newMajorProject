import express from "express";
import { getAllLops, addLop, deleteLop, getSalaryEmployee } from "../controllers/admin-lop.controller.js";

const router = express.Router();

router.post('/getAllLops', getAllLops);
router.post('/addLop', addLop);
router.delete('/deleteLop', deleteLop);
router.get('/getSalaryEmployee', getSalaryEmployee);

export default router;
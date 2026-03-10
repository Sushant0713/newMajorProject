import express from 'express';
import { getJoinings, editJoining, exportJoiningUpCSV} from '../controllers/admin-joining.controller.js';

const router = express.Router();
router.post("/getJoinings", getJoinings);
router.post('/editJoining', editJoining);
router.get('/exportJoiningUpCSV', exportJoiningUpCSV);

export default router;
import express from 'express';
import { getJoinings, editJoining, exportJoiningUpCSV} from '../controllers/admin-joining.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/getJoinings", protectRoute, getJoinings);
router.post('/editJoining', protectRoute, editJoining);
router.get('/exportJoiningUpCSV', protectRoute, exportJoiningUpCSV);

export default router;
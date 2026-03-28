import express from 'express';
import { upload } from '../middleware/uploadExcel.middleware.js';
import { importData, getDataTypes, createDataType, getStats, getEmployeeWorkload, getDataTypeOverview, getDataTypesDetails, updateDataType, 
    assignDataTypes, exportCandidatesCSV} from '../controllers/admin-data.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/importData', protectRoute, upload.single('file'), importData);
router.get('/getDataTypes', protectRoute, getDataTypes);
router.post('/createDataType', protectRoute, createDataType);
router.get('/getStats', protectRoute, getStats);
router.post('/getEmployeeWorkload', protectRoute, getEmployeeWorkload);
router.get('/getDataTypeOverview', protectRoute, getDataTypeOverview);
router.get('/getDataTypesDetails', protectRoute, getDataTypesDetails);
router.put('/updateDataType', protectRoute, updateDataType);
router.post('/assignDataTypes', protectRoute, assignDataTypes);
router.post('/exportCandidatesCSV', protectRoute, exportCandidatesCSV);

export default router;
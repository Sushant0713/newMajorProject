import express from 'express';
import { upload } from '../middleware/uploadExcel.middleware.js';
import { importData, getDataTypes, createDataType, getStats, getEmployeeWorkload, getDataTypeOverview, getDataTypesDetails, updateDataType, 
    assignDataTypes, exportCandidatesCSV} from '../controllers/admin-data.controller.js';

const router = express.Router();

router.post('/importData', upload.single('file'), importData);
router.get('/getDataTypes', getDataTypes);
router.post('/createDataType', createDataType);
router.get('/getStats', getStats);
router.post('/getEmployeeWorkload', getEmployeeWorkload);
router.get('/getDataTypeOverview', getDataTypeOverview);
router.get('/getDataTypesDetails', getDataTypesDetails);
router.put('/updateDataType', updateDataType);
router.post('/assignDataTypes', assignDataTypes);
router.post('/exportCandidatesCSV', exportCandidatesCSV);

export default router;
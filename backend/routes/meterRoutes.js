const express = require('express');
const router = express.Router();
const { addReading, getReadings, getReadingById, updateStatus, exportCSV } = require('../controllers/meterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'supervisor', 'technician'), addReading);
router.get('/', protect, authorize('admin', 'supervisor', 'technician'), getReadings);
router.get('/export/csv', protect, authorize('admin', 'supervisor'), exportCSV);
router.get('/:id', protect, authorize('admin', 'supervisor', 'technician'), getReadingById);
router.put('/:id/status', protect, authorize('admin', 'supervisor'), updateStatus);

module.exports = router;

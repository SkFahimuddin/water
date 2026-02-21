const express = require('express');
const router = express.Router();
const {
  createComplaint, getComplaints, getComplaintById, updateComplaint, exportCSV
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createComplaint);
router.get('/', protect, getComplaints);
router.get('/export/csv', protect, authorize('admin', 'supervisor'), exportCSV);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, authorize('admin', 'supervisor', 'technician'), updateComplaint);

module.exports = router;

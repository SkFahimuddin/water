const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/summary', protect, authorize('admin', 'supervisor'), getSummary);

module.exports = router;

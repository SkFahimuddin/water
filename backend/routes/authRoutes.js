const express = require('express');
const router = express.Router();
const { register, login, createStaff, getMe, getStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/create-staff', protect, authorize('admin'), createStaff);
router.get('/staff', protect, authorize('admin', 'supervisor'), getStaff);

module.exports = router;

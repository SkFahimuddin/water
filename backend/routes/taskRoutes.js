const express = require('express');
const router = express.Router();
const { createTask, getTasks, getTaskById, updateTask, exportCSV } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin', 'supervisor'), createTask);
router.get('/', protect, getTasks);
router.get('/export/csv', protect, authorize('admin', 'supervisor'), exportCSV);
router.get('/:id', protect, getTaskById);
router.put('/:id', protect, updateTask);

module.exports = router;

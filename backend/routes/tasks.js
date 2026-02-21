const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { auth, requireRole } = require('../middleware/auth');

// Create task (supervisor/admin only)
router.post('/', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user.id });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'technician') filter.assignedTo = req.user.id;
    const { status } = req.query;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update task (technician can update their own tasks, supervisor/admin can update any)
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'technician' && task.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: 'You can only update your assigned tasks' });

    const update = { ...req.body };
    if (update.status === 'Completed') update.completedAt = new Date();

    const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get daily/weekly report
router.get('/report/summary', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    const days = period === 'daily' ? 1 : 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const tasks = await Task.find({ createdAt: { $gte: since } })
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name');

    const summary = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      cancelled: tasks.filter(t => t.status === 'Cancelled').length,
      tasks,
    };
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const MeterReading = require('../models/MeterReading');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

router.get('/stats', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const [complaintsByStatus, complaintsByCategory, complaintsByLocation,
           totalComplaints, totalReadings, totalTasks, totalUsers, recentComplaints] = await Promise.all([
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Complaint.countDocuments(),
      MeterReading.countDocuments(),
      Task.countDocuments(),
      User.countDocuments(),
      Complaint.find().sort({ createdAt: -1 }).limit(5).populate('submittedBy', 'name'),
    ]);

    res.json({
      complaintsByStatus,
      complaintsByCategory,
      complaintsByLocation,
      totals: { complaints: totalComplaints, readings: totalReadings, tasks: totalTasks, users: totalUsers },
      recentComplaints,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

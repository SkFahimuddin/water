const Complaint = require('../models/Complaint');
const MeterReading = require('../models/MeterReading');
const Task = require('../models/Task');
const User = require('../models/User');

// @GET /api/dashboard/summary
const getSummary = async (req, res) => {
  try {
    const [
      totalComplaints, openComplaints, resolvedComplaints,
      totalReadings, totalTasks, pendingTasks, completedTasks,
      totalUsers, complaintsByType, complaintsByStatus,
      complaintsByLocation, tasksByStatus
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $ne: 'Resolved' } }),
      Complaint.countDocuments({ status: 'Resolved' }),
      MeterReading.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      Task.countDocuments({ status: 'Completed' }),
      User.countDocuments(),
      Complaint.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
      Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
    ]);

    res.json({
      complaints: { total: totalComplaints, open: openComplaints, resolved: resolvedComplaints },
      meterReadings: { total: totalReadings },
      tasks: { total: totalTasks, pending: pendingTasks, completed: completedTasks },
      users: { total: totalUsers },
      charts: { complaintsByType, complaintsByStatus, complaintsByLocation, tasksByStatus }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getSummary };

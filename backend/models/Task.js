const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  location: String,
  dueDate: Date,
  completionNotes: String,
  completedAt: Date,
  relatedComplaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

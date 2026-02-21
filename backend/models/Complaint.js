const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const complaintSchema = new mongoose.Schema({
  referenceNumber: { type: String, default: () => 'CMP-' + uuidv4().slice(0,8).toUpperCase(), unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['Pipe Leak', 'No Water', 'Billing Issue', 'Water Quality', 'Meter Issue', 'Other'], required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['Received', 'In Progress', 'Resolved'], default: 'Received' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: String,
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { auth, requireRole } = require('../middleware/auth');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

// Submit complaint (any logged in user)
router.post('/', auth, async (req, res) => {
  try {
    const complaint = await Complaint.create({ ...req.body, submittedBy: req.user.id });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get complaints - customers see their own, staff see all
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, location } = req.query;
    const filter = {};
    if (req.user.role === 'customer') filter.submittedBy = req.user.id;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');

    const complaints = await Complaint.find(filter)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single complaint
router.get('/:id', auth, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update complaint status (staff only)
router.put('/:id', auth, requireRole('supervisor', 'admin', 'technician'), async (req, res) => {
  try {
    const update = { ...req.body };
    if (update.status === 'Resolved') update.resolvedAt = new Date();
    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export complaints to CSV
router.get('/export/csv', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name');

    const csvData = complaints.map(c => ({
      reference: c.referenceNumber,
      title: c.title,
      category: c.category,
      location: c.location,
      status: c.status,
      priority: c.priority,
      submittedBy: c.submittedBy?.name || '',
      assignedTo: c.assignedTo?.name || 'Unassigned',
      createdAt: c.createdAt.toISOString().split('T')[0],
      resolvedAt: c.resolvedAt ? c.resolvedAt.toISOString().split('T')[0] : '',
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    res.send([headers, ...rows].join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

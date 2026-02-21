const express = require('express');
const router = express.Router();
const MeterReading = require('../models/MeterReading');
const { auth, requireRole } = require('../middleware/auth');

// Add meter reading
router.post('/', auth, requireRole('technician', 'supervisor', 'admin'), async (req, res) => {
  try {
    const reading = await MeterReading.create({ ...req.body, meterReader: req.user.id });
    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all readings
router.get('/', auth, requireRole('technician', 'supervisor', 'admin'), async (req, res) => {
  try {
    const { meterNumber, startDate, endDate } = req.query;
    const filter = {};
    if (meterNumber) filter.meterNumber = new RegExp(meterNumber, 'i');
    if (startDate || endDate) {
      filter.readingDate = {};
      if (startDate) filter.readingDate.$gte = new Date(startDate);
      if (endDate) filter.readingDate.$lte = new Date(endDate);
    }
    const readings = await MeterReading.find(filter)
      .populate('meterReader', 'name')
      .sort({ readingDate: -1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get reading history for a specific meter
router.get('/meter/:meterNumber', auth, async (req, res) => {
  try {
    const readings = await MeterReading.find({ meterNumber: req.params.meterNumber })
      .populate('meterReader', 'name')
      .sort({ readingDate: -1 });
    res.json(readings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export CSV
router.get('/export/csv', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const readings = await MeterReading.find().populate('meterReader', 'name');
    const csvData = readings.map(r => ({
      meterNumber: r.meterNumber,
      customerName: r.customerName,
      customerAccount: r.customerAccount || '',
      location: r.location || '',
      previousReading: r.previousReading,
      currentReading: r.currentReading,
      consumption: r.consumption,
      unit: r.unit,
      readingDate: r.readingDate.toISOString().split('T')[0],
      meterReader: r.meterReader?.name || '',
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=meter_readings.csv');

    const headers = Object.keys(csvData[0] || {}).join(',');
    const rows = csvData.map(row => Object.values(row).join(','));
    res.send([headers, ...rows].join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

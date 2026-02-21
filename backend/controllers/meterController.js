const MeterReading = require('../models/MeterReading');
const { stringify } = require('csv-stringify/sync');

// @POST /api/meter
const addReading = async (req, res) => {
  try {
    const { meterNumber, customerName, customerAddress, currentReading, readingDate, notes } = req.body;

    // Get last reading for this meter to calculate consumption
    const lastReading = await MeterReading.findOne({ meterNumber }).sort({ readingDate: -1 });
    const previousReading = lastReading ? lastReading.currentReading : 0;

    const reading = await MeterReading.create({
      meterNumber, customerName, customerAddress,
      currentReading, previousReading,
      readingDate: readingDate || new Date(),
      meterReader: req.user._id,
      meterReaderName: req.user.name,
      notes
    });
    res.status(201).json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/meter
const getReadings = async (req, res) => {
  try {
    const { meterNumber, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (meterNumber) filter.meterNumber = new RegExp(meterNumber, 'i');
    if (status) filter.status = status;

    const total = await MeterReading.countDocuments(filter);
    const readings = await MeterReading.find(filter)
      .populate('meterReader', 'name')
      .sort({ readingDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ readings, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/meter/:id
const getReadingById = async (req, res) => {
  try {
    const reading = await MeterReading.findById(req.params.id).populate('meterReader', 'name');
    if (!reading) return res.status(404).json({ message: 'Reading not found' });
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/meter/:id/status
const updateStatus = async (req, res) => {
  try {
    const reading = await MeterReading.findByIdAndUpdate(
      req.params.id, { status: req.body.status }, { new: true }
    );
    if (!reading) return res.status(404).json({ message: 'Reading not found' });
    res.json(reading);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/meter/export/csv
const exportCSV = async (req, res) => {
  try {
    const readings = await MeterReading.find({}).populate('meterReader', 'name');
    const rows = readings.map(r => ({
      MeterNumber: r.meterNumber,
      CustomerName: r.customerName,
      Address: r.customerAddress,
      PreviousReading: r.previousReading,
      CurrentReading: r.currentReading,
      Consumption: r.consumption,
      Unit: r.unit,
      ReadingDate: new Date(r.readingDate).toISOString().split('T')[0],
      MeterReader: r.meterReaderName || r.meterReader?.name || '',
      Status: r.status,
      Notes: r.notes || ''
    }));
    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=meter_readings.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addReading, getReadings, getReadingById, updateStatus, exportCSV };

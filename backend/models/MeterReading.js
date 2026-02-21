const mongoose = require('mongoose');

const meterReadingSchema = new mongoose.Schema({
  meterNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  customerAccount: String,
  location: String,
  previousReading: { type: Number, required: true },
  currentReading: { type: Number, required: true },
  consumption: { type: Number },
  readingDate: { type: Date, required: true },
  meterReader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String,
  unit: { type: String, default: 'KL' },
}, { timestamps: true });

meterReadingSchema.pre('save', function(next) {
  this.consumption = this.currentReading - this.previousReading;
  next();
});

module.exports = mongoose.model('MeterReading', meterReadingSchema);

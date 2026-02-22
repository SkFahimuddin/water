const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

// Register (customer self-service only)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, accountNumber } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, phone, address, accountNumber, role: 'customer' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create staff account (admin only)
router.post('/create-staff', auth, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!['technician', 'supervisor', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List all staff — used by Supervisor Panel to populate technician dropdown
router.get('/staff', auth, requireRole('supervisor', 'admin'), async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['technician', 'supervisor', 'admin'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
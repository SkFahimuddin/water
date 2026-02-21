const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    // Only allow customer self-registration; other roles need admin
    const userRole = role && ['technician', 'supervisor', 'admin'].includes(role)
      ? 'customer' : (role || 'customer');

    const user = await User.create({ name, email, password, role: userRole, phone, address });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/create-staff (admin only)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role, phone });
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json(req.user);
};

// @GET /api/auth/staff
const getStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['technician', 'supervisor', 'admin'] } }).select('-password');
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, createStaff, getMe, getStaff };

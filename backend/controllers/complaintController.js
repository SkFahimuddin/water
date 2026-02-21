const Complaint = require('../models/Complaint');
const { stringify } = require('csv-stringify/sync');

// @POST /api/complaints
const createComplaint = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, location, type, description, priority } = req.body;
    const complaint = await Complaint.create({
      user: req.user?._id,
      customerName: customerName || req.user?.name,
      customerEmail: customerEmail || req.user?.email,
      customerPhone,
      location, type, description, priority
    });
    res.status(201).json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/complaints
const getComplaints = async (req, res) => {
  try {
    const { status, type, location, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (location) filter.location = new RegExp(location, 'i');

    // Customers only see their own
    if (req.user.role === 'customer') filter.user = req.user._id;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ complaints, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/complaints/:id
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('user', 'name email');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/complaints/:id
const updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const { status, assignedTo, resolutionNotes, priority } = req.body;
    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (resolutionNotes) complaint.resolutionNotes = resolutionNotes;
    if (priority) complaint.priority = priority;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/complaints/export/csv
const exportCSV = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate('assignedTo', 'name');
    const rows = complaints.map(c => ({
      Reference: c.referenceNumber,
      Customer: c.customerName,
      Email: c.customerEmail,
      Phone: c.customerPhone,
      Location: c.location,
      Type: c.type,
      Status: c.status,
      Priority: c.priority,
      Description: c.description,
      AssignedTo: c.assignedTo?.name || '',
      ResolutionNotes: c.resolutionNotes || '',
      CreatedAt: c.createdAt.toISOString(),
      ResolvedAt: c.resolvedAt?.toISOString() || ''
    }));
    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=complaints.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createComplaint, getComplaints, getComplaintById, updateComplaint, exportCSV };

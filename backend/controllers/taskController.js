const Task = require('../models/Task');
const { stringify } = require('csv-stringify/sync');

// @POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, location, assignedTo, priority, category, dueDate, relatedComplaint } = req.body;
    const task = await Task.create({
      title, description, location,
      assignedBy: req.user._id,
      assignedTo, priority, category, dueDate, relatedComplaint
    });
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const { status, assignedTo, category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    // Technicians only see their tasks
    if (req.user.role === 'technician') filter.assignedTo = req.user._id;
    else if (assignedTo) filter.assignedTo = assignedTo;

    const total = await Task.countDocuments(filter);
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
      .populate('relatedComplaint', 'referenceNumber type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/:id
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { status, completionNotes, priority, dueDate } = req.body;
    if (status) task.status = status;
    if (completionNotes) task.completionNotes = completionNotes;
    if (priority) task.priority = priority;
    if (dueDate) task.dueDate = dueDate;
    if (status === 'Completed') task.completedAt = new Date();

    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/tasks/export/csv
const exportCSV = async (req, res) => {
  try {
    const tasks = await Task.find({})
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name');
    const rows = tasks.map(t => ({
      Title: t.title,
      Category: t.category,
      Location: t.location,
      AssignedBy: t.assignedBy?.name || '',
      AssignedTo: t.assignedTo?.name || '',
      Priority: t.priority,
      Status: t.status,
      DueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
      CompletedAt: t.completedAt ? t.completedAt.toISOString() : '',
      CompletionNotes: t.completionNotes || '',
      CreatedAt: t.createdAt.toISOString()
    }));
    const csv = stringify(rows, { header: true });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tasks.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createTask, getTasks, getTaskById, updateTask, exportCSV };

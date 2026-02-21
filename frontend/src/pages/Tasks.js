import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [updateTask, setUpdateTask] = useState(null);
  const [filters, setFilters] = useState({ status: '' });
  const [report, setReport] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const isSupervisor = ['supervisor', 'admin'].includes(user?.role);

  const [form, setForm] = useState({
    title: '', description: '', assignedTo: '', priority: 'Medium', location: '', dueDate: ''
  });

  useEffect(() => { fetchTasks(); }, [filters]);

  const fetchTasks = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      const res = await api.get('/tasks', { params });
      setTasks(res.data);
    } catch (err) { toast.error('Failed to load tasks'); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', form);
      toast.success('Task assigned!');
      setShowForm(false);
      setForm({ title: '', description: '', assignedTo: '', priority: 'Medium', location: '', dueDate: '' });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create task'); }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/tasks/${updateTask._id}`, { status: updateTask.status, completionNotes: updateTask.completionNotes });
      toast.success('Task updated!');
      setUpdateTask(null);
      fetchTasks();
    } catch (err) { toast.error('Update failed'); }
  };

  const fetchReport = async (period) => {
    try {
      const res = await api.get(`/tasks/report/summary?period=${period}`);
      setReport({ ...res.data, period });
    } catch (err) { toast.error('Failed to generate report'); }
  };

  const statusClass = { 'Pending': 'pending', 'In Progress': 'inprogress', 'Completed': 'completed', 'Cancelled': 'cancelled' };

  return (
    <div className="container">
      <div className="page-header">
        <h1>✅ Task Management</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isSupervisor && <>
            <button onClick={() => fetchReport('daily')} className="btn btn-secondary btn-sm">Daily Report</button>
            <button onClick={() => fetchReport('weekly')} className="btn btn-secondary btn-sm">Weekly Report</button>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Assign Task</button>
          </>}
        </div>
      </div>

      {report && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>{report.period === 'daily' ? 'Daily' : 'Weekly'} Task Summary</h2>
            <button onClick={() => setReport(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>✕</button>
          </div>
          <div className="stats-grid" style={{ marginBottom: 0 }}>
            <div className="stat-card stat-blue"><span className="stat-number">{report.total}</span><span className="stat-label">Total Tasks</span></div>
            <div className="stat-card stat-green"><span className="stat-number">{report.completed}</span><span className="stat-label">Completed</span></div>
            <div className="stat-card stat-orange"><span className="stat-number">{report.inProgress}</span><span className="stat-label">In Progress</span></div>
            <div className="stat-card"><span className="stat-number">{report.pending}</span><span className="stat-label">Pending</span></div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Assign New Task</h2>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Task Title *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Fix water main on Oak Street" />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Detailed task instructions..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Assign To (User ID) *</label>
                <input value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})} required placeholder="Technician User ID" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Site address" />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Assign Task</button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Title</th><th>Assigned To</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t._id}>
                <td><strong>{t.title}</strong><br/><small style={{ color: '#6b7280' }}>{t.location}</small></td>
                <td>{t.assignedTo?.name}</td>
                <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                <td><span className={`badge badge-${statusClass[t.status]}`}>{t.status}</span></td>
                <td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                <td>
                  {(isSupervisor || t.assignedTo?._id === user?.id) && (
                    <button onClick={() => setUpdateTask({ ...t, completionNotes: t.completionNotes || '' })} className="btn btn-primary btn-sm">Update</button>
                  )}
                </td>
              </tr>
            ))}
            {tasks.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No tasks found</td></tr>}
          </tbody>
        </table>
      </div>

      {updateTask && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '90%', maxWidth: 460 }}>
            <h2 style={{ marginBottom: 20 }}>Update Task</h2>
            <p style={{ color: '#6b7280', marginBottom: 16 }}>{updateTask.title}</p>
            <div className="form-group">
              <label>Status</label>
              <select value={updateTask.status} onChange={e => setUpdateTask({...updateTask, status: e.target.value})}>
                <option>Pending</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
              </select>
            </div>
            <div className="form-group">
              <label>Completion Notes</label>
              <textarea rows={3} value={updateTask.completionNotes} onChange={e => setUpdateTask({...updateTask, completionNotes: e.target.value})} placeholder="Add notes about work done..." />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setUpdateTask(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUpdate} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

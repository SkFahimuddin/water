import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function Complaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', location: '' });
  const [selected, setSelected] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', assignedTo: '', resolutionNotes: '' });
  const [technicians, setTechnicians] = useState([]);
  const isStaff = ['technician', 'supervisor', 'admin'].includes(user?.role);

  useEffect(() => { fetchComplaints(); }, [filters]);
  useEffect(() => {
    if (isStaff) api.get('/auth/me').then().catch(); // just to verify token
  }, [isStaff]);

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      const res = await api.get('/complaints', { params });
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    }
  };

  const openUpdate = (c) => {
    setSelected(c);
    setUpdateForm({ status: c.status, assignedTo: c.assignedTo?._id || '', resolutionNotes: c.resolutionNotes || '' });
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/complaints/${selected._id}`, updateForm);
      toast.success('Complaint updated');
      setSelected(null);
      fetchComplaints();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const statusClass = { 'Received': 'received', 'In Progress': 'inprogress', 'Resolved': 'resolved' };

  return (
    <div className="container">
      <div className="page-header">
        <h1>📋 Complaints & Service Requests</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          {isStaff && <a href="/api/complaints/export/csv" className="btn btn-secondary btn-sm">Export CSV</a>}
          <Link to="/complaints/new" className="btn btn-primary">+ New Complaint</Link>
        </div>
      </div>

      <div className="filters">
        <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
          <option value="">All Statuses</option>
          <option>Received</option><option>In Progress</option><option>Resolved</option>
        </select>
        <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
          <option value="">All Categories</option>
          <option>Pipe Leak</option><option>No Water</option><option>Billing Issue</option>
          <option>Water Quality</option><option>Meter Issue</option><option>Other</option>
        </select>
        <input placeholder="Filter by location..." value={filters.location} onChange={e => setFilters({...filters, location: e.target.value})} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Reference</th><th>Title</th><th>Category</th><th>Location</th>
              <th>Priority</th><th>Status</th>
              {isStaff && <th>Submitted By</th>}
              <th>Date</th>
              {isStaff && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c._id}>
                <td><code style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{c.referenceNumber}</code></td>
                <td><strong>{c.title}</strong></td>
                <td>{c.category}</td>
                <td>{c.location}</td>
                <td><span className={`badge badge-${c.priority.toLowerCase()}`}>{c.priority}</span></td>
                <td><span className={`badge badge-${statusClass[c.status]}`}>{c.status}</span></td>
                {isStaff && <td>{c.submittedBy?.name}</td>}
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                {isStaff && (
                  <td>
                    <button onClick={() => openUpdate(c)} className="btn btn-primary btn-sm">Update</button>
                  </td>
                )}
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No complaints found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 32, width: '90%', maxWidth: 500 }}>
            <h2 style={{ marginBottom: 20 }}>Update Complaint</h2>
            <p style={{ marginBottom: 16, color: '#6b7280' }}><code>{selected.referenceNumber}</code> — {selected.title}</p>
            <div className="form-group">
              <label>Status</label>
              <select value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}>
                <option>Received</option><option>In Progress</option><option>Resolved</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resolution Notes</label>
              <textarea rows={3} value={updateForm.resolutionNotes} onChange={e => setUpdateForm({...updateForm, resolutionNotes: e.target.value})} placeholder="Add notes about the resolution..." />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelected(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUpdate} className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

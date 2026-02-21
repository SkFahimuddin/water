import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createComplaint } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SubmitComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: user?.name || '', customerEmail: user?.email || '',
    customerPhone: '', location: '', type: '', description: '', priority: 'Medium'
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await createComplaint(form);
      setSuccess(`Complaint submitted! Your reference number is: ${data.referenceNumber}`);
      setForm({ ...form, location: '', type: '', description: '', priority: 'Medium' });
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '640px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a365d', marginBottom: '4px' }}>📝 Submit a Complaint</h1>
      <p style={{ color: '#718096', marginBottom: '24px', fontSize: '14px' }}>
        Report a water-related issue and we'll get back to you.
      </p>
      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Your Name</label>
              <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Location / Address</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required placeholder="e.g. 14 Main Street, Ward 5" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Complaint Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} required>
                <option value="">Select type...</option>
                <option>Low Pressure</option><option>No Water</option><option>Water Quality</option>
                <option>Billing Issue</option><option>Pipe Leak</option><option>Meter Problem</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={4} placeholder="Please describe the issue in detail..." />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitComplaint;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Pipe Leak', location: '', priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/complaints', form);
      setSubmitted(res.data);
      toast.success('Complaint submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#16a34a', marginBottom: 8 }}>Complaint Submitted!</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>Your complaint has been received and will be attended to shortly.</p>
          <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 20, marginBottom: 24 }}>
            <p style={{ color: '#6b7280', fontSize: 14 }}>Your Reference Number</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0369a1', fontFamily: 'monospace' }}>{submitted.referenceNumber}</p>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>Please save this for tracking your complaint</p>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={() => { setSubmitted(null); setForm({ title: '', description: '', category: 'Pipe Leak', location: '', priority: 'Medium' }); }} className="btn btn-secondary">Submit Another</button>
            <button onClick={() => navigate('/complaints')} className="btn btn-primary">View My Complaints</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1>📝 Submit a Complaint</h1>
      </div>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title / Brief Description *</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g. Burst pipe on Main Street" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Category *</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option>Pipe Leak</option><option>No Water</option><option>Billing Issue</option>
                <option>Water Quality</option><option>Meter Issue</option><option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Location / Address *</label>
            <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} required placeholder="e.g. 123 Main Street, Ward 5" />
          </div>
          <div className="form-group">
            <label>Detailed Description *</label>
            <textarea rows={5} value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Please describe the issue in detail. Include any relevant information like how long the problem has been occurring, impact, etc." />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="button" onClick={() => navigate('/complaints')} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

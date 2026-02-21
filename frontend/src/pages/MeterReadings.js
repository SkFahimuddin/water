import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function MeterReadings() {
  const [readings, setReadings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ meterNumber: '', startDate: '', endDate: '' });
  const [form, setForm] = useState({
    meterNumber: '', customerName: '', customerAccount: '', location: '',
    previousReading: '', currentReading: '', readingDate: new Date().toISOString().split('T')[0], notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReadings(); }, [filters]);

  const fetchReadings = async () => {
    try {
      const params = {};
      if (filters.meterNumber) params.meterNumber = filters.meterNumber;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await api.get('/meter', { params });
      setReadings(res.data);
    } catch (err) { toast.error('Failed to load readings'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(form.currentReading) < Number(form.previousReading)) {
      toast.error('Current reading cannot be less than previous reading');
      return;
    }
    setLoading(true);
    try {
      await api.post('/meter', form);
      toast.success('Meter reading recorded!');
      setShowForm(false);
      setForm({ meterNumber: '', customerName: '', customerAccount: '', location: '', previousReading: '', currentReading: '', readingDate: new Date().toISOString().split('T')[0], notes: '' });
      fetchReadings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save reading');
    } finally { setLoading(false); }
  };

  const consumption = form.currentReading && form.previousReading 
    ? Math.max(0, Number(form.currentReading) - Number(form.previousReading)) : null;

  return (
    <div className="container">
      <div className="page-header">
        <h1>🔢 Meter Readings</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/api/meter/export/csv" className="btn btn-secondary btn-sm">Export CSV</a>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">+ Record Reading</button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>New Meter Reading</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Meter Number *</label>
                <input value={form.meterNumber} onChange={e => setForm({...form, meterNumber: e.target.value})} required placeholder="e.g. MTR-12345" />
              </div>
              <div className="form-group">
                <label>Customer Name *</label>
                <input value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required placeholder="Customer full name" />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input value={form.customerAccount} onChange={e => setForm({...form, customerAccount: e.target.value})} placeholder="Customer account #" />
              </div>
              <div className="form-group">
                <label>Location / Address</label>
                <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Property address" />
              </div>
              <div className="form-group">
                <label>Previous Reading (KL) *</label>
                <input type="number" value={form.previousReading} onChange={e => setForm({...form, previousReading: e.target.value})} required min="0" />
              </div>
              <div className="form-group">
                <label>Current Reading (KL) *</label>
                <input type="number" value={form.currentReading} onChange={e => setForm({...form, currentReading: e.target.value})} required min="0" />
              </div>
              <div className="form-group">
                <label>Reading Date *</label>
                <input type="date" value={form.readingDate} onChange={e => setForm({...form, readingDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Any observations..." />
              </div>
            </div>
            {consumption !== null && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
                <strong>Calculated Consumption: </strong>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#0369a1' }}>{consumption} KL</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Reading'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="filters">
        <input placeholder="Search by meter #..." value={filters.meterNumber} onChange={e => setFilters({...filters, meterNumber: e.target.value})} />
        <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})} />
        <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Meter #</th><th>Customer</th><th>Location</th><th>Prev (KL)</th><th>Current (KL)</th><th>Consumption (KL)</th><th>Date</th><th>Read By</th></tr>
          </thead>
          <tbody>
            {readings.map(r => (
              <tr key={r._id}>
                <td><code style={{ fontSize: 12 }}>{r.meterNumber}</code></td>
                <td>{r.customerName}<br/><small style={{ color: '#6b7280' }}>{r.customerAccount}</small></td>
                <td>{r.location}</td>
                <td>{r.previousReading}</td>
                <td>{r.currentReading}</td>
                <td><strong style={{ color: r.consumption > 50 ? '#dc2626' : '#16a34a' }}>{r.consumption}</strong></td>
                <td>{new Date(r.readingDate).toLocaleDateString()}</td>
                <td>{r.meterReader?.name}</td>
              </tr>
            ))}
            {readings.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>No meter readings found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

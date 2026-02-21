import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', accountNumber: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 40, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>💧</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e3a5f' }}>Create Your Account</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label>Full Name *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="john@email.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} placeholder="Min 6 characters" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+27 11 000 0000" />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input value={form.accountNumber} onChange={e => setForm({...form, accountNumber: e.target.value})} placeholder="Your water account #" />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main St, City" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: 16 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#6b7280' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

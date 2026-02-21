import React, { useState, useEffect } from 'react';
import { getStaff, createStaff } from '../utils/api';

const Admin = () => {
  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'technician', phone: '' });
  const [msg, setMsg] = useState('');

  const load = () => getStaff().then(r => setStaff(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createStaff(form);
      setMsg('Staff member created!');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'technician', phone: '' });
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1a365d' }}>⚙️ Admin Panel</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {msg && <div className={`alert ${msg.includes('!') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '16px' }}>Add Staff Member</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="technician">Technician</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Staff Account</button>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>Staff Members ({staff.length})</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {staff.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td><span className="badge badge-received" style={{ textTransform: 'capitalize' }}>{s.role}</span></td>
                  <td>{s.phone || '—'}</td>
                  <td style={{ fontSize: '12px' }}>{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

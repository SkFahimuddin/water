import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myComplaints, setMyComplaints] = useState([]);
  const isStaff = ['supervisor', 'admin'].includes(user?.role);

  useEffect(() => {
    if (isStaff) {
      api.get('/dashboard/stats').then(r => setStats(r.data));
    } else {
      api.get('/complaints').then(r => setMyComplaints(r.data));
    }
  }, [isStaff]);

  if (!isStaff) {
    return (
      <div className="container">
        <div className="page-header">
          <h1>Welcome, {user?.name}!</h1>
          <Link to="/complaints/new" className="btn btn-primary">+ Submit Complaint</Link>
        </div>
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <span className="stat-number">{myComplaints.length}</span>
            <span className="stat-label">My Complaints</span>
          </div>
          <div className="stat-card stat-orange">
            <span className="stat-number">{myComplaints.filter(c => c.status === 'In Progress').length}</span>
            <span className="stat-label">In Progress</span>
          </div>
          <div className="stat-card stat-green">
            <span className="stat-number">{myComplaints.filter(c => c.status === 'Resolved').length}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginBottom: 16 }}>My Recent Complaints</h2>
          {myComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>
              <p>No complaints submitted yet.</p>
              <Link to="/complaints/new" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Submit Your First Complaint</Link>
            </div>
          ) : (
            <table>
              <thead><tr><th>Reference</th><th>Title</th><th>Category</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {myComplaints.slice(0, 10).map(c => (
                  <tr key={c._id}>
                    <td><code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{c.referenceNumber}</code></td>
                    <td>{c.title}</td>
                    <td>{c.category}</td>
                    <td><span className={`badge badge-${c.status.toLowerCase().replace(' ','')}`}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>📊 Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="/api/complaints/export/csv" className="btn btn-secondary btn-sm">Export Complaints CSV</a>
          <a href="/api/meter/export/csv" className="btn btn-secondary btn-sm">Export Meter CSV</a>
        </div>
      </div>
      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-blue"><span className="stat-number">{stats.totals.complaints}</span><span className="stat-label">Total Complaints</span></div>
            <div className="stat-card stat-green"><span className="stat-number">{stats.totals.readings}</span><span className="stat-label">Meter Readings</span></div>
            <div className="stat-card stat-orange"><span className="stat-number">{stats.totals.tasks}</span><span className="stat-label">Total Tasks</span></div>
            <div className="stat-card stat-purple"><span className="stat-number">{stats.totals.users}</span><span className="stat-label">Registered Users</span></div>
          </div>
          <div className="grid-2">
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Complaints by Status</h3>
              <Doughnut data={{
                labels: stats.complaintsByStatus.map(s => s._id),
                datasets: [{ data: stats.complaintsByStatus.map(s => s.count), backgroundColor: ['#3b82f6','#f59e0b','#10b981'] }]
              }} />
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Complaints by Category</h3>
              <Bar
                data={{
                  labels: stats.complaintsByCategory.map(s => s._id),
                  datasets: [{ label: 'Count', data: stats.complaintsByCategory.map(s => s.count), backgroundColor: '#3b82f6' }]
                }}
                options={{ plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Recent Complaints</h3>
            <table>
              <thead><tr><th>Reference</th><th>Title</th><th>Submitted By</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {stats.recentComplaints.map(c => (
                  <tr key={c._id}>
                    <td><code style={{ fontSize: 12, background: '#f3f4f6', padding: '2px 6px', borderRadius: 4 }}>{c.referenceNumber}</code></td>
                    <td>{c.title}</td>
                    <td>{c.submittedBy?.name}</td>
                    <td><span className={`badge badge-${c.status.toLowerCase().replace(' ','')}`}>{c.status}</span></td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

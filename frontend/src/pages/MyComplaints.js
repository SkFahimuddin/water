import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getComplaints } from '../utils/api';

const statusBadge = (s) => {
  const map = { 'Received': 'badge-received', 'In Progress': 'badge-inprogress', 'Resolved': 'badge-resolved' };
  return <span className={`badge ${map[s] || ''}`}>{s}</span>;
};

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints({ limit: 50 }).then(r => {
      setComplaints(r.data.complaints);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#1a365d' }}>My Complaints</h1>
        <Link to="/submit-complaint" className="btn btn-primary">+ New Complaint</Link>
      </div>
      {loading ? <div className="loading">Loading...</div> : complaints.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
          <p style={{ color: '#718096' }}>No complaints yet.</p>
          <Link to="/submit-complaint" className="btn btn-primary" style={{ marginTop: '16px', display: 'inline-block' }}>Submit Your First Complaint</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {complaints.map(c => (
            <div key={c._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', background: '#ebf8ff', padding: '2px 8px', borderRadius: '4px', color: '#2b6cb0' }}>
                      {c.referenceNumber}
                    </span>
                    {statusBadge(c.status)}
                  </div>
                  <p style={{ fontWeight: 600 }}>{c.type}</p>
                  <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>{c.description}</p>
                  <p style={{ fontSize: '13px', color: '#718096', marginTop: '4px' }}>📍 {c.location}</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', color: '#718096' }}>
                  <div>{new Date(c.createdAt).toLocaleDateString()}</div>
                  {c.assignedTo && <div style={{ marginTop: '4px' }}>Assigned: {c.assignedTo.name}</div>}
                </div>
              </div>
              {c.resolutionNotes && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#f0fff4', borderRadius: '6px', fontSize: '14px', color: '#276749' }}>
                  <strong>Resolution:</strong> {c.resolutionNotes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;

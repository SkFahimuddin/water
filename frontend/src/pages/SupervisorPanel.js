import React, { useEffect, useState, useCallback } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const STATUS_COLORS = {
  'Received':   { bg: '#EFF6FF', color: '#1D4ED8', dot: '#3B82F6' },
  'In Progress':{ bg: '#FFFBEB', color: '#B45309', dot: '#F59E0B' },
  'Resolved':   { bg: '#F0FDF4', color: '#15803D', dot: '#22C55E' },
};

const PRIORITY_COLORS = {
  'High':   { bg: '#FEF2F2', color: '#DC2626' },
  'Medium': { bg: '#FFFBEB', color: '#D97706' },
  'Low':    { bg: '#F0FDF4', color: '#16A34A' },
};

const Badge = ({ label, map }) => {
  const style = map[label] || { bg: '#F3F4F6', color: '#6B7280' };
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      display: 'inline-flex', alignItems: 'center', gap: 5
    }}>
      {map === STATUS_COLORS && <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot, display: 'inline-block' }} />}
      {label}
    </span>
  );
};

export default function SupervisorPanel() {
  const [complaints, setComplaints]   = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selected, setSelected]       = useState(null);
  const [filters, setFilters]         = useState({ status: '', category: '', priority: '' });
  const [assignForm, setAssignForm]   = useState({ assignedTo: '', status: '', resolutionNotes: '', priority: '' });
  const [stats, setStats]             = useState(null);
  const [activeTab, setActiveTab]     = useState('complaints'); // 'complaints' | 'stats'
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status)   params.status   = filters.status;
      if (filters.category) params.category = filters.category;
      const [cRes, tRes] = await Promise.all([
        api.get('/complaints', { params }),
        api.get('/auth/me').then(() => api.get('/auth/staff')).catch(() => ({ data: [] })),
      ]);
      setComplaints(cRes.data);
      setTechnicians((tRes.data || []).filter(u => u.role === 'technician'));
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch {
      // fallback — compute from complaints
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { if (activeTab === 'stats') fetchStats(); }, [activeTab, fetchStats]);

  const openModal = (c) => {
    setSelected(c);
    setAssignForm({
      assignedTo: c.assignedTo?._id || '',
      status: c.status,
      resolutionNotes: c.resolutionNotes || '',
      priority: c.priority,
    });
  };

  const handleSave = async () => {
    try {
      await api.put(`/complaints/${selected._id}`, assignForm);
      toast.success('Complaint updated!');
      setSelected(null);
      fetchAll();
    } catch {
      toast.error('Update failed');
    }
  };

  const visible = complaints.filter(c => {
    if (filters.priority && c.priority !== filters.priority) return false;
    if (search && !`${c.title} ${c.location} ${c.referenceNumber}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    total:      complaints.length,
    received:   complaints.filter(c => c.status === 'Received').length,
    inProgress: complaints.filter(c => c.status === 'In Progress').length,
    resolved:   complaints.filter(c => c.status === 'Resolved').length,
    unassigned: complaints.filter(c => !c.assignedTo).length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
        borderBottom: '1px solid rgba(99,102,241,0.2)',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🛡️</div>
            <div>
              <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 17, letterSpacing: '-0.3px' }}>Supervisor Control Panel</div>
              <div style={{ color: '#64748B', fontSize: 12 }}>Complaint Monitoring & Assignment</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['complaints','stats'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: activeTab === tab ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab ? 'white' : '#94A3B8',
                transition: 'all 0.2s',
              }}>
                {tab === 'complaints' ? '📋 Complaints' : '📊 Statistics'}
              </button>
            ))}
            <a href="/api/complaints/export/csv" style={{
              padding: '8px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
              background: 'rgba(255,255,255,0.06)', color: '#94A3B8',
            }}>⬇ Export CSV</a>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 32px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total', value: counts.total,      color: '#6366F1', icon: '📋' },
            { label: 'New',   value: counts.received,    color: '#3B82F6', icon: '🔵' },
            { label: 'Active',value: counts.inProgress,  color: '#F59E0B', icon: '⚡' },
            { label: 'Resolved', value: counts.resolved, color: '#22C55E', icon: '✅' },
            { label: 'Unassigned', value: counts.unassigned, color: '#EF4444', icon: '⚠️' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '14px 14px 0 0' }} />
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 30, fontWeight: 800, lineHeight: 1.1, marginTop: 6 }}>{s.value}</div>
              <div style={{ color: '#64748B', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {activeTab === 'complaints' && (
          <>
            {/* Filters */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '16px 20px', marginBottom: 20,
              display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <input
                placeholder="🔍  Search complaints..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={inputStyle}
              />
              {[
                { key: 'status',   opts: ['', 'Received', 'In Progress', 'Resolved'],                                       label: 'Status' },
                { key: 'category', opts: ['', 'Pipe Leak', 'No Water', 'Billing Issue', 'Water Quality', 'Meter Issue', 'Other'], label: 'Category' },
                { key: 'priority', opts: ['', 'High', 'Medium', 'Low'],                                                      label: 'Priority' },
              ].map(f => (
                <select key={f.key} value={filters[f.key]} onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
                  style={{ ...inputStyle, maxWidth: 160 }}>
                  <option value="">{f.label}: All</option>
                  {f.opts.filter(Boolean).map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
              <div style={{ marginLeft: 'auto', color: '#64748B', fontSize: 13 }}>
                Showing <strong style={{ color: '#F1F5F9' }}>{visible.length}</strong> of {complaints.length}
              </div>
            </div>

            {/* Table */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#64748B' }}>Loading complaints...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['Ref #', 'Title & Location', 'Category', 'Priority', 'Status', 'Submitted By', 'Assigned To', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.2)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((c, i) => (
                      <tr key={c._id} style={{
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.15s',
                        background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                      >
                        <td style={td}>
                          <code style={{ fontSize: 11, background: 'rgba(99,102,241,0.15)', color: '#A5B4FC', padding: '3px 8px', borderRadius: 6 }}>
                            {c.referenceNumber}
                          </code>
                        </td>
                        <td style={td}>
                          <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13 }}>{c.title}</div>
                          <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>📍 {c.location}</div>
                        </td>
                        <td style={td}><span style={{ color: '#94A3B8', fontSize: 13 }}>{c.category}</span></td>
                        <td style={td}><Badge label={c.priority} map={PRIORITY_COLORS} /></td>
                        <td style={td}><Badge label={c.status} map={STATUS_COLORS} /></td>
                        <td style={td}><span style={{ color: '#CBD5E1', fontSize: 13 }}>{c.submittedBy?.name || '—'}</span></td>
                        <td style={td}>
                          {c.assignedTo ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                                {c.assignedTo.name?.charAt(0)}
                              </span>
                              <span style={{ color: '#CBD5E1', fontSize: 13 }}>{c.assignedTo.name}</span>
                            </span>
                          ) : (
                            <span style={{ color: '#EF4444', fontSize: 12, fontWeight: 600 }}>⚠ Unassigned</span>
                          )}
                        </td>
                        <td style={td}><span style={{ color: '#64748B', fontSize: 12 }}>{new Date(c.createdAt).toLocaleDateString()}</span></td>
                        <td style={td}>
                          <button onClick={() => openModal(c)} style={{
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            border: 'none', color: 'white', padding: '6px 14px',
                            borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                          }}>
                            Manage →
                          </button>
                        </td>
                      </tr>
                    ))}
                    {visible.length === 0 && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 60, color: '#475569' }}>No complaints match filters</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {[
              { title: 'By Status', data: [
                { label: 'Received',    value: counts.received,   color: '#3B82F6' },
                { label: 'In Progress', value: counts.inProgress, color: '#F59E0B' },
                { label: 'Resolved',    value: counts.resolved,   color: '#22C55E' },
              ]},
              { title: 'By Priority', data: [
                { label: 'High',   value: complaints.filter(c => c.priority === 'High').length,   color: '#EF4444' },
                { label: 'Medium', value: complaints.filter(c => c.priority === 'Medium').length, color: '#F59E0B' },
                { label: 'Low',    value: complaints.filter(c => c.priority === 'Low').length,    color: '#22C55E' },
              ]},
            ].map(panel => (
              <div key={panel.title} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16, padding: 24,
              }}>
                <h3 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>{panel.title}</h3>
                {panel.data.map(d => (
                  <div key={d.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#94A3B8', fontSize: 14 }}>{d.label}</span>
                      <span style={{ color: d.color, fontWeight: 700 }}>{d.value}</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', background: d.color, borderRadius: 4,
                        width: counts.total > 0 ? `${(d.value / counts.total) * 100}%` : '0%',
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: 24, gridColumn: '1/-1',
            }}>
              <h3 style={{ color: '#F1F5F9', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Technician Workload</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {technicians.map(t => {
                  const assigned = complaints.filter(c => c.assignedTo?._id === t._id);
                  const resolved = assigned.filter(c => c.status === 'Resolved').length;
                  return (
                    <div key={t._id} style={{
                      background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 12, padding: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14 }}>
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 13 }}>{t.name}</div>
                          <div style={{ color: '#64748B', fontSize: 11 }}>Technician</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 0' }}>
                          <div style={{ color: '#6366F1', fontWeight: 700, fontSize: 20 }}>{assigned.length}</div>
                          <div style={{ color: '#64748B', fontSize: 11 }}>Assigned</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 0' }}>
                          <div style={{ color: '#22C55E', fontWeight: 700, fontSize: 20 }}>{resolved}</div>
                          <div style={{ color: '#64748B', fontSize: 11 }}>Resolved</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {technicians.length === 0 && (
                  <div style={{ color: '#475569', fontSize: 14, gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>
                    No technicians found. Add staff via the Admin route.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{
            background: '#1E293B', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 520,
            boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <h2 style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18, margin: 0 }}>Manage Complaint</h2>
                <code style={{ color: '#A5B4FC', fontSize: 12 }}>{selected.referenceNumber}</code>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94A3B8', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ color: '#F1F5F9', fontWeight: 600, marginBottom: 4 }}>{selected.title}</div>
              <div style={{ color: '#64748B', fontSize: 13 }}>{selected.description}</div>
              <div style={{ color: '#64748B', fontSize: 12, marginTop: 8 }}>📍 {selected.location}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Assign Technician</label>
                <select value={assignForm.assignedTo} onChange={e => setAssignForm({ ...assignForm, assignedTo: e.target.value })} style={modalInputStyle}>
                  <option value="">— Select Technician —</option>
                  {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Update Status</label>
                <select value={assignForm.status} onChange={e => setAssignForm({ ...assignForm, status: e.target.value })} style={modalInputStyle}>
                  <option>Received</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={assignForm.priority} onChange={e => setAssignForm({ ...assignForm, priority: e.target.value })} style={modalInputStyle}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Resolution Notes</label>
                <textarea
                  rows={3}
                  value={assignForm.resolutionNotes}
                  onChange={e => setAssignForm({ ...assignForm, resolutionNotes: e.target.value })}
                  placeholder="Notes about this complaint..."
                  style={{ ...modalInputStyle, resize: 'vertical', minHeight: 80 }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
              <button onClick={() => setSelected(null)} style={{
                padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: '10px 22px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14,
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10, padding: '9px 14px', color: '#F1F5F9', fontSize: 13,
  outline: 'none', flex: 1, minWidth: 140,
};

const td = {
  padding: '14px 16px', verticalAlign: 'middle',
};

const labelStyle = {
  display: 'block', color: '#64748B', fontSize: 12, fontWeight: 600,
  textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6,
};

const modalInputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
  padding: '10px 14px', color: '#F1F5F9', fontSize: 14, outline: 'none',
};
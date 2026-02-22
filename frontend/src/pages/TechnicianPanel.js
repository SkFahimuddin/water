import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';

const CATEGORY_ICON = {
  'Pipe Leak':     '🔧',
  'No Water':      '🚿',
  'Billing Issue': '💵',
  'Water Quality': '🧪',
  'Meter Issue':   '📊',
  'Other':         '❓',
};

const STATUS_META = {
  'Received':    { label: 'New',         color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: '🆕' },
  'In Progress': { label: 'Working On',  color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: '⚡' },
  'Resolved':    { label: 'Resolved',    color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   icon: '✅' },
};

const PRIORITY_META = {
  'High':   { color: '#EF4444', label: '🔴 High' },
  'Medium': { color: '#F59E0B', label: '🟡 Medium' },
  'Low':    { color: '#22C55E', label: '🟢 Low' },
};

export default function TechnicianPanel() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selected,   setSelected]   = useState(null);
  const [activeTab,  setActiveTab]  = useState('all');   // 'all'|'active'|'resolved'
  const [solveForm,  setSolveForm]  = useState({ resolutionNotes: '' });
  const [loading,    setLoading]    = useState(false);
  const [quickNote,  setQuickNote]  = useState({});

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch {
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  // Technicians only see their assigned complaints (backend also filters)
  const assigned = complaints;

  const tabs = {
    all:      assigned,
    active:   assigned.filter(c => c.status !== 'Resolved'),
    resolved: assigned.filter(c => c.status === 'Resolved'),
  };

  const visible = tabs[activeTab] || [];

  const openSolveModal = (c) => {
    setSelected(c);
    setSolveForm({ resolutionNotes: c.resolutionNotes || '', status: c.status });
  };

  const handleStatusChange = async (complaint, newStatus) => {
    try {
      await api.put(`/complaints/${complaint._id}`, {
        status: newStatus,
        resolutionNotes: quickNote[complaint._id] || complaint.resolutionNotes || '',
      });
      toast.success(`Marked as ${newStatus}!`);
      fetchComplaints();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleSolve = async () => {
    if (!solveForm.resolutionNotes.trim()) {
      toast.error('Please add resolution notes before marking as resolved');
      return;
    }
    try {
      await api.put(`/complaints/${selected._id}`, {
        status: 'Resolved',
        resolutionNotes: solveForm.resolutionNotes,
      });
      toast.success('✅ Complaint marked as Resolved!');
      setSelected(null);
      fetchComplaints();
    } catch {
      toast.error('Update failed');
    }
  };

  const counts = {
    total:    assigned.length,
    active:   assigned.filter(c => c.status !== 'Resolved').length,
    resolved: assigned.filter(c => c.status === 'Resolved').length,
    high:     assigned.filter(c => c.priority === 'High' && c.status !== 'Resolved').length,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0C1322', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        borderBottom: '1px solid rgba(56,189,248,0.2)',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #0EA5E9, #38BDF8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔧</div>
            <div>
              <div style={{ color: '#F0F9FF', fontWeight: 700, fontSize: 17 }}>Technician Workbench</div>
              <div style={{ color: '#64748B', fontSize: 12 }}>
                Welcome, <span style={{ color: '#38BDF8' }}>{user?.name}</span>
              </div>
            </div>
          </div>
          {counts.high > 0 && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '8px 16px', color: '#FCA5A5', fontSize: 13, fontWeight: 600,
            }}>
              ⚠️ {counts.high} High Priority Pending
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Total Assigned', value: counts.total,    color: '#38BDF8', bg: 'rgba(56,189,248,0.1)',  icon: '📋' },
            { label: 'Pending',        value: counts.active,   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  icon: '⏳' },
            { label: 'Resolved',       value: counts.resolved, color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   icon: '✅' },
            { label: 'High Priority',  value: counts.high,     color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   icon: '🔴' },
          ].map(s => (
            <div key={s.label} style={{
              background: s.bg, border: `1px solid ${s.color}30`,
              borderRadius: 14, padding: '18px 20px',
            }}>
              <div style={{ fontSize: 24 }}>{s.icon}</div>
              <div style={{ color: s.color, fontSize: 32, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>{s.value}</div>
              <div style={{ color: '#64748B', fontSize: 12, fontWeight: 500, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[
            { key: 'all',      label: `All (${counts.total})` },
            { key: 'active',   label: `Pending (${counts.active})` },
            { key: 'resolved', label: `Resolved (${counts.resolved})` },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '9px 20px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === t.key ? 'linear-gradient(135deg, #0EA5E9, #38BDF8)' : 'transparent',
              color: activeTab === t.key ? 'white' : '#64748B',
              transition: 'all 0.2s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Complaint Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#475569' }}>Loading your complaints...</div>
        ) : visible.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80,
            background: 'rgba(255,255,255,0.03)', borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ color: '#94A3B8', fontSize: 16 }}>
              {activeTab === 'resolved' ? 'No resolved complaints yet' : 'No pending complaints! Great work.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map(c => {
              const sm = STATUS_META[c.status] || STATUS_META['Received'];
              const pm = PRIORITY_META[c.priority] || PRIORITY_META['Medium'];
              const isResolved = c.status === 'Resolved';

              return (
                <div key={c._id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: isResolved ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  borderLeft: `4px solid ${sm.color}`,
                  borderRadius: 14, padding: '20px 24px',
                  opacity: isResolved ? 0.75 : 1,
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                    {/* Left: Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 20 }}>{CATEGORY_ICON[c.category] || '❓'}</span>
                        <code style={{ fontSize: 11, background: 'rgba(56,189,248,0.1)', color: '#38BDF8', padding: '3px 8px', borderRadius: 6 }}>
                          {c.referenceNumber}
                        </code>
                        <span style={{ background: sm.bg, color: sm.color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {sm.icon} {sm.label}
                        </span>
                        <span style={{ color: pm.color, fontSize: 12, fontWeight: 600 }}>{pm.label}</span>
                      </div>

                      <h3 style={{ color: '#F0F9FF', fontWeight: 700, fontSize: 15, margin: '0 0 6px 0' }}>{c.title}</h3>
                      <p style={{ color: '#94A3B8', fontSize: 13, margin: '0 0 8px 0', lineHeight: 1.5 }}>{c.description}</p>

                      <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#64748B', flexWrap: 'wrap' }}>
                        <span>📍 {c.location}</span>
                        <span>📁 {c.category}</span>
                        <span>📅 {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.submittedBy && <span>👤 {c.submittedBy.name}</span>}
                      </div>

                      {isResolved && c.resolutionNotes && (
                        <div style={{
                          marginTop: 12, background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10,
                          padding: '10px 14px', color: '#86EFAC', fontSize: 13,
                        }}>
                          <strong>✅ Resolution:</strong> {c.resolutionNotes}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {!isResolved && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 160 }}>
                        {c.status === 'Received' && (
                          <button
                            onClick={() => handleStatusChange(c, 'In Progress')}
                            style={{
                              background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                              color: '#FCD34D', padding: '9px 16px', borderRadius: 10, cursor: 'pointer',
                              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
                            }}
                          >
                            ⚡ Start Working
                          </button>
                        )}
                        <button
                          onClick={() => openSolveModal(c)}
                          style={{
                            background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                            border: 'none', color: 'white', padding: '9px 16px',
                            borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ✅ Mark Resolved
                        </button>
                      </div>
                    )}

                    {isResolved && (
                      <div style={{
                        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: 10, padding: '10px 16px', color: '#4ADE80',
                        fontWeight: 700, fontSize: 13, textAlign: 'center', minWidth: 120,
                      }}>
                        ✅ Done
                        <div style={{ color: '#64748B', fontSize: 11, fontWeight: 400, marginTop: 2 }}>
                          {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{
            background: '#132232', border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: 20, padding: 32, width: '100%', maxWidth: 500,
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
              <h2 style={{ color: '#F0F9FF', fontWeight: 700, fontSize: 20, margin: 0 }}>Mark as Resolved</h2>
              <p style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>Provide resolution details before closing</p>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, marginBottom: 20,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div style={{ color: '#F0F9FF', fontWeight: 600, fontSize: 14 }}>{selected.title}</div>
              <div style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>
                <code style={{ color: '#38BDF8' }}>{selected.referenceNumber}</code> · 📍 {selected.location}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#64748B', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Resolution Notes <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <textarea
                rows={4}
                value={solveForm.resolutionNotes}
                onChange={e => setSolveForm({ ...solveForm, resolutionNotes: e.target.value })}
                placeholder="Describe what was done to resolve this issue, parts replaced, actions taken, etc..."
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(56,189,248,0.2)', borderRadius: 12,
                  padding: '12px 16px', color: '#F0F9FF', fontSize: 14,
                  resize: 'vertical', minHeight: 100, outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setSelected(null)} style={{
                flex: 1, padding: '12px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              }}>Cancel</button>
              <button onClick={handleSolve} style={{
                flex: 2, padding: '12px', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #16A34A, #22C55E)',
                color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 15,
              }}>
                ✅ Confirm Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
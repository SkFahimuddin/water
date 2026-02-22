import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isStaff       = ['technician', 'supervisor', 'admin'].includes(user?.role);
  const isSupervisor  = ['supervisor', 'admin'].includes(user?.role);
  const isTechnician  = user?.role === 'technician';

  const links = [
    { to: '/',            label: '📊 Dashboard',        show: true },
    { to: '/complaints',  label: '📋 Complaints',        show: true },
    { to: '/supervisor',  label: '🛡️ Supervisor Panel', show: isSupervisor },
    { to: '/technician',  label: '🔧 My Workbench',      show: isStaff },
    { to: '/meter',       label: '🔢 Meter Readings',    show: isStaff },
    { to: '/tasks',       label: '✅ Tasks',             show: isStaff },
  ].filter(l => l.show);

  const roleColors = {
    customer:   '#22C55E',
    technician: '#38BDF8',
    supervisor: '#A78BFA',
    admin:      '#F59E0B',
  };

  return (
    <nav style={{
      background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 24px',
      position: 'sticky', top: 0, zIndex: 200,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 58,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: 22 }}>💧</span>
          <span style={{ color: '#F1F5F9', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>WaterMS</span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {links.map(({ to, label }) => {
            const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
            return (
              <Link key={to} to={to} style={{
                color:      active ? '#F1F5F9' : '#64748B',
                textDecoration: 'none',
                padding:    '6px 12px',
                borderRadius: 8,
                fontSize:   13,
                fontWeight: active ? 700 : 500,
                background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
                border:     active ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent'; }}}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* User info + Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColors[user?.role] || '#6366F1'}, #6366F1)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: 12,
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
              <div style={{ color: roleColors[user?.role] || '#6366F1', fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94A3B8', padding: '7px 14px', borderRadius: 8,
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = '#FCA5A5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#94A3B8'; }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isStaff = ['technician','supervisor','admin'].includes(user?.role);

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
      color: 'white', padding: '0 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 700, fontSize: 18 }}>
          💧 WaterMS
        </Link>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[
            { to: '/', label: '📊 Dashboard' },
            { to: '/complaints', label: '📋 Complaints' },
            ...(isStaff ? [{ to: '/meter', label: '🔢 Meter Readings' }] : []),
            ...(isStaff ? [{ to: '/tasks', label: '✅ Tasks' }] : []),
          ].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              color: location.pathname === to ? '#93c5fd' : 'rgba(255,255,255,0.85)',
              textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14,
              background: location.pathname === to ? 'rgba(255,255,255,0.15)' : 'transparent',
              fontWeight: location.pathname === to ? 600 : 400,
            }}>{label}</Link>
          ))}
          <div style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>
              {user?.name} <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{user?.role}</span>
            </span>
            <button onClick={handleLogout} style={{
              background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13
            }}>Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
}

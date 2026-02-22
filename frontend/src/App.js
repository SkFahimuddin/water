import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import NewComplaint from './pages/NewComplaint';
import MeterReadings from './pages/MeterReadings';
import Tasks from './pages/Tasks';
import SupervisorPanel from './pages/SupervisorPanel';
import TechnicianPanel from './pages/TechnicianPanel';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ textAlign: 'center', padding: '50px', color: '#94A3B8' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {user && <Navbar />}
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dashboard — role-aware */}
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />

        {/* Complaints — all roles */}
        <Route path="/complaints"     element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />

        {/* Meter — staff only */}
        <Route path="/meter" element={
          <PrivateRoute roles={['technician', 'supervisor', 'admin']}>
            <MeterReadings />
          </PrivateRoute>
        } />

        {/* Tasks — staff only */}
        <Route path="/tasks" element={
          <PrivateRoute roles={['technician', 'supervisor', 'admin']}>
            <Tasks />
          </PrivateRoute>
        } />

        {/* ── NEW ROUTES ─────────────────────────────── */}

        {/* Supervisor / Admin control panel */}
        <Route path="/supervisor" element={
          <PrivateRoute roles={['supervisor', 'admin']}>
            <SupervisorPanel />
          </PrivateRoute>
        } />

        {/* Technician workbench */}
        <Route path="/technician" element={
          <PrivateRoute roles={['technician', 'supervisor', 'admin']}>
            <TechnicianPanel />
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
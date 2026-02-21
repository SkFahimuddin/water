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

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',padding:'50px'}}>Loading...</div>;
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/complaints" element={<PrivateRoute><Complaints /></PrivateRoute>} />
        <Route path="/complaints/new" element={<PrivateRoute><NewComplaint /></PrivateRoute>} />
        <Route path="/meter" element={<PrivateRoute roles={['technician','supervisor','admin']}><MeterReadings /></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

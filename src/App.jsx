import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import Companies from './pages/Companies';
import Analytics from './pages/Analytics';
import Interviews from './pages/Interviews';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Legacy support for setCurrentPage
  const setCurrentPage = (page) => {
    switch (page) {
      case 'login': navigate('/login'); break;
      case 'register': navigate('/register'); break;
      case 'otp-verification': navigate('/otp-verification'); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'kanban': navigate('/kanban'); break;
      case 'companies': navigate('/companies'); break;
      case 'analytics': navigate('/analytics'); break;
      case 'interviews': navigate('/interviews'); break;
      default: navigate('/login');
    }
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login setCurrentPage={setCurrentPage} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register setCurrentPage={setCurrentPage} />} />
        <Route path="/otp-verification" element={<OTPVerification setCurrentPage={setCurrentPage} />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard setCurrentPage={setCurrentPage} /></ProtectedRoute>} />
        <Route path="/kanban" element={<ProtectedRoute><KanbanBoard setCurrentPage={setCurrentPage} /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><Companies setCurrentPage={setCurrentPage} /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics setCurrentPage={setCurrentPage} /></ProtectedRoute>} />
        <Route path="/interviews" element={<ProtectedRoute><Interviews setCurrentPage={setCurrentPage} /></ProtectedRoute>} />

        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;
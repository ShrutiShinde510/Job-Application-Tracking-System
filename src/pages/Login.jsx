import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Login.css';

function Login({ setCurrentPage }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'error', 'info', or 'success'

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    setServerMsg('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setServerMsg('');
      setMsgType('');

      try {
        const response = await api.post('/auth/login', formData);
        const data = response.data;

        // Login successful
        console.log('✅ Login successful');
        login(data.user || { email: formData.email }, data.token);
        setServerMsg('✅ Login successful! Redirecting...');
        setMsgType('success');

        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (error) {
        if (error.response) {
          const data = error.response.data;
          if (error.response.status === 403 && data.requiresVerification) {
            // Email not verified - redirect to OTP page
            console.log('📧 Email verification required');

            if (data.devOTP) {
              console.log('📧 Development OTP:', data.devOTP);
            }

            if (data.emailSent === false) {
              setServerMsg(`⚠️ Email failed to send. Developer OTP: ${data.devOTP || 'Check Console'}`);
              setMsgType('error');
            } else {
              setServerMsg('📧 Email verification required. A new OTP has been sent to your email.');
              setMsgType('info');
            }

            // Pass data to OTP page via location state
            setTimeout(() => {
              navigate('/otp-verification', {
                state: {
                  email: formData.email,
                  devOTP: data.devOTP,
                  emailSent: data.emailSent
                }
              });
            }, 1800);
          } else {
            // Login failed
            setServerMsg(data.message || 'Login failed');
            setMsgType('error');
          }
        } else {
          console.error('❌ Login error:', error);
          setServerMsg('⚠️ Cannot connect to server. Please ensure backend is running on port 5001.');
          setMsgType('error');
        }
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <Briefcase size={24} />
            </div>
            <span className="auth-logo-text">JobTracker</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue tracking your applications</p>
        </div>

        <div className="auth-form">
          {/* Server Message */}
          {serverMsg && (
            <div className={`server-message ${msgType}`}>
              {serverMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <span className="auth-link" onClick={() => !loading && navigate('/register')}>
            Sign up
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;

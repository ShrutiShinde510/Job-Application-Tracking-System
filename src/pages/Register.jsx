import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState('');
  const [msgType, setMsgType] = useState(''); // 'error' or 'success'

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

    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        const response = await api.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        const data = response.data;

        // Registration successful
        console.log('✅ Registration successful:', data);

        if (data.emailSent === false) {
          setServerMsg(`⚠️ Account created, but email failed. OTP: ${data.devOTP || 'Check Console'}`);
          setMsgType('error');
        } else {
          setServerMsg('✅ Account created! Check your email for OTP.');
          setMsgType('success');
        }

        // Navigate to OTP page after 2 seconds
        setTimeout(() => {
          navigate('/otp-verification', {
            state: {
              email: formData.email,
              devOTP: data.devOTP,
              emailSent: data.emailSent
            }
          });
        }, 2000);
      } catch (error) {
        console.error('❌ Registration error:', error);
        setServerMsg(error.response?.data?.message || 'Registration failed');
        setMsgType('error');
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start tracking your job applications today</p>
        </div>

        <div className="auth-form">
          {/* Server Message */}
          {serverMsg && (
            <div className={`server-message ${msgType}`}>
              {serverMsg}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

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
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => !loading && navigate('/login')}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;

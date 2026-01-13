import React, { useState, useRef, useEffect } from 'react';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './OTPVerification.css';

function OTPVerification() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const initialEmailSent = location.state?.emailSent;
  const initialDevOTP = location.state?.devOTP;

  // Set initial feedback if email failed
  useEffect(() => {
    if (initialEmailSent === false) {
      setError('⚠️ Email failed to send. Please check your SMTP settings or use the OTP provided below.');
      if (initialDevOTP) {
        setSuccess(`Development OTP: ${initialDevOTP}`);
      }
    }
  }, [initialEmailSent, initialDevOTP]);

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('');
    setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);

    // Focus last filled input or last input
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/verify-otp', {
        email: email,
        otp: otpValue
      });

      if (response.status === 200) {
        setSuccess('OTP verified successfully!');

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('OTP Verification Error:', error);
      const msg = error.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/resend-otp', { email });

      if (response.status === 200) {
        setSuccess('OTP sent successfully!');
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0].focus();

        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Resend OTP Error:', error);
      setError(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
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
          <h1 className="auth-title">Verify Your Email</h1>
          <p className="auth-subtitle">
            We've sent a 6-digit code to<br />
            <strong>{email || 'your email'}</strong>
          </p>
        </div>

        <div className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="1"
                className={`otp-input ${error ? 'otp-input-error' : ''} ${success ? 'otp-input-success' : ''}`}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                autoFocus={index === 0}
                disabled={loading}
              />
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button
            onClick={handleVerify}
            className="btn btn-primary"
            disabled={otp.join('').length !== 6 || loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="otp-resend">
            {!canResend ? (
              <p className="resend-timer">
                Resend OTP in <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <p className="resend-link">
                Didn't receive code?{' '}
                <span onClick={handleResend} style={{ opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Sending...' : 'Resend OTP'}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="auth-footer">
          <span className="auth-link" onClick={() => !loading && navigate('/login')}>
            <ArrowLeft size={16} style={{ verticalAlign: 'middle' }} /> Back to Login
          </span>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;

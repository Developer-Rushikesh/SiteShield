import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, UserPlus, AlertCircle, Mail, Key, ArrowLeft, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Register = () => {
  const [step, setStep] = useState(1); // 1 = Details Form, 2 = OTP Verification
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Status & Feedback States
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { verifyRegisterOtp } = useAuth();
  const navigate = useNavigate();

  // Cooldown countdown timer
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.sendRegisterOtp(email, name);
      setSuccessMsg(res.message || `A 6-digit verification code was sent to ${email}`);
      setCountdown(res.cooldown_seconds || 60);
      setStep(2);
    } catch (err) {
      let msg = 'Failed to send verification code.';
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          msg = data;
        } else if (data.email) {
          msg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.detail) {
          msg = data.detail;
        } else {
          const firstVal = Object.values(data)[0];
          msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Complete Registration
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      await verifyRegisterOtp(name, email, password, cleanOtp);
      navigate('/dashboard');
    } catch (err) {
      let msg = 'Verification failed. Please check the OTP code and try again.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.otp) {
          msg = Array.isArray(data.otp) ? data.otp[0] : data.otp;
        } else if (data.detail) {
          msg = data.detail;
        } else if (data.email) {
          msg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else {
          const firstVal = Object.values(data)[0];
          msg = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Action
  const handleResendOtp = async () => {
    if (countdown > 0 || resending) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const res = await authService.resendRegisterOtp(email, name);
      setSuccessMsg(res.message || `A fresh 6-digit code has been sent to ${email}`);
      setCountdown(res.cooldown_seconds || 60);
    } catch (err) {
      let msg = 'Failed to resend code.';
      if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.response?.data?.email) {
        msg = Array.isArray(err.response.data.email) ? err.response.data.email[0] : err.response.data.email;
      }
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)',
        padding: '1.5rem'
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: '460px', padding: '2.5rem' }}>
        {/* Step Indicator Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {step === 1 ? <Activity size={28} /> : <ShieldCheck size={30} />}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {step === 1 ? 'Create Your Account' : 'Verify Your Email'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {step === 1
              ? 'Start monitoring your web applications with real-time health intelligence.'
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>
        </div>

        {/* Step Progress Pill */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: step === 1 ? 'var(--accent-primary)' : 'var(--status-up-bg)',
              color: step === 1 ? '#ffffff' : 'var(--status-up)'
            }}
          >
            {step > 1 ? <CheckCircle2 size={12} /> : '1'} Account Details
          </div>
          <div style={{ width: '24px', height: '2px', backgroundColor: step === 2 ? 'var(--accent-primary)' : 'var(--border-color)' }} />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: step === 2 ? 'var(--accent-primary)' : 'var(--bg-primary)',
              color: step === 2 ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            2 Email OTP Verification
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-down-bg)',
              color: 'var(--status-down)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-up-bg)',
              color: 'var(--status-up)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}
          >
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                required
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            >
              <Mail size={18} /> {loading ? 'Sending Verification OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}
            >
              We've dispatched a 6-digit security code to <strong style={{ color: 'var(--accent-primary)' }}>{email}</strong>. Please enter the code below to verify your email.
            </div>

            <div className="form-group">
              <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}>
                6-Digit Security Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                className="form-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                style={{
                  textAlign: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 800,
                  letterSpacing: '12px',
                  padding: '0.75rem',
                  fontFamily: 'monospace',
                  color: 'var(--accent-primary)',
                  backgroundColor: '#ffffff'
                }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', textAlign: 'center', marginTop: '0.35rem' }}>
                Code expires in 10 minutes
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem' }}
            >
              <ShieldCheck size={18} /> {loading ? 'Verifying & Registering...' : 'Verify OTP & Register'}
            </button>

            {/* Resend and Change Email Options */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', fontSize: '0.85rem' }}>
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: 0
                }}
              >
                <ArrowLeft size={14} /> Change Email
              </button>

              <div>
                {countdown > 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    Resend code in <strong>{countdown}s</strong>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      padding: 0
                    }}
                  >
                    <RefreshCw size={13} className={resending ? "spin" : ""} />
                    {resending ? 'Resending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, KeyRound, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Reset Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message || 'Account verified. Enter your new password below.');
      setStep(2);
    } catch (err) {
      let msg = 'Failed to verify account.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.email) {
          msg = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.detail) {
          msg = data.detail;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
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
      const data = await authService.resetPassword(email, password);
      setSuccessMsg('Password reset successfully! Redirecting to dashboard...');
      setTimeout(() => {
        if (data.user) setUser(data.user);
        navigate('/dashboard');
      }, 1200);
    } catch (err) {
      let msg = 'Failed to reset password.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.password) {
          msg = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.detail) {
          msg = data.detail;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
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
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-primary)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <KeyRound size={26} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Forgot Password</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {step === 1 ? 'Enter your registered email to reset your password' : 'Create a new password for your account'}
          </p>
        </div>

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
              marginBottom: '1.5rem'
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
              marginBottom: '1.5rem'
            }}
          >
            <CheckCircle size={16} /> {successMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestReset}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              {loading ? 'Verifying Account...' : 'Continue to Reset Password'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}
            >
              {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

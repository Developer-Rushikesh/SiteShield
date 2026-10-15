import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Sliders, Check, Key, Smartphone, MessageSquare, Mail, AlertTriangle, ShieldCheck, Clock, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

export const Settings = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  // User Data State
  const [name, setName] = useState(user?.name || user?.first_name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Profile Save State
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Monitoring Defaults
  const [defaultInterval, setDefaultInterval] = useState(5);
  const [defaultTimeout, setDefaultTimeout] = useState(10);

  // Custom Alert Options
  const [webDownAlerts, setWebDownAlerts] = useState(true);
  const [webUpTimeAlerts, setWebUpTimeAlerts] = useState(true);
  const [statusSummaryAlerts, setStatusSummaryAlerts] = useState(true);

  // Multi-Channel Customization (WhatsApp, SMS, Email)
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('+91 98765 43210');

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsNumber, setSmsNumber] = useState('+91 98765 43210');

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [alertEmail, setAlertEmail] = useState('alerts@example.com');

  useEffect(() => {
    if (user) {
      setName(user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const currentTimeStatic = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaved(false);
    setProfileError(null);
    setSavingProfile(true);

    try {
      const res = await authService.updateProfile({ name, email });
      if (res.user) setUser(res.user);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      let msg = 'Failed to update profile.';
      if (err.response?.data?.email) {
        msg = Array.isArray(err.response.data.email) ? err.response.data.email[0] : err.response.data.email;
      } else if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setPasswordMsg(res.message || 'Password changed successfully in the database!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err) {
      let msg = 'Failed to update password.';
      if (err.response?.data) {
        const d = err.response.data;
        if (d.current_password) {
          msg = Array.isArray(d.current_password) ? d.current_password[0] : d.current_password;
        } else if (d.new_password) {
          msg = Array.isArray(d.new_password) ? d.new_password[0] : d.new_password;
        } else if (d.detail) {
          msg = d.detail;
        }
      }
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Account & Notification Settings ⚙️
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Manage user details, change password, and configure custom WhatsApp, SMS & Email alerts.
          </p>
        </div>

        {/* Static Current Time System Indicator */}
        <div style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Clock size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>System Sync: <strong style={{ color: 'var(--text-primary)' }}>{currentTimeStatic}</strong></span>
        </div>
      </div>

      {profileError && (
        <div
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-down-bg)',
            color: 'var(--status-down)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <AlertTriangle size={18} /> {profileError}
        </div>
      )}

      {saved && (
        <div
          style={{
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-up-bg)',
            color: 'var(--status-up)',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Check size={18} /> Settings & Notification Channels saved successfully!
        </div>
      )}

      {/* 1. User Profile Data */}
      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={20} style={{ color: 'var(--accent-primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>User Profile & Contact Details</h3>
            </div>
            <button
              type="button"
              onClick={async () => { await logout(); navigate('/login'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.85rem',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.825rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'; e.currentTarget.style.color = '#ef4444'; }}
            >
              <LogOut size={15} />
              <span>Log Out Account</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* 2. Password Change Functionality */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Key size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Change Password</h3>
          </div>

          {passwordMsg && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-up-bg)', color: 'var(--status-up)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} /> {passwordMsg}
            </div>
          )}

          {passwordError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} /> {passwordError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={savingPassword}
            onClick={handlePasswordChange}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {savingPassword ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Updating Password in DB...</span>
              </>
            ) : (
              <>
                <Key size={16} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Notification Customization Options (Web Down, Up Time Web Status) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Bell size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Custom Notification Alert Triggers</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="var(--status-down)" /> Web Down Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Trigger immediate emergency alerts when target domain fails checks or goes DOWN
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                checked={webDownAlerts}
                onChange={(e) => setWebDownAlerts(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--status-up)" /> Web Up Time & Recovery Status Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Trigger positive status alerts when website recovers or achieves 100% uptime
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                checked={webUpTimeAlerts}
                onChange={(e) => setWebUpTimeAlerts(e.target.checked)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} color="var(--accent-primary)" /> Daily Web Status Summary Alerts
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                  Receive daily performance summary digest of all monitored projects
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                checked={statusSummaryAlerts}
                onChange={(e) => setStatusSummaryAlerts(e.target.checked)}
              />
            </div>
          </div>
        </div>

        {/* 4. Notification Channels (WhatsApp, SMS, Email) */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notification Dispatch Channels</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* WhatsApp Notifications */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  <MessageSquare size={18} style={{ color: '#25D366' }} /> WhatsApp Notifications
                </div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: whatsappEnabled ? 'var(--status-up)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', accentColor: '#25D366' }}
                    checked={whatsappEnabled}
                    onChange={(e) => setWhatsappEnabled(e.target.checked)}
                  />
                  {whatsappEnabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
              {whatsappEnabled && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>WhatsApp Phone Number (with country code)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              )}
            </div>

            {/* SMS Notifications */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  <Smartphone size={18} style={{ color: 'var(--accent-primary)' }} /> Mobile SMS Notifications
                </div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: smsEnabled ? 'var(--status-up)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    checked={smsEnabled}
                    onChange={(e) => setSmsEnabled(e.target.checked)}
                  />
                  {smsEnabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
              {smsEnabled && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>SMS Recipient Mobile Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={smsNumber}
                    onChange={(e) => setSmsNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              )}
            </div>

            {/* Email Notifications */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  <Mail size={18} style={{ color: 'var(--accent-primary)' }} /> Email Alert Dispatch
                </div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: emailEnabled ? 'var(--status-up)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }}
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
                  />
                  {emailEnabled ? 'Enabled' : 'Disabled'}
                </label>
              </div>
              {emailEnabled && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Alert Recipient Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    placeholder="alerts@example.com"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={savingProfile}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {savingProfile ? (
              <>
                <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save All Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

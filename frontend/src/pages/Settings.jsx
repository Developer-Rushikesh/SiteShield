import React, { useState } from 'react';
import { Save, User, Bell, Sliders, Check, Key, Smartphone, MessageSquare, Mail, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user } = useAuth();

  // User Data State
  const [name, setName] = useState(user?.name || user?.first_name || 'Demo Admin');
  const [email, setEmail] = useState(user?.email || 'demo@example.com');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

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

  const [saved, setSaved] = useState(false);

  const currentTimeStatic = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordMsg('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(null), 3500);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <User size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>User Profile & Contact Details</h3>
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
            onClick={handlePasswordChange}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
          >
            <Key size={16} /> Update Password
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
          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem' }}>
            <Save size={18} /> Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

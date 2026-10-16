import React, { useState, useEffect } from 'react';
import { Save, User, Bell, Sliders, Check, Key, Smartphone, MessageSquare, Mail, AlertTriangle, ShieldCheck, Clock, LogOut, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { projectService } from '../services/projectService';

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

  // Daily 9:00 PM Email Report Schedule States
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [sendDownAlerts, setSendDownAlerts] = useState(true);
  const [scheduleEmail, setScheduleEmail] = useState('');
  const [includeAllProjects, setIncludeAllProjects] = useState(true);
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [lastReportSentAt, setLastReportSentAt] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [testingSchedule, setTestingSchedule] = useState(false);
  const [scheduleFeedback, setScheduleFeedback] = useState(null);

  // Red Alert Outage States
  const [testingRedAlert, setTestingRedAlert] = useState(false);
  const [redAlertFeedback, setRedAlertFeedback] = useState(null);

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const [sched, projs] = await Promise.all([
          projectService.getReportSchedule(),
          projectService.getProjects()
        ]);
        if (sched) {
          setScheduleEnabled(sched.is_enabled);
          setSendDownAlerts(sched.send_down_alerts ?? true);
          setScheduleEmail(sched.recipient_email || '');
          if (sched.recipient_email) setAlertEmail(sched.recipient_email);
          setIncludeAllProjects(sched.include_all_projects);
          setSelectedProjectIds(sched.selected_projects?.map(p => p.id) || []);
          setLastReportSentAt(sched.last_sent_at);
        }
        setAvailableProjects(projs || []);
      } catch (err) {
        console.error("Failed to load daily report schedule:", err);
      }
    };
    fetchScheduleData();
  }, []);

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    setScheduleFeedback(null);
    try {
      const res = await projectService.updateReportSchedule({
        is_enabled: scheduleEnabled,
        send_down_alerts: sendDownAlerts,
        recipient_email: scheduleEmail,
        include_all_projects: includeAllProjects,
        selected_project_ids: selectedProjectIds
      });
      setScheduleFeedback({
        type: 'success',
        message: 'Daily 9:00 PM report schedule preferences saved successfully!'
      });
      setTimeout(() => setScheduleFeedback(null), 4000);
    } catch (err) {
      setScheduleFeedback({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to save daily report schedule.'
      });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleTestDailyReport = async () => {
    setTestingSchedule(true);
    setScheduleFeedback(null);
    try {
      const res = await projectService.testDailyReport(scheduleEmail);
      setScheduleFeedback({
        type: 'success',
        message: res.message || `Test daily 9 PM report dispatched successfully to ${res.recipient}!`
      });
      setTimeout(() => setScheduleFeedback(null), 5000);
    } catch (err) {
      setScheduleFeedback({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to dispatch test daily report.'
      });
    } finally {
      setTestingSchedule(false);
    }
  };

  const handleTestRedAlert = async () => {
    setTestingRedAlert(true);
    setRedAlertFeedback(null);
    try {
      const targetEmail = scheduleEmail || alertEmail || user?.email;
      const res = await projectService.testRedAlert(null, targetEmail);
      setRedAlertFeedback({
        type: 'success',
        message: res.message || `🚨 Test Red Alert outage email sent to ${res.recipient}!`
      });
      setTimeout(() => setRedAlertFeedback(null), 6000);
    } catch (err) {
      setRedAlertFeedback({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Failed to dispatch test red alert.'
      });
    } finally {
      setTestingRedAlert(false);
    }
  };

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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.25rem' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1rem', marginBottom: '1rem' }}>
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

            {/* Email Notifications & Red Alert Outage Dispatch */}
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ffffff', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  <Mail size={18} style={{ color: 'var(--accent-primary)' }} /> Email Alert & Red Alert Outage Dispatch
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
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Default Alert Recipient Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={alertEmail}
                      onChange={(e) => {
                        setAlertEmail(e.target.value);
                        if (!scheduleEmail) setScheduleEmail(e.target.value);
                      }}
                      placeholder="alerts@example.com"
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Primary destination email for downtime alerts and system notifications.
                    </span>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', borderRadius: '6px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>🚨</span> Critical Red Alert Outage Emails (When Website Goes DOWN)
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#7f1d1d', marginTop: '0.2rem' }}>
                        Dispatches immediate high-urgency Red Alert email when any monitored website endpoint goes down.
                      </div>
                    </div>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '0.4rem', fontSize: '0.825rem', fontWeight: 700, color: sendDownAlerts ? '#dc2626' : 'var(--text-muted)' }}>
                      <input
                        type="checkbox"
                        style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                        checked={sendDownAlerts}
                        onChange={(e) => setSendDownAlerts(e.target.checked)}
                      />
                      {sendDownAlerts ? 'Active' : 'Muted'}
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      disabled={testingRedAlert}
                      onClick={handleTestRedAlert}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.825rem', padding: '0.5rem 0.95rem', color: '#b91c1c', borderColor: '#fca5a5', backgroundColor: '#fff1f2', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      title="Send a sample Red Alert email to test delivery"
                    >
                      <AlertTriangle size={14} className={testingRedAlert ? "spin" : ""} />
                      {testingRedAlert ? 'Sending Red Alert...' : '🚨 Send Test Red Alert Email Now'}
                    </button>
                  </div>

                  {redAlertFeedback && (
                    <div
                      style={{
                        padding: '0.7rem 0.9rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: redAlertFeedback.type === 'success' ? '#fef2f2' : 'var(--status-down-bg)',
                        border: redAlertFeedback.type === 'success' ? '1px solid #fecaca' : '1px solid var(--status-down)',
                        color: redAlertFeedback.type === 'success' ? '#991b1b' : 'var(--status-down)',
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      {redAlertFeedback.type === 'success' ? <CheckCircle2 size={15} color="#dc2626" /> : <AlertTriangle size={15} />}
                      <span>{redAlertFeedback.message}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 5. Daily 9:00 PM Automated Email Reports */}
        <div className="card" style={{ border: scheduleEnabled ? '1px solid #93c5fd' : '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#eff6ff', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Automated Daily 9:00 PM Performance Report
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Dispatches a comprehensive nightly website availability audit directly to your designated email.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: scheduleEnabled ? 'var(--status-up-bg)' : '#f1f5f9',
                  color: scheduleEnabled ? 'var(--status-up)' : 'var(--text-muted)'
                }}
              >
                {scheduleEnabled ? '● Daily 9:00 PM Active' : '○ Disabled'}
              </span>
            </div>
          </div>

          {/* Feedback Alert */}
          {scheduleFeedback && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: scheduleFeedback.type === 'success' ? 'var(--status-up-bg)' : 'var(--status-down-bg)',
                color: scheduleFeedback.type === 'success' ? 'var(--status-up)' : 'var(--status-down)',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {scheduleFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{scheduleFeedback.message}</span>
            </div>
          )}

          {/* Enable Toggle Box */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: scheduleEnabled ? 'rgba(59, 130, 246, 0.04)' : '#f8fafc',
              border: '1px solid ' + (scheduleEnabled ? '#bfdbfe' : 'var(--border-color)'),
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Enable Daily Nightly Report (9:00 PM IST)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                When enabled, SiteShield 24 Monitor compiles all synthetic uptime & latency logs and emails the report every day at 21:00.
              </div>
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                style={{ width: '22px', height: '22px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
              />
            </label>
          </div>

          {/* Configuration Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {/* Particular Recipient Email */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Target Recipient Email Address
              </label>
              <input
                type="email"
                className="form-input"
                value={scheduleEmail}
                onChange={(e) => setScheduleEmail(e.target.value)}
                placeholder={user?.email || 'e.g. devops-lead@company.com'}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                Specify any particular email address for the daily 9 PM digest. (Defaults to <strong>{user?.email || 'your account email'}</strong> if blank).
              </span>
            </div>

            {/* Schedule Details Badge */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Execution Time & Timezone</label>
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Clock size={16} color="var(--accent-primary)" />
                <span>Daily at <strong>9:00 PM (21:00) IST</strong></span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.3rem' }}>
                {lastReportSentAt
                  ? `Last report was dispatched on: ${new Date(lastReportSentAt).toLocaleString()}`
                  : 'Automated nightly trigger via SiteShield background scheduler.'}
              </span>
            </div>
          </div>

          {/* Scope Selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Included Monitored Projects</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="includeProjects"
                  checked={includeAllProjects}
                  onChange={() => setIncludeAllProjects(true)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                All Monitored Projects ({availableProjects.length})
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input
                  type="radio"
                  name="includeProjects"
                  checked={!includeAllProjects}
                  onChange={() => setIncludeAllProjects(false)}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                Select Specific Projects
              </label>
            </div>

            {!includeAllProjects && (
              <div
                style={{
                  maxHeight: '160px',
                  overflowY: 'auto',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem'
                }}
              >
                {availableProjects.map((p) => {
                  const isChecked = selectedProjectIds.includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.825rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedProjectIds([...selectedProjectIds, p.id]);
                          } else {
                            setSelectedProjectIds(selectedProjectIds.filter((id) => id !== p.id));
                          }
                        }}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons for Schedule */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                disabled={testingSchedule}
                onClick={handleTestDailyReport}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#1d4ed8', borderColor: '#93c5fd', backgroundColor: '#eff6ff' }}
                title="Compile and dispatch the 9 PM report immediately to verify email delivery"
              >
                <Send size={14} className={testingSchedule ? "spin" : ""} />
                {testingSchedule ? 'Sending Test 9 PM Report...' : 'Send Test 9 PM Report Now'}
              </button>

              <button
                type="button"
                disabled={testingRedAlert}
                onClick={handleTestRedAlert}
                className="btn btn-secondary"
                style={{ padding: '0.55rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#b91c1c', borderColor: '#fca5a5', backgroundColor: '#fff1f2', fontWeight: 600 }}
                title="Dispatch a sample Red Alert email to test outage alerting"
              >
                <AlertTriangle size={14} className={testingRedAlert ? "spin" : ""} />
                {testingRedAlert ? 'Sending Red Alert...' : '🚨 Test Red Alert Outage'}
              </button>
            </div>

            <button
              type="button"
              disabled={savingSchedule}
              onClick={handleSaveSchedule}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Save size={15} />
              {savingSchedule ? 'Saving Schedule...' : 'Save Daily Report Schedule'}
            </button>
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

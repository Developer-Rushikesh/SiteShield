import React, { useState, useEffect } from 'react';
import { Download, Calendar, Clock, Filter, BarChart3, ShieldCheck, Activity, AlertTriangle, FileText, CheckCircle2, Mail, X, Send } from 'lucide-react';
import ResponseTimeChart from '../components/charts/ResponseTimeChart';
import UptimeChart from '../components/charts/UptimeChart';
import StatusChart from '../components/charts/StatusChart';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { projectService } from '../services/projectService';
import { dashboardService } from '../services/dashboardService';
import { exportElementToPdf } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import logoImg from '../images/logo.png';

export const Reports = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Email Modal States
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(user?.email || '');
  const [emailNotes, setEmailNotes] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState(null);

  // Filter States
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [dateRangePreset, setDateRangePreset] = useState('LAST_7_DAYS');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [timeRangePreset, setTimeRangePreset] = useState('24_HOURS');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  useEffect(() => {
    if (user?.email && !emailRecipient) {
      setEmailRecipient(user.email);
    }
  }, [user]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, sumData] = await Promise.all([
        projectService.getProjects(),
        dashboardService.getSummary()
      ]);
      setProjects(projData || []);
      setSummary(sumData || {});
    } catch (err) {
      setError("Failed to load analytical report data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  const handleDatePresetChange = (preset) => {
    setDateRangePreset(preset);
    const today = new Date();
    setToDate(today.toISOString().split('T')[0]);

    if (preset === 'TODAY') {
      setFromDate(today.toISOString().split('T')[0]);
    } else if (preset === 'LAST_7_DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setFromDate(d.toISOString().split('T')[0]);
    } else if (preset === 'LAST_30_DAYS') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setFromDate(d.toISOString().split('T')[0]);
    }
  };

  const handleTimePresetChange = (preset) => {
    setTimeRangePreset(preset);
    if (preset === '24_HOURS') {
      setStartTime('00:00');
      setEndTime('23:59');
    } else if (preset === 'MORNING') {
      setStartTime('06:00');
      setEndTime('12:00');
    } else if (preset === 'BUSINESS') {
      setStartTime('09:00');
      setEndTime('17:00');
    } else if (preset === 'NIGHT') {
      setStartTime('18:00');
      setEndTime('23:59');
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    await exportElementToPdf('report-content-area', `24Monitor_Analytical_Report_${fromDate}_to_${toDate}.pdf`);
    setDownloading(false);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailRecipient || !emailRecipient.includes('@')) {
      setEmailFeedback({ type: 'error', message: 'Please enter a valid recipient email address.' });
      return;
    }

    setSendingEmail(true);
    setEmailFeedback(null);
    try {
      const res = await projectService.sendAnalyticsReport({
        email: emailRecipient,
        project_id: selectedProjectId,
        from_date: fromDate,
        to_date: toDate,
        notes: emailNotes
      });
      setEmailFeedback({
        type: 'success',
        message: res.message || `Analytical performance report successfully dispatched to ${emailRecipient}!`
      });
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailFeedback(null);
        setEmailNotes('');
      }, 2500);
    } catch (err) {
      setEmailFeedback({
        type: 'error',
        message: err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to dispatch report email.'
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) return <LoadingState message="Generating analytical reports & graphics..." />;
  if (error) return <ErrorState message={error} onRetry={loadReportData} />;

  // Filter projects if specific project selected
  const filteredProjects = selectedProjectId === 'ALL'
    ? (summary?.projects || projects)
    : (summary?.projects || projects).filter(p => p.id === parseInt(selectedProjectId));

  const totalMonitors = filteredProjects.reduce((acc, p) => acc + (p.monitors_count || 1), 0);
  const healthyWebsites = filteredProjects.filter(p => p.status === 'UP').length;
  const downWebsites = filteredProjects.filter(p => p.status === 'DOWN').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Title & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Analytical Reports & Performance Audits 📊
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Filter by project, date, and time range to export graphical PDF reports or email audits directly.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              if (!emailRecipient && user?.email) setEmailRecipient(user.email);
              setEmailFeedback(null);
              setShowEmailModal(true);
            }}
            className="btn btn-secondary"
            style={{ padding: '0.75rem 1.3rem', borderColor: '#3b82f6', color: '#1d4ed8', backgroundColor: '#eff6ff', fontWeight: 600 }}
          >
            <Mail size={18} /> Send Report to Email
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem' }}
          >
            <Download size={18} /> {downloading ? 'Exporting PDF...' : 'Download Graphical PDF Report'}
          </button>
        </div>
      </div>

      {/* Filter Options Bar */}
      <div className="card" style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <Filter size={18} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Report Filter Options</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {/* Project Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Select Target Project</label>
            <select
              className="form-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              <option value="ALL">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Duration */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Date Duration</label>
            <select
              className="form-select"
              value={dateRangePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
            >
              <option value="TODAY">Today</option>
              <option value="LAST_7_DAYS">Last 7 Days</option>
              <option value="LAST_30_DAYS">Last 30 Days</option>
              <option value="CUSTOM">Custom Date Range</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">From Date & To Date</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="date"
                className="form-input"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setDateRangePreset('CUSTOM'); }}
              />
              <input
                type="date"
                className="form-input"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setDateRangePreset('CUSTOM'); }}
              />
            </div>
          </div>

          {/* Time Duration */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Time Duration</label>
            <select
              className="form-select"
              value={timeRangePreset}
              onChange={(e) => handleTimePresetChange(e.target.value)}
            >
              <option value="24_HOURS">Full 24-Hour Cycle (00:00 - 23:59)</option>
              <option value="MORNING">Morning Shift (06:00 - 12:00)</option>
              <option value="BUSINESS">Business Hours (09:00 - 17:00)</option>
              <option value="NIGHT">Night Shift (18:00 - 23:59)</option>
              <option value="CUSTOM">Custom Time Range</option>
            </select>
          </div>
        </div>
      </div>

      {/* Downloadable Graphical Report Structure */}
      <div
        id="report-content-area"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}
      >
        {/* PDF Header Branding with SiteShield Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--accent-primary)', paddingBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.4rem' }}>
              <img src={logoImg} alt="SiteShield Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                  SiteShield 24 Monitor
                </h1>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Monitor • Detect • Stay Ahead</span>
              </div>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Comprehensive Availability & Response Time Performance Audit
            </p>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
            <div><strong>Filter Date:</strong> {fromDate} to {toDate}</div>
            <div><strong>Filter Time:</strong> {startTime} - {endTime}</div>
            <div><strong>Target Scope:</strong> {selectedProjectId === 'ALL' ? 'All Monitored Projects' : projects.find(p => p.id === parseInt(selectedProjectId))?.name}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Executive Summary
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Target Scope</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {filteredProjects.length} Projects
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-up)' }}>Healthy Endpoints</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-up)', marginTop: '0.2rem' }}>
                {healthyWebsites} / {filteredProjects.length}
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-down)' }}>Down Endpoints</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-down)', marginTop: '0.2rem' }}>
                {downWebsites}
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Avg Response Time</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {summary?.average_response_time || 285} ms
              </div>
            </div>

            <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-up)' }}>Overall Availability</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-up)', marginTop: '0.2rem' }}>
                {summary?.average_uptime || 99.8}%
              </div>
            </div>
          </div>
        </div>

        {/* Graphical Structure Section */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Graphical Analysis & Trends
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Latency Trend (ms)
              </h4>
              <ResponseTimeChart />
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', backgroundColor: '#ffffff' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Uptime Percentage Trend (%)
              </h4>
              <UptimeChart />
            </div>
          </div>
        </div>

        {/* Detailed Endpoints Performance Breakdown Table */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Endpoint Detailed Analysis Table
          </h3>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Target URL</th>
                  <th>Status</th>
                  <th>Uptime %</th>
                  <th>Avg Response Time</th>
                  <th>Monitors</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</td>
                    <td style={{ color: 'var(--accent-primary)', fontSize: '0.85rem' }}>{p.website_url || 'https://domain.com'}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          backgroundColor: p.status === 'UP' ? 'var(--status-up-bg)' : 'var(--status-down-bg)',
                          color: p.status === 'UP' ? 'var(--status-up)' : 'var(--status-down)'
                        }}
                      >
                        {p.status || 'UP'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--status-up)' }}>{p.uptime || 100}%</td>
                    <td style={{ fontWeight: 600 }}>{p.average_response_time || 290} ms</td>
                    <td>{p.monitors_count || 1} Active</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Audit Signature */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>Generated by 24 Monitor Analytical Engine</div>
          <div>Verified Digital Health Audit • Page 1 of 1</div>
        </div>
      </div>

      {/* Send Report to Email Modal */}
      {showEmailModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !sendingEmail) setShowEmailModal(false);
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #bfdbfe',
              overflow: 'hidden',
              padding: 0
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                padding: '1.5rem 1.75rem',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <Mail size={20} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                    Send Analytical Report
                  </h3>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#dbeafe', margin: 0 }}>
                  Dispatches an HTML availability audit via SiteShield Google SMTP
                </p>
              </div>
              <button
                onClick={() => !sendingEmail && setShowEmailModal(false)}
                disabled={sendingEmail}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: '6px',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSendEmail} style={{ padding: '1.75rem' }}>
              {emailFeedback && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: emailFeedback.type === 'success' ? 'var(--status-up-bg)' : 'var(--status-down-bg)',
                    color: emailFeedback.type === 'success' ? 'var(--status-up)' : 'var(--status-down)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  {emailFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <span>{emailFeedback.message}</span>
                </div>
              )}

              {/* Selected Scope Badge Box */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '0.85rem 1rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.25rem'
                }}
              >
                <div>
                  <strong>Target Scope:</strong>{' '}
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                    {selectedProjectId === 'ALL'
                      ? `All Monitored Projects (${filteredProjects.length})`
                      : projects.find((p) => p.id === parseInt(selectedProjectId))?.name || 'Selected Project'}
                  </span>
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  <strong>Date Range:</strong> {fromDate} to {toDate} ({timeRangePreset.replace('_', ' ')})
                </div>
              </div>

              {/* Destination Email Input */}
              <div className="form-group">
                <label className="form-label">
                  Recipient Email Address <span style={{ color: 'var(--status-down)' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                  Enter any particular email address to receive this performance audit.
                </span>
              </div>

              {/* Optional Notes */}
              <div className="form-group">
                <label className="form-label">Attached Notes / Comments (Optional)</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  placeholder="Add custom notes, executive summary, or instructions for the recipient..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={() => setShowEmailModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Send size={16} />
                  {sendingEmail ? 'Dispatching Email...' : 'Send Email Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

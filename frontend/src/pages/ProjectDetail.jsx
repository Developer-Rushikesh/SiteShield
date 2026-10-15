import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RefreshCw, ExternalLink, ArrowLeft, ShieldCheck, Clock,
  AlertTriangle, Plus, Download, Globe, Settings, CheckCircle2,
  AlertCircle, Activity, Server, Radio
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import HealthScore from '../components/common/HealthScore';
import ResponseTimeChart from '../components/charts/ResponseTimeChart';
import StatusChart from '../components/charts/StatusChart';
import StatusTimeline from '../components/charts/StatusTimeline';
import HistoryTable from '../components/tables/HistoryTable';
import IncidentTable from '../components/tables/IncidentTable';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { projectService } from '../services/projectService';
import { exportElementToPdf } from '../utils/pdfGenerator';

export const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [incidents, setIncidents] = useState([]);

  // URL Setup / Edit States
  const [showConfig, setShowConfig] = useState(false);
  const [configUrl, setConfigUrl] = useState('');
  const [configInterval, setConfigInterval] = useState(5);
  const [configTimeout, setConfigTimeout] = useState(10);
  const [savingConfig, setSavingConfig] = useState(false);
  const [configError, setConfigError] = useState('');
  const [configSuccess, setConfigSuccess] = useState('');

  // Filter States for History
  const [histStatus, setHistStatus] = useState('ALL');
  const [histFromDate, setHistFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [histToDate, setHistToDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Loading & Action States
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);

  const autoRefreshRef = useRef(null);

  const loadData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError(null);
    setAuthError(false);
    try {
      const [projData, statsData, histData, incData] = await Promise.all([
        projectService.getProjectById(id),
        projectService.getProjectStatistics(id),
        projectService.getProjectHistory(id, {
          status: histStatus !== 'ALL' ? histStatus : undefined,
          from_date: histFromDate || undefined,
          to_date: histToDate || undefined
        }),
        projectService.getProjectIncidents(id)
      ]);

      setProject(projData);
      setStats(statsData);
      setHistory(histData || []);
      setIncidents(incData || []);

      if (statsData?.target_url || projData?.website_url) {
        setConfigUrl(statsData?.target_url || projData?.website_url || '');
        setConfigInterval(statsData?.check_interval || 5);
        setConfigTimeout(statsData?.timeout || 10);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setAuthError(true);
        setError("Unauthorized Access: You do not have permission to view or manage this project.");
      } else if (err.response?.status === 404) {
        setError(`Project #${id} was not found.`);
      } else {
        setError(err.response?.data?.detail || err.message || "Failed to load project monitoring metrics from the server.");
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [id, histStatus, histFromDate, histToDate]);

  // Live Auto-Refresh Effect (every 15s)
  useEffect(() => {
    if (autoRefresh) {
      autoRefreshRef.current = setInterval(() => {
        loadData(false);
      }, 15000);
    } else if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
    }

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [autoRefresh, id, histStatus, histFromDate, histToDate]);

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await projectService.checkProject(id);
      await loadData(false);
    } catch (err) {
      alert("Health Check failed: " + (err.response?.data?.error || err.response?.data?.detail || err.message));
    } finally {
      setChecking(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setConfigError('');
    setConfigSuccess('');
    setSavingConfig(true);

    try {
      await projectService.configureProjectMonitor(id, {
        url: configUrl,
        check_interval: parseInt(configInterval),
        timeout: parseInt(configTimeout)
      });
      setConfigSuccess("Target URL configured successfully! Initial health check recorded.");
      setShowConfig(false);
      await loadData(false);
    } catch (err) {
      setConfigError(err.response?.data?.error || err.response?.data?.detail || err.message || "Failed to configure target URL.");
    } finally {
      setSavingConfig(false);
    }
  };

  if (loading) return <LoadingState message="Fetching real-time website analytics & monitoring records..." />;

  if (authError || error || !project) {
    return (
      <div style={{ maxWidth: '640px', margin: '3rem auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {authError ? "Access Denied (403 Forbidden)" : "Project Error"}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            {error || "The requested project could not be found or loaded."}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/projects" className="btn btn-primary">
              <ArrowLeft size={16} /> Back to My Projects
            </Link>
            {!authError && (
              <button onClick={() => loadData(true)} className="btn btn-secondary">
                <RefreshCw size={16} /> Retry
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const hasTargetUrl = Boolean(stats?.has_monitor || project.website_url || stats?.target_url);
  const targetUrl = stats?.target_url || project.website_url || '';
  const currentStatus = stats?.status || project.status || 'PENDING';
  const totalChecks = stats?.total_checks || 0;
  const uptimeVal = totalChecks > 0 ? stats?.uptime : 0.0;
  const latestRespTime = stats?.latest_response_time || 0;
  const avgRespTime = stats?.average_response_time || 0;
  const latestHttpCode = stats?.latest_http_status;
  const healthScore = stats?.health_score !== undefined ? stats.health_score : 0;
  const downtimeMins = stats?.downtime_minutes || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header */}
      <div>
        <Link to="/projects" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {project.name}
              </h1>
              <StatusBadge status={currentStatus} />
              {project.id && (
                <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem', borderRadius: '4px', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Project #{project.id}
                </span>
              )}
            </div>

            {targetUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                <a
                  href={targetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.925rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Globe size={15} /> {targetUrl} <ExternalLink size={13} />
                </a>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Interval: <strong>{stats?.check_interval || 5}m</strong> | Timeout: <strong>{stats?.timeout || 10}s</strong>
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', color: 'var(--status-warning)', fontSize: '0.875rem' }}>
                <AlertCircle size={15} />
                <span>No target website URL configured yet.</span>
              </div>
            )}

            {project.description && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {project.description}
              </p>
            )}
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="btn btn-secondary"
              style={{
                fontSize: '0.85rem',
                padding: '0.55rem 0.9rem',
                borderColor: autoRefresh ? 'var(--status-up)' : 'var(--border-color)',
                backgroundColor: autoRefresh ? 'var(--status-up-bg)' : 'transparent',
                color: autoRefresh ? 'var(--status-up)' : 'var(--text-secondary)'
              }}
              title={autoRefresh ? "Auto-refresh is active (every 15s)" : "Enable live polling"}
            >
              <Radio size={14} className={autoRefresh ? "spin" : ""} />
              {autoRefresh ? "Live Sync ON" : "Auto Refresh"}
            </button>

            {/* Configure URL Button */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.55rem 0.9rem' }}
            >
              <Settings size={15} />
              {hasTargetUrl ? "Configure URL" : "Set Target URL"}
            </button>

            {/* Check Now Button */}
            <button
              onClick={hasTargetUrl ? handleCheckNow : () => setShowConfig(true)}
              disabled={checking}
              className="btn btn-primary"
              style={{ padding: '0.55rem 1.15rem' }}
            >
              <RefreshCw size={15} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
              {checking ? 'Pinging target...' : (hasTargetUrl ? 'Check Now' : 'Set URL & Ping')}
            </button>
          </div>
        </div>
      </div>

      {/* Target URL Setup / Edit Section (Collapse / Expand) */}
      {(showConfig || !hasTargetUrl) && (
        <div
          className="card"
          style={{
            border: !hasTargetUrl ? '2px dashed var(--accent-primary)' : '1px solid var(--border-color)',
            backgroundColor: !hasTargetUrl ? 'rgba(59, 130, 246, 0.03)' : 'var(--bg-card)',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {hasTargetUrl ? "Update Target Website URL & Scan Settings" : "Configure Target Website URL"}
              </h3>
            </div>
            {hasTargetUrl && (
              <button
                onClick={() => setShowConfig(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Close ✕
              </button>
            )}
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
            {!hasTargetUrl
              ? "This project currently has no active URL to monitor. Provide a website or API endpoint URL below to start real-time health checks, uptime tracking, and latency metrics."
              : "Change the target URL or adjust automated scan frequency and timeout settings."}
          </p>

          {configError && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertCircle size={16} /> {configError}
            </div>
          )}

          {configSuccess && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-up-bg)', color: 'var(--status-up)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle2 size={16} /> {configSuccess}
            </div>
          )}

          <form onSubmit={handleSaveConfig}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Target Website URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com or https://api.yourdomain.com"
                  className="form-input"
                  style={{ fontSize: '0.9rem' }}
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Interval</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.875rem' }}
                  value={configInterval}
                  onChange={(e) => setConfigInterval(e.target.value)}
                >
                  <option value={1}>Every 1 min</option>
                  <option value={5}>Every 5 mins</option>
                  <option value={10}>Every 10 mins</option>
                  <option value={30}>Every 30 mins</option>
                  <option value={60}>Every 60 mins</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Timeout</label>
                <select
                  className="form-select"
                  style={{ fontSize: '0.875rem' }}
                  value={configTimeout}
                  onChange={(e) => setConfigTimeout(e.target.value)}
                >
                  <option value={5}>5 seconds</option>
                  <option value={10}>10 seconds</option>
                  <option value={15}>15 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={savingConfig || !configUrl}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem', whiteSpace: 'nowrap', height: '42px' }}
              >
                {savingConfig ? (
                  <>
                    <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    {hasTargetUrl ? "Update & Scan" : "Save & Start Monitoring"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Real-time Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {/* 1. Real Uptime */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Uptime
            </span>
            <Activity size={16} style={{ color: uptimeVal > 95 ? 'var(--status-up)' : 'var(--status-down)' }} />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              marginTop: '0.35rem',
              color: totalChecks === 0 ? 'var(--text-muted)' : (uptimeVal >= 99 ? 'var(--status-up)' : (uptimeVal >= 90 ? 'var(--status-warning)' : 'var(--status-down)'))
            }}
          >
            {totalChecks > 0 ? `${uptimeVal}%` : '0.0%'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {totalChecks > 0 ? `Computed over ${totalChecks} check logs` : 'No checks logged yet'}
          </div>
        </div>

        {/* 2. Real Latency / Response Time */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Response Time
            </span>
            <Clock size={16} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--accent-primary)' }}>
            {latestRespTime > 0 ? `${latestRespTime} ms` : (totalChecks > 0 ? `${avgRespTime} ms` : '0 ms')}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {totalChecks > 0 ? `Avg: ${avgRespTime} ms | Min: ${stats?.min_response_time || 0} ms` : 'Awaiting initial check'}
          </div>
        </div>

        {/* 3. Real HTTP Status Code */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              HTTP Status Code
            </span>
            <Server size={16} style={{ color: latestHttpCode && latestHttpCode >= 200 && latestHttpCode < 400 ? 'var(--status-up)' : 'var(--status-down)' }} />
          </div>
          <div
            style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              marginTop: '0.35rem',
              fontFamily: 'monospace',
              color: latestHttpCode && latestHttpCode >= 200 && latestHttpCode < 400 ? 'var(--status-up)' : (latestHttpCode ? 'var(--status-down)' : 'var(--text-muted)')
            }}
          >
            {latestHttpCode ? `${latestHttpCode} ${latestHttpCode === 200 ? 'OK' : ''}` : (totalChecks > 0 ? 'ERR' : 'N/A')}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {totalChecks > 0 ? `Status: ${currentStatus}` : 'Target URL not yet checked'}
          </div>
        </div>

        {/* 4. Real Total Checks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Checks
            </span>
            <ShieldCheck size={16} style={{ color: 'var(--text-primary)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: 'var(--text-primary)' }}>
            {totalChecks}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {totalChecks > 0 ? `Recorded in database` : 'Start checking to log events'}
          </div>
        </div>

        {/* 5. Real Downtime & Incidents */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Downtime & Incidents
            </span>
            <AlertTriangle size={16} style={{ color: incidents.length > 0 ? 'var(--status-down)' : 'var(--status-up)' }} />
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.35rem', color: incidents.length > 0 ? 'var(--status-down)' : 'var(--text-primary)' }}>
            {downtimeMins > 0 ? `${downtimeMins} min` : '0 min'}
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {stats?.incidents ? `${stats.incidents} incident(s) logged` : '0 active downtime incidents'}
          </div>
        </div>
      </div>

      {/* Health Score & Status Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: '1.5rem', alignItems: 'stretch' }}>
        <HealthScore score={healthScore} />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StatusTimeline timeline={stats?.timeline || []} />
        </div>
      </div>

      {/* Interactive Charts Section (Recharts) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Response Time History (ms)
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time DB records</span>
          </div>
          <ResponseTimeChart data={stats?.response_time || []} />
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              HTTP Status Distribution
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time DB counts</span>
          </div>
          <StatusChart data={stats?.status_distribution || []} />
        </div>
      </div>

      {/* Target URL Monitoring History PDF Section */}
      <div className="card" id="url-history-pdf-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live Monitoring History & Audit Log
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Target: <strong style={{ color: targetUrl ? 'var(--accent-primary)' : 'var(--text-muted)' }}>{targetUrl || 'None configured'}</strong>
            </span>
          </div>

          <button
            onClick={() => exportElementToPdf('url-history-pdf-section', `${project.name}_Monitoring_History_Report.pdf`)}
            className="btn btn-primary"
            style={{ padding: '0.65rem 1.25rem', fontSize: '0.875rem' }}
            disabled={history.length === 0}
          >
            <Download size={16} /> Download History PDF Report
          </button>
        </div>

        {/* Date and Status Filter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Filter Status</label>
            <select
              className="form-select"
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              value={histStatus}
              onChange={(e) => setHistStatus(e.target.value)}
            >
              <option value="ALL">All Statuses ({totalChecks})</option>
              <option value="UP">UP / Healthy Only</option>
              <option value="WARNING">WARNING / Slow Only</option>
              <option value="DOWN">DOWN / Error Only</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>From Date</label>
            <input
              type="date"
              className="form-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={histFromDate}
              onChange={(e) => setHistFromDate(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 600 }}>To Date</label>
            <input
              type="date"
              className="form-input"
              style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
              value={histToDate}
              onChange={(e) => setHistToDate(e.target.value)}
            />
          </div>
        </div>

        {/* Real History Table */}
        <HistoryTable records={history} />
      </div>

      {/* Incidents Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Recorded Incidents & Downtime Log
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real downtime events automatically captured from HTTP failures and timeouts
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', borderRadius: '4px', backgroundColor: incidents.length > 0 ? 'var(--status-down-bg)' : 'var(--status-up-bg)', color: incidents.length > 0 ? 'var(--status-down)' : 'var(--status-up)', fontWeight: 600 }}>
            {incidents.length} Incident(s)
          </span>
        </div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
};

export default ProjectDetail;

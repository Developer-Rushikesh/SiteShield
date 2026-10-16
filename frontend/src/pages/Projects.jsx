import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, ExternalLink, Activity, RefreshCw, Mail, Send, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { projectService } from '../services/projectService';
import { useAuth } from '../context/AuthContext';

export const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [checkingId, setCheckingId] = useState(null);
  const [error, setError] = useState(null);

  // Email Modal States
  const [emailModalProject, setEmailModalProject] = useState(null);
  const [emailRecipient, setEmailRecipient] = useState(user?.email || '');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);
  const [emailError, setEmailError] = useState(null);

  const fetchProjects = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      setError("Failed to fetch projects list.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCheckNow = async (projectId) => {
    setCheckingId(projectId);
    try {
      await projectService.checkProject(projectId);
      await fetchProjects(false);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project '${name}'?`)) {
      await projectService.deleteProject(id);
      fetchProjects();
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailRecipient || !emailRecipient.includes('@')) {
      setEmailError('Please enter a valid destination email.');
      return;
    }
    setSendingEmail(true);
    setEmailError(null);
    setEmailSuccess(null);
    try {
      const res = await projectService.sendProjectReport(emailModalProject.id, { email: emailRecipient });
      setEmailSuccess(res.message || `Audit report dispatched to ${emailRecipient}!`);
      setTimeout(() => {
        setEmailModalProject(null);
        setEmailSuccess(null);
      }, 2500);
    } catch (err) {
      setEmailError(err.response?.data?.error || err.message || 'Failed to dispatch report.');
    } finally {
      setSendingEmail(false);
    }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.website_url && p.website_url.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <LoadingState message="Loading project catalog..." />;
  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Projects & Applications</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage and view health statistics for all monitored environments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchProjects(true)}
            className="btn btn-secondary"
            title="Refresh All Projects"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <Link to="/projects/new" className="btn btn-primary">
            <Plus size={18} /> Create Project
          </Link>
        </div>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search projects or URLs..."
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matching projects found" : "No projects created yet"}
          description={search ? "Try searching for a different name or URL." : "Add your first web application project."}
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Target URL</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>Avg Response</th>
                <th>Last Checked</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/projects/${p.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    {p.website_url ? (
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                        {p.website_url} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <Link
                        to={`/projects/${p.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--status-warning-bg)',
                          color: 'var(--status-warning)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          textDecoration: 'none'
                        }}
                      >
                        ⚠️ Setup Target URL
                      </Link>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.total_checks > 0 ? `${p.uptime}%` : '0.0%'}</td>
                  <td>{p.average_response_time ? `${p.average_response_time} ms` : (p.total_checks > 0 ? '0 ms' : 'Pending')}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {p.last_checked ? new Date(p.last_checked).toLocaleTimeString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleCheckNow(p.id)}
                        disabled={checkingId === p.id}
                        className="btn btn-secondary btn-sm"
                        title="Scan HTTP Health Now"
                      >
                        <RefreshCw size={13} className={checkingId === p.id ? "spin" : ""} style={{ animation: checkingId === p.id ? 'spin 1s linear infinite' : 'none' }} />
                        {checkingId === p.id ? 'Scanning...' : 'Ping'}
                      </button>
                      <button
                        onClick={() => {
                          setEmailModalProject(p);
                          setEmailRecipient(user?.email || '');
                          setEmailSuccess(null);
                          setEmailError(null);
                        }}
                        className="btn btn-secondary btn-sm"
                        title="Email Project Health Audit"
                        style={{ color: '#1d4ed8', borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}
                      >
                        <Mail size={13} />
                      </button>
                      <Link to={`/projects/${p.id}`} className="btn btn-secondary btn-sm" title="View Dashboard">
                        <Activity size={14} /> View
                      </Link>
                      <Link to={`/projects/${p.id}/edit`} className="btn btn-secondary btn-sm" title="Edit Project">
                        <Edit size={14} />
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)} title="Delete Project">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Email Modal */}
      {emailModalProject && (
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
            if (e.target === e.currentTarget && !sendingEmail) setEmailModalProject(null);
          }}
        >
          <div
            className="card"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '460px',
              width: '100%',
              padding: 0,
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #bfdbfe'
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                padding: '1.25rem 1.5rem',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={18} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Email Health Audit
                </h3>
              </div>
              <button
                onClick={() => setEmailModalProject(null)}
                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendEmail} style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Dispatch a real-time availability report for <strong style={{ color: 'var(--text-primary)' }}>{emailModalProject.name}</strong>.
              </div>

              {emailSuccess && (
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-up-bg)', color: 'var(--status-up)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={16} /> {emailSuccess}
                </div>
              )}

              {emailError && (
                <div style={{ padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-down-bg)', color: 'var(--status-down)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <AlertTriangle size={16} /> {emailError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Recipient Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  disabled={sendingEmail}
                  onClick={() => setEmailModalProject(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={14} />
                  {sendingEmail ? 'Dispatching...' : 'Send Audit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FolderPlus, ArrowLeft, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';
import { monitorService } from '../services/monitorService';

export const CreateProject = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [checkInterval, setCheckInterval] = useState(5);
  const [timeout, setTimeoutVal] = useState(10);
  const [alertDown, setAlertDown] = useState(true);
  const [alertRecovered, setAlertRecovered] = useState(true);
  const [alertSlow, setAlertSlow] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create Project with URL (Atomic creation & immediate health check)
      await projectService.createProject({
        name,
        description,
        url,
        check_interval: parseInt(checkInterval),
        timeout: parseInt(timeout)
      });

      navigate('/projects');
    } catch (err) {
      setError(err.response?.data?.url?.[0] || err.response?.data?.detail || err.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <Link to="/projects" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Monitoring Project</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Configure a project and target URL for automated website health monitoring.
        </p>
      </div>

      <div className="card">
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

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Khet Saathi Platform"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={2}
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the application or client website..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Website URL to Monitor *</label>
            <input
              type="url"
              required
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Monitoring Interval</label>
              <select className="form-select" value={checkInterval} onChange={(e) => setCheckInterval(e.target.value)}>
                <option value={1}>Every 1 minute</option>
                <option value={5}>Every 5 minutes</option>
                <option value={10}>Every 10 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every 60 minutes</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Request Timeout (seconds)</label>
              <select className="form-select" value={timeout} onChange={(e) => setTimeoutVal(e.target.value)}>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
                <option value={30}>30 seconds</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            <label className="form-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Alert Triggers</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={alertDown} onChange={(e) => setAlertDown(e.target.checked)} />
                Website Down Alert (HTTP 5xx, timeouts, connection failures)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={alertRecovered} onChange={(e) => setAlertRecovered(e.target.checked)} />
                Website Recovered Alert (When site returns online)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={alertSlow} onChange={(e) => setAlertSlow(e.target.checked)} />
                Slow Response Alert (&gt; 1500ms response time)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Link to="/projects" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <FolderPlus size={18} /> {loading ? 'Saving...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Plus, ArrowLeft, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';
import { monitorService } from '../services/monitorService';

export const CreateMonitor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultProjectId = searchParams.get('project');

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState(defaultProjectId || '');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [checkInterval, setCheckInterval] = useState(5);
  const [timeout, setTimeoutVal] = useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    projectService.getProjects().then(data => {
      setProjects(data || []);
      if (!projectId && data && data.length > 0) {
        setProjectId(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await monitorService.createMonitor({
        project: parseInt(projectId),
        name,
        url,
        check_interval: parseInt(checkInterval),
        timeout: parseInt(timeoutVal)
      });
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err.response?.data?.url?.[0] || err.response?.data?.detail || 'Failed to create monitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <Link to="/projects" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Projects
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add Website Monitor</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
          Add a new target endpoint or URL to monitor under your existing project.
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
            <label className="form-label">Target Project *</label>
            <select
              className="form-select"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              <option value="" disabled>Select a project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Monitor Name *</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. API Health Check"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Website or API URL *</label>
            <input
              type="url"
              required
              className="form-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/health"
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
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timeout (seconds)</label>
              <select className="form-select" value={timeout} onChange={(e) => setTimeoutVal(e.target.value)}>
                <option value={5}>5 seconds</option>
                <option value={10}>10 seconds</option>
                <option value={15}>15 seconds</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Link to="/projects" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Plus size={18} /> {loading ? 'Adding...' : 'Add Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMonitor;

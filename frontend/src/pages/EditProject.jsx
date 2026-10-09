import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { projectService } from '../services/projectService';
import LoadingState from '../components/common/LoadingState';

export const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProj = async () => {
      try {
        const p = await projectService.getProjectById(id);
        setName(p.name || '');
        setDescription(p.description || '');
        setUrl(p.website_url || p.url || '');
        setIsActive(p.is_active ?? true);
      } catch (e) {
        setError('Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProj();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await projectService.updateProject(id, {
        name,
        description,
        url,
        is_active: isActive
      });
      navigate(`/projects/${id}`);
    } catch (err) {
      setError('Failed to update project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading project settings..." />;

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <Link to={`/projects/${id}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <ArrowLeft size={16} /> Back to Project Dashboard
        </Link>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Project Settings</h2>
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
            <label className="form-label">Project Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Website URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Project Active (Enable automated checks)
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            <Link to={`/projects/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary">
              <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProject;

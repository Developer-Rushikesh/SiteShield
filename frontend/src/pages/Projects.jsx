import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Trash2, Edit, ExternalLink, Activity } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { projectService } from '../services/projectService';

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getProjects();
      setProjects(data || []);
    } catch (err) {
      setError("Failed to fetch projects list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete project '${name}'?`)) {
      await projectService.deleteProject(id);
      fetchProjects();
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
        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={18} /> Create Project
        </Link>
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
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        {p.website_url} <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No URL</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.uptime}%</td>
                  <td>{p.average_response_time ? `${p.average_response_time} ms` : 'N/A'}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {p.last_checked ? new Date(p.last_checked).toLocaleTimeString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
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
    </div>
  );
};

export default Projects;

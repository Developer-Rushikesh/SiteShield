import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Clock, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';

export const ProjectCard = ({ project }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {project.name}
          </h3>
          {project.website_url && (
            <a
              href={project.website_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.825rem',
                color: 'var(--text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginTop: '0.2rem'
              }}
            >
              {project.website_url} <ExternalLink size={12} />
            </a>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {project.description || 'No description provided.'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.825rem'
        }}
      >
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Uptime</span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.uptime}%</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Response</span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {project.average_response_time ? `${project.average_response_time} ms` : 'N/A'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={12} /> Checked {project.last_checked ? new Date(project.last_checked).toLocaleTimeString() : 'Never'}
        </span>
        <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm">
          View Dashboard <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;

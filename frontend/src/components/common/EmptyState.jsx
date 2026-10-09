import React from 'react';
import { PlusCircle, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({ title = "No projects yet", description = "Create your first monitoring project to track website health.", actionText = "+ Create Project", actionLink = "/projects/new" }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', textAlign: 'center' }}>
    <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
      <Inbox size={40} />
    </div>
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '400px' }}>{description}</p>
    </div>
    {actionText && actionLink && (
      <Link to={actionLink} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        <PlusCircle size={16} /> {actionText}
      </Link>
    )}
  </div>
);

export default EmptyState;

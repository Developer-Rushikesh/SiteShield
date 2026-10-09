import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ message = "Unable to load data. Please try again.", onRetry }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '1rem', textCenter: 'center' }}>
    <AlertTriangle size={36} style={{ color: 'var(--status-down)' }} />
    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Something went wrong</div>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{message}</p>
    {onRetry && (
      <button className="btn btn-secondary btn-sm" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    )}
  </div>
);

export default ErrorState;

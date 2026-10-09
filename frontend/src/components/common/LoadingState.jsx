import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading data..." }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', gap: '1rem', color: 'var(--text-secondary)' }}>
    <Loader2 size={32} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
    <span>{message}</span>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export default LoadingState;

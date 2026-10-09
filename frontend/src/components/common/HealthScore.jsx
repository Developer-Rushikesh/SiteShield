import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export const HealthScore = ({ score = 95 }) => {
  let statusText = 'Excellent';
  let color = 'var(--status-up)';
  if (score < 50) {
    statusText = 'Critical';
    color = 'var(--status-down)';
  } else if (score < 80) {
    statusText = 'Needs Attention';
    color = 'var(--status-warning)';
  } else if (score < 90) {
    statusText = 'Good';
    color = 'var(--accent-primary)';
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          border: `4px solid ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `${color}10`
        }}
      >
        <span style={{ fontSize: '1.4rem', fontWeight: 800, color: color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/100</span>
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Application Health Score
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: color, marginTop: '0.15rem' }}>
          {statusText}
        </div>
        <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Calculated from uptime, response time, and active incidents.
        </div>
      </div>
    </div>
  );
};

export default HealthScore;

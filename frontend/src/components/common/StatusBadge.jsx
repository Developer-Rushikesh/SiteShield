import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'UNKNOWN').toUpperCase();

  let bg = 'var(--status-paused-bg)';
  let color = 'var(--status-paused)';
  let label = normalized;

  if (normalized === 'UP' || normalized === 'OPERATIONAL' || normalized === 'RESOLVED') {
    bg = 'var(--status-up-bg)';
    color = 'var(--status-up)';
    label = normalized === 'RESOLVED' ? 'RESOLVED' : 'OPERATIONAL';
  } else if (normalized === 'DOWN' || normalized === 'OPEN') {
    bg = 'var(--status-down-bg)';
    color = 'var(--status-down)';
    label = normalized === 'OPEN' ? 'OPEN INCIDENT' : 'DOWN';
  } else if (normalized === 'WARNING' || normalized === 'SLOW') {
    bg = 'var(--status-warning-bg)';
    color = 'var(--status-warning)';
    label = 'WARNING';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        borderRadius: '9999px',
        backgroundColor: bg,
        color: color,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.025em',
        textTransform: 'uppercase'
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color
        }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;

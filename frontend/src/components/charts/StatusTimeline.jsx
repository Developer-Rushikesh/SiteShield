import React from 'react';

export const StatusTimeline = ({ timeline = [] }) => {
  const getColor = (status) => {
    if (status === 'UP') return 'var(--status-up)';
    if (status === 'DOWN') return 'var(--status-down)';
    if (status === 'WARNING') return 'var(--status-warning)';
    return 'var(--status-paused)';
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Timeline (Recent Checks)</span>
        </div>
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No monitoring checks logged yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Timeline (Recent Checks)</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Latest right →</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
          overflowX: 'auto',
          padding: '0.5rem 0'
        }}
      >
        {timeline.map((item, index) => (
          <div
            key={item.id || index}
            title={`${item.time} | ${item.status} (${item.http_status || 'ERR'}) - ${item.response_time}ms`}
            style={{
              flex: 1,
              minWidth: '12px',
              height: '32px',
              borderRadius: '3px',
              backgroundColor: getColor(item.status),
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          />
        ))}
      </div>
    </div>
  );
};

export default StatusTimeline;

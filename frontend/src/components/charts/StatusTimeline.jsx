import React from 'react';

export const StatusTimeline = ({ timeline = [] }) => {
  const items = timeline.length > 0 ? timeline : [
    { id: 1, time: '10:00', status: 'UP', response_time: 220, http_status: 200 },
    { id: 2, time: '10:05', status: 'UP', response_time: 235, http_status: 200 },
    { id: 3, time: '10:10', status: 'UP', response_time: 210, http_status: 200 },
    { id: 4, time: '10:15', status: 'DOWN', response_time: 2200, http_status: 500 },
    { id: 5, time: '10:20', status: 'DOWN', response_time: 2400, http_status: 500 },
    { id: 6, time: '10:25', status: 'UP', response_time: 245, http_status: 200 }
  ];

  const getColor = (status) => {
    if (status === 'UP') return 'var(--status-up)';
    if (status === 'DOWN') return 'var(--status-down)';
    if (status === 'WARNING') return 'var(--status-warning)';
    return 'var(--status-paused)';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Timeline (Last Checks)</span>
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
        {items.map((item, index) => (
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

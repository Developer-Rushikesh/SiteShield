import React from 'react';
import StatusBadge from '../common/StatusBadge';

export const HistoryTable = ({ records = [] }) => {
  if (!records || records.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No monitoring checks recorded yet. Click "Check Now" to perform the first check.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Status</th>
            <th>HTTP Status</th>
            <th>Response Time</th>
            <th>Details / Error</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {new Date(r.checked_at).toLocaleString()}
              </td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: r.http_status_code && r.http_status_code >= 200 && r.http_status_code < 400 ? 'var(--status-up)' : 'var(--status-down)'
                  }}
                >
                  {r.http_status_code ? `HTTP ${r.http_status_code}` : 'N/A'}
                </span>
              </td>
              <td>{r.response_time} ms</td>
              <td style={{ color: r.error_message ? 'var(--status-down)' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                {r.error_message || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;

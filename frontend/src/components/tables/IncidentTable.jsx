import React from 'react';
import StatusBadge from '../common/StatusBadge';

export const IncidentTable = ({ incidents = [] }) => {
  if (!incidents || incidents.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        No incidents recorded. All services operating normally! 🎉
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Monitor / URL</th>
            <th>Started At</th>
            <th>Resolved At</th>
            <th>Duration</th>
            <th>Reason</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id}>
              <td style={{ fontWeight: 600 }}>#{inc.id}</td>
              <td>
                <div style={{ fontWeight: 500 }}>{inc.monitor_name || 'Monitor'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inc.monitor_url}</div>
              </td>
              <td style={{ fontSize: '0.85rem' }}>
                {new Date(inc.started_at).toLocaleString()}
              </td>
              <td style={{ fontSize: '0.85rem' }}>
                {inc.resolved_at ? new Date(inc.resolved_at).toLocaleString() : 'Ongoing'}
              </td>
              <td>
                {inc.duration ? `${inc.duration} mins` : (inc.status === 'OPEN' ? 'Active' : '-')}
              </td>
              <td style={{ fontSize: '0.85rem', color: 'var(--status-down)' }}>
                {inc.reason}
              </td>
              <td>
                <StatusBadge status={inc.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentTable;

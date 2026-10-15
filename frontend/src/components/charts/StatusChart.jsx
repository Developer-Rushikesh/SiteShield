import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const StatusChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
        No HTTP status code data recorded yet.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="code" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', color: '#fff' }}
            formatter={(val) => [val, 'Occurrences']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const codeStr = String(entry.code);
              let color = 'var(--status-down)';
              if (codeStr.startsWith('2')) color = 'var(--status-up)';
              else if (codeStr.startsWith('3')) color = 'var(--accent-primary)';
              else if (codeStr.startsWith('4')) color = 'var(--status-warning)';
              return <Cell key={`cell-${index}`} fill={entry.color || color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;

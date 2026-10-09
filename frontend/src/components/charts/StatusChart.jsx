import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

export const StatusChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { code: '200', count: 8400, color: 'var(--status-up)' },
    { code: '301', count: 45, color: 'var(--accent-primary)' },
    { code: '404', count: 12, color: 'var(--status-warning)' },
    { code: '500', count: 18, color: 'var(--status-down)' },
    { code: '504', count: 2, color: 'var(--status-down)' }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="code" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', color: '#fff' }}
            formatter={(val) => [val, 'Occurrences']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || (entry.code.startsWith('2') ? 'var(--status-up)' : entry.code.startsWith('3') ? 'var(--accent-primary)' : 'var(--status-down)')} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;

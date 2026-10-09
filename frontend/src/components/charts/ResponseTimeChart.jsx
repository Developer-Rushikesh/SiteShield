import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ResponseTimeChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { time: '09:00', response_time: 220 },
    { time: '10:00', response_time: 245 },
    { time: '11:00', response_time: 280 },
    { time: '12:00', response_time: 230 },
    { time: '13:00', response_time: 350 },
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} unit="ms" />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', color: '#fff' }}
            formatter={(val) => [`${val} ms`, 'Response Time']}
          />
          <Line
            type="monotone"
            dataKey="response_time"
            stroke="var(--accent-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: 'var(--accent-primary)' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResponseTimeChart;

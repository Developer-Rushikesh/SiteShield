import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const UptimeChart = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { time: 'Mon', uptime: 100 },
    { time: 'Tue', uptime: 99.8 },
    { time: 'Wed', uptime: 100 },
    { time: 'Thu', uptime: 98.5 },
    { time: 'Fri', uptime: 100 },
    { time: 'Sat', uptime: 100 },
    { time: 'Sun', uptime: 99.94 }
  ];

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--status-up)" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="var(--status-up)" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
          <YAxis domain={[90, 100]} stroke="var(--text-muted)" fontSize={12} tickLine={false} unit="%" />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '6px', color: '#fff' }}
            formatter={(val) => [`${val}%`, 'Uptime']}
          />
          <Area
            type="monotone"
            dataKey="uptime"
            stroke="var(--status-up)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorUptime)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UptimeChart;

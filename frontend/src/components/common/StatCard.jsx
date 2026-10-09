import React, { useState } from 'react';

export const StatCard = ({ title, value, subtext, icon: Icon, color = 'var(--accent-primary)', topData = [] }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        cursor: topData && topData.length > 0 ? 'pointer' : 'default',
        borderColor: isHovered ? 'var(--accent-primary)' : 'var(--border-color)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
      }}
    >
      <div>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {title}
        </span>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
          {value}
        </div>
        {subtext && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            {subtext}
          </div>
        )}
      </div>

      {Icon && (
        <div
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: `${color}18`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
        >
          <Icon size={22} />
        </div>
      )}

      {/* Top 2 Hover Popover */}
      {isHovered && topData && topData.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            backgroundColor: '#ffffff',
            border: '1px solid #bfdbfe',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.2)',
            zIndex: 999,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', borderBottom: '1px solid #eff6ff', paddingBottom: '0.3rem' }}>
            Top 2 Recent Records
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {topData.slice(0, 2).map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.75rem', color: item.badgeColor || 'var(--text-secondary)', fontWeight: 600, backgroundColor: `${item.badgeColor || 'var(--border-color)'}15`, padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                  {item.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const NotificationDropdown = ({ notifications = [], onMarkRead, onMarkAllRead, onClose }) => {
  const getIcon = (type) => {
    if (type === 'DOWN') return <AlertTriangle size={16} color="var(--status-down)" />;
    if (type === 'RECOVERED') return <ShieldCheck size={16} color="var(--status-up)" />;
    if (type === 'SLOW') return <Zap size={16} color="var(--status-warning)" />;
    return <Bell size={16} color="var(--accent-primary)" />;
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        width: '360px',
        maxHeight: '480px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
        <button
          onClick={onMarkAllRead}
          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
        >
          Mark all as read
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '340px' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No unread notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: n.is_read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                display: 'flex',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
            >
              <div style={{ marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: n.is_read ? 500 : 600, color: 'var(--text-primary)' }}>
                  {n.title}
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {n.message}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {new Date(n.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          backgroundColor: 'var(--bg-card)'
        }}
      >
        <Link
          to="/notifications"
          onClick={onClose}
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}
        >
          View all notifications →
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;

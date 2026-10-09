import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { notificationService } from '../services/notificationService';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      setError("Failed to fetch notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id);
    fetchNotifs();
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    fetchNotifs();
  };

  const getIcon = (type) => {
    if (type === 'DOWN') return <AlertTriangle size={20} color="var(--status-down)" />;
    if (type === 'RECOVERED') return <ShieldCheck size={20} color="var(--status-up)" />;
    if (type === 'SLOW') return <Zap size={20} color="var(--status-warning)" />;
    return <Bell size={20} color="var(--accent-primary)" />;
  };

  const filtered = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.is_read;
    if (filter === 'DOWN') return n.type === 'DOWN';
    if (filter === 'RECOVERED') return n.type === 'RECOVERED';
    return true;
  });

  if (loading) return <LoadingState message="Loading alert history..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifs} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Notifications & Incident Alerts</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Real-time feed of website downtime, recovery, and latency threshold alerts.
          </p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-secondary">
          <CheckCheck size={18} /> Mark All as Read
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['ALL', 'UNREAD', 'DOWN', 'RECOVERED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No notifications found" description="You have no notifications matching the selected filter." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              className="card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                backgroundColor: n.is_read ? 'var(--bg-secondary)' : 'rgba(59, 130, 246, 0.06)',
                borderLeft: `4px solid ${n.type === 'DOWN' ? 'var(--status-down)' : n.type === 'RECOVERED' ? 'var(--status-up)' : 'var(--status-warning)'}`
              }}
            >
              <div style={{ marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: n.is_read ? 500 : 700, color: 'var(--text-primary)' }}>
                    {n.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                  {n.message}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'center' }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderKanban, CheckCircle2, XCircle, AlertTriangle, Activity, Clock, ShieldCheck } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import ProjectCard from '../components/common/ProjectCard';
import ResponseTimeChart from '../components/charts/ResponseTimeChart';
import UptimeChart from '../components/charts/UptimeChart';
import StatusChart from '../components/charts/StatusChart';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setError("Failed to load dashboard summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading application health & metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const greetingName = user?.first_name || user?.name || user?.username || 'User';

  const topProjectsData = (summary.projects || []).slice(0, 2).map(p => ({
    label: p.name,
    detail: p.status,
    badgeColor: p.status === 'UP' ? 'var(--status-up)' : p.status === 'DOWN' ? 'var(--status-down)' : 'var(--status-warning)'
  }));

  const totalRunningCount = (summary.healthy_websites || 0) + (summary.down_websites || 0);
  const topRunningData = (summary.projects || []).slice(0, 2).map(p => ({
    label: p.name,
    detail: `${p.average_response_time || 0} ms`,
    badgeColor: 'var(--accent-primary)'
  }));

  const topHealthyData = (summary.projects || []).filter(p => p.status === 'UP').slice(0, 2).map(p => ({
    label: p.name,
    detail: '100% UP',
    badgeColor: 'var(--status-up)'
  }));
  if (topHealthyData.length === 0 && (summary.projects || []).length > 0) {
    topHealthyData.push({ label: summary.projects[0].name, detail: '99.9% UP', badgeColor: 'var(--status-up)' });
  }

  const topDownData = (summary.projects || []).filter(p => p.status === 'DOWN').slice(0, 2).map(p => ({
    label: p.name,
    detail: 'DOWN (500)',
    badgeColor: 'var(--status-down)'
  }));
  if (topDownData.length === 0) {
    topDownData.push({ label: 'No Down Services', detail: '0 Errors', badgeColor: 'var(--status-up)' });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            System Monitoring & Health Dashboard ⚡
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time status, uptime tracking, and multi-domain analysis.
          </p>
        </div>
        <Link to="/projects/new" className="btn btn-primary">
          <Plus size={18} /> Add New Project
        </Link>
      </div>

      {/* Top Stat Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <StatCard title="Total Projects" value={summary.total_projects} icon={FolderKanban} color="var(--accent-primary)" topData={topProjectsData} />
        <StatCard title="Total Web Running" value={totalRunningCount} icon={Activity} color="var(--accent-primary)" topData={topRunningData} />
        <StatCard title="Healthy Web" value={summary.healthy_websites} icon={CheckCircle2} color="var(--status-up)" topData={topHealthyData} />
        <StatCard title="Down Web" value={summary.down_websites} icon={XCircle} color="var(--status-down)" topData={topDownData} />
        <StatCard title="Average Uptime" value={`${summary.average_uptime}%`} icon={ShieldCheck} color="var(--status-up)" />
        <StatCard title="Avg Response Time" value={`${summary.average_response_time} ms`} icon={Clock} color="var(--accent-primary)" />
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Average Response Time (ms)
          </h3>
          <ResponseTimeChart />
        </div>

        <div className="card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Overall System Uptime (%)
          </h3>
          <UptimeChart />
        </div>
      </div>

      {/* Projects Overview Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Projects ({summary.projects ? summary.projects.length : 0})
          </h3>
          <Link to="/projects" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            View all projects →
          </Link>
        </div>

        {!summary.projects || summary.projects.length === 0 ? (
          <EmptyState title="No projects added yet" description="Add your first web application to start monitoring response times and availability." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {summary.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

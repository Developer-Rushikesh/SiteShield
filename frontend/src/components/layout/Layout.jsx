import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from '../common/Chatbot';

export const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/projects/new')) return 'Create New Project';
    if (path.startsWith('/monitors/new')) return 'Add Website Monitor';
    if (path.startsWith('/projects/') && path.includes('/edit')) return 'Edit Project';
    if (path.startsWith('/projects/')) return 'Project Detail Dashboard';
    if (path.startsWith('/projects')) return 'Projects & Websites';
    if (path.startsWith('/reports')) return 'Reports & Analytics';
    if (path.startsWith('/notifications')) return 'Notifications & Alerts';
    if (path.startsWith('/settings')) return 'Account & Settings';
    return 'Main Dashboard';
  };

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-wrapper">
        <Navbar title={getPageTitle()} onMenuClick={() => setMobileOpen(prev => !prev)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
};

export default Layout;

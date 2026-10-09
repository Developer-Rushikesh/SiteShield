import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Activity, Zap, MessageSquare, Smartphone, User, ArrowRight, CheckCircle2, FileText, Bot, Lock, LogIn, ExternalLink } from 'lucide-react';
import logoImg from '../images/logo.png';

export const LandingPage = () => {
  const navigate = useNavigate();

  const handleRedirectDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      {/* 1. Header / Navbar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={handleRedirectDashboard}>
            <img src={logoImg} alt="SiteShield Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                SiteShield
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--accent-primary)', fontWeight: 600 }}>24/7 Monitor</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <a href="#about" style={{ color: 'var(--text-secondary)' }}>About</a>
            <a href="#why-us" style={{ color: 'var(--text-secondary)' }}>Why Choose Us</a>
            <a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a>
          </nav>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={handleRedirectDashboard} className="btn btn-secondary btn-sm" style={{ fontWeight: 600 }}>
              <LogIn size={16} /> Sign In / Register
            </button>
            <button onClick={handleRedirectDashboard} className="btn btn-primary btn-sm">
              Launch Dashboard <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{ padding: '4.5rem 1.5rem 3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          {/* Top Pill Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 700
            }}
          >
            <Zap size={16} /> 24/7 Real-Time Website & API Monitoring Platform
          </div>

          {/* Main Hero Headline */}
          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Monitor, Detect & Stay Ahead of <span style={{ color: 'var(--accent-primary)' }}>Website Downtime</span>.
          </h1>

          {/* Hero Subtitle */}
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: 1.6 }}>
            SiteShield delivers continuous automated uptime checks, latency graphs, WhatsApp/SMS/Email downtime alerts, and downloadable graphical PDF reports.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={handleRedirectDashboard} className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}>
              Go to Live Dashboard <ArrowRight size={18} />
            </button>
            <button onClick={handleRedirectDashboard} className="btn btn-secondary" style={{ padding: '0.85rem 1.6rem', fontSize: '1rem' }}>
              <LogIn size={18} /> Access Direct Web App
            </button>
          </div>

          {/* Dashboard Preview Mockup Card */}
          <div
            style={{
              marginTop: '2.5rem',
              width: '100%',
              maxWidth: '920px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img src={logoImg} alt="SiteShield Logo" style={{ width: '28px', height: '28px' }} />
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>SiteShield Live System Overview</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.75rem', fontWeight: 700 }}>● All Systems Operational</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Average System Uptime</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--status-up)', marginTop: '0.2rem' }}>99.98%</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Average Ping Latency</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.2rem' }}>245 ms</div>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Active Monitored Endpoints</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>4 URLs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About Section */}
      <section id="about" style={{ padding: '4rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              About SiteShield 24 Monitor
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              SiteShield is an enterprise-grade website health and uptime monitoring SaaS platform designed to safeguard your web applications, APIs, and microservices round-the-clock.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ backgroundColor: '#ffffff' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Continuous Availability Pings</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Automated background HTTP/HTTPS check engines ping your target domains continuously, verifying status codes (200, 404, 500, 502) and measuring response latency down to the millisecond.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: '#ffffff' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Activity size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Instant Health Scoring</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Every domain gets a dynamic 0–100 Health Score based on uptime consistency, error rate, latency distribution, and recent incident resolution times.
              </p>
            </div>

            <div className="card" style={{ backgroundColor: '#ffffff' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Audit-Ready Graphical Reports</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Generate custom Date-wise and Time-wise PDF performance audits featuring latency trend charts, HTTP status distribution, and complete check history tables.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Use Our Web (Why Choose SiteShield) */}
      <section id="why-us" style={{ padding: '4rem 1.5rem', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
              Why Choose SiteShield
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Built for Developers, Agencies & Businesses
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
              Why thousands rely on SiteShield for uncompromised website monitoring.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Feature 1 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: 'var(--accent-primary)' }}>
                <Zap size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Sub-Second Latency Tracking</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Track millisecond-level HTTP ping speeds and identify performance degradation before your users experience slow page loads.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', color: '#059669' }}>
                <MessageSquare size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>WhatsApp, SMS & Email Alerts</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Get emergency downtime notifications directly on WhatsApp, mobile SMS, or Email the instant your server fails checks.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: 'var(--accent-primary)' }}>
                <FileText size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Filtered Graphical PDF Exports</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Export executive PDF reports filtered by specific date ranges and time slots (Morning, Business Hours, Night Shift).
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#fef2f2', color: '#dc2626' }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Automated Incident Logging</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Automatic incident creation records outage duration, HTTP error codes, and resolution timestamps for full SLA compliance.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#eff6ff', color: 'var(--accent-primary)' }}>
                <Bot size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>24/7 AI Health Assistant</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Integrated doubt-solving AI chatbot provides step-by-step diagnostic checklists whenever your website goes DOWN.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: '#ecfdf5', color: '#059669' }}>
                <Lock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>Direct Zero-Barrier Access</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  No tedious password barriers or login obstacles. Access the live monitoring dashboard immediately with one click.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer style={{ backgroundColor: '#0b1d3a', color: '#ffffff', padding: '3rem 1.5rem 2rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <img src={logoImg} alt="SiteShield Logo" style={{ width: '36px', height: '36px' }} />
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>SiteShield 24 Monitor</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6 }}>
                Enterprise uptime monitoring, response speed analytics, and real-time WhatsApp, SMS, and Email alert dispatching.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleRedirectDashboard(); }} style={{ color: '#cbd5e1' }}>Dashboard</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleRedirectDashboard(); }} style={{ color: '#cbd5e1' }}>Monitored Endpoints</a>
                  <a href="#" onClick={(e) => { e.preventDefault(); handleRedirectDashboard(); }} style={{ color: '#cbd5e1' }}>Reports & PDFs</a>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            <div>© {new Date().getFullYear()} SiteShield 24 Monitor. All rights reserved.</div>
            <div>Monitor • Detect • Stay Ahead</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

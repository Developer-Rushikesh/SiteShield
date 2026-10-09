import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, HelpCircle, AlertTriangle, ShieldCheck, Zap, FileText } from 'lucide-react';

const KNOWLEDGE_BASE = [
  {
    keywords: ['down', 'website down', 'not working', 'failing', '500', '502', '503', '504', 'offline', 'error'],
    title: '🚨 Website Down Troubleshooting Guide',
    steps: [
      '1️⃣ Check DNS & Domain: Run "nslookup domain.com" or verify domain expiration date.',
      '2️⃣ Verify Web Server Status: Check if Nginx, Apache, Node.js, Gunicorn, or IIS process is running.',
      '3. Inspect SSL/TLS Certificate: Check if HTTPS certificate has expired or has a chain error.',
      '4️⃣ Check Firewall & Ports: Ensure ports 80 (HTTP) and 443 (HTTPS) are accepting traffic.',
      '5️⃣ Review Server Logs & CPU/RAM: Inspect "/var/log/nginx/error.log" or server memory utilization.',
      '6️⃣ Test API Endpoints manually: Use cURL or Postman to isolate backend vs frontend errors.'
    ]
  },
  {
    keywords: ['slow', 'latency', 'delay', 'response time', 'high ping', 'timeout'],
    title: '⚡ Improving Response Time & High Latency',
    steps: [
      '1️⃣ Enable CDN (Cloudflare, AWS CloudFront): Cache static assets at edge servers.',
      '2️⃣ Optimize Database Queries: Index frequently queried foreign keys and add query caching.',
      '3. Compress Assets: Enable Gzip / Brotli compression for JS, CSS, and HTML responses.',
      '4️⃣ Increase Server Resources: Scale up CPU cores or RAM if database pool is saturated.'
    ]
  },
  {
    keywords: ['pdf', 'report', 'export', 'download', 'filtered', 'history'],
    title: '📄 Downloading Custom PDF Performance Reports',
    steps: [
      '1️⃣ Navigate to the "Reports" section from the sidebar.',
      '2️⃣ Select your target Project or select "All Projects".',
      '3. Choose your Date Duration (e.g. Last 7 Days) & Time Duration (e.g. Business Hours).',
      '4️⃣ Click "Download Graphical PDF Report" to export a complete analytical document.'
    ]
  },
  {
    keywords: ['whatsapp', 'sms', 'email', 'alert', 'notification', 'settings'],
    title: '💬 Configuring WhatsApp, SMS & Email Notifications',
    steps: [
      '1️⃣ Go to the "Settings" page.',
      '2️⃣ Enable "Web Down Alerts" and "Web Up Time Alerts".',
      '3. Turn on WhatsApp / SMS toggles and enter your recipient phone number with country code (+91).'
    ]
  }
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your 24 Monitor AI Health Assistant 🤖. If your website is DOWN or experiencing issues, ask me what steps to take next!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');

    // Generate Intelligent Response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let matchedKb = KNOWLEDGE_BASE.find((kb) =>
        kb.keywords.some((kw) => lowerText.includes(kw))
      );

      let botResponse = '';
      let stepsList = null;

      if (matchedKb) {
        botResponse = matchedKb.title;
        stepsList = matchedKb.steps;
      } else {
        botResponse = `Thanks for your question! For general diagnostics:
1. Verify if your server service (Nginx/Node/Django) is active.
2. Check database connectivity.
3. Review 24 Monitor history logs to see exact HTTP status code.`;
      }

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botResponse,
        steps: stepsList,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-primary)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 25px rgba(29, 78, 216, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        aria-label="Open Health Assistant"
      >
        {isOpen ? <X size={26} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span
            style={{
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: '14px',
              height: '14px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              border: '2px solid #ffffff'
            }}
          />
        )}
      </button>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '95px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            animation: 'fadeIn 0.25s ease-in-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ padding: '0.4rem', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Bot size={22} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800 }}>24/7 Health Assistant</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#34d399' }} /> Online & Ready
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <button
              onClick={() => handleSendMessage('My website is DOWN, what next steps should I take?')}
              style={{ padding: '0.3rem 0.65rem', borderRadius: '14px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              🚨 Web Down Next Steps
            </button>
            <button
              onClick={() => handleSendMessage('How to fix high latency and slow website response time?')}
              style={{ padding: '0.3rem 0.65rem', borderRadius: '14px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              ⚡ Fix High Latency
            </button>
            <button
              onClick={() => handleSendMessage('How to download date and time filtered PDF reports?')}
              style={{ padding: '0.3rem 0.65rem', borderRadius: '14px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
            >
              📄 Export PDF Report
            </button>
          </div>

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundColor: '#f8fafc'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.85rem 1rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    backgroundColor: msg.sender === 'user' ? 'var(--accent-primary)' : '#ffffff',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.875rem',
                    lineHeight: 1.45
                  }}
                >
                  <div style={{ fontWeight: msg.steps ? 700 : 400 }}>{msg.text}</div>
                  {msg.steps && (
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {msg.steps.map((step, idx) => (
                        <div key={idx} style={{ fontSize: '0.825rem', color: '#334155' }}>
                          {step}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', padding: '0 0.25rem' }}>
                  {msg.timestamp}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.85rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Ask a doubt or search troubleshooting steps..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              style={{ fontSize: '0.875rem', height: '40px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '40px', width: '44px', padding: 0, borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;

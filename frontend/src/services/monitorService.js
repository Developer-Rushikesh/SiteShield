import api from './api';
import { mockMonitors } from '../data/mockMonitors';
import { mockHistory } from '../data/mockHistory';
import { mockIncidents } from '../data/mockIncidents';

export const monitorService = {
  getMonitors: async () => {
    try {
      const response = await api.get('/monitors/');
      return response.data;
    } catch (error) {
      return mockMonitors;
    }
  },

  getMonitorById: async (id) => {
    try {
      const response = await api.get(`/monitors/${id}/`);
      return response.data;
    } catch (error) {
      return mockMonitors.find(m => m.id === parseInt(id)) || mockMonitors[0];
    }
  },

  createMonitor: async (monitorData) => {
    try {
      const response = await api.post('/monitors/', monitorData);
      return response.data;
    } catch (error) {
      if (!error.response) {
        const newMon = {
          id: Date.now(),
          ...monitorData,
          current_status: 'PENDING',
          uptime: 100.0,
          average_response_time: 0,
          health_score: 100,
          created_at: new Date().toISOString()
        };
        mockMonitors.unshift(newMon);
        return newMon;
      }
      throw error;
    }
  },

  checkNow: async (monitorId) => {
    try {
      const response = await api.post(`/monitors/${monitorId}/check/`);
      return response.data;
    } catch (error) {
      // Return simulated check result if backend is unavailable
      const mon = mockMonitors.find(m => m.id === parseInt(monitorId)) || mockMonitors[0];
      mon.last_checked_at = new Date().toISOString();
      mon.current_status = mon.current_status === 'DOWN' ? 'DOWN' : 'UP';
      return {
        message: `Checked ${mon.name}`,
        monitor: mon,
        record: {
          id: Date.now(),
          monitor: mon.id,
          checked_at: mon.last_checked_at,
          status: mon.current_status,
          http_status_code: mon.current_status === 'DOWN' ? 500 : 200,
          response_time: Math.floor(Math.random() * 150) + 120,
          error_message: mon.current_status === 'DOWN' ? 'Simulated downtime error' : ''
        }
      };
    }
  },

  getHistory: async (monitorId, params = {}) => {
    try {
      const response = await api.get(`/monitors/${monitorId}/history/`, { params });
      return response.data;
    } catch (error) {
      return mockHistory.filter(h => h.monitor === parseInt(monitorId));
    }
  },

  getStatistics: async (monitorId) => {
    try {
      const response = await api.get(`/monitors/${monitorId}/statistics/`);
      return response.data;
    } catch (error) {
      return {
        uptime: 99.94,
        average_response_time: 245,
        total_checks: 8420,
        incidents: 2,
        downtime_minutes: 15,
        response_time: [
          { time: '09:00', response_time: 220 },
          { time: '10:00', response_time: 245 },
          { time: '11:00', response_time: 280 },
          { time: '12:00', response_time: 230 },
          { time: '13:00', response_time: 350 }
        ],
        status_distribution: [
          { code: '200', count: 8400 },
          { code: '500', count: 18 },
          { code: '504', count: 2 }
        ],
        timeline: [
          { time: '10:00', status: 'UP', response_time: 220 },
          { time: '10:05', status: 'UP', response_time: 230 },
          { time: '10:10', status: 'WARNING', response_time: 1650 },
          { time: '10:15', status: 'UP', response_time: 245 }
        ]
      };
    }
  },

  getIncidents: async (monitorId) => {
    try {
      const response = await api.get(`/monitors/${monitorId}/incidents/`);
      return response.data;
    } catch (error) {
      return mockIncidents.filter(i => i.monitor === parseInt(monitorId));
    }
  }
};

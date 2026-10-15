import api from './api';

export const monitorService = {
  getMonitors: async (params = {}) => {
    const response = await api.get('/monitors/', { params });
    return response.data;
  },

  getMonitorById: async (id) => {
    const response = await api.get(`/monitors/${id}/`);
    return response.data;
  },

  createMonitor: async (monitorData) => {
    const response = await api.post('/monitors/', monitorData);
    return response.data;
  },

  updateMonitor: async (id, monitorData) => {
    const response = await api.patch(`/monitors/${id}/`, monitorData);
    return response.data;
  },

  deleteMonitor: async (id) => {
    const response = await api.delete(`/monitors/${id}/`);
    return response.data;
  },

  checkNow: async (monitorId) => {
    const response = await api.post(`/monitors/${monitorId}/check/`);
    return response.data;
  },

  getHistory: async (monitorId, params = {}) => {
    const response = await api.get(`/monitors/${monitorId}/history/`, { params });
    return response.data;
  },

  getStatistics: async (monitorId) => {
    const response = await api.get(`/monitors/${monitorId}/statistics/`);
    return response.data;
  },

  getIncidents: async (monitorId) => {
    const response = await api.get(`/monitors/${monitorId}/incidents/`);
    return response.data;
  }
};

export default monitorService;

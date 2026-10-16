import api from './api';

export const projectService = {
  getProjects: async () => {
    const response = await api.get('/projects/');
    return response.data;
  },

  getProjectById: async (id) => {
    const response = await api.get(`/projects/${id}/`);
    return response.data;
  },

  getProjectStatistics: async (id) => {
    const response = await api.get(`/projects/${id}/statistics/`);
    return response.data;
  },

  getProjectHistory: async (id, params = {}) => {
    const response = await api.get(`/projects/${id}/history/`, { params });
    return response.data;
  },

  getProjectIncidents: async (id) => {
    const response = await api.get(`/projects/${id}/incidents/`);
    return response.data;
  },

  configureProjectMonitor: async (id, data) => {
    const response = await api.post(`/projects/${id}/configure-monitor/`, data);
    return response.data;
  },

  checkProject: async (id, data = {}) => {
    const response = await api.post(`/projects/${id}/check/`, data);
    return response.data;
  },

  createProject: async (projectData) => {
    const payload = {
      ...projectData,
      url: projectData.url || projectData.website_url
    };
    const response = await api.post('/projects/', payload);
    return response.data;
  },

  updateProject: async (id, projectData) => {
    const payload = {
      ...projectData,
      url: projectData.url || projectData.website_url
    };
    const response = await api.patch(`/projects/${id}/`, payload);
    return response.data;
  },

  deleteProject: async (id) => {
    const response = await api.delete(`/projects/${id}/`);
    return response.data;
  },

  // Daily 9:00 PM Report Scheduling
  getReportSchedule: async () => {
    const response = await api.get('/projects/report-schedule/');
    return response.data;
  },

  updateReportSchedule: async (data) => {
    const response = await api.post('/projects/report-schedule/', data);
    return response.data;
  },

  testDailyReport: async (recipientEmail = '') => {
    const response = await api.post('/projects/test-daily-report/', { recipient_email: recipientEmail });
    return response.data;
  },

  // On-demand Analytical Reports
  sendAnalyticsReport: async (reportPayload) => {
    const response = await api.post('/projects/send-analytics-report/', reportPayload);
    return response.data;
  },

  // On-demand Single Project Audit Report
  sendProjectReport: async (projectId, data) => {
    const response = await api.post(`/projects/${projectId}/send-report/`, data);
    return response.data;
  },

  // Test Critical Red Alert Email Dispatch
  testRedAlert: async (projectId = null, recipientEmail = '') => {
    if (projectId) {
      const response = await api.post(`/projects/${projectId}/test-red-alert/`, { recipient_email: recipientEmail });
      return response.data;
    } else {
      const response = await api.post('/projects/test-red-alert/', { recipient_email: recipientEmail });
      return response.data;
    }
  }
};

export default projectService;

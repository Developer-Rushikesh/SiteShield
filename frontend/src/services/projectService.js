import api from './api';
import { mockProjects } from '../data/mockProjects';

export const projectService = {
  getProjects: async () => {
    try {
      const response = await api.get('/projects/');
      return response.data;
    } catch (error) {
      return mockProjects;
    }
  },

  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}/`);
      return response.data;
    } catch (error) {
      const proj = mockProjects.find(p => p.id === parseInt(id));
      return proj || mockProjects[0];
    }
  },

  createProject: async (projectData) => {
    try {
      const payload = {
        ...projectData,
        url: projectData.url || projectData.website_url
      };
      const response = await api.post('/projects/', payload);
      return response.data;
    } catch (error) {
      if (!error.response) {
        const targetUrl = projectData.url || projectData.website_url || '';
        const newProj = {
          id: Date.now(),
          ...projectData,
          monitors_count: targetUrl ? 1 : 0,
          healthy_count: targetUrl ? 1 : 0,
          down_count: 0,
          status: targetUrl ? 'UP' : 'PENDING',
          uptime: 100.0,
          average_response_time: 120,
          website_url: targetUrl,
          created_at: new Date().toISOString()
        };
        mockProjects.unshift(newProj);
        return newProj;
      }
      throw error;
    }
  },

  checkProject: async (id) => {
    try {
      const response = await api.post(`/projects/${id}/check/`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  updateProject: async (id, projectData) => {
    try {
      const payload = {
        ...projectData,
        url: projectData.url || projectData.website_url
      };
      const response = await api.patch(`/projects/${id}/`, payload);
      return response.data;
    } catch (error) {
      const index = mockProjects.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...projectData };
        return mockProjects[index];
      }
      throw error;
    }
  },

  deleteProject: async (id) => {
    try {
      await api.delete(`/projects/${id}/`);
      return true;
    } catch (error) {
      const index = mockProjects.findIndex(p => p.id === parseInt(id));
      if (index !== -1) {
        mockProjects.splice(index, 1);
      }
      return true;
    }
  }
};

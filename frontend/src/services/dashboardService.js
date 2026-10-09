import api from './api';
import { mockProjects } from '../data/mockProjects';

export const dashboardService = {
  getSummary: async () => {
    try {
      const response = await api.get('/dashboard/summary/');
      return response.data;
    } catch (error) {
      const totalProjects = mockProjects.length;
      const healthyWebsites = mockProjects.filter(p => p.status === 'UP').length;
      const downWebsites = mockProjects.filter(p => p.status === 'DOWN').length;

      return {
        total_projects: totalProjects,
        healthy_websites: healthyWebsites,
        down_websites: downWebsites,
        active_incidents: 1,
        average_uptime: 99.72,
        average_response_time: 284,
        total_checks: 8420,
        projects: mockProjects
      };
    }
  }
};

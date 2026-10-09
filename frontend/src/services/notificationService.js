import api from './api';
import { mockNotifications } from '../data/mockNotifications';

export const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications/');
      return response.data;
    } catch (error) {
      return mockNotifications;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read/`);
      return response.data;
    } catch (error) {
      const notif = mockNotifications.find(n => n.id === parseInt(id));
      if (notif) notif.is_read = true;
      return notif;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.post('/notifications/read-all/');
      return response.data;
    } catch (error) {
      mockNotifications.forEach(n => { n.is_read = true; });
      return { message: 'All marked as read', count: mockNotifications.length };
    }
  }
};

import httpClient from './httpClient';
import { API_ENDPOINTS } from '../config/config';

class NotificationService {
  async getNotifications() {
    return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.LIST);
  }

  async markAsRead(notificationId: string) {
    return await httpClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/${notificationId}/read`, {});
  }

  async markAllAsRead() {
    return await httpClient.patch(`${API_ENDPOINTS.NOTIFICATIONS.LIST}/read-all`, {});
  }
}

export const notificationService = new NotificationService();

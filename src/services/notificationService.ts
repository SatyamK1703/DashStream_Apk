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
    return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ, {});
  }

  async registerPushToken(token: string, deviceType: string = 'android', deviceInfo: object = {}) {
    return await httpClient.post(API_ENDPOINTS.NOTIFICATIONS.LIST + '/register-device', { token, deviceType, deviceInfo });
  }

  async removePushToken(token: string) {
    return await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.LIST + '/deregister-device', { data: { token } });
  }

  async getPreferences() {
    return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
  }

  async updatePreferences(preferences: object) {
    return await httpClient.put(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
  }
}

export const notificationService = new NotificationService();

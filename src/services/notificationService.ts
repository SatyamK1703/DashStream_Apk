import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { Notification } from '../types/api';

class NotificationService {
  /**
   * Get user notifications
   */
  async getNotifications(params?: {
    type?: 'booking' | 'payment' | 'offer' | 'general';
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    notifications: Notification[];
    unreadCount: number;
  }>> {
    try {
      return await httpClient.get(ENDPOINTS.NOTIFICATIONS.ALL, { params });
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<{ success: boolean; count: number }>> {
    try {
      return await httpClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    try {
      return await httpClient.get('/notifications/unread-count');
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<ApiResponse<{ success: boolean; count: number }>> {
    try {
      return await httpClient.delete('/notifications/clear-all');
    } catch (error) {
      console.error('Clear all notifications error:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: {
    booking: boolean;
    payment: boolean;
    offers: boolean;
    general: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  }): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.patch('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<ApiResponse<{
    booking: boolean;
    payment: boolean;
    offers: boolean;
    general: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
  }>> {
    try {
      return await httpClient.get('/notifications/preferences');
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  }

  /**
   * Register FCM token for push notifications
   */
  async registerFCMToken(token: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.post('/notifications/register-fcm', { token });
    } catch (error) {
      console.error('Register FCM token error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
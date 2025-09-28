import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Notification } from '../types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  NOTIF_PREFERENCES: '@DashStream:notification_preferences_local',
};

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
      return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.ALL, { params });
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
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
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
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
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
      return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
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
      return await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId));
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
      return await httpClient.delete(API_ENDPOINTS.NOTIFICATIONS.CLEAR_ALL);
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
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, preferences);
    } catch (error) {
      console.error('Update notification preferences error:', error);
      // Persist locally so user's choice is not lost when server denies access
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIF_PREFERENCES, JSON.stringify(preferences));
      } catch (e) {
        if (__DEV__) console.warn('Failed to persist notification preferences locally:', e);
      }
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
      return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
    } catch (error: any) {
      console.error('Get notification preferences error:', error);

      // If server denies access (403) or preferences unavailable, try to return local fallback if present
      try {
        const local = await AsyncStorage.getItem(STORAGE_KEYS.NOTIF_PREFERENCES);
        if (local) {
          const parsed = JSON.parse(local);
          return {
            success: true,
            status: 'success',
            message: 'local-fallback',
            data: parsed,
          } as ApiResponse<any>;
        }
      } catch (e) {
        if (__DEV__) console.warn('Failed to read local notification preferences:', e);
      }

      throw error;
    }
  }

  /**
   * Register FCM token for push notifications
   */
  async registerFCMToken(token: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_FCM, { token });
    } catch (error) {
      console.error('Register FCM token error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;

// Dev helper: produce a cURL command for reproducing the preferences request
export const buildPreferencesCurl = async (): Promise<string> => {
  try {
    // Try secure key first (matches httpClient SECURE_KEYS)
    let accessToken = null;
    try {
      accessToken = await SecureStore.getItemAsync('dashstream_access_token');
    } catch (e) {
      if (__DEV__) console.warn('SecureStore.getItemAsync failed in curl helper:', e);
    }

    // Fallback to AsyncStorage-stored token
    if (!accessToken) accessToken = await AsyncStorage.getItem('@DashStream:access_token');

    const base = (API_ENDPOINTS as any).__base || '';
    const url = `${(base || '')}${API_ENDPOINTS.NOTIFICATIONS.PREFERENCES}`;
    const headers = [] as string[];
    if (accessToken) headers.push(`-H "Authorization: Bearer ${accessToken}"`);
    headers.push('-H "Content-Type: application/json"');
    return `curl -X GET ${headers.join(' ')} "${url}"`;
  } catch {
    return 'curl command could not be generated (dev)';
  }
};
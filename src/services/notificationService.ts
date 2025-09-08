import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_TOKEN_KEY = '@dashstream:notification_token';
const NOTIFICATION_SETTINGS_KEY = '@dashstream:notification_settings';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationSettings {
  pushNotifications: boolean;
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  promotionalOffers: boolean;
  systemUpdates: boolean;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'promotional' | 'system' | 'general';
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

class NotificationService {
  private notificationToken: string | null = null;
  private settings: NotificationSettings = {
    pushNotifications: true,
    bookingUpdates: true,
    paymentUpdates: true,
    promotionalOffers: true,
    systemUpdates: true,
  };

  constructor() {
    this.loadSettings();
  }

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }

      // Get push token
      if (Device.isDevice) {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: 'your-expo-project-id', // Replace with your actual project ID
        });
        this.notificationToken = token.data;
        await this.saveToken();
        await this.registerDeviceToken();
      } else {
        console.log('Must use physical device for Push Notifications');
      }

      // Configure notification channels for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidChannels();
      }
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Setup Android notification channels
   */
  private async setupAndroidChannels(): Promise<void> {
    await Notifications.setNotificationChannelAsync('booking-updates', {
      name: 'Booking Updates',
      description: 'Notifications about your bookings',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563eb',
    });

    await Notifications.setNotificationChannelAsync('payment-updates', {
      name: 'Payment Updates',
      description: 'Notifications about payments',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#10b981',
    });

    await Notifications.setNotificationChannelAsync('promotional', {
      name: 'Promotional Offers',
      description: 'Special offers and promotions',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#f59e0b',
    });

    await Notifications.setNotificationChannelAsync('system', {
      name: 'System Updates',
      description: 'Important system notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#ef4444',
    });
  }

  /**
   * Register device token with backend
   */
  async registerDeviceToken(): Promise<void> {
    if (!this.notificationToken) return;

    try {
      await apiService.post('/notifications/register-device', {
        token: this.notificationToken,
        platform: Platform.OS,
        deviceId: Device.osInternalBuildId || 'unknown',
      });
    } catch (error) {
      console.error('Error registering device token:', error);
    }
  }

  /**
   * Deregister device token
   */
  async deregisterDeviceToken(): Promise<void> {
    if (!this.notificationToken) return;

    try {
      await apiService.delete('/notifications/deregister-device', {
        data: { token: this.notificationToken },
      });
    } catch (error) {
      console.error('Error deregistering device token:', error);
    }
  }

  /**
   * Get my notifications from backend
   */
  async getMyNotifications(params?: { page?: number; limit?: number }): Promise<NotificationData[]> {
    try {
      const response = await apiService.get('/notifications', params);
      return response.data?.notifications || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await apiService.get('/notifications/unread-count');
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiService.patch('/notifications/mark-all-read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Delete all read notifications
   */
  async deleteReadNotifications(): Promise<void> {
    try {
      await apiService.delete('/notifications/delete-read');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
    }
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || null,
      });
      return identifier;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel scheduled notification
   */
  async cancelScheduledNotification(identifier: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Error canceling scheduled notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all scheduled notifications:', error);
    }
  }

  /**
   * Get notification settings
   */
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  /**
   * Update notification settings
   */
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
  }

  /**
   * Check if notification type is enabled
   */
  isNotificationTypeEnabled(type: keyof NotificationSettings): boolean {
    return this.settings.pushNotifications && this.settings[type];
  }

  /**
   * Save token to local storage
   */
  private async saveToken(): Promise<void> {
    if (this.notificationToken) {
      await AsyncStorage.setItem(NOTIFICATION_TOKEN_KEY, this.notificationToken);
    }
  }

  /**
   * Load settings from local storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        this.settings = { ...this.settings, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  /**
   * Save settings to local storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Add notification listener
   */
  addNotificationListener(listener: (notification: Notifications.Notification) => void): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response listener
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Remove notification listener
   */
  removeNotificationListener(subscription: Notifications.Subscription): void {
    Notifications.removeNotificationSubscription(subscription);
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge count
   */
  async clearBadgeCount(): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge count:', error);
    }
  }
}

// Create and export a singleton instance
const notificationService = new NotificationService();
export default notificationService;

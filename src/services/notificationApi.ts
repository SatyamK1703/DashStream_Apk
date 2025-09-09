// src/services/notificationApi.ts
import notificationService, { NotificationData } from './notificationService';

// API Response types to match what NotificationContext expects
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

interface NotificationsResponse extends ApiResponse {
  notifications?: NotificationData[];
}

/**
 * Notification API adapter - provides a consistent API interface
 * Acts as a wrapper around the notificationService to match expected return formats
 */

/**
 * Get user notifications
 */
export const getNotifications = async (params?: { page?: number; limit?: number }): Promise<NotificationsResponse> => {
  try {
    const notifications = await notificationService.getMyNotifications(params);
    return {
      success: true,
      notifications,
      data: { notifications }
    };
  } catch (error) {
    console.error('Error in getNotifications:', error);
    return {
      success: false,
      message: 'Failed to fetch notifications',
      notifications: []
    };
  }
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
  try {
    await notificationService.markAsRead(notificationId);
    return {
      success: true,
      message: 'Notification marked as read'
    };
  } catch (error) {
    console.error('Error in markNotificationAsRead:', error);
    return {
      success: false,
      message: 'Failed to mark notification as read'
    };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse> => {
  try {
    await notificationService.markAllAsRead();
    return {
      success: true,
      message: 'All notifications marked as read'
    };
  } catch (error) {
    console.error('Error in markAllNotificationsAsRead:', error);
    return {
      success: false,
      message: 'Failed to mark all notifications as read'
    };
  }
};

/**
 * Register device for push notifications
 */
export const registerDeviceForPushNotifications = async (
  deviceToken: string, 
  deviceInfo: any = {}
): Promise<ApiResponse> => {
  try {
    // Initialize the notification service if not already done
    await notificationService.initialize();
    
    // Register the device token with backend
    await notificationService.registerDeviceToken();
    
    return {
      success: true,
      message: 'Device registered for push notifications',
      data: { deviceToken, deviceInfo }
    };
  } catch (error) {
    console.error('Error in registerDeviceForPushNotifications:', error);
    return {
      success: false,
      message: 'Failed to register device for push notifications'
    };
  }
};

/**
 * Deregister device from push notifications
 */
export const deregisterDeviceFromPushNotifications = async (deviceToken?: string): Promise<ApiResponse> => {
  try {
    await notificationService.deregisterDeviceToken();
    return {
      success: true,
      message: 'Device deregistered from push notifications',
      data: { deviceToken }
    };
  } catch (error) {
    console.error('Error in deregisterDeviceFromPushNotifications:', error);
    return {
      success: false,
      message: 'Failed to deregister device from push notifications'
    };
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  try {
    const count = await notificationService.getUnreadCount();
    return {
      success: true,
      data: { count }
    };
  } catch (error) {
    console.error('Error in getUnreadCount:', error);
    return {
      success: false,
      message: 'Failed to get unread count',
      data: { count: 0 }
    };
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string): Promise<ApiResponse> => {
  try {
    await notificationService.deleteNotification(notificationId);
    return {
      success: true,
      message: 'Notification deleted'
    };
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    return {
      success: false,
      message: 'Failed to delete notification'
    };
  }
};

/**
 * Delete all read notifications
 */
export const deleteReadNotifications = async (): Promise<ApiResponse> => {
  try {
    await notificationService.deleteReadNotifications();
    return {
      success: true,
      message: 'Read notifications deleted'
    };
  } catch (error) {
    console.error('Error in deleteReadNotifications:', error);
    return {
      success: false,
      message: 'Failed to delete read notifications'
    };
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = async (settings: any): Promise<ApiResponse> => {
  try {
    await notificationService.updateSettings(settings);
    return {
      success: true,
      message: 'Notification settings updated',
      data: settings
    };
  } catch (error) {
    console.error('Error in updateNotificationSettings:', error);
    return {
      success: false,
      message: 'Failed to update notification settings'
    };
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async (): Promise<ApiResponse> => {
  try {
    const settings = notificationService.getSettings();
    return {
      success: true,
      data: settings
    };
  } catch (error) {
    console.error('Error in getNotificationSettings:', error);
    return {
      success: false,
      message: 'Failed to get notification settings'
    };
  }
};

// Export the notification service instance as well for direct access if needed
export { notificationService };
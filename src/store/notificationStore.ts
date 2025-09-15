// src/store/notificationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

interface NotificationState {
  // State
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Permission state
  hasPermission: boolean;
  permissionStatus: string | null;
  
  // Push notification token
  expoPushToken: string | null;
  
  // Settings
  notificationSettings: {
    pushEnabled: boolean;
    bookingUpdates: boolean;
    promotionalOffers: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
  
  // Actions
  requestPermission: () => Promise<boolean>;
  registerForPushNotifications: () => Promise<string | null>;
  
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  
  // Local notifications
  scheduleLocalNotification: (title: string, body: string, trigger?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  
  // Settings
  updateNotificationSettings: (settings: Partial<typeof notificationSettings>) => void;
  
  // Push notifications
  sendPushNotification: (userId: string, title: string, body: string, data?: any) => Promise<boolean>;
  
  // Utilities
  clearError: () => void;
  getUnreadNotifications: () => any[];
  getNotificationById: (id: string) => any | null;
}

// Default notification settings
const defaultNotificationSettings = {
  pushEnabled: true,
  bookingUpdates: true,
  promotionalOffers: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    hasPermission: false,
    permissionStatus: null,
    expoPushToken: null,
    notificationSettings: defaultNotificationSettings,

    // Actions
    requestPermission: async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        const hasPermission = finalStatus === 'granted';
        
        set({ 
          hasPermission,
          permissionStatus: finalStatus,
          error: hasPermission ? null : 'Notification permission denied'
        });

        return hasPermission;
      } catch (error: any) {
        console.error('Error requesting notification permission:', error);
        set({ 
          error: error.message || 'Failed to request notification permission',
          hasPermission: false 
        });
        return false;
      }
    },

    registerForPushNotifications: async () => {
      try {
        const { hasPermission, requestPermission } = get();
        
        if (!hasPermission) {
          const granted = await requestPermission();
          if (!granted) return null;
        }

        // Get the token that uniquely identifies this device
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        
        set({ expoPushToken: token });
        
        // TODO: Send this token to your server to store it for this user
        // await sendPushTokenToServer(token);
        
        return token;
      } catch (error: any) {
        console.error('Error registering for push notifications:', error);
        set({ error: error.message || 'Failed to register for push notifications' });
        return null;
      }
    },

    fetchNotifications: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // TODO: Implement API call to fetch notifications from server
        // For now, this is a placeholder
        const response = { success: true, data: [] };
        
        if (response.success) {
          const notifications = response.data || [];
          const unreadCount = notifications.filter((n: any) => !n.read).length;
          
          set({ 
            notifications,
            unreadCount,
            isLoading: false 
          });
        } else {
          set({ 
            error: 'Failed to fetch notifications',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        set({ 
          error: error.message || 'Failed to fetch notifications',
          isLoading: false 
        });
      }
    },

    markAsRead: (notificationId: string) => {
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      set({ 
        notifications: updatedNotifications,
        unreadCount 
      });
      
      // TODO: Send read status to server
    },

    markAllAsRead: () => {
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      set({ 
        notifications: updatedNotifications,
        unreadCount: 0 
      });
      
      // TODO: Send bulk read status to server
    },

    deleteNotification: (notificationId: string) => {
      const { notifications } = get();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      const unreadCount = updatedNotifications.filter(n => !n.read).length;
      
      set({ 
        notifications: updatedNotifications,
        unreadCount 
      });
      
      // TODO: Delete from server
    },

    clearAllNotifications: () => {
      set({ 
        notifications: [],
        unreadCount: 0 
      });
      
      // TODO: Clear all from server
    },

    // Local notifications
    scheduleLocalNotification: async (title: string, body: string, trigger?: any) => {
      try {
        const { notificationSettings } = get();
        
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: notificationSettings.soundEnabled ? 'default' : false,
            vibrate: notificationSettings.vibrationEnabled ? [0, 250, 250, 250] : [],
          },
          trigger: trigger || null, // null means immediate
        });
        
        return notificationId;
      } catch (error: any) {
        console.error('Error scheduling local notification:', error);
        set({ error: error.message || 'Failed to schedule notification' });
        throw error;
      }
    },

    cancelNotification: async (notificationId: string) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error: any) {
        console.error('Error canceling notification:', error);
        set({ error: error.message || 'Failed to cancel notification' });
      }
    },

    cancelAllNotifications: async () => {
      try {
        await Notifications.cancelAllScheduledNotificationsAsync();
      } catch (error: any) {
        console.error('Error canceling all notifications:', error);
        set({ error: error.message || 'Failed to cancel notifications' });
      }
    },

    // Settings
    updateNotificationSettings: (newSettings) => {
      const { notificationSettings } = get();
      const updatedSettings = { ...notificationSettings, ...newSettings };
      
      set({ notificationSettings: updatedSettings });
      
      // TODO: Save settings to server/storage
    },

    // Push notifications
    sendPushNotification: async (userId: string, title: string, body: string, data?: any) => {
      try {
        // TODO: Implement server-side push notification sending
        // This would typically be done from your backend
        console.log('Sending push notification:', { userId, title, body, data });
        return true;
      } catch (error: any) {
        console.error('Error sending push notification:', error);
        set({ error: error.message || 'Failed to send push notification' });
        return false;
      }
    },

    // Utilities
    clearError: () => set({ error: null }),

    getUnreadNotifications: () => {
      const { notifications } = get();
      return notifications.filter(notification => !notification.read);
    },

    getNotificationById: (id: string) => {
      const { notifications } = get();
      return notifications.find(notification => notification.id === id) || null;
    },
  }))
);
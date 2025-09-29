// src/store/notificationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationService } from '../services';
import { Notification, NotificationSettings, PushNotificationToken } from '../types/notification';
import { useAuthStore } from './authStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

interface NotificationState {
  // State
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Permission state
  hasPermission: boolean;
  permissionStatus: string | null;
  
  // Push notification token
  expoPushToken: string | null;
  
  // Settings
  notificationSettings: NotificationSettings;
  
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
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  
  // Utility getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: string) => Notification[];
  
  // Error handling
  clearError: () => void;
}

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
    notificationSettings: {
      pushEnabled: true,
      bookingUpdates: true,
      promotionalOffers: true,
      systemAlerts: true,
      reminderNotifications: true,
      soundEnabled: true,
      vibrationEnabled: true,
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
    },

    requestPermission: async () => {
      try {
        set({ isLoading: true, error: null });
        
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
          isLoading: false 
        });
        
        return hasPermission;
      } catch (error: any) {
        console.error('Error requesting notification permission:', error);
        set({ 
          error: error.message || 'Failed to request notification permission',
          isLoading: false 
        });
        return false;
      }
    },

    registerForPushNotifications: async () => {
      try {
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        const hasPermission = await get().requestPermission();
        if (!hasPermission) {
          throw new Error('Notification permission not granted');
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;
        set({ expoPushToken: token });

        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) {
          try {
            await notificationService.registerPushToken(token);
          } catch (serverError) {
            console.warn('Failed to register push token with server:', serverError);
          }
        }

        return token;
      } catch (error: any) {
        console.error('Error registering for push notifications:', error);
        set({ error: error.message || 'Failed to register for push notifications' });
        return null;
      }
    },

    fetchNotifications: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        set({ notifications: [], unreadCount: 0 });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await notificationService.getNotifications();
        
        if (response.success && response.data) {
          const notifications = response.data;
          const unreadCount = notifications.filter(n => !n.isRead).length;
          
          set({ 
            notifications,
            unreadCount,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Failed to fetch notifications',
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
          ? { ...notification, isRead: true, readAt: new Date().toISOString() }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      set({ notifications: updatedNotifications, unreadCount });

      notificationService.markAsRead(notificationId).catch(console.error);
    },

    markAllAsRead: () => {
      const { notifications } = get();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        isRead: true,
        readAt: notification.readAt || new Date().toISOString(),
      }));
      
      set({ notifications: updatedNotifications, unreadCount: 0 });

      notificationService.markAllAsRead().catch(console.error);
    },

    deleteNotification: (notificationId: string) => {
      const { notifications } = get();
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      set({ notifications: updatedNotifications, unreadCount });

      notificationService.deleteNotification(notificationId).catch(console.error);
    },

    clearAllNotifications: () => {
      set({ notifications: [], unreadCount: 0 });
      
      notificationService.clearAllNotifications().catch(console.error);
    },

    scheduleLocalNotification: async (title: string, body: string, trigger?: any) => {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
          },
          trigger: trigger || null,
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
        set({ error: error.message || 'Failed to cancel all notifications' });
      }
    },

    updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
      const { notificationSettings } = get();
      const newSettings = { ...notificationSettings, ...settings };
      
      set({ notificationSettings: newSettings });
      
      notificationService.updateSettings(newSettings).catch(console.error);
    },

    getUnreadNotifications: () => {
      const { notifications } = get();
      return notifications.filter(n => !n.isRead);
    },

    getNotificationsByType: (type: string) => {
      const { notifications } = get();
      return notifications.filter(n => n.type === type);
    },

    clearError: () => set({ error: null }),
  }))
);
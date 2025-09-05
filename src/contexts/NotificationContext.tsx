// src/contexts/NotificationContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

// Define notification type
type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  data?: any;
};

// Define notification context state
type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  registerDeviceForPushNotifications: (deviceToken: string, deviceInfo: any) => Promise<void>;
  deregisterDeviceFromPushNotifications: (deviceToken?: string) => Promise<void>;
};

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  registerDeviceForPushNotifications: async () => {},
  deregisterDeviceFromPushNotifications: async () => {},
});

// Notification provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  // Calculate unread count
  const unreadCount = notifications.filter(notification => !notification.isRead).length;
  
  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      // Clear notifications when logged out
      setNotifications([]);
    }
  }, [isAuthenticated]);
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const result = await api.getNotifications();
      if (result.success && result.notifications) {
        setNotifications(result.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const result = await api.markNotificationAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const result = await api.markAllNotificationsAsRead();
      if (result.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  // Register device for push notifications
  const registerDeviceForPushNotifications = async (deviceInfo: any = {}) => {
    try {
      setIsLoading(true);
      const token = await notificationService.registerForPushNotificationsAsync();
      if (token) {
        // Pass the token and device info to the API
        await api.registerDeviceForPushNotifications(token, deviceInfo);
        console.log('Device registered for push notifications with token:', token);
      } else {
        console.log('Failed to get push notification token');
      }
    } catch (error) {
      console.error('Error registering device for push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Deregister device from push notifications
  const deregisterDeviceFromPushNotifications = async (deviceToken?: string) => {
    try {
      setIsLoading(true);
      await api.deregisterDeviceFromPushNotifications(deviceToken);
      console.log('Device deregistered from push notifications');
    } catch (error) {
      console.error('Error deregistering device from push notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Provide notification context value
  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    registerDeviceForPushNotifications,
    deregisterDeviceFromPushNotifications,
  };
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

// Custom hook to use notification context
export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
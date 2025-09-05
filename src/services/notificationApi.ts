// src/services/notificationApi.ts
import apiService from './apiService';
import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import { Platform } from 'react-native';

/**
 * Get user notifications
 */
export const getNotifications = async () => {
  try {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST);
    return { success: true, notifications: response };
  } catch (error: any) {
    console.error('Error fetching notifications:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch notifications.' 
    };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notificationId);
    const response = await apiService.post(url);
    return { success: true, notification: response };
  } catch (error: any) {
    console.error('Error marking notification as read:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to mark notification as read.' 
    };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return { success: true, notifications: response };
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to mark all notifications as read.' 
    };
  }
};

/**
 * Register device for push notifications
 */
export const registerDeviceForPushNotifications = async (deviceToken: string, deviceInfo: any) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, {
      token: deviceToken,
      deviceType: Platform.OS,
      deviceInfo,
    });
    
    // Store device token
    await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.DEVICE_TOKEN, deviceToken);
    
    return { success: true, device: response };
  } catch (error: any) {
    console.error('Error registering device for push notifications:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to register device for push notifications.' 
    };
  }
};

/**
 * Deregister device from push notifications
 */
export const deregisterDeviceFromPushNotifications = async (deviceToken?: string) => {
  try {
    // If no token provided, try to get from storage
    const token = deviceToken || await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.DEVICE_TOKEN);
    
    if (!token) {
      return { success: false, error: 'No device token found.' };
    }
    
    const response = await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.DEREGISTER_DEVICE, {
      token,
    });
    
    // Remove device token from storage
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.DEVICE_TOKEN);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deregistering device from push notifications:', error.response?.data || error.message);
    
    // Still remove token from storage
    await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.DEVICE_TOKEN);
    
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to deregister device from push notifications.' 
    };
  }
};

/**
 * Send notification to a specific user or device
 */
export const sendNotification = async (to: string, title: string, body: string, data?: any) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.NOTIFICATIONS.SEND_NOTIFICATION || '/notifications/send', {
      to,
      title,
      body,
      data
    });
    
    return { success: true, notification: response };
  } catch (error: any) {
    console.error('Error sending notification:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send notification.' 
    };
  }
};
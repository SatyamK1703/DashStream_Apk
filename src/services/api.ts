import apiService from './apiService';
import { API_CONFIG } from '../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

export const sendOtp = async (phone: string) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, { phone });
    return { success: true, ...response };
  } catch (error: any) {
    console.error('Error sending OTP:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send OTP. Please try again.' 
    };
  }
};

// Verify OTP and login
export const verifyOtp = async (phone: string, otp: string) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
    
    // Store auth token
    if (response.token) {
      await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
      apiService.setToken(response.token);
      
      // Store user data
      if (response.user) {
        await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      }
    }
    
    return { success: true, user: response.user };
  } catch (error: any) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to verify OTP. Please try again.' 
    };
  }
};

// Logout user
export const logout = async () => {
  try {
    await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    
    // Clear stored data
    await AsyncStorage.multiRemove([
      APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      APP_CONFIG.STORAGE_KEYS.USER_DATA,
    ]);
    
    apiService.clearToken();
    return { success: true };
  } catch (error: any) {
    console.error('Error logging out:', error.response?.data || error.message);
    
    // Still clear local data even if API call fails
    await AsyncStorage.multiRemove([
      APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      APP_CONFIG.STORAGE_KEYS.USER_DATA,
    ]);
    
    apiService.clearToken();
    return { success: true };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
    return { success: true, user: response };
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch user profile.' 
    };
  }
};

// Update user profile
export const updateUserProfile = async (userData: any) => {
  try {
    const response = await apiService.put(API_CONFIG.ENDPOINTS.USER.UPDATE_PROFILE, userData);
    
    // Update stored user data
    await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(response));
    
    return { success: true, user: response };
  } catch (error: any) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update user profile.' 
    };
  }
};

// Get user bookings
export const fetchBookings = async () => {
  try {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.BOOKINGS.LIST);
    return { success: true, bookings: response };
  } catch (error: any) {
    console.error('Error fetching bookings:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch bookings.' 
    };
  }
};

// Get booking details
export const getBookingDetails = async (bookingId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.BOOKINGS.DETAILS.replace(':id', bookingId);
    const response = await apiService.get(url);
    return { success: true, booking: response };
  } catch (error: any) {
    console.error('Error fetching booking details:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch booking details.' 
    };
  }
};

// Create new booking
export const createBooking = async (bookingData: any) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, bookingData);
    return { success: true, booking: response };
  } catch (error: any) {
    console.error('Error creating booking:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to create booking.' 
    };
  }
};

// Cancel booking
export const cancelBooking = async (bookingId: string, reason?: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL.replace(':id', bookingId);
    const response = await apiService.post(url, { reason });
    return { success: true, booking: response };
  } catch (error: any) {
    console.error('Error cancelling booking:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to cancel booking.' 
    };
  }
};

// Get all services
export const getServices = async (filters?: any) => {
  try {
    const response = await apiService.get(API_CONFIG.ENDPOINTS.SERVICES.LIST, { params: filters });
    return { success: true, services: response };
  } catch (error: any) {
    console.error('Error fetching services:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch services.' 
    };
  }
};

// Get service details
export const getServiceDetails = async (serviceId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.SERVICES.DETAILS.replace(':id', serviceId);
    const response = await apiService.get(url);
    return { success: true, service: response };
  } catch (error: any) {
    console.error('Error fetching service details:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to fetch service details.' 
    };
  }
};

// Get user notifications
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

// Mark notification as read
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

// Mark all notifications as read
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

// Register device for push notifications
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

// Deregister device from push notifications
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

// Import Platform for device type detection
import { Platform } from 'react-native';
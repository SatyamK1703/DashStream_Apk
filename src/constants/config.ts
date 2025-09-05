// src/constants/config.ts

/**
 * Application configuration constants
 */

// API Configuration
export const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: __DEV__ 
    ? 'http://10.0.2.2:5000/api' // Android emulator localhost
    : 'https://api.dashstream.com/api', // Production API URL
  
  // API Timeout in milliseconds
  TIMEOUT: 30000,
  
  // API Endpoints
  ENDPOINTS: {
    // Auth
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      LOGOUT: '/auth/logout',
    },
    
    // User
    USER: {
      PROFILE: '/users/me',
      UPDATE_PROFILE: '/users/me',
    },
    
    // Services
    SERVICES: {
      LIST: '/services',
      DETAILS: '/services/:id',
    },
    
    // Bookings
    BOOKINGS: {
      LIST: '/bookings',
      CREATE: '/bookings',
      DETAILS: '/bookings/:id',
      CANCEL: '/bookings/:id/cancel',
      RESCHEDULE: '/bookings/:id/reschedule',
    },
    
    // Notifications
    NOTIFICATIONS: {
      LIST: '/notifications',
      MARK_READ: '/notifications/:id/read',
    },
    
    // Payments
    PAYMENTS: {
      CREATE_ORDER: '/payments/create-order',
      VERIFY_PAYMENT: '/payments/verify',
      USER_PAYMENTS: '/payments/user',
      PAYMENT_DETAILS: '/payments/:id',
      MARK_ALL_READ: '/notifications/mark-all-read',
      REGISTER_DEVICE: '/notifications/register-device',
      DEREGISTER_DEVICE: '/notifications/deregister-device',
      MY_DEVICES: '/notifications/my-devices',
    },
  },
};

// App Configuration
export const APP_CONFIG = {
  // App version
  VERSION: '1.0.0',
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: '@DashStream:authToken',
    USER_DATA: '@DashStream:userData',
    DEVICE_TOKEN: '@DashStream:deviceToken',
    ONBOARDING_COMPLETE: '@DashStream:onboarding_complete',
    THEME: '@DashStream:theme',
    LANGUAGE: '@DashStream:language',
    FIREBASE_USER_LINK: '@DashStream:firebaseUserLink',
  },
};
import { Platform } from 'react-native';

// Environment configuration for different stages
const ENV = {
  development: {
    API_URL: Platform.OS === 'ios' 
      ? 'https://dash-stream-apk-backend.vercel.app/api'
      : 'https://dash-stream-apk-backend.vercel.app/api', // Android emulator
    WS_URL: Platform.OS === 'ios'
      ? 'https://dash-stream-apk-backend.vercel.app/api'
      : 'https://dash-stream-apk-backend.vercel.app/api',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
    RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  },
  staging: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    WS_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
    RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  },
  production: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    WS_URL: 'wss://dash-stream-apk-backend.vercel.app',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
    RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  }
};

// Get current environment
const getCurrentEnv = () => {
  if (__DEV__) return 'development';
  // You can add logic here to detect staging vs production
  return 'production';
};

export const config = ENV[getCurrentEnv()];

// API endpoints
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_TOKEN: '/auth/verify-token',
  },

  // Users
  USERS: {
    PROFILE: '/users/update-profile',
    PROFILE_IMAGE: '/users/update-profile-image',
    DELETE_ACCOUNT: '/users/delete-account',
    ADDRESSES: '/users/addresses',
    ADDRESS_BY_ID: (id: string) => `/users/addresses/${id}`,
    SET_DEFAULT_ADDRESS: (id: string) => `/users/addresses/${id}/set-default`,
    PROFESSIONALS: '/users/professionals',
    PROFESSIONAL_DETAILS: (id: string) => `/users/professionals/${id}`,
  },

  // Services
  SERVICES: {
    ALL: '/services',
    POPULAR: '/services/popular',
    TOP_SERVICES: '/services/top-services',
    CATEGORIES: '/services/categories',
    BY_CATEGORY: (category: string) => `/services/categories/${category}`,
    SEARCH: '/services/search',
    BY_ID: (id: string) => `/services/${id}`,
  },

  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY_PAYMENT: '/payments/verify-payment',
    PAYMENT_METHODS: '/payments/methods',
    REFUND: '/payments/refund',
  },

  // Offers
  OFFERS: {
    ALL: '/offers',
    ACTIVE: '/offers/active',
    BY_ID: (id: string) => `/offers/${id}`,
    APPLY: '/offers/apply',
  },

  // Vehicles
  VEHICLES: {
    MY_VEHICLES: '/vehicles/my-vehicles',
    CREATE: '/vehicles',
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    ALL: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
  },

  // Memberships
  MEMBERSHIPS: {
    PLANS: '/memberships/plans',
    MY_MEMBERSHIP: '/memberships/my-membership',
    PURCHASE: '/memberships/purchase',
  },

  // Locations
  LOCATIONS: {
    SEARCH: '/locations/search',
    NEARBY: '/locations/nearby',
    GEOCODE: '/locations/geocode',
    REVERSE_GEOCODE: '/locations/reverse-geocode',
  },

  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admins/dashboard',
    USERS: '/admins/users',
    USER_BY_ID: (id: string) => `/admins/users/${id}`,
    BOOKINGS: '/admins/bookings',
    BOOKING_BY_ID: (id: string) => `/admins/bookings/${id}`,
    SERVICES: '/admins/services',
    SERVICE_BY_ID: (id: string) => `/admins/services/${id}`,
    PROFESSIONALS: '/admins/professionals',
    PROFESSIONAL_BY_ID: (id: string) => `/admins/professionals/${id}`,
    STATS: '/admins/stats',
  },

  // Professional endpoints
  PROFESSIONALS: {
    PROFILE: '/professionals/profile',
    AVAILABILITY: '/professionals/toggle-availability',
    JOBS: '/professionals/jobs',
    EARNINGS: '/professionals/earnings',
    VERIFICATION: '/professionals/verification',
  },
};

// App constants
export const APP_CONFIG = {
  APP_NAME: 'DashStream',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 30000, // 30 seconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};
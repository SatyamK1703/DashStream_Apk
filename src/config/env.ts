import { Platform } from 'react-native';

// Environment configuration for different stages
const ENV = {
  development: {
    API_URL: Platform.OS === 'ios' 
      ? 'https://dash-stream-apk-backend.vercel.app/api'
      : 'https://dash-stream-apk-backend.vercel.app/api', // Use your local backend
    WS_URL: Platform.OS === 'ios'
      ? 'https://dashboard.razorpay.com/app/webhooks/RIhOTtZLsn5SIE'
      : 'https://dashboard.razorpay.com/app/webhooks/RIhOTtZLsn5SIE',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
    RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  },
  staging: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    WS_URL: 'https://dashboard.razorpay.com/app/webhooks/RIhOTtZLsn5SIE',
    GOOGLE_MAPS_API_KEY: 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
    RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  },
  production: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    WS_URL: 'https://dashsteam.com/app',
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
    CREATE: '/services',
    BY_ID: (id: string) => `/services/${id}`,
    UPDATE: (id: string) => `/services/${id}`,
    DELETE: (id: string) => `/services/${id}`,
    POPULAR: '/services/popular',
    TOP_SERVICES: '/services/top-services',
    CATEGORIES: '/services/categories',
    BY_CATEGORY: (category: string) => `/services/categories/${category}`,
    SEARCH: '/services/search',
    STATS: '/services/stats',
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
    STATS: (id: string) => `/offers/${id}/stats`,
    APPLY: '/offers/apply',
  },

  // Vehicles
  VEHICLES: {
    MY_VEHICLES: '/vehicles',
    CREATE: '/vehicles',
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    ALL: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
    UNREAD_COUNT: '/notifications/unread-count',
    PREFERENCES: '/notifications/preferences',
    REGISTER_FCM: '/notifications/register-fcm',
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
    USERS: '/users',
    USER_BY_ID: (id: string) => `/users/${id}`,
    CREATE_USER: '/admins/users',
    UPDATE_USER: (id: string) => `/users/${id}`,
    DELETE_USER: (id: string) => `/users/${id}`,
    BOOKINGS: '/bookings',
    BOOKING_BY_ID: (id: string) => `/admins/bookings/${id}`,
    ASSIGN_PROFESSIONAL: (id: string) => `/admins/bookings/${id}/assign`,
    CANCEL_BOOKING: (id: string) => `/admins/bookings/${id}/cancel`,
    UPDATE_BOOKING_STATUS: (id: string) => `/admins/bookings/${id}/status`,
    SERVICES: '/services',
    SERVICE_BY_ID: (id: string) => `/services/${id}`,
    CREATE_SERVICE: '/services',
    UPDATE_SERVICE: (id: string) => `/services/${id}`,
    DELETE_SERVICE: (id: string) => `/services/${id}`,
    PROFESSIONALS: '/professionals',
    PROFESSIONAL_BY_ID: (id: string) => `/professionals/${id}`,
    CREATE_PROFESSIONAL: '/professionals',
    UPDATE_PROFESSIONAL: (id: string) => `/professionals/${id}`,
    VERIFY_PROFESSIONAL: (id: string) => `/professionals/${id}/verification`,
    STATS: '/admins/stats',
  },

  // Professional endpoints
  PROFESSIONALS: {
    PROFILE: '/professionals/profile',
    DASHBOARD: '/professionals/dashboard',
    JOBS: '/professionals/jobs',
    JOB_BY_ID: (id: string) => `/professionals/jobs/${id}`,
    UPDATE_JOB_STATUS: (id: string) => `/professionals/jobs/${id}/status`,
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
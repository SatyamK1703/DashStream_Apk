
import { Platform } from 'react-native';

// Using a more secure way to handle environment variables is recommended,
// for example, using a library like react-native-config.
// For this example, we'll define them here, but they should be in a .env file.

const ENV = {
  development: {
    API_URL: Platform.OS === 'ios'
      ? 'http://localhost:5000/api'
      : 'http://10.0.2.2:5000/api',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  },
  staging: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  },
  production: {
    API_URL: 'https://api.dashstream.com/api',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  }
};

const getCurrentEnv = () => {
  if (__DEV__) return 'development';
  // Add logic to detect staging vs production
  return 'production';
};

export const config = ENV[getCurrentEnv()];

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    SOCIAL_LOGIN: '/auth/social-login',
  },

  // User Profile
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/delete-account',
    ADDRESSES: '/users/addresses',
    VEHICLES: '/users/vehicles',
  },

  // Services
  SERVICES: {
    LIST: '/services',
    DETAILS: (id: string) => `/services/${id}`,
    CATEGORIES: '/services/categories',
    POPULAR: '/services/popular',
    SEARCH: '/services/search',
    BY_CATEGORY: (categoryId: string) => `/services/category/${categoryId}`,
  },

  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    DETAILS: (id: string) => `/bookings/${id}`,
    UPDATE: (id: string) => `/bookings/${id}`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    RATING: (id: string) => `/bookings/${id}/rating`,
    TRACK: (id: string) => `/bookings/${id}/track`,
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    VERIFY: '/payments/verify',
    METHODS: '/payments/methods',
    ADD_METHOD: '/payments/methods',
    REMOVE_METHOD: (id: string) => `/payments/methods/${id}`,
    HISTORY: '/payments/history',
    REFUND: '/payments/refund',
    VALIDATE_PROMO: '/payments/validate-promo',
  },

  // Offers
  OFFERS: {
    ACTIVE: '/offers/active',
    ALL: '/offers',
    DETAILS: (id: string) => `/offers/${id}`,
    STATS: (id: string) => `/offers/${id}/stats`,
    APPLY: '/offers/apply',
    PERSONALIZED: '/offers',
    USAGE_HISTORY: '/offers/usage-history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
    PREFERENCES: '/notifications/preferences',
    REGISTER_FCM: '/notifications/register-fcm',
    UNREAD_COUNT: '/notifications/unread-count',
  },

  // Location
  LOCATION: {
    SEARCH: '/location/search',
    NEARBY: '/location/nearby',
    GEOCODE: '/location/geocode',
    REVERSE_GEOCODE: '/location/reverse-geocode',
    ROUTE: '/location/route',
    SERVICEABLE: '/location/serviceable',
    POPULAR: '/location/popular',
    FAVORITES: '/location/favorites',
  },

  // Vehicles
  VEHICLES: {
    LIST: '/vehicles',
    CREATE: '/vehicles',
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
    SET_DEFAULT: (id: string) => `/vehicles/${id}/set-default`,
    MAKES: '/vehicles/makes',
    MODELS: '/vehicles/models',
    YEARS: '/vehicles/years',
  },

  // Membership
  MEMBERSHIP: {
    PLANS: '/membership/plans',
    MY_MEMBERSHIP: '/membership/my-membership',
    PURCHASE: '/membership/purchase',
    VERIFY_PAYMENT: '/membership/verify-payment',
    CANCEL: '/membership/cancel',
    USAGE: '/membership/usage',
    BENEFITS: '/membership/benefits',
    RENEW: '/membership/renew',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE_TICKET: '/support/tickets',
    TICKET_DETAILS: (id: string) => `/support/tickets/${id}`,
    FAQ: '/support/faq',
    CONTACT: '/support/contact',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    SERVICES: '/admin/services',
    PROFESSIONALS: '/admin/professionals',
  },
};

export const APP_CONFIG = {
  APP_NAME: 'DashStream',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 30000,
  CACHE_DURATION: 5 * 60 * 1000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

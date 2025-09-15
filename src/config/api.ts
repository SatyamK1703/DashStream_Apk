// API Configuration
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: {
    development: 'https://dash-stream-apk-backend.vercel.app/api',
    staging: 'https://dash-stream-apk-backend.vercel.app/api',
    production: 'https://api.dashstream.com/api',
  },
  
  // Current environment
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
  
  // API Version
  VERSION: 'v1',
  
  // Authentication
  AUTH: {
    TOKEN_KEY: '@dashstream_token',
    REFRESH_TOKEN_KEY: '@dashstream_refresh_token',
    USER_KEY: '@dashstream_user',
  },
  
  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
  
  // File upload limits
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  
  // Cache settings
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    USER_PROFILE_TTL: 30 * 60 * 1000, // 30 minutes
    SERVICES_TTL: 60 * 60 * 1000, // 1 hour
  },
};

// Get current API base URL
export const getApiBaseUrl = (): string => {
  return API_CONFIG.BASE_URL[API_CONFIG.ENVIRONMENT as keyof typeof API_CONFIG.BASE_URL];
};

// API Endpoints
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
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    CHANGE_PASSWORD: '/user/change-password',
    DELETE_ACCOUNT: '/user/delete-account',
    ADDRESSES: '/user/addresses',
    VEHICLES: '/user/vehicles',
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
    APPLY: '/offers/apply',
    PERSONALIZED: '/offers/personalized',
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

  // Admin (if needed for customer app)
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    BOOKINGS: '/admin/bookings',
    SERVICES: '/admin/services',
    PROFESSIONALS: '/admin/professionals',
  },
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Request Headers
export const getDefaultHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-Version': API_CONFIG.VERSION,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Multipart form headers
export const getMultipartHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json',
    'X-API-Version': API_CONFIG.VERSION,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

// Error messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNAUTHORIZED: 'You are not authorized. Please login again.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

// Feature flags (for gradual rollout of features)
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_TRACKING: true,
  ENABLE_SOCIAL_LOGIN: true,
  ENABLE_MEMBERSHIP: true,
  ENABLE_CHAT_SUPPORT: false,
  ENABLE_VIDEO_CALLS: false,
  ENABLE_OFFLINE_MODE: false,
};
import { ENV_CONFIG } from '../config/environment';

export const API_CONFIG = {
  BASE_URL: ENV_CONFIG.API_BASE_URL,
  TIMEOUT: ENV_CONFIG.TIMEOUT,

  ENDPOINTS: {
    // ================= AUTH =================
    AUTH: {
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
      LOGOUT: '/auth/logout',
      ME: '/auth/me',
    },

    // ================= USERS =================
    USERS: {
      UPDATE_PROFILE: '/users/update-profile',
      UPDATE_PROFILE_IMAGE: '/users/update-profile-image',
      DELETE_ACCOUNT: '/users/delete-account',

      ADDRESSES: '/users/addresses',
      ADDRESS: '/users/addresses/:id',
      ADDRESS_SET_DEFAULT: '/users/addresses/:id/set-default',

      PROFESSIONAL_PROFILE: '/users/professional-profile',
      TOGGLE_AVAILABILITY: '/users/toggle-availability',

      PROFESSIONALS: '/users/professionals',
      PROFESSIONAL_DETAILS: '/users/professionals/:id',

      ADMIN: {
        LIST: '/users',
        CREATE: '/users',
        DETAILS: '/users/:id',
        UPDATE: '/users/:id',
        DELETE: '/users/:id',
        STATS: '/users/stats',
      },
    },

    // ================= BOOKINGS =================
    BOOKINGS: {
      MY: '/bookings/my-bookings',
      CREATE: '/bookings',
      DETAILS: '/bookings/:id',
      UPDATE_STATUS: '/bookings/:id/status',
      TRACKING: '/bookings/:id/tracking',
      RATE: '/bookings/:id/rate',
      STATS: '/bookings/stats',
      ADMIN_LIST: '/bookings',
    },

    // ================= ADMIN =================
    ADMIN: {
      DASHBOARD: '/admin/dashboard',

      USERS: {
        LIST: '/admin/users',
        DETAILS: '/admin/users/:userId',
        CREATE: '/admin/users',
        UPDATE: '/admin/users/:userId',
        DELETE: '/admin/users/:userId',
      },

      BOOKINGS: {
        LIST: '/admin/bookings',
        DETAILS: '/admin/bookings/:bookingId',
        UPDATE: '/admin/bookings/:bookingId',
      },

      SERVICES: {
        LIST: '/admin/services',
        CREATE: '/admin/services',
        UPDATE: '/admin/services/:serviceId',
        DELETE: '/admin/services/:serviceId',
      },
    },

    // ================= SERVICES =================
    SERVICES: {
      LIST: '/services',
      POPULAR: '/services/popular',
      TOP: '/services/top-services',
      CATEGORIES: '/services/categories',
      BY_CATEGORY: '/services/categories/:category',
      SEARCH: '/services/search',
      DETAILS: '/services/:id',

      ADMIN: {
        CREATE: '/services',
        UPDATE: '/services/:id',
        DELETE: '/services/:id',
        STATS: '/services/stats',
      },
    },

    // ================= OFFERS =================
    OFFERS: {
      ACTIVE: '/offers/active',
      FEATURED: '/offers/featured',
      VALIDATE: '/offers/validate/:code',
      DETAILS: '/offers/:id',
      USE: '/offers/:id/use',

      ADMIN: {
        LIST: '/offers',
        CREATE: '/offers',
        UPDATE: '/offers/:id',
        DELETE: '/offers/:id',
        ACTIVATE: '/offers/:id/activate',
        DEACTIVATE: '/offers/:id/deactivate',
        STATS: '/offers/stats',
      },
    },

    // ================= MEMBERSHIPS =================
    MEMBERSHIPS: {
      PLANS: '/membership/plans',
      STATUS: '/membership/status',
      PURCHASE: '/membership/purchase',
      AUTO_RENEW: '/membership/auto-renew',
      CANCEL: '/membership/cancel',
      HISTORY: '/membership/history',

      ADMIN: {
        CREATE_PLAN: '/membership/plans',
        UPDATE_PLAN: '/membership/plans/:id',
        ALL: '/membership/admin/all',
      },
    },

    // ================= PAYMENTS =================
    PAYMENTS: {
      WEBHOOK: '/payments/webhook',
      CREATE_ORDER: '/payments/create-order',
      VERIFY: '/payments/verify',
      USER_PAYMENTS: '/payments/user',
      DETAILS: '/payments/:id',
      REFUND: '/payments/:id/refund',
    },

    // ================= NOTIFICATIONS =================
    NOTIFICATIONS: {
      LIST: '/notifications',
      UNREAD_COUNT: '/notifications/unread-count',
      MARK_ALL_READ: '/notifications/mark-all-read',
      DELETE_READ: '/notifications/delete-read',
      MARK_AS_READ: '/notifications/:id/read',
      DELETE: '/notifications/:id',

      DEVICES: {
        REGISTER: '/notifications/register-device',
        DEREGISTER: '/notifications/deregister-device',
        MY_DEVICES: '/notifications/my-devices',
      },

      ADMIN: {
        CREATE: '/notifications',
        LIST: '/notifications/all',
        DELETE_EXPIRED: '/notifications/expired',
        CLEANUP_TOKENS: '/notifications/cleanup-tokens',
      },
    },

    // ================= LOCATION =================
    LOCATION: {
      UPDATE: '/location/update',
      STATUS: '/location/status',
      TRACKING: '/location/tracking',
      SETTINGS: '/location/settings',
      PROFESSIONAL: '/location/professional/:id',
      HISTORY: '/location/professional/:id/history',
      NEARBY: '/location/nearby',
      SUBSCRIBE: '/location/subscribe/:professionalId',
      UNSUBSCRIBE: '/location/unsubscribe/:professionalId',

      NOTIFICATIONS: {
        SEND: '/location/notifications/send',
        SEND_MULTICAST: '/location/notifications/send-multicast',
      },
    },

    // ================= PROFESSIONAL =================
    PROFESSIONAL: {
      JOBS: '/professional/jobs',
      JOB_DETAILS: '/professional/jobs/:jobId',
      UPDATE_JOB_STATUS: '/professional/jobs/:jobId/status',
      DASHBOARD: '/professional/dashboard',
      PROFILE: '/professional/profile',
      UPDATE_PROFILE: '/professional/profile',
    },

    // ================= VEHICLES =================
    VEHICLES: {
      LIST: '/vehicles',
      CREATE: '/vehicles',
      DEFAULT: '/vehicles/default',
      DETAILS: '/vehicles/:id',
      UPDATE: '/vehicles/:id',
      DELETE: '/vehicles/:id',
      SET_DEFAULT: '/vehicles/:id/set-default',
      UPLOAD_IMAGE: '/vehicles/:id/upload-image',
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
    FIREBASE_AUTH_METHOD: '@DashStream:firebaseAuthMethod',
  },
};
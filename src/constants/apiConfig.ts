// // API Configuration Constants
// export const API_CONFIG = {
//   // Base endpoints
//   BASE_URL: 'https://dash-stream-apk-backend.vercel.app/api',
  
//   // Timeout settings
//   TIMEOUT: 30000,
//   REQUEST_TIMEOUT: 15000,
  
//   // Retry settings
//   MAX_RETRIES: 3,
//   RETRY_DELAY: 1000,
  
//   // Token settings
//   TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
//   SESSION_CHECK_INTERVAL: 60000, // 1 minute
  
//   // API Endpoints
//   ENDPOINTS: {
//     // Authentication
//     AUTH: {
//       SEND_OTP: '/auth/send-otp',
//       VERIFY_OTP: '/auth/verify-otp',
//       REFRESH_TOKEN: '/auth/refresh-token',
//       LOGOUT: '/auth/logout',
//       ME: '/auth/me',
//       VERIFY_TOKEN: '/auth/verify-token',
//       HEALTH: '/auth/health'
//     },
    
//     // User Management
//     USERS: {
//       PROFILE: '/users/profile',
//       UPDATE_PROFILE: '/users/profile',
//       CHANGE_PASSWORD: '/users/change-password',
//       ADDRESSES: '/users/addresses',
//       VEHICLES: '/users/vehicles'
//     },
    
//     // Services
//     SERVICES: {
//       LIST: '/services',
//       CATEGORIES: '/services/categories',
//       DETAILS: '/services',
//       SEARCH: '/services/search',
//       POPULAR: '/services/popular'
//     },
    
//     // Bookings
//     BOOKINGS: {
//       CREATE: '/bookings',
//       LIST: '/bookings',
//       DETAILS: '/bookings',
//       UPDATE: '/bookings',
//       CANCEL: '/bookings',
//       HISTORY: '/bookings/history',
//       STATUS: '/bookings/status'
//     },
    
//     // Professionals
//     PROFESSIONALS: {
//       LIST: '/professional',
//       DETAILS: '/professional',
//       NEARBY: '/professional/nearby',
//       AVAILABILITY: '/professional/availability',
//       REVIEWS: '/professional/reviews'
//     },
    
//     // Payments
//     PAYMENTS: {
//       CREATE_ORDER: '/payments/create-order',
//       VERIFY_PAYMENT: '/payments/verify',
//       HISTORY: '/payments/history',
//       METHODS: '/payments/methods'
//     },
    
//     // Location
//     LOCATION: {
//       SEARCH: '/location/search',
//       AUTOCOMPLETE: '/location/autocomplete',
//       DETAILS: '/location/details'
//     },
    
//     // Offers
//     OFFERS: {
//       LIST: '/offers',
//       DETAILS: '/offers',
//       APPLY: '/offers/apply',
//       ACTIVE: '/offers/active'
//     },
    
//     // Notifications
//     NOTIFICATIONS: {
//       LIST: '/notifications',
//       MARK_READ: '/notifications/read',
//       SETTINGS: '/notifications/settings'
//     },
    
//     // Membership
//     MEMBERSHIP: {
//       PLANS: '/membership/plans',
//       SUBSCRIBE: '/membership/subscribe',
//       STATUS: '/membership/status'
//     },
    
//     // Vehicles
//     VEHICLES: {
//       LIST: '/vehicles',
//       ADD: '/vehicles',
//       UPDATE: '/vehicles',
//       DELETE: '/vehicles'
//     },
    
//     // Admin (if needed)
//     ADMIN: {
//       DASHBOARD: '/admin/dashboard',
//       USERS: '/admin/users',
//       BOOKINGS: '/admin/bookings',
//       ANALYTICS: '/admin/analytics'
//     }
//   },
  
//   // HTTP Status Codes
//   STATUS_CODES: {
//     OK: 200,
//     CREATED: 201,
//     BAD_REQUEST: 400,
//     UNAUTHORIZED: 401,
//     FORBIDDEN: 403,
//     NOT_FOUND: 404,
//     CONFLICT: 409,
//     TOO_MANY_REQUESTS: 429,
//     INTERNAL_SERVER_ERROR: 500,
//     SERVICE_UNAVAILABLE: 503
//   },
  
//   // Error Types
//   ERROR_TYPES: {
//     NETWORK: 'network',
//     AUTHENTICATION: 'authentication',
//     VALIDATION: 'validation',
//     SERVER: 'server',
//     CLIENT: 'client',
//     TIMEOUT: 'timeout'
//   }
// } as const;

// // Export commonly used values
// export const { ENDPOINTS, STATUS_CODES, ERROR_TYPES } = API_CONFIG;
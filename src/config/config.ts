
import { Platform } from 'react-native';

// Using a more secure way to handle environment variables is recommended,
// for example, using a library like react-native-config.
// For this example, we'll define them here, but they should be in a .env file.

const ENV = {
  development: {
    API_URL: Platform.OS === 'ios'
      ? 'https://dash-stream-apk-backend.vercel.app/api'
      : 'https://dash-stream-apk-backend.vercel.app/api',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  },
  staging: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID',
  },
  production: {
    API_URL: 'https://dash-stream-apk-backend.vercel.app/api',
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
    SEND_OTP: '/auth/send-otp',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_TOKEN: '/auth/verify-token',
  },

  // User Profile
  USERS: {
    PROFILE: '/users/update-profile',
    PROFILE_IMAGE: '/users/update-profile-image',
    CHANGE_PASSWORD: '/users/change-password',
    DELETE_ACCOUNT: '/users/delete-account',
    PROFESSIONALS: '/users/professionals',
    PROFESSIONAL_DETAILS: (id: string) => `/users/professionals/${id}`,
  },

  // Services
  SERVICES: {
    ALL: '/services',
    LIST: '/services',
    UPDATE: (id: string) => `/services/${id}`,
    CREATE: '/services',
    DETAILS: (id: string) => `/services/${id}`,
    BY_ID: (id: string) => `/services/${id}`,
    CATEGORIES: '/services/categories',
    POPULAR: '/services/popular',
    SEARCH: '/services/search',
    BY_CATEGORY: (categoryId: string) => `/services/category/${categoryId}`,
    TOP_SERVICES: '/services/top',
  },

  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    BY_ID: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    RATING: (id: string) => `/bookings/${id}/rating`,
    TRACK: (id: string) => `/bookings/${id}/track`,
  },

  // Payments
  PAYMENTS: {
    CREATE_ORDER: '/payments/create-order',
    CREATE_PAYMENT_LINK: '/payments/create-payment-link',
    VERIFY_PAYMENT: '/payments/verify',
    PAYMENT_METHODS: '/payments/methods',
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
    BY_ID: (id: string) => `/offers/${id}`,
    STATS: (id: string) => `/offers/${id}/stats`,
    APPLY: '/offers/apply',
    PERSONALIZED: '/offers',
    USAGE_HISTORY: '/offers/usage-history',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    ALL: '/notifications/all',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    CLEAR_ALL: '/notifications/clear-all',
    PREFERENCES: '/notifications/preferences',
    REGISTER_FCM: '/notifications/register-fcm',
    UNREAD_COUNT: '/notifications/unread-count',
    AREA_REQUEST: '/notifications/area-request',
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
    CREATE: '/vehicles',
    MY_VEHICLES: '/vehicles',
    UPDATE: (id: string) => `/vehicles/${id}`,
    DELETE: (id: string) => `/vehicles/${id}`,
    SET_DEFAULT: (id: string) => `/vehicles/${id}/set-default`,
    MAKES: '/vehicles/makes',
    MODELS: '/vehicles/models',
    YEARS: '/vehicles/years',
  },

  // Addresses
  ADDRESSES: {
    ALL: '/addresses',
    CREATE: '/addresses',
    BY_ID: (id: string) => `/addresses/${id}`,
    SET_DEFAULT: (id: string) => `/addresses/${id}/set-default`,
  },

  // Membership
  MEMBERSHIPS: {
    PLANS: '/memberships/plans',
    STATUS: '/memberships/status',
    PURCHASE: '/memberships/purchase',
    AUTO_RENEW: '/memberships/auto-renew',
    CANCEL: '/memberships/cancel',
    HISTORY: '/memberships/history',
    VERIFY_PAYMENT: '/memberships/verify-payment',
    USAGE: '/memberships/usage',
    BENEFITS: '/memberships/benefits',
    RENEW: '/memberships/renew',
  },

  // Support
  SUPPORT: {
    QUESTIONS: '/support/questions',
  },

  // Professionals
  PROFESSIONALS: {
    JOBS: '/professionals/jobs',
    JOB_BY_ID: (jobId: string) => `/professionals/jobs/${jobId}`,
    UPDATE_JOB_STATUS: (jobId: string) => `/professionals/jobs/${jobId}/status`,
    DASHBOARD: '/professionals/dashboard',
    PROFILE: '/professionals/profile',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    STATS: '/admin/dashboard',
    USERS: '/admin/users',
    CREATE_USER: '/admin/users',
    USER_BY_ID: (userId: string) => `/admin/users/${userId}`,
    USER_DETAILS: (userId: string) => `/admin/users/${userId}`,
    UPDATE_USER: (userId: string) => `/admin/users/${userId}`,
    DELETE_USER: (userId: string) => `/admin/users/${userId}`,
    BOOKINGS: '/admin/bookings',
    BOOKING_BY_ID: (bookingId: string) => `/admin/bookings/${bookingId}`,
    UPDATE_BOOKING_STATUS: (bookingId: string) => `/admin/bookings/${bookingId}/status`,
    CANCEL_BOOKING: (bookingId: string) => `/admin/bookings/${bookingId}/cancel`,

    SERVICES: '/admin/services',
    CREATE_SERVICE: '/admin/services',
    SERVICE_BY_ID: (serviceId: string) => `/admin/services/${serviceId}`,
    UPDATE_SERVICE: (serviceId: string) => `/admin/services/${serviceId}`,
    DELETE_SERVICE: (serviceId: string) => `/admin/services/${serviceId}`,

    PROFESSIONALS: '/admin/professionals',
    CREATE_PROFESSIONAL: '/admin/professionals',
    ASSIGN_PROFESSIONAL: (bookingId: string) => `/admin/bookings/${bookingId}/assign-professional`,
    AVAILABLE_PROFESSIONALS: (bookingId: string) => `/admin/bookings/${bookingId}/available-professionals`,
    VERIFY_PROFESSIONAL: (professionalId: string) => `/admin/professionals/${professionalId}/verification`,
    PROFESSIONAL_BY_ID: (professionalId: string) => `/admin/professionals/${professionalId}`,

  },
};

export const SCREEN_TEXTS = {
  ProDashboard: {
    greeting: 'Hello, ',
    defaultName: 'Professional',
    todayEarnings: "Today's Earnings",
    jobsToday: 'Jobs Today',
    goOnline: 'Go Online',
    online: 'Online',
    statusUpdated: 'Status Updated',
    statusUpdateError: 'Failed to update status. Please try again.',
    jobAccepted: 'Job accepted successfully!',
    jobAcceptError: 'Failed to accept job. Please try again.',
    upcomingJobs: 'Upcoming Jobs',
    viewAll: 'View All',
    noUpcomingJobs: 'No upcoming jobs',
    goOnlineToReceiveJobs: 'Go online to receive jobs',
    newJobsWillAppear: 'New jobs will appear here',
    earningsSummary: 'Earnings Summary',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    pending: 'Pending',
    lastPayout: 'Last Payout',
    performanceMetrics: 'Performance Metrics',
    rating: 'Rating',
    completion: 'Completion',
    onTime: 'On Time',
    jobs: 'Jobs',
    loadingDashboard: 'Loading dashboard...',
    failedToLoadDashboard: 'Failed to load dashboard',
    retry: 'Retry',
  },
  ProJobs: {
    myJobs: 'My Jobs',
    searchPlaceholder: 'Search by customer, job ID, etc.',
    all: 'All',
    pending: 'Pending',
    confirmed: 'Confirmed',
    inProgress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noJobsFound: 'No jobs found',
    noJobsMatching: 'No jobs matching',
    clearFilters: 'Clear Filters',
  },
  ProJobDetails: {
    job: 'Job',
    confirmStatusChange: 'Are you sure you want to',
    thisJob: 'this job?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    successfully: 'successfully',
    failedTo: 'Failed to',
    pleaseTryAgain: 'Please try again.',
    jobNotFound: 'Job Not Found',
    goBack: 'Go Back',
    jobDetails: 'Job Details',
    yourLocation: 'Your Location',
    jobInformation: 'Job Information',
    date: 'Date',
    time: 'Time',
    address: 'Address',
    specialInstructions: 'Special Instructions',
    vehicle: 'Vehicle',
    services: 'Services',
    totalAmount: 'Total Amount',
    call: 'Call',
    acceptJob: 'Accept Job',
    startJob: 'Start Job',
    markAsCompleted: 'Mark as Completed',
    backToJobs: 'Back to Jobs',
    statusPending: 'Pending',
    statusConfirmed: 'Confirmed',
    statusAssigned: 'Assigned',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusCancelled: 'Cancelled',
    statusRejected: 'Rejected',
    statusUnknown: 'Unknown',
  }
};

export const APP_CONFIG = {
  APP_NAME: 'DashStream',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 30000,
  CACHE_DURATION: 5 * 60 * 1000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

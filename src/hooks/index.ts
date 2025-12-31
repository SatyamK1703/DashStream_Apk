// Base API hooks
export * from './useApi';

// Service hooks
export * from './useServices';

// Booking hooks
export * from './useBookings';

// User hooks
export * from './useUser';

// Vehicle hooks
export * from './useVehicles';

// Payment hooks
export * from './usePayments';

// Offer hooks
export * from './useOffers';

// Notification hooks
export * from './useNotifications';

// Location hooks
export * from './useLocation';

// Membership hooks
export * from './useMembership';

// Admin hooks
export * from './useAdmin';

// Testimonial hooks
export * from './useTestimonials';

// Testimonial types
export type { Testimonial } from '../services/testimonialService';

// Re-export commonly used types
export type {
  Service,
  ServiceCategory,
  Booking,
  User as ApiUser,
  Address,
  Vehicle,
  Offer,
  Notification,
  Membership,
  UserMembership,
  Payment,
} from '../types/api';
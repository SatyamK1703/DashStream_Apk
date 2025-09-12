// Services Index - Export all services
export { default as productionAuthService } from './productionAuthService';
export { default as unifiedApiService } from './unifiedApiService';
export { default as bookingService } from './bookingService';
export { default as servicesService } from './servicesService';
export { default as professionalService } from './professionalService';
export { default as userService } from './userService';
export { default as enhancedPaymentService } from './enhancedPaymentService';

// Import existing services if they exist (fallback to original names)
export { default as locationService } from './locationService';
export { default as notificationService } from './notificationService';

// Legacy payment service export for backward compatibility
export * as paymentService  from './paymentService';

// Export types
export type {
  // Auth types
  User,
  AuthState,
  AuthResponse,
  OtpResponse
} from './productionAuthService';

export type {
  // API types
  ApiResponse,
  ApiError
} from './unifiedApiService';

export type {
  // Booking types
  Booking,
  BookingData,
  BookingResponse,
  BookingListResponse,
  BookingFilter,
  Vehicle,
  Location
} from './bookingService';

export type {
  // Services types
  Service,
  ServiceCategory,
  ServiceResponse,
  ServicesListResponse,
  ServiceFilter
} from './servicesService';

export type {
  // Professional types
  Professional,
  ProfessionalResponse,
  ProfessionalsListResponse,
  ProfessionalFilter
} from './professionalService';

export type {
  // User types
  UserProfile,
  Address,
  Vehicle as UserVehicle,
  UserResponse,
  AddressResponse,
  VehicleResponse
} from './userService';

export type {
  // Payment types
  PaymentOrder,
  PaymentDetails,
  RazorpayResponse,
  PaymentVerification,
  Payment,
  PaymentResponse,
  PaymentListResponse,
  PaymentMethod
} from './enhancedPaymentService';
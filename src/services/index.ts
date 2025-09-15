// Services Index - Export all services currently in use
export { default as bookingService } from './bookingService';
export { default as professionalService } from './professionalService';
export { default as userService } from './userService';
export { default as locationService } from './locationService';
export { default as notificationService } from './notificationService';
export { default as dataService } from './dataService';
export { default as apiService } from './apiService';

// Payment service export for backward compatibility
export * as paymentService from './paymentService';

// Export types from actual services
export type {
  // API types from apiService
  ApiResponse,
  ApiError
} from './apiService';

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
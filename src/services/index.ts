// API Services - Production Ready
// Import services first
import { authService as _authService } from './authService';
import { userService as _userService } from './userService';
import { serviceService as _serviceService } from './serviceService';
import { bookingService as _bookingService } from './bookingService';
import { paymentService as _paymentService } from './paymentService';
import { vehicleService as _vehicleService } from './vehicleService';
import { offerService as _offerService } from './offerService';
import { notificationService as _notificationService } from './notificationService';
import { membershipService as _membershipService } from './membershipService';
import { locationService as _locationService } from './locationService';
import { adminService as _adminService } from './adminService';
import { professionalService as _professionalService } from './professionalService';
import { addressService as _addressService } from './addressService';

export { default as httpClient } from './httpClient';
export type { ApiResponse, ApiError } from './httpClient';

// Then export them
export const authService = _authService;
export const userService = _userService;
export const serviceService = _serviceService;
export const bookingService = _bookingService;
export const paymentService = _paymentService;
export const vehicleService = _vehicleService;
export const offerService = _offerService;
export const notificationService = _notificationService;
export const membershipService = _membershipService;
export const locationService = _locationService;
export const adminService = _adminService;
export const professionalService = _professionalService;
export const addressService = _addressService;

// Re-export types
export * from '../types/api';

// Service API Class (for centralized access)
class ServiceAPI {
  auth = _authService;
  user = _userService;
  service = _serviceService;
  booking = _bookingService;
  payment = _paymentService;
  vehicle = _vehicleService;
  offer = _offerService;
  notification = _notificationService;
  membership = _membershipService;
  location = _locationService;
  admin = _adminService;
  professional = _professionalService;
  address = _addressService;
}

// Export singleton instance
export const api = new ServiceAPI();
export default api;
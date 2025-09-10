// All API Services - Comprehensive backend integration
import unifiedApiService, { ApiResponse } from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';

// Types for API responses
export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  image: string;
  icon: string;
  services: Service[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
  image: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  features: string[];
}

export interface Booking {
  id: string;
  service: Service;
  professional?: Professional;
  user: any;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  address: Address;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  availability: any;
  location: {
    coordinates: [number, number];
    address: string;
  };
  isActive: boolean;
  isVerified: boolean;
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  landmark?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isDefault: boolean;
}

export interface Vehicle {
  id?: string;
  type: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'wallet' | 'netbanking';
  details: any;
  isDefault: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_service';
  value: number;
  code: string;
  validFrom: string;
  validUntil: string;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  applicableServices: string[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in days
  benefits: string[];
  discount: number;
  isPopular: boolean;
  isActive: boolean;
}

// Auth API Service
export class AuthApiService {
  static async getCurrentUser(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  static async verifyToken(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
  }

  static async refreshToken(refreshToken: string): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, { refreshToken });
  }

  static async logout(): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  }
}

// User API Service
export class UserApiService {
  static async getProfile(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  static async updateProfile(data: any): Promise<ApiResponse<any>> {
    return unifiedApiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, data);
  }

  static async getAddresses(): Promise<ApiResponse<Address[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.USERS.ADDRESSES);
  }

  static async addAddress(address: Omit<Address, 'id'>): Promise<ApiResponse<Address>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.USERS.ADDRESSES, address);
  }

  static async updateAddress(id: string, address: Partial<Address>): Promise<ApiResponse<Address>> {
    return unifiedApiService.put(`${API_CONFIG.ENDPOINTS.USERS.ADDRESSES}/${id}`, address);
  }

  static async deleteAddress(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.delete(`${API_CONFIG.ENDPOINTS.USERS.ADDRESSES}/${id}`);
  }

  static async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.USERS.VEHICLES);
  }

  static async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<ApiResponse<Vehicle>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.USERS.VEHICLES, vehicle);
  }

  static async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return unifiedApiService.put(`${API_CONFIG.ENDPOINTS.USERS.VEHICLES}/${id}`, vehicle);
  }

  static async deleteVehicle(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.delete(`${API_CONFIG.ENDPOINTS.USERS.VEHICLES}/${id}`);
  }
}

// Service API Service
export class ServiceApiService {
  static async getServices(params?: { category?: string; search?: string; limit?: number; page?: number }): Promise<ApiResponse<Service[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.SERVICES.LIST, { params });
  }

  static async getServiceCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.SERVICES.CATEGORIES);
  }

  static async getServiceDetails(id: string): Promise<ApiResponse<Service>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.SERVICES.DETAILS}/${id}`);
  }

  static async searchServices(query: string, filters?: any): Promise<ApiResponse<Service[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.SERVICES.SEARCH, { params: { q: query, ...filters } });
  }

  static async getPopularServices(): Promise<ApiResponse<Service[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.SERVICES.POPULAR);
  }
}

// Booking API Service
export class BookingApiService {
  static async createBooking(bookingData: any): Promise<ApiResponse<Booking>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, bookingData);
  }

  static async getBookings(status?: string): Promise<ApiResponse<Booking[]>> {
    const params = status ? { status } : undefined;
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.BOOKINGS.LIST, { params });
  }

  static async getBookingDetails(id: string): Promise<ApiResponse<Booking>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.BOOKINGS.DETAILS}/${id}`);
  }

  static async updateBooking(id: string, data: any): Promise<ApiResponse<Booking>> {
    return unifiedApiService.put(`${API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE}/${id}`, data);
  }

  static async cancelBooking(id: string, reason?: string): Promise<ApiResponse<any>> {
    return unifiedApiService.patch(`${API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL}/${id}`, { reason });
  }

  static async getBookingHistory(page?: number, limit?: number): Promise<ApiResponse<Booking[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.BOOKINGS.HISTORY, { 
      params: { page, limit } 
    });
  }

  static async trackBooking(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.BOOKINGS.STATUS}/${id}`);
  }
}

// Professional API Service
export class ProfessionalApiService {
  static async getProfessionals(params?: { 
    serviceId?: string; 
    location?: { lat: number; lng: number }; 
    radius?: number 
  }): Promise<ApiResponse<Professional[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.PROFESSIONALS.LIST, { params });
  }

  static async getNearbyProfessionals(
    location: { lat: number; lng: number }, 
    serviceId?: string, 
    radius?: number
  ): Promise<ApiResponse<Professional[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.PROFESSIONALS.NEARBY, {
      params: { lat: location.lat, lng: location.lng, serviceId, radius }
    });
  }

  static async getProfessionalDetails(id: string): Promise<ApiResponse<Professional>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.PROFESSIONALS.DETAILS}/${id}`);
  }

  static async getProfessionalAvailability(
    id: string, 
    date?: string
  ): Promise<ApiResponse<any>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.PROFESSIONALS.AVAILABILITY}/${id}`, {
      params: date ? { date } : undefined
    });
  }

  static async getProfessionalReviews(id: string): Promise<ApiResponse<any[]>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.PROFESSIONALS.REVIEWS}/${id}`);
  }
}

// Payment API Service
export class PaymentApiService {
  static async createPaymentOrder(data: {
    bookingId: string;
    amount: number;
    currency: string;
  }): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.CREATE_ORDER, data);
  }

  static async verifyPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.VERIFY_PAYMENT, data);
  }

  static async getPaymentHistory(): Promise<ApiResponse<any[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.HISTORY);
  }

  static async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.PAYMENTS.METHODS);
  }

  static async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<ApiResponse<PaymentMethod>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.PAYMENTS.METHODS, method);
  }

  static async deletePaymentMethod(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.delete(`${API_CONFIG.ENDPOINTS.PAYMENTS.METHODS}/${id}`);
  }
}

// Location API Service
export class LocationApiService {
  static async searchLocations(query: string): Promise<ApiResponse<any[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.LOCATION.SEARCH, {
      params: { q: query }
    });
  }

  static async getLocationAutocomplete(input: string): Promise<ApiResponse<any[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.LOCATION.AUTOCOMPLETE, {
      params: { input }
    });
  }

  static async getLocationDetails(placeId: string): Promise<ApiResponse<any>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.LOCATION.DETAILS}/${placeId}`);
  }
}

// Offer API Service
export class OfferApiService {
  static async getOffers(): Promise<ApiResponse<Offer[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.OFFERS.LIST);
  }

  static async getOfferDetails(id: string): Promise<ApiResponse<Offer>> {
    return unifiedApiService.get(`${API_CONFIG.ENDPOINTS.OFFERS.DETAILS}/${id}`);
  }

  static async applyOffer(code: string, bookingData: any): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.OFFERS.APPLY, { code, bookingData });
  }

  static async getActiveOffers(): Promise<ApiResponse<Offer[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.OFFERS.ACTIVE);
  }

  static async validateOfferCode(code: string): Promise<ApiResponse<any>> {
    return unifiedApiService.post(`${API_CONFIG.ENDPOINTS.OFFERS.LIST}/validate`, { code });
  }
}

// Notification API Service
export class NotificationApiService {
  static async getNotifications(page?: number, limit?: number): Promise<ApiResponse<Notification[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.LIST, {
      params: { page, limit }
    });
  }

  static async markAsRead(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.patch(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ}/${id}`);
  }

  static async markAllAsRead(): Promise<ApiResponse<any>> {
    return unifiedApiService.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ);
  }

  static async getNotificationSettings(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.SETTINGS);
  }

  static async updateNotificationSettings(settings: any): Promise<ApiResponse<any>> {
    return unifiedApiService.put(API_CONFIG.ENDPOINTS.NOTIFICATIONS.SETTINGS, settings);
  }
}

// Membership API Service
export class MembershipApiService {
  static async getMembershipPlans(): Promise<ApiResponse<MembershipPlan[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.MEMBERSHIP.PLANS);
  }

  static async subscribeToPlan(planId: string): Promise<ApiResponse<any>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.MEMBERSHIP.SUBSCRIBE, { planId });
  }

  static async getMembershipStatus(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.MEMBERSHIP.STATUS);
  }

  static async cancelMembership(): Promise<ApiResponse<any>> {
    return unifiedApiService.delete(API_CONFIG.ENDPOINTS.MEMBERSHIP.STATUS);
  }
}

// Vehicle API Service (extended)
export class VehicleApiService {
  static async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.VEHICLES.LIST);
  }

  static async addVehicle(vehicle: Omit<Vehicle, 'id'>): Promise<ApiResponse<Vehicle>> {
    return unifiedApiService.post(API_CONFIG.ENDPOINTS.VEHICLES.ADD, vehicle);
  }

  static async updateVehicle(id: string, vehicle: Partial<Vehicle>): Promise<ApiResponse<Vehicle>> {
    return unifiedApiService.put(`${API_CONFIG.ENDPOINTS.VEHICLES.UPDATE}/${id}`, vehicle);
  }

  static async deleteVehicle(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.delete(`${API_CONFIG.ENDPOINTS.VEHICLES.DELETE}/${id}`);
  }

  static async setDefaultVehicle(id: string): Promise<ApiResponse<any>> {
    return unifiedApiService.patch(`${API_CONFIG.ENDPOINTS.VEHICLES.UPDATE}/${id}/default`);
  }
}

// Admin API Service (if user has admin role)
export class AdminApiService {
  static async getDashboardStats(): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD);
  }

  static async getUsers(page?: number, limit?: number): Promise<ApiResponse<any[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.ADMIN.USERS, {
      params: { page, limit }
    });
  }

  static async getBookings(status?: string, page?: number, limit?: number): Promise<ApiResponse<Booking[]>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.ADMIN.BOOKINGS, {
      params: { status, page, limit }
    });
  }

  static async getAnalytics(period?: string): Promise<ApiResponse<any>> {
    return unifiedApiService.get(API_CONFIG.ENDPOINTS.ADMIN.ANALYTICS, {
      params: { period }
    });
  }
}

// Main API Service Class that combines all services
export class AllApiServices {
  static Auth = AuthApiService;
  static User = UserApiService;
  static Service = ServiceApiService;
  static Booking = BookingApiService;
  static Professional = ProfessionalApiService;
  static Payment = PaymentApiService;
  static Location = LocationApiService;
  static Offer = OfferApiService;
  static Notification = NotificationApiService;
  static Membership = MembershipApiService;
  static Vehicle = VehicleApiService;
  static Admin = AdminApiService;

  // Utility methods
  static async healthCheck(): Promise<ApiResponse<any>> {
    return unifiedApiService.get('/health');
  }

  static async getAppConfig(): Promise<ApiResponse<any>> {
    return unifiedApiService.get('/config');
  }

  // Batch operations
  static async batchRequest(requests: Array<{
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    data?: any;
  }>): Promise<ApiResponse<any[]>> {
    return unifiedApiService.post('/batch', { requests });
  }
}

// Export individual services and main service
export {
  AuthApiService,
  UserApiService,
  ServiceApiService,
  BookingApiService,
  ProfessionalApiService,
  PaymentApiService,
  LocationApiService,
  OfferApiService,
  NotificationApiService,
  MembershipApiService,
  VehicleApiService,
  AdminApiService
};

// Export as default
export default AllApiServices;
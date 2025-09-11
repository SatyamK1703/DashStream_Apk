import apiService, { ApiResponse } from './apiService';
import { Service, ServiceCategory } from '../types/ServiceType';
import { Booking } from '../types/BookingType';
import { Offer } from '../types/OfferType';
import { User, Professional } from '../types/UserType';
import { Payment } from '../types/PaymentType';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Location service types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp?: number;
  status?: 'available' | 'busy' | 'offline';
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  type: 'enter' | 'exit' | 'both';
}

// Location API Service
export class LocationApiService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async initialize(): Promise<void> {
    // Initialize location service
    console.log('Location service initialized for user:', this.userId);
  }

  async startTracking(): Promise<boolean> {
    try {
      // Start location tracking
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  async stopTracking(): Promise<void> {
    try {
      // Stop location tracking
      console.log('Location tracking stopped');
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }

  async updateStatus(status: 'available' | 'busy' | 'offline'): Promise<void> {
    try {
      await apiService.post('/location/status', { status });
    } catch (error) {
      console.error('Error updating location status:', error);
    }
  }

  async getLocationHistory(limit?: number): Promise<LocationData[]> {
    try {
      const response = await apiService.get('/location/history', { limit });
      return response.data || [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  async addGeofence(geofence: Omit<Geofence, 'id'>): Promise<void> {
    try {
      await apiService.post('/location/geofences', geofence);
    } catch (error) {
      console.error('Error adding geofence:', error);
    }
  }

  async removeGeofence(geofenceId: string): Promise<boolean> {
    try {
      await apiService.delete(`/location/geofences/${geofenceId}`);
      return true;
    } catch (error) {
      console.error('Error removing geofence:', error);
      return false;
    }
  }

  async updateTrackingSettings(options: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
  }): Promise<void> {
    try {
      await apiService.post('/location/settings', options);
    } catch (error) {
      console.error('Error updating tracking settings:', error);
    }
  }
}

// Dashboard statistics interface
interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProfessionals: number;
  recentBookings: Booking[];
  popularServices: Service[];
}

class DataService {
  // Local storage keys
  private readonly USER_STORAGE_KEY = '@DashStream:user';
  
  // Authentication endpoints
  async sendOtp(phone: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/auth/send-otp', { phone });
  }

  async verifyOtp(phone: string, otp: string): Promise<ApiResponse<{ token: string; refreshToken?: string; user: User }>> {
    const response = await apiService.post<{ token: string; refreshToken?: string; user: User }>('/auth/verify-otp', { phone, otp });
    
    if (response.success && response.data) {
      // Save tokens to API service
      const { token, refreshToken, user } = response.data;
      await apiService.setTokens(token, refreshToken);
      
      // Save user to local storage
      if (user) {
        await this.setCurrentUser(user);
      }
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    const response = await apiService.post('/auth/logout');
    
    // Clear local data regardless of API response
    await this.clearUserData();
    
    return response;
  }
  
  // Local storage methods
  async setCurrentUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
      throw error;
    }
  }
  
  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_STORAGE_KEY);
      apiService.clearAuthToken();
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  // User endpoints
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get from API
      const response = await apiService.get<User>('/users/me');
      
      if (response.success && response.data) {
        // Update local storage with latest user data
        await this.setCurrentUser(response.data);
        return response.data;
      }
      
      // If API fails, try to get from local storage
      const userJson = await AsyncStorage.getItem(this.USER_STORAGE_KEY);
      if (userJson) {
        return JSON.parse(userJson) as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      
      // Try to get from local storage as fallback
      try {
        const userJson = await AsyncStorage.getItem(this.USER_STORAGE_KEY);
        if (userJson) {
          return JSON.parse(userJson) as User;
        }
      } catch (storageError) {
        console.error('Error getting user from storage:', storageError);
      }
      
      return null;
    }
  }

  async updateUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.patch('/users/me', userData);
  }

  async getAllUsers(params?: { role?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>> {
    return apiService.get('/users', params);
  }

  async getUserById(userId: string): Promise<ApiResponse<User>> {
    return apiService.get(`/users/${userId}`);
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.post('/users', userData);
  }

  async updateUserById(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.patch(`/users/${userId}`, userData);
  }

  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/users/${userId}`);
  }

  // Professional endpoints
  async getAllProfessionals(params?: { search?: string; serviceArea?: string; service?: string; page?: number; limit?: number }): Promise<ApiResponse<{ professionals: Professional[]; total: number; page: number; limit: number }>> {
    return apiService.get('/professionals', params);
  }

  async getProfessionalById(professionalId: string): Promise<ApiResponse<Professional>> {
    return apiService.get(`/professionals/${professionalId}`);
  }

  async updateProfessionalProfile(profileData: Partial<Professional>): Promise<ApiResponse<Professional>> {
    return apiService.patch('/professionals/profile', profileData);
  }

  async updateProfessionalLocation(location: { latitude: number; longitude: number }): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/professionals/location', location);
  }

  async getNearbyProfessionals(params: { latitude: number; longitude: number; radius?: number }): Promise<ApiResponse<Professional[]>> {
    return apiService.get('/professionals/nearby', params);
  }

  // Service endpoints
  async getAllServices(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ services: Service[]; total: number; page: number; limit: number }>> {
    return apiService.get('/services', params);
  }

  async getServiceById(serviceId: string): Promise<ApiResponse<Service>> {
    return apiService.get(`/services/${serviceId}`);
  }

  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return apiService.post('/services', serviceData);
  }

  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return apiService.patch(`/services/${serviceId}`, serviceData);
  }

  async deleteService(serviceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/services/${serviceId}`);
  }

  async getAllServiceCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    return apiService.get('/services/categories');
  }

  // Booking endpoints
  async createBooking(bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return apiService.post('/bookings', bookingData);
  }

  async getAllBookings(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    return apiService.get('/bookings', params);
  }

  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.get(`/bookings/${bookingId}`);
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    return apiService.patch(`/bookings/${bookingId}/status`, { status });
  }

  async getUserBookings(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    return apiService.get('/bookings/my-bookings', params);
  }

  async getProfessionalBookings(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    return apiService.get('/bookings/professional', params);
  }

  // Offer endpoints
  async getAllOffers(params?: { active?: boolean; page?: number; limit?: number }): Promise<ApiResponse<{ offers: Offer[]; total: number; page: number; limit: number }>> {
    return apiService.get('/offers', params);
  }

  async getOfferById(offerId: string): Promise<ApiResponse<Offer>> {
    return apiService.get(`/offers/${offerId}`);
  }

  async createOffer(offerData: Partial<Offer>): Promise<ApiResponse<Offer>> {
    return apiService.post('/offers', offerData);
  }

  async updateOffer(offerId: string, offerData: Partial<Offer>): Promise<ApiResponse<Offer>> {
    return apiService.patch(`/offers/${offerId}`, offerData);
  }

  async deleteOffer(offerId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/offers/${offerId}`);
  }

  // Payment endpoints
  async createPaymentIntent(bookingId: string): Promise<ApiResponse<{ clientSecret: string }>> {
    return apiService.post(`/payments/create-intent`, { bookingId });
  }

  async confirmPayment(paymentData: { bookingId: string; paymentMethodId: string }): Promise<ApiResponse<Payment>> {
    return apiService.post('/payments/confirm', paymentData);
  }

  async getUserPayments(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ payments: Payment[]; total: number; page: number; limit: number }>> {
    return apiService.get('/payments/user', params);
  }

  // Dashboard endpoints (admin)
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiService.get('/admin/dashboard');
  }

  // Professional endpoints
  async getProfessionalJobs(params?: { status?: string; page?: number; limit?: number }): Promise<ApiResponse<{ jobs: Booking[]; total: number; page: number; limit: number }>> {
    return apiService.get('/professional/jobs', params);
  }

  async getJobDetails(jobId: string): Promise<ApiResponse<Booking>> {
    return apiService.get(`/professional/jobs/${jobId}`);
  }

  async updateJobStatus(jobId: string, status: string): Promise<ApiResponse<Booking>> {
    return apiService.patch(`/professional/jobs/${jobId}/status`, { status });
  }

  async getProfessionalDashboardStats(): Promise<ApiResponse<any>> {
    return apiService.get('/professional/dashboard');
  }

  async getProfessionalProfile(): Promise<ApiResponse<Professional>> {
    return apiService.get('/professional/profile');
  }

  async updateProfessionalProfile(profileData: Partial<Professional>): Promise<ApiResponse<Professional>> {
    return apiService.patch('/professional/profile', profileData);
  }

  // Vehicle endpoints
  async getMyVehicles(): Promise<ApiResponse<any[]>> {
    return apiService.get('/vehicles');
  }

  async getMyDefaultVehicle(): Promise<ApiResponse<any>> {
    return apiService.get('/vehicles/default');
  }

  async getVehicle(vehicleId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/vehicles/${vehicleId}`);
  }

  async createVehicle(vehicleData: any): Promise<ApiResponse<any>> {
    return apiService.post('/vehicles', vehicleData);
  }

  async updateVehicle(vehicleId: string, vehicleData: any): Promise<ApiResponse<any>> {
    return apiService.patch(`/vehicles/${vehicleId}`, vehicleData);
  }

  async deleteVehicle(vehicleId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/vehicles/${vehicleId}`);
  }

  async setDefaultVehicle(vehicleId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch(`/vehicles/${vehicleId}/set-default`);
  }

  async uploadVehicleImage(vehicleId: string, imageData: FormData): Promise<ApiResponse<any>> {
    return apiService.post(`/vehicles/${vehicleId}/upload-image`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Location endpoints
  async updateProfessionalLocation(locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    batteryLevel?: number;
    networkType?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.post('/location/update', locationData);
  }

  async updateProfessionalStatus(status: string): Promise<ApiResponse<any>> {
    return apiService.post('/location/status', { status });
  }

  async setTrackingEnabled(enabled: boolean): Promise<ApiResponse<any>> {
    return apiService.post('/location/tracking', { enabled });
  }

  async updateTrackingSettings(settings: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
    maxHistoryItems?: number;
  }): Promise<ApiResponse<any>> {
    return apiService.post('/location/settings', settings);
  }

  async getProfessionalLocation(professionalId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/location/professional/${professionalId}`);
  }

  async getProfessionalLocationHistory(professionalId: string, limit?: number): Promise<ApiResponse<any[]>> {
    return apiService.get(`/location/professional/${professionalId}/history`, { limit });
  }

  async findNearbyProfessionals(params: {
    latitude: number;
    longitude: number;
    maxDistance?: number;
    status?: string;
  }): Promise<ApiResponse<Professional[]>> {
    return apiService.get('/location/nearby', params);
  }

  async subscribeToLocationUpdates(professionalId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/location/subscribe/${professionalId}`);
  }

  async unsubscribeFromLocationUpdates(professionalId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/location/unsubscribe/${professionalId}`);
  }

  // Notification endpoints
  async getMyNotifications(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ notifications: any[]; total: number; page: number; limit: number }>> {
    return apiService.get('/notifications', params);
  }

  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiService.get('/notifications/unread-count');
  }

  async markAllAsRead(): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch('/notifications/mark-all-read');
  }

  async deleteReadNotifications(): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete('/notifications/delete-read');
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.patch(`/notifications/${notificationId}/read`);
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/notifications/${notificationId}`);
  }

  async registerDeviceToken(token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post('/notifications/register-device', { token });
  }

  async deregisterDeviceToken(token: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete('/notifications/deregister-device', { token });
  }

  async getMyDevices(): Promise<ApiResponse<any[]>> {
    return apiService.get('/notifications/my-devices');
  }

  // Admin notification endpoints
  async createNotification(notificationData: any): Promise<ApiResponse<any>> {
    return apiService.post('/notifications', notificationData);
  }

  async getAllNotifications(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ notifications: any[]; total: number; page: number; limit: number }>> {
    return apiService.get('/notifications/all', params);
  }

  async deleteExpiredNotifications(): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete('/notifications/expired');
  }

  async cleanupOldTokens(): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete('/notifications/cleanup-tokens');
  }

  // Admin endpoints
  async getAllUsersAdmin(params?: { role?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>> {
    return apiService.get('/admin/users', params);
  }

  async getUserDetailsAdmin(userId: string): Promise<ApiResponse<User>> {
    return apiService.get(`/admin/users/${userId}`);
  }

  async createUserAdmin(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.post('/admin/users', userData);
  }

  async updateUserAdmin(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiService.patch(`/admin/users/${userId}`, userData);
  }

  async deleteUserAdmin(userId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/admin/users/${userId}`);
  }

  async getAllBookingsAdmin(params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ bookings: Booking[]; total: number; page: number; limit: number }>> {
    return apiService.get('/admin/bookings', params);
  }

  async getBookingDetailsAdmin(bookingId: string): Promise<ApiResponse<Booking>> {
    return apiService.get(`/admin/bookings/${bookingId}`);
  }

  async updateBookingAdmin(bookingId: string, bookingData: Partial<Booking>): Promise<ApiResponse<Booking>> {
    return apiService.patch(`/admin/bookings/${bookingId}`, bookingData);
  }

  async getAllServicesAdmin(params?: { category?: string; search?: string; page?: number; limit?: number }): Promise<ApiResponse<{ services: Service[]; total: number; page: number; limit: number }>> {
    return apiService.get('/admin/services', params);
  }

  async createServiceAdmin(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return apiService.post('/admin/services', serviceData);
  }

  async updateServiceAdmin(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    return apiService.patch(`/admin/services/${serviceId}`, serviceData);
  }

  async deleteServiceAdmin(serviceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/admin/services/${serviceId}`);
  }

  // Membership endpoints
  async getAllMemberships(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ memberships: any[]; total: number; page: number; limit: number }>> {
    return apiService.get('/membership', params);
  }

  async getMembershipById(membershipId: string): Promise<ApiResponse<any>> {
    return apiService.get(`/membership/${membershipId}`);
  }

  async createMembership(membershipData: any): Promise<ApiResponse<any>> {
    return apiService.post('/membership', membershipData);
  }

  async updateMembership(membershipId: string, membershipData: any): Promise<ApiResponse<any>> {
    return apiService.patch(`/membership/${membershipId}`, membershipData);
  }

  async deleteMembership(membershipId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete(`/membership/${membershipId}`);
  }

  async subscribeToMembership(membershipId: string): Promise<ApiResponse<any>> {
    return apiService.post(`/membership/${membershipId}/subscribe`);
  }

  async cancelMembership(membershipId: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post(`/membership/${membershipId}/cancel`);
  }

  async getMyMemberships(): Promise<ApiResponse<any[]>> {
    return apiService.get('/membership/my-memberships');
  }

  // Enhanced payment endpoints
  async createPaymentOrder(orderData: {
    amount: number;
    currency?: string;
    receipt?: string;
    notes?: any;
  }): Promise<ApiResponse<{ order: any; key: string }>> {
    return apiService.post('/payments/create-order', orderData);
  }

  async verifyPayment(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
  }): Promise<ApiResponse<Payment>> {
    return apiService.post('/payments/verify', paymentData);
  }

  async getPayment(paymentId: string): Promise<ApiResponse<Payment>> {
    return apiService.get(`/payments/${paymentId}`);
  }

  async initiateRefund(paymentId: string, refundData: {
    amount?: number;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return apiService.post(`/payments/${paymentId}/refund`, refundData);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return apiService.get('/health');
  }

  // Wrapper methods for contexts (to match expected method names)
  async getServices(filters?: any): Promise<Service[]> {
    try {
      const response = await this.getAllServices(filters);
      return response.data?.services || [];
    } catch (error) {
      console.error('Error getting services:', error);
      return [];
    }
  }

  async getPopularServices(limit?: number): Promise<Service[]> {
    try {
      const response = await this.getAllServices({ limit });
      // For now, return all services. You can add popularity logic later
      return response.data?.services || [];
    } catch (error) {
      console.error('Error getting popular services:', error);
      return [];
    }
  }

  async getProfessionals(): Promise<Professional[]> {
    try {
      const response = await this.getAllProfessionals();
      return response.data?.professionals || [];
    } catch (error) {
      console.error('Error getting professionals:', error);
      return [];
    }
  }

  async getBookings(userId?: string): Promise<Booking[]> {
    try {
      if (userId) {
        const response = await this.getUserBookings();
        return response.data?.bookings || [];
      } else {
        const response = await this.getAllBookings();
        return response.data?.bookings || [];
      }
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  async getActiveOffers(): Promise<Offer[]> {
    try {
      const response = await this.getAllOffers({ active: true });
      return response.data?.offers || [];
    } catch (error) {
      console.error('Error getting active offers:', error);
      return [];
    }
  }

  async getFeaturedOffers(): Promise<Offer[]> {
    try {
      const response = await this.getAllOffers(); // Add featured filter when available
      return response.data?.offers || [];
    } catch (error) {
      console.error('Error getting featured offers:', error);
      return [];
    }
  }

  async validateOfferCode(code: string, serviceId?: string, orderAmount?: number): Promise<{ isValid: boolean; offer?: Offer; error?: string }> {
    try {
      // This would need an API endpoint for validation
      // For now, return a placeholder
      return { isValid: false, error: 'Offer validation not implemented' };
    } catch (error) {
      console.error('Error validating offer code:', error);
      return { isValid: false, error: 'Validation failed' };
    }
  }

  async getRecentBookings(limit?: number): Promise<Booking[]> {
    try {
      const response = await this.getAllBookings({ limit });
      return response.data?.bookings || [];
    } catch (error) {
      console.error('Error getting recent bookings:', error);
      return [];
    }
  }

  async getTopProfessionals(limit?: number): Promise<Professional[]> {
    try {
      const response = await this.getAllProfessionals({ limit });
      return response.data?.professionals || [];
    } catch (error) {
      console.error('Error getting top professionals:', error);
      return [];
    }
  }

  // Generic data method
  async getData<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await apiService.get(`/${endpoint}`);
      return response.data?.data || [];
    } catch (error) {
      console.error(`Error getting data from ${endpoint}:`, error);
      return [];
    }
  }
}

// Create and export a singleton instance
const dataService = new DataService();
export default dataService;
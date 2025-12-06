import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import {
  User,
  Booking,
  Service,
  Professional
} from '../types/api';

// Admin-specific types
export interface AdminDashboardStats {
  stats: {
    users: number;
    professionals: number;
    bookings: number;
    services: number;
    revenue: number;
  };
  recentBookings: Booking[];
  topProfessionals: Professional[];
  chartData: {
    bookings: { daily: any; weekly: any; monthly: any };
    revenue: { daily: any; weekly: any; monthly: any };
  };
  analytics: {
    revenueByCategory: Array<{
      category: string;
      revenue: number;
      bookings: number;
    }>;
    professionalKPIs: Array<{
      id: string;
      name: string;
      totalBookings: number;
      completedBookings: number;
      completionRate: number;
      totalRevenue: number;
      averageRating: number;
    }>;
    customerRetention: {
      totalRecentCustomers: number;
      retainedCustomers: number;
      retentionRate: number;
    };
    geographicDistribution: Array<{
      location: string;
      bookings: number;
      revenue: number;
    }>;
  };
}

export interface AdminFilters {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

class AdminService {
  private handleError(error: any, context: string): never {
    // Log error in development only
    if (__DEV__) {
      console.error(`AdminService error in ${context}:`, error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
    throw error;
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
    } catch (error) {
      return this.handleError(error, 'getDashboardStats');
    }
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters?: AdminFilters): Promise<ApiResponse<User[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.USERS, { params: filters });
    } catch (error) {
      return this.handleError(error, 'getUsers');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
    } catch (error) {
      return this.handleError(error, 'getUserById');
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'professional';
    additionalInfo?: any;
  }): Promise<ApiResponse<User>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.CREATE_USER, userData);
    } catch (error) {
      return this.handleError(error, 'createUser');
    }
  }

  /**
   * Create new professional
   */
  async createProfessional(professionalData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    status?: 'active' | 'inactive' | 'pending';
    address?: any;
    skills?: string[];
    serviceAreas?: string[];
    experience?: string;
    vehicleInfo?: any;
    profileImage?: string | null;
    sendCredentials?: boolean;
  }): Promise<ApiResponse<Professional>> {
    try {
      if (__DEV__) {
        console.log('Creating professional with data:', JSON.stringify(professionalData, null, 2));
      }
      return await httpClient.post(API_ENDPOINTS.ADMIN.PROFESSIONALS, professionalData);
    } catch (error: any) {
      return this.handleError(error, 'createProfessional');
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_USER(userId), userData);
    } catch (error) {
      return this.handleError(error, 'updateUser');
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
    } catch (error) {
      return this.handleError(error, 'deleteUser');
    }
  }

  /**
   * Get all bookings with filters
   */
  async getBookings(filters?: AdminFilters): Promise<ApiResponse<Booking[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.BOOKINGS, { params: filters });
    } catch (error) {
      return this.handleError(error, 'getBookings');
    }
  }

  private normalizeBooking(rawBooking: any): Booking {
    if (!rawBooking || typeof rawBooking !== 'object') return rawBooking;

    const booking = { ...rawBooking };

    // Ensure top-level _id and id exist
    if (!booking._id && booking.id) booking._id = String(booking.id);
    if (!booking.id && booking._id) booking.id = String(booking._id);

    // Provide a bookingId fallback for UI header if missing
    if (!booking.bookingId) booking.bookingId = booking.id || booking._id;

    // Map location -> address for older/newer API shapes
    if (!booking.address && booking.location) {
      booking.address = booking.location;
    } else if (!booking.address) {
      booking.address = { addressLine1: '', city: '', state: '', postalCode: '' };
    }

    // Ensure nested customer/professional have _id as client expects
    if (booking.customer && typeof booking.customer === 'object') {
      if (!booking.customer._id && booking.customer.id) booking.customer._id = booking.customer.id;
    } else if (typeof booking.customer === 'string') {
      booking.customer = { _id: booking.customer, name: 'Unknown', phone: '' };
    }

    // Professional shape: ensure .user exists for UI
    if (booking.professional && typeof booking.professional === 'object') {
      const p = booking.professional;
      if (!p.user) {
        p.user = {
          _id: p._id || p.id || null,
          name: p.name || 'Unknown',
          phone: p.phone || '',
          email: p.email || '',
        };
      } else if (p.user && p.user.id && !p.user._id) {
        p.user._id = p.user.id;
      }
      if (typeof p.rating === 'undefined') p.rating = 0;
      if (typeof p.reviewCount === 'undefined') p.reviewCount = 0;
    }

    // Service shape: ensure basePrice and duration exist
    if (booking.service && typeof booking.service === 'object') {
      const s = booking.service;
      if (!s._id && s.id) s._id = s.id;
      if (typeof s.basePrice === 'undefined') s.basePrice = s.price ?? s.cost ?? 0;
      if (typeof s.duration === 'undefined') s.duration = 0;
    } else if (Array.isArray(booking.services) && booking.services[0]) {
      const s0 = booking.services[0];
      booking.service = {
        _id: s0.serviceId?._id || s0.serviceId || s0.id,
        name: s0.serviceId?.title || s0.title || s0.name || 'Service',
        description: s0.serviceId?.description || s0.description || '',
        basePrice: s0.price || s0.serviceId?.price || 0,
        duration: s0.duration || s0.serviceId?.duration || 0,
      };
    }

    // Ensure totals and payment fields
    if (typeof booking.totalAmount === 'undefined') booking.totalAmount = booking.amount ?? 0;
    if (!booking.paymentStatus) booking.paymentStatus = 'pending';
    if (!booking.paymentMethod) booking.paymentMethod = null;

    return booking as Booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    try {
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId));

      if (!response) return response;

      let bookingPayload: any = null;
      const responseData = response.data;

      if (responseData && typeof responseData === 'object') {
        if (responseData.booking) {
          bookingPayload = responseData.booking;
        } else if (responseData.data && (responseData.data.booking || responseData.data._id || responseData.data.id)) {
          bookingPayload = responseData.data.booking ?? responseData.data;
        } else if (responseData._id || responseData.id) {
          bookingPayload = responseData;
        }
      } else if ((response as any).booking) {
        bookingPayload = (response as any).booking;
      }

      const successFlag = (response as any).success === true || response.status === 'success';

      return {
        ...response,
        success: successFlag,
        data: this.normalizeBooking(bookingPayload),
      };
    } catch (error) {
      return this.handleError(error, 'getBookingById');
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_BOOKING_STATUS(bookingId), { status });
    } catch (error) {
      return this.handleError(error, 'updateBookingStatus');
    }
  }

  /**
   * Get available professionals for a booking
   */
  async getAvailableProfessionals(bookingId: string): Promise<ApiResponse<Professional[]>> {
    try {
      if (__DEV__) console.log('Getting available professionals for booking:', bookingId);
      return await httpClient.get(API_ENDPOINTS.ADMIN.AVAILABLE_PROFESSIONALS(bookingId));
    } catch (error) {
      return this.handleError(error, 'getAvailableProfessionals');
    }
  }

  /**
   * Assign professional to booking
   */
  async assignProfessional(bookingId: string, professionalId: string): Promise<ApiResponse<Booking>> {
    try {
      if (__DEV__) console.log('Assigning professional to booking:', bookingId, professionalId);
      return await httpClient.patch(API_ENDPOINTS.ADMIN.ASSIGN_PROFESSIONAL(bookingId), { professionalId });
    } catch (error) {
      return this.handleError(error, 'assignProfessional');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.ADMIN.CANCEL_BOOKING(bookingId), { reason });
    } catch (error) {
      return this.handleError(error, 'cancelBooking');
    }
  }

  /**
   * Get all services (Admin view)
   */
  async getServices(filters?: AdminFilters): Promise<ApiResponse<{ services: Service[]; pagination?: any }>> {
    try {
      if (__DEV__) {
        console.log('adminService.getServices - Making request to:', API_ENDPOINTS.ADMIN.SERVICES, 'with filters:', filters);
      }
      
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.SERVICES, { params: filters });
      let services: Service[] = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          services = response.data;
        } else if (response.data.services && Array.isArray(response.data.services)) {
          services = response.data.services;
        } else if (typeof response.data === 'object') {
          services = [response.data];
        }
      }

      return {
        ...response,
        data: {
          services,
          pagination: response.meta?.pagination,
        },
      };
    } catch (error) {
      return this.handleError(error, 'getServices');
    }
  }

  /**
   * Create new service
   */
  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.CREATE_SERVICE, serviceData);
    } catch (error) {
      return this.handleError(error, 'createService');
    }
  }

  /**
   * Update service
   */
  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_SERVICE(serviceId), serviceData);
    } catch (error) {
      return this.handleError(error, 'updateService');
    }
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_SERVICE(serviceId));
    } catch (error) {
      return this.handleError(error, 'deleteService');
    }
  }

  /**
   * Get all professionals
   */
  async getProfessionals(filters?: AdminFilters): Promise<ApiResponse<Professional[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONALS, { params: filters });
    } catch (error) {
      return this.handleError(error, 'getProfessionals');
    }
  }

  /**
   * Get professional by ID
   */
  async getProfessionalById(professionalId: string): Promise<ApiResponse<Professional>> {
    try {
      if (__DEV__) console.log('adminService.getProfessionalById called with ID:', professionalId);
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONAL_BY_ID(professionalId));

      // Handle nested data structure e.g. { data: { data: { ... } } }
      if (response.data && response.data.data && typeof response.data.data === 'object') {
        return {
          ...response,
          data: response.data.data,
          success: response.success || response.data.status === 'success'
        };
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'getProfessionalById');
    }
  }

  /**
   * Update professional verification status
   */
  async updateProfessionalVerification(
    professionalId: string,
    verificationData: { isVerified: boolean; verificationNotes?: string }
  ): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.patch(
        API_ENDPOINTS.ADMIN.VERIFY_PROFESSIONAL(professionalId),
        verificationData
      );
    } catch (error) {
      return this.handleError(error, 'updateProfessionalVerification');
    }
  }

  /**
   * Update professional details
   */
  async updateProfessional(
    professionalId: string,
    professionalData: Partial<Professional>
  ): Promise<ApiResponse<Professional>> {
    try {
      if (__DEV__) {
        console.log('Updating professional with ID:', professionalId, 'Data:', professionalData);
      }
      return await httpClient.patch(
        API_ENDPOINTS.ADMIN.PROFESSIONAL_BY_ID(professionalId),
        professionalData
      );
    } catch (error) {
      return this.handleError(error, 'updateProfessional');
    }
  }

  /**
   * Get admin statistics
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.STATS);
    } catch (error) {
      return this.handleError(error, 'getStats');
    }
  }

  /**
   * Get customers (users with customer role)
   */
  async getCustomers(filters?: AdminFilters): Promise<ApiResponse<User[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.ADMIN.USERS, {
        params: { ...filters, role: 'customer' }
      });
    } catch (error) {
      return this.handleError(error, 'getCustomers');
    }
  }

  /**
   * Get admin notifications
   */
  async getNotifications(filters?: AdminFilters): Promise<ApiResponse<any[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.ALL, { params: filters });
    } catch (error) {
      return this.handleError(error, 'getNotifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    } catch (error) {
      return this.handleError(error, 'markNotificationAsRead');
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      return this.handleError(error, 'markAllNotificationsAsRead');
    }
  }

  /**
   * Bulk update user status
   */
  async bulkUpdateUserStatus(userIds: string[], status: 'active' | 'inactive' | 'blocked'): Promise<ApiResponse<{ updated: number; total: number }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.BULK_UPDATE_USER_STATUS, { userIds, status });
    } catch (error) {
      return this.handleError(error, 'bulkUpdateUserStatus');
    }
  }

  /**
   * Bulk assign professional to bookings
   */
  async bulkAssignProfessional(bookingIds: string[], professionalId: string): Promise<ApiResponse<{ updated: number; total: number }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.BULK_ASSIGN_PROFESSIONAL, { bookingIds, professionalId });
    } catch (error) {
      return this.handleError(error, 'bulkAssignProfessional');
    }
  }

  /**
   * Bulk update service prices
   */
  async bulkUpdateServicePrices(serviceUpdates: Array<{ serviceId: string; price?: number; discountPrice?: number }>): Promise<ApiResponse<{ updated: number; total: number; results: any[] }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.BULK_UPDATE_SERVICE_PRICES, { serviceUpdates });
    } catch (error) {
      return this.handleError(error, 'bulkUpdateServicePrices');
    }
  }

  /**
   * Bulk verify professionals
   */
  async bulkVerifyProfessionals(professionalIds: string[], isVerified: boolean, verificationNotes?: string): Promise<ApiResponse<{ updated: number; total: number }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.ADMIN.BULK_VERIFY_PROFESSIONALS, { professionalIds, isVerified, verificationNotes });
    } catch (error) {
      return this.handleError(error, 'bulkVerifyProfessionals');
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;

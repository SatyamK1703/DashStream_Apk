import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { 
  User, 
  Booking, 
  Service, 
  Professional 
} from '../types/api';

// Admin-specific types
export interface AdminDashboardStats {
  totalRevenue: number;
  totalBookings: number;
  activeCustomers: number;
  activeProfessionals: number;
  revenueChange: number;
  bookingsChange: number;
  customersChange: number;
  professionalsChange: number;
  chartData: {
    revenue: { daily: any; weekly: any; monthly: any };
    bookings: { daily: any; weekly: any; monthly: any };
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
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.DASHBOARD);
    } catch (error) {
      // Log error in development only
      if (__DEV__) console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard data (alias for getDashboardStats)
   */
  async getDashboard(): Promise<ApiResponse<AdminDashboardStats>> {
    return this.getDashboardStats();
  }

  /**
   * Get all users with pagination and filters
   */
  async getUsers(filters?: AdminFilters): Promise<ApiResponse<User[]>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.USERS, { params: filters });
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.USER_BY_ID(userId));
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
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
      return await httpClient.post(ENDPOINTS.ADMIN.CREATE_USER, userData);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await httpClient.patch(ENDPOINTS.ADMIN.UPDATE_USER(userId), userData);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(ENDPOINTS.ADMIN.DELETE_USER(userId));
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Get all bookings with filters
   */
  async getBookings(filters?: AdminFilters): Promise<ApiResponse<Booking[]>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.BOOKINGS, { params: filters });
    } catch (error) {
      console.error('Get bookings error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId));
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(ENDPOINTS.ADMIN.UPDATE_BOOKING_STATUS(bookingId), { status });
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  /**
   * Assign professional to booking
   */
  async assignProfessional(bookingId: string, professionalId: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(ENDPOINTS.ADMIN.ASSIGN_PROFESSIONAL(bookingId), { 
        professionalId 
      });
    } catch (error) {
      console.error('Assign professional error:', error);
      throw error;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(ENDPOINTS.ADMIN.CANCEL_BOOKING(bookingId), { reason });
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get all services (Admin view)
   */
  async getServices(filters?: AdminFilters): Promise<ApiResponse<{ services: Service[]; pagination?: any }>> {
    try {
      if (__DEV__) {
        console.log('adminService.getServices - Making request to:', ENDPOINTS.ADMIN.SERVICES, 'with filters:', filters);
      }
      
      const response = await httpClient.get(ENDPOINTS.ADMIN.SERVICES, { params: filters });
      
      if (__DEV__) {
        console.log('adminService.getServices - Raw response:', {
          endpoint: ENDPOINTS.ADMIN.SERVICES,
          filters,
          response,
          responseData: response.data,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
          success: response.success,
          status: response.status
        });
      }
      
      // Handle both array and object responses
      if (Array.isArray(response.data)) {
        const formattedResponse = {
          ...response,
          data: {
            services: response.data,
            pagination: response.meta?.pagination
          }
        };
        
        if (__DEV__) {
          console.log('adminService.getServices - Formatted response (array):', formattedResponse);
        }
        
        return formattedResponse;
      }
      
      // If response.data has services property, use it directly
      if (response.data && typeof response.data === 'object' && 'services' in response.data) {
        if (__DEV__) {
          console.log('adminService.getServices - Response already has services property:', response);
        }
        return response;
      }
      
      // If response.data is an object but doesn't have services property, wrap it
      if (response.data && typeof response.data === 'object') {
        const wrappedResponse = {
          ...response,
          data: {
            services: [response.data], // Single service as array
            pagination: response.meta?.pagination
          }
        };
        
        if (__DEV__) {
          console.log('adminService.getServices - Wrapped single service:', wrappedResponse);
        }
        
        return wrappedResponse;
      }
      
      // Fallback - return empty services array
      const fallbackResponse = {
        ...response,
        data: {
          services: [],
          pagination: response.meta?.pagination
        }
      };
      
      if (__DEV__) {
        console.log('adminService.getServices - Fallback response:', fallbackResponse);
      }
      
      return fallbackResponse;
    } catch (error) {
      console.error('Get admin services error:', error);
      throw error;
    }
  }

  /**
   * Create new service
   */
  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.post(ENDPOINTS.ADMIN.CREATE_SERVICE, serviceData);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  /**
   * Update service
   */
  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.patch(ENDPOINTS.ADMIN.UPDATE_SERVICE(serviceId), serviceData);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  /**
   * Delete service
   */
  async deleteService(serviceId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(ENDPOINTS.ADMIN.DELETE_SERVICE(serviceId));
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }

  /**
   * Get all professionals
   */
  async getProfessionals(filters?: AdminFilters): Promise<ApiResponse<Professional[]>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.PROFESSIONALS, { params: filters });
    } catch (error) {
      console.error('Get professionals error:', error);
      throw error;
    }
  }

  /**
   * Get professional by ID
   */
  async getProfessionalById(professionalId: string): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.PROFESSIONAL_BY_ID(professionalId));
    } catch (error) {
      console.error('Get professional by ID error:', error);
      throw error;
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
        ENDPOINTS.ADMIN.VERIFY_PROFESSIONAL(professionalId), 
        verificationData
      );
    } catch (error) {
      console.error('Update professional verification error:', error);
      throw error;
    }
  }

  /**
   * Get admin statistics
   */
  async getStats(): Promise<ApiResponse<any>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.STATS);
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error;
    }
  }

  /**
   * Get customers (users with customer role)
   */
  async getCustomers(filters?: AdminFilters): Promise<ApiResponse<User[]>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.USERS, { 
        params: { ...filters, role: 'customer' } 
      });
    } catch (error) {
      console.error('Get customers error:', error);
      throw error;
    }
  }

  /**
   * Get admin notifications
   */
  async getNotifications(filters?: AdminFilters): Promise<ApiResponse<any[]>> {
    try {
      return await httpClient.get(ENDPOINTS.NOTIFICATIONS.ALL, { params: filters });
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<any>> {
    try {
      return await httpClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<ApiResponse<any>> {
    try {
      return await httpClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
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
      return await httpClient.get(`${ENDPOINTS.ADMIN.USERS}/${userId}`);
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
      return await httpClient.post(ENDPOINTS.ADMIN.USERS, userData);
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
      return await httpClient.patch(`${ENDPOINTS.ADMIN.USERS}/${userId}`, userData);
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
      return await httpClient.delete(ENDPOINTS.ADMIN.USER_BY_ID(userId));
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
      return await httpClient.patch(`${ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId)}/status`, { status });
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
      return await httpClient.patch(`${ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId)}/assign`, { 
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
      return await httpClient.patch(`${ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId)}/cancel`, { 
        reason 
      });
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Get all services with filters
   */
  async getServices(filters?: AdminFilters): Promise<ApiResponse<Service[]>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.SERVICES, { params: filters });
    } catch (error) {
      console.error('Get services error:', error);
      throw error;
    }
  }

  /**
   * Create new service
   */
  async createService(serviceData: {
    name: string;
    description: string;
    price: number;
    category: string;
    duration: number;
    features: string[];
    isActive: boolean;
  }): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.post(ENDPOINTS.ADMIN.SERVICES, serviceData);
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
      return await httpClient.patch(ENDPOINTS.ADMIN.SERVICE_BY_ID(serviceId), serviceData);
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
      return await httpClient.delete(ENDPOINTS.ADMIN.SERVICE_BY_ID(serviceId));
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }

  /**
   * Get all professionals with filters
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
    data: { isVerified: boolean; verificationNotes?: string }
  ): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.patch(
        `${ENDPOINTS.ADMIN.PROFESSIONAL_BY_ID(professionalId)}/verification`, 
        data
      );
    } catch (error) {
      console.error('Update professional verification error:', error);
      throw error;
    }
  }

  /**
   * Get admin statistics
   */
  async getStats(filters?: { period: 'daily' | 'weekly' | 'monthly' }): Promise<ApiResponse<any>> {
    try {
      return await httpClient.get(ENDPOINTS.ADMIN.STATS, { params: filters });
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error;
    }
  }

  /**
   * Send notification to users
   */
  async sendNotification(data: {
    title: string;
    message: string;
    userIds?: string[];
    userType?: 'all' | 'customers' | 'professionals';
    priority?: 'low' | 'normal' | 'high';
  }): Promise<ApiResponse<void>> {
    try {
      return await httpClient.post(`${ENDPOINTS.ADMIN.USERS}/send-notification`, data);
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
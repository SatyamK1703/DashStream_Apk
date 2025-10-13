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
      return await httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD);
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.USERS, { params: filters });
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(userId));
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
      return await httpClient.post(API_ENDPOINTS.ADMIN.CREATE_USER, userData);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
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
      // Log the request for debugging
      if (__DEV__) {
        console.log('Creating professional with data:', JSON.stringify(professionalData, null, 2));
      }
      
      // Make the API call
      return await httpClient.post(API_ENDPOINTS.ADMIN.PROFESSIONALS, professionalData);
    } catch (error) {
      console.error('Create professional error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_USER(userId), userData);
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
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_USER(userId));
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.BOOKINGS, { params: filters });
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
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.BOOKING_BY_ID(bookingId));

      // Normalize response shapes from backend
      // Possible shapes observed:
      // 1) { status: 'success', data: booking }
      // 2) { status: 'success', booking: booking }
      // 3) { status: 'success', data: { booking: booking } }
      // 4) { status: 'success', data: { data: booking } }
      if (!response) return response;

      let bookingPayload: any = null;

      if (response.data && typeof response.data === 'object') {
        // Direct booking
        if (!Array.isArray(response.data) && ('_id' in response.data || 'id' in response.data)) {
          bookingPayload = response.data;
        }

        // Nested booking under data.booking
        if (!bookingPayload && response.data.booking) {
          bookingPayload = response.data.booking;
        }

        // Double nested data.data
        if (!bookingPayload && response.data.data) {
          const maybe = response.data.data;
          if (maybe && (maybe._id || maybe.id || maybe.booking)) {
            bookingPayload = maybe.booking ?? maybe;
          }
        }
      }

      // Root-level booking property
  if (!bookingPayload && (response as any).booking) bookingPayload = (response as any).booking;

      const successFlag = (response as any).success === true || response.status === 'success';

      if (bookingPayload) {
  // Normalize booking shape to match client expectations
  const normalize = (b: any) => {
          if (!b || typeof b !== 'object') return b;

          const out = { ...b };

          // Ensure top-level _id exists (client code often uses _id)
          if (!out._id && out.id) out._id = out.id;

          // Provide a bookingId fallback for UI header if missing
          if (!out.bookingId) out.bookingId = out.bookingId || out.id || out._id;

          // Map location -> address for older/newer API shapes
          if (!out.address && out.location) {
            out.address = out.location;
          }

          // Ensure nested customer/professional have _id as client expects
          if (out.customer && typeof out.customer === 'object') {
            if (!out.customer._id && out.customer.id) out.customer._id = out.customer.id;
          }

          if (out.professional && typeof out.professional === 'object') {
            if (!out.professional._id && out.professional.id) out.professional._id = out.professional.id;
          }

          // Ensure service has _id when returned as { id }
          if (out.service && typeof out.service === 'object') {
            if (!out.service._id && out.service.id) out.service._id = out.service.id;
          }

          return out;
        };

        let normalizedBooking = normalize(bookingPayload);

  // Further adapt shape to client Booking type expectations

  try {
          // Ensure id aliases
          if (!normalizedBooking.id && normalizedBooking._id) normalizedBooking.id = String(normalizedBooking._id);

          // Customer shape
          if (normalizedBooking.customer && typeof normalizedBooking.customer === 'object') {
            const c = normalizedBooking.customer;
            if (!c._id && c.id) c._id = c.id;
            // keep as-is otherwise
          } else if (typeof normalizedBooking.customer === 'string') {
            normalizedBooking.customer = { _id: normalizedBooking.customer, name: 'Unknown', phone: '' };
          }

          // Professional shape: ensure .user exists for UI
          if (normalizedBooking.professional && typeof normalizedBooking.professional === 'object') {
            const p = normalizedBooking.professional;
            // If backend returned a simple professional object (id,name,..), create .user wrapper
            if (!p.user) {
              p.user = {
                _id: p._id || p.id || null,
                name: p.name || (p.user && p.user.name) || 'Unknown',
                phone: p.phone || (p.user && p.user.phone) || '',
                email: p.email || (p.user && p.user.email) || '',
              };
            } else {
              // ensure inner user has _id
              if (p.user && p.user.id && !p.user._id) p.user._id = p.user.id;
            }

            // Ensure rating/reviewCount exist
            if (typeof p.rating === 'undefined') p.rating = 0;
            if (typeof p.reviewCount === 'undefined') p.reviewCount = 0;
          }

          // Service shape: ensure basePrice and duration exist
          if (normalizedBooking.service && typeof normalizedBooking.service === 'object') {
            const s = normalizedBooking.service;
            if (!s._id && s.id) s._id = s.id;
            if (typeof s.basePrice === 'undefined') s.basePrice = s.price ?? s.cost ?? 0;
            if (typeof s.duration === 'undefined') s.duration = s.duration ?? 0;
          } else if (normalizedBooking.services && Array.isArray(normalizedBooking.services) && normalizedBooking.services[0]) {
            // sometimes backend returns services array; pick first
            const s0 = normalizedBooking.services[0];
            normalizedBooking.service = normalizedBooking.service || {
              _id: s0.serviceId?._id || s0.serviceId || s0.id,
              name: s0.serviceId?.title || s0.title || s0.name || 'Service',
              description: s0.serviceId?.description || s0.description || '',
              basePrice: s0.price || s0.serviceId?.price || 0,
              duration: s0.duration || s0.serviceId?.duration || 0,
            };
          }

          // Address fallback
          if (!normalizedBooking.address) {
            if (normalizedBooking.location && typeof normalizedBooking.location === 'object') {
              normalizedBooking.address = normalizedBooking.location;
            } else {
              normalizedBooking.address = normalizedBooking.address || { addressLine1: '', city: '', state: '', postalCode: '' };
            }
          }

          // Ensure totals and payment fields
          if (typeof normalizedBooking.totalAmount === 'undefined') normalizedBooking.totalAmount = normalizedBooking.totalAmount ?? normalizedBooking.amount ?? 0;
          if (!normalizedBooking.paymentStatus) normalizedBooking.paymentStatus = normalizedBooking.paymentStatus ?? 'pending';
          if (!normalizedBooking.paymentMethod) normalizedBooking.paymentMethod = normalizedBooking.paymentMethod ?? null;
        } catch (e) {
          if (__DEV__) console.warn('adminService.getBookingById - normalization post-processing failed', e);
  }

  return {
          ...response,
          // Ensure callers relying on `response.success` work even if backend uses `status: 'success'`
          success: successFlag,
          data: normalizedBooking,
        } as ApiResponse<Booking>;
      }

      // If we didn't find a booking payload, still return a normalized success flag so callers can check reliably
      return {
        ...response,
        success: successFlag,
      } as ApiResponse<Booking>;
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
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_BOOKING_STATUS(bookingId), { status });
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
      return await httpClient.patch(API_ENDPOINTS.ADMIN.ASSIGN_PROFESSIONAL(bookingId), { 
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
      return await httpClient.patch(API_ENDPOINTS.ADMIN.CANCEL_BOOKING(bookingId), { reason });
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
        console.log('adminService.getServices - Making request to:', API_ENDPOINTS.ADMIN.SERVICES, 'with filters:', filters);
      }
      
      const response = await httpClient.get(API_ENDPOINTS.ADMIN.SERVICES, { params: filters });

      
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
      return await httpClient.post(API_ENDPOINTS.ADMIN.CREATE_SERVICE, serviceData);
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
      return await httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_SERVICE(serviceId), serviceData);
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
      return await httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_SERVICE(serviceId));
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONALS, { params: filters });
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.PROFESSIONAL_BY_ID(professionalId));
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
        API_ENDPOINTS.ADMIN.VERIFY_PROFESSIONAL(professionalId), 
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.STATS);
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
      return await httpClient.get(API_ENDPOINTS.ADMIN.USERS, { 
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
      return await httpClient.get(API_ENDPOINTS.NOTIFICATIONS.ALL, { params: filters });
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
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId));
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
      return await httpClient.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
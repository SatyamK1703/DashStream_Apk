import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Booking, CreateBookingRequest } from '../types/api';

class BookingService {
  /**
   * Create a new booking
   */
  async createBooking(data: CreateBookingRequest): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.post(API_ENDPOINTS.BOOKINGS.CREATE, data);
    } catch (error) {
      // Log error in development only
      if (__DEV__) console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getMyBookings(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'scheduledDate';
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<Booking[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, { params });
    } catch (error) {
      console.error('Get my bookings error:', error);
      throw error;
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.get(API_ENDPOINTS.BOOKINGS.BY_ID(bookingId));
    } catch (error) {
      console.error('Get booking by ID error:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.BOOKINGS.CANCEL(bookingId), { reason });
    } catch (error) {
      console.error('Cancel booking error:', error);
      throw error;
    }
  }

  /**
   * Update booking status (Professional/Admin only)
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'confirmed' | 'in-progress' | 'completed',
    notes?: string
  ): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(bookingId), {
        status,
        notes,
      });
    } catch (error) {
      console.error('Update booking status error:', error);
      throw error;
    }
  }

  /**
   * Rate and review a completed booking
   */
  async rateBooking(
    bookingId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<Booking>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.BOOKINGS.BY_ID(bookingId), {
        rating,
        review,
      });
    } catch (error) {
      console.error('Rate booking error:', error);
      throw error;
    }
  }

  /**
   * Get booking tracking info
   */
  async getBookingTracking(bookingId: string): Promise<ApiResponse<{
    status: string;
    location?: { latitude: number; longitude: number };
    estimatedArrival?: string;
    professionalLocation?: { latitude: number; longitude: number };
    timeline: {
      status: string;
      timestamp: string;
      description: string;
    }[];
  }>> {
    try {
      return await httpClient.get(`${API_ENDPOINTS.BOOKINGS.BY_ID(bookingId)}/tracking`);
    } catch (error) {
      console.error('Get booking tracking error:', error);
      throw error;
    }
  }

  /**
   * Verify booking OTP (Professional only)
   */
  async verifyBookingOtp(bookingId: string, otp: string): Promise<ApiResponse<{ verified: boolean }>> {
    try {
      return await httpClient.post(`${API_ENDPOINTS.BOOKINGS.BY_ID(bookingId)}/verify-otp`, { otp });
    } catch (error) {
      console.error('Verify booking OTP error:', error);
      throw error;
    }
  }

  /**
   * Get available time slots for a service
   */
  async getAvailableTimeSlots(params: {
    serviceId: string;
    date: string;
    location?: { latitude: number; longitude: number };
  }): Promise<ApiResponse<{
    date: string;
    slots: {
      time: string;
      available: boolean;
      professionalCount: number;
    }[];
  }>> {
    try {
      return await httpClient.get('/bookings/available-slots', { params });
    } catch (error) {
      console.error('Get available time slots error:', error);
      throw error;
    }
  }

  /**
   * Calculate booking price
   */
  async calculatePrice(params: {
    serviceId: string;
    vehicleType?: string;
    location?: { latitude: number; longitude: number };
    addOns?: string[];
    membershipId?: string;
    promoCode?: string;
  }): Promise<ApiResponse<{
    basePrice: number;
    addOnsPrice: number;
    membershipDiscount: number;
    promoDiscount: number;
    taxes: number;
    totalPrice: number;
    breakdown: {
      item: string;
      price: number;
    }[];
  }>> {
    try {
      return await httpClient.post('/bookings/calculate-price', params);
    } catch (error) {
      console.error('Calculate price error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const bookingService = new BookingService();
export default bookingService;
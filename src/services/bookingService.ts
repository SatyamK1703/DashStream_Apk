// Production Booking Service
import unifiedApiService from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';
import productionAuthService from './productionAuthService';

// Types
export interface Vehicle {
  type: '2 Wheeler' | '4 Wheeler';
  brand?: string;
  model?: string;
}

export interface Location {
  address: {
    name: string;
    address: string;
    city: string;
    landmark?: string;
    pincode: string;
  };
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface BookingItem {
  _id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
  category: string;
}

export interface BookingData {
  service: string[];
  vehicle: Vehicle;
  scheduledDate: Date | string;
  scheduledTime: string;
  location: Location;
  professional?: string;
  price?: number;
  totalAmount?: number;
  notes?: string;
  discountCode?: string;
}

export interface Booking {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
  };
  professional?: {
    _id: string;
    name: string;
    phone: string;
    rating?: number;
  };
  service: BookingItem[];
  vehicle: Vehicle;
  scheduledDate: string;
  scheduledTime: string;
  location: Location;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  price: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentMethod?: string;
  bookingId: string;
  notes?: string;
  trackingUpdates: Array<{
    status: string;
    message: string;
    timestamp: string;
    updatedBy?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  estimatedDuration?: number;
  actualStartTime?: string;
  actualEndTime?: string;
  customerRating?: number;
  customerReview?: string;
  professionalNotes?: string;
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message: string;
  statusCode?: number;
}

export interface BookingListResponse {
  success: boolean;
  data?: {
    bookings: Booking[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message: string;
  statusCode?: number;
}

export interface BookingFilter {
  status?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  services?: string[];
  professional?: string;
  page?: number;
  limit?: number;
}

class BookingService {
  private static instance: BookingService;

  private constructor() {}

  public static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }

  // Create a new booking
  public async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    try {
      console.log('🆕 Creating booking...', {
        services: bookingData.service.length,
        date: bookingData.scheduledDate,
        time: bookingData.scheduledTime
      });

      // Ensure user is authenticated
      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required to create booking'
        };
      }

      // Format the booking data
      const formattedData = {
        ...bookingData,
        scheduledDate: typeof bookingData.scheduledDate === 'string' 
          ? bookingData.scheduledDate 
          : bookingData.scheduledDate.toISOString(),
      };

      const response = await unifiedApiService.post(
        API_CONFIG.ENDPOINTS.BOOKINGS.CREATE,
        formattedData
      );

      if (response.success && response.data) {
        console.log('✅ Booking created successfully:', response.data._id);
        return {
          success: true,
          data: response.data,
          message: response.message || 'Booking created successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to create booking',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Create booking failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to create booking. Please try again.',
        statusCode: error.statusCode
      };
    }
  }

  // Get user's bookings
  public async getUserBookings(filters?: BookingFilter): Promise<BookingListResponse> {
    try {
      console.log('📋 Fetching user bookings...', filters);

      // Ensure user is authenticated
      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required to fetch bookings'
        };
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.status?.length) {
        queryParams.append('status', filters.status.join(','));
      }
      
      if (filters?.dateRange) {
        queryParams.append('startDate', filters.dateRange.start);
        queryParams.append('endDate', filters.dateRange.end);
      }
      
      if (filters?.services?.length) {
        queryParams.append('services', filters.services.join(','));
      }
      
      if (filters?.professional) {
        queryParams.append('professional', filters.professional);
      }
      
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${API_CONFIG.ENDPOINTS.BOOKINGS.LIST}?${queryString}`
        : API_CONFIG.ENDPOINTS.BOOKINGS.LIST;

      const response = await unifiedApiService.get(endpoint);

      if (response.success) {
        console.log('✅ Bookings fetched successfully:', response.data?.bookings?.length || 0);
        return {
          success: true,
          data: {
            bookings: response.data?.bookings || response.data || [],
            pagination: response.pagination
          },
          message: response.message || 'Bookings fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch bookings',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch bookings failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch bookings. Please try again.',
        statusCode: error.statusCode
      };
    }
  }

  // Get booking details by ID
  public async getBookingDetails(bookingId: string): Promise<BookingResponse> {
    try {
      console.log('📄 Fetching booking details:', bookingId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.DETAILS}/${bookingId}`
      );

      if (response.success && response.data) {
        console.log('✅ Booking details fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Booking details fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Booking not found',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch booking details failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch booking details',
        statusCode: error.statusCode
      };
    }
  }

  // Update booking
  public async updateBooking(
    bookingId: string, 
    updateData: Partial<BookingData>
  ): Promise<BookingResponse> {
    try {
      console.log('📝 Updating booking:', bookingId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.put(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE}/${bookingId}`,
        updateData
      );

      if (response.success && response.data) {
        console.log('✅ Booking updated successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Booking updated successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to update booking',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Update booking failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update booking',
        statusCode: error.statusCode
      };
    }
  }

  // Cancel booking
  public async cancelBooking(bookingId: string, reason?: string): Promise<BookingResponse> {
    try {
      console.log('❌ Cancelling booking:', bookingId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.put(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL}/${bookingId}`,
        { reason }
      );

      if (response.success) {
        console.log('✅ Booking cancelled successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Booking cancelled successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to cancel booking',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Cancel booking failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to cancel booking',
        statusCode: error.statusCode
      };
    }
  }

  // Get booking history
  public async getBookingHistory(
    page: number = 1, 
    limit: number = 10
  ): Promise<BookingListResponse> {
    try {
      console.log('📚 Fetching booking history...');

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.HISTORY}?page=${page}&limit=${limit}`
      );

      if (response.success) {
        console.log('✅ Booking history fetched successfully');
        return {
          success: true,
          data: {
            bookings: response.data?.bookings || response.data || [],
            pagination: response.pagination
          },
          message: response.message || 'History fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch history',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch booking history failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch booking history',
        statusCode: error.statusCode
      };
    }
  }

  // Get booking status
  public async getBookingStatus(bookingId: string): Promise<BookingResponse> {
    try {
      console.log('🔍 Checking booking status:', bookingId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.STATUS}/${bookingId}`
      );

      if (response.success && response.data) {
        console.log('✅ Booking status fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Status fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to get booking status',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Get booking status failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to get booking status',
        statusCode: error.statusCode
      };
    }
  }

  // Add rating and review to completed booking
  public async addBookingReview(
    bookingId: string, 
    rating: number, 
    review?: string
  ): Promise<BookingResponse> {
    try {
      console.log('⭐ Adding booking review:', bookingId);

      if (!productionAuthService.isAuthenticated()) {
        return {
          success: false,
          message: 'Authentication required'
        };
      }

      if (rating < 1 || rating > 5) {
        return {
          success: false,
          message: 'Rating must be between 1 and 5'
        };
      }

      const response = await unifiedApiService.put(
        `${API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE}/${bookingId}`,
        { 
          customerRating: rating,
          customerReview: review 
        }
      );

      if (response.success) {
        console.log('✅ Review added successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Review added successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to add review',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Add review failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to add review',
        statusCode: error.statusCode
      };
    }
  }
}

// Export singleton instance
export default BookingService.getInstance();
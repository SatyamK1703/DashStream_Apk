// Professional Service
import unifiedApiService from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';

// Types
export interface Professional {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: 'professional';
  profileImage?: string;
  profileComplete: boolean;
  isPhoneVerified: boolean;
  isAvailable: boolean;
  isVerified: boolean;
  specializations: string[];
  experience: number; // years
  rating: {
    average: number;
    count: number;
  };
  location: {
    address: {
      name: string;
      address: string;
      city: string;
      landmark?: string;
      pincode: string;
    };
    coordinates?: [number, number]; // [longitude, latitude]
  };
  serviceArea: {
    radius: number; // in km
    cities: string[];
  };
  pricing: {
    baseRate?: number;
    hourlyRate?: number;
    calloutFee?: number;
  };
  availability: {
    workingDays: string[];
    workingHours: {
      start: string;
      end: string;
    };
    breaks?: Array<{
      start: string;
      end: string;
    }>;
  };
  documents: {
    idProof?: string;
    addressProof?: string;
    experienceCertificate?: string;
    licenses?: string[];
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  stats: {
    completedBookings: number;
    totalEarnings: number;
    averageRating: number;
    responseTime: number; // in minutes
  };
  reviews?: Array<{
    _id: string;
    customer: {
      _id: string;
      name: string;
    };
    booking: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
}

export interface ProfessionalResponse {
  success: boolean;
  data?: Professional;
  message: string;
  statusCode?: number;
}

export interface ProfessionalsListResponse {
  success: boolean;
  data?: {
    professionals: Professional[];
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

export interface ProfessionalFilter {
  services?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in km
  };
  availability?: {
    date: string;
    time?: string;
  };
  rating?: {
    min: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
  experience?: {
    min: number;
  };
  isVerified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'distance' | 'responseTime';
  sortOrder?: 'asc' | 'desc';
}

class ProfessionalService {
  private static instance: ProfessionalService;

  private constructor() {}

  public static getInstance(): ProfessionalService {
    if (!ProfessionalService.instance) {
      ProfessionalService.instance = new ProfessionalService();
    }
    return ProfessionalService.instance;
  }

  // Get all professionals with filters
  public async getProfessionals(filters?: ProfessionalFilter): Promise<ProfessionalsListResponse> {
    try {
      console.log('👨‍💼 Fetching professionals...', filters);

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.services?.length) {
        queryParams.append('services', filters.services.join(','));
      }
      
      if (filters?.location) {
        queryParams.append('latitude', filters.location.latitude.toString());
        queryParams.append('longitude', filters.location.longitude.toString());
        if (filters.location.radius) {
          queryParams.append('radius', filters.location.radius.toString());
        }
      }
      
      if (filters?.availability) {
        queryParams.append('date', filters.availability.date);
        if (filters.availability.time) {
          queryParams.append('time', filters.availability.time);
        }
      }
      
      if (filters?.rating) {
        queryParams.append('minRating', filters.rating.min.toString());
      }
      
      if (filters?.priceRange) {
        queryParams.append('minPrice', filters.priceRange.min.toString());
        queryParams.append('maxPrice', filters.priceRange.max.toString());
      }
      
      if (filters?.experience) {
        queryParams.append('minExperience', filters.experience.min.toString());
      }
      
      if (filters?.isVerified !== undefined) {
        queryParams.append('verified', filters.isVerified.toString());
      }
      
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }
      
      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }
      
      if (filters?.sortBy) {
        queryParams.append('sortBy', filters.sortBy);
      }
      
      if (filters?.sortOrder) {
        queryParams.append('sortOrder', filters.sortOrder);
      }

      const queryString = queryParams.toString();
      const endpoint = queryString 
        ? `${API_CONFIG.ENDPOINTS.PROFESSIONALS.LIST}?${queryString}`
        : API_CONFIG.ENDPOINTS.PROFESSIONALS.LIST;

      const response = await unifiedApiService.get(endpoint);

      if (response.success) {
        const professionals = response.data?.professionals || response.data || [];
        console.log('✅ Professionals fetched successfully:', professionals.length);
        
        return {
          success: true,
          data: {
            professionals,
            pagination: response.pagination
          },
          message: response.message || 'Professionals fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch professionals',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch professionals failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch professionals. Please try again.',
        statusCode: error.statusCode
      };
    }
  }

  // Get professional details by ID
  public async getProfessionalDetails(professionalId: string): Promise<ProfessionalResponse> {
    try {
      console.log('📄 Fetching professional details:', professionalId);

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PROFESSIONALS.DETAILS}/${professionalId}`
      );

      if (response.success && response.data) {
        console.log('✅ Professional details fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Professional details fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Professional not found',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch professional details failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch professional details',
        statusCode: error.statusCode
      };
    }
  }

  // Get nearby professionals
  public async getNearbyProfessionals(
    latitude: number,
    longitude: number,
    radius: number = 25,
    serviceTypes?: string[]
  ): Promise<ProfessionalsListResponse> {
    try {
      console.log('📍 Fetching nearby professionals...', { latitude, longitude, radius });

      return await this.getProfessionals({
        location: { latitude, longitude, radius },
        services: serviceTypes,
        sortBy: 'distance',
        sortOrder: 'asc'
      });
    } catch (error: any) {
      console.error('❌ Fetch nearby professionals failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch nearby professionals',
        statusCode: error.statusCode
      };
    }
  }

  // Check professional availability
  public async checkAvailability(
    professionalId: string,
    date: string,
    time?: string
  ): Promise<{ success: boolean; available: boolean; message: string; availableSlots?: string[] }> {
    try {
      console.log('📅 Checking professional availability:', { professionalId, date, time });

      const queryParams = new URLSearchParams();
      queryParams.append('date', date);
      if (time) {
        queryParams.append('time', time);
      }

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PROFESSIONALS.AVAILABILITY}/${professionalId}?${queryParams.toString()}`
      );

      if (response.success) {
        console.log('✅ Availability checked successfully');
        return {
          success: true,
          available: response.data?.available || false,
          message: response.message || 'Availability checked',
          availableSlots: response.data?.availableSlots
        };
      } else {
        return {
          success: false,
          available: false,
          message: response.message || 'Failed to check availability'
        };
      }
    } catch (error: any) {
      console.error('❌ Check availability failed:', error);
      return {
        success: false,
        available: false,
        message: error.message || 'Failed to check availability'
      };
    }
  }

  // Get professional reviews
  public async getProfessionalReviews(
    professionalId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProfessionalsListResponse> {
    try {
      console.log('⭐ Fetching professional reviews:', professionalId);

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PROFESSIONALS.REVIEWS}/${professionalId}?page=${page}&limit=${limit}`
      );

      if (response.success) {
        console.log('✅ Reviews fetched successfully');
        return {
          success: true,
          data: {
            professionals: [],
            pagination: response.pagination
          },
          message: response.message || 'Reviews fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch reviews',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch reviews failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch reviews',
        statusCode: error.statusCode
      };
    }
  }

  // Get top-rated professionals
  public async getTopRatedProfessionals(
    limit: number = 10,
    services?: string[]
  ): Promise<ProfessionalsListResponse> {
    try {
      console.log('⭐ Fetching top-rated professionals...');

      return await this.getProfessionals({
        services,
        rating: { min: 4.0 },
        sortBy: 'rating',
        sortOrder: 'desc',
        limit
      });
    } catch (error: any) {
      console.error('❌ Fetch top-rated professionals failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch top-rated professionals',
        statusCode: error.statusCode
      };
    }
  }

  // Search professionals by name or specialization
  public async searchProfessionals(
    query: string,
    filters?: Partial<ProfessionalFilter>
  ): Promise<ProfessionalsListResponse> {
    try {
      console.log('🔍 Searching professionals:', query);

      // For now, we'll use the general endpoint with additional filters
      // This would need to be implemented in the backend
      const queryParams = new URLSearchParams();
      queryParams.append('search', query);

      Object.entries(filters || {}).forEach(([key, value]) => {
        if (value !== undefined) {
          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.entries(value).forEach(([subKey, subValue]) => {
              queryParams.append(`${key}.${subKey}`, subValue.toString());
            });
          } else {
            queryParams.append(key, Array.isArray(value) ? value.join(',') : value.toString());
          }
        }
      });

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.PROFESSIONALS.LIST}?${queryParams.toString()}`
      );

      if (response.success) {
        const professionals = response.data?.professionals || response.data || [];
        console.log('✅ Professional search completed:', professionals.length);
        
        return {
          success: true,
          data: {
            professionals,
            pagination: response.pagination
          },
          message: response.message || 'Search completed',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Search failed',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Search professionals failed:', error);
      return {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode
      };
    }
  }

  // Calculate distance between two points (helper function)
  public calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Format professional availability for display
  public formatAvailability(professional: Professional): string {
    if (!professional.availability) return 'Availability not set';
    
    const { workingDays, workingHours } = professional.availability;
    const daysStr = workingDays.join(', ');
    const hoursStr = `${workingHours.start} - ${workingHours.end}`;
    
    return `${daysStr}, ${hoursStr}`;
  }

  // Check if professional is currently available
  public isCurrentlyAvailable(professional: Professional): boolean {
    if (!professional.isAvailable || !professional.availability) return false;

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const { workingDays, workingHours } = professional.availability;
    
    // Check if today is a working day
    if (!workingDays.includes(currentDay)) return false;
    
    // Check if current time is within working hours
    const isWithinHours = currentTime >= workingHours.start && currentTime <= workingHours.end;
    
    return isWithinHours;
  }
}

// Export singleton instance
export default ProfessionalService.getInstance();
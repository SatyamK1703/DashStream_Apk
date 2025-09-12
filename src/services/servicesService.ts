// Services Management Service
import unifiedApiService from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';

// Types
export interface ServiceCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
}

export interface Service {
  _id: string;
  name: string;
  description: string;
  category: string | ServiceCategory;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  isPopular: boolean;
  images?: string[];
  features?: string[];
  requirements?: string[];
  tags?: string[];
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validUntil?: string;
  };
  rating?: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ServiceResponse {
  success: boolean;
  data?: Service;
  message: string;
  statusCode?: number;
}

export interface ServicesListResponse {
  success: boolean;
  data?: {
    services: Service[];
    categories?: ServiceCategory[];
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

export interface ServiceFilter {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  isPopular?: boolean;
  search?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'price' | 'duration' | 'popularity' | 'rating' | 'name';
  sortOrder?: 'asc' | 'desc';
}

class ServicesService {
  private static instance: ServicesService;
  private cachedServices: Service[] = [];
  private cachedCategories: ServiceCategory[] = [];
  private lastCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): ServicesService {
    if (!ServicesService.instance) {
      ServicesService.instance = new ServicesService();
    }
    return ServicesService.instance;
  }

  // Get all services with optional filters
  public async getServices(filters?: ServiceFilter): Promise<ServicesListResponse> {
    try {
      console.log('🔍 Fetching services...', filters);

      // Check cache first
      if (this.shouldUseCache() && !filters) {
        console.log('📦 Using cached services');
        return {
          success: true,
          data: {
            services: this.cachedServices,
            categories: this.cachedCategories
          },
          message: 'Services fetched from cache'
        };
      }

      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.category) {
        queryParams.append('category', filters.category);
      }
      
      if (filters?.priceRange) {
        queryParams.append('minPrice', filters.priceRange.min.toString());
        queryParams.append('maxPrice', filters.priceRange.max.toString());
      }
      
      if (filters?.duration) {
        queryParams.append('minDuration', filters.duration.min.toString());
        queryParams.append('maxDuration', filters.duration.max.toString());
      }
      
      if (filters?.isPopular !== undefined) {
        queryParams.append('popular', filters.isPopular.toString());
      }
      
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }
      
      if (filters?.tags?.length) {
        queryParams.append('tags', filters.tags.join(','));
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
        ? `${API_CONFIG.ENDPOINTS.SERVICES.LIST}?${queryString}`
        : API_CONFIG.ENDPOINTS.SERVICES.LIST;

      const response = await unifiedApiService.get(endpoint);

      if (response.success) {
        const services = response.data?.services || response.data || [];
        const categories = response.data?.categories || [];

        // Cache results if no filters applied
        if (!filters) {
          this.cachedServices = services;
          this.cachedCategories = categories;
          this.lastCacheTime = Date.now();
        }

        console.log('✅ Services fetched successfully:', services.length);
        return {
          success: true,
          data: {
            services,
            categories,
            pagination: response.pagination
          },
          message: response.message || 'Services fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch services',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch services failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch services. Please try again.',
        statusCode: error.statusCode
      };
    }
  }

  // Get service categories
  public async getCategories(): Promise<ServicesListResponse> {
    try {
      console.log('📂 Fetching service categories...');

      // Check cache first
      if (this.shouldUseCache() && this.cachedCategories.length > 0) {
        console.log('📦 Using cached categories');
        return {
          success: true,
          data: {
            services: [],
            categories: this.cachedCategories
          },
          message: 'Categories fetched from cache'
        };
      }

      const response = await unifiedApiService.get(API_CONFIG.ENDPOINTS.SERVICES.CATEGORIES);

      if (response.success) {
        const categories = response.data?.categories || response.data || [];
        
        // Cache categories
        this.cachedCategories = categories;
        this.lastCacheTime = Date.now();

        console.log('✅ Categories fetched successfully:', categories.length);
        return {
          success: true,
          data: {
            services: [],
            categories
          },
          message: response.message || 'Categories fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch categories',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch categories failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch categories',
        statusCode: error.statusCode
      };
    }
  }

  // Get service details by ID
  public async getServiceDetails(serviceId: string): Promise<ServiceResponse> {
    try {
      console.log('📄 Fetching service details:', serviceId);

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.SERVICES.DETAILS}/${serviceId}`
      );

      if (response.success && response.data) {
        console.log('✅ Service details fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Service details fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Service not found',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch service details failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch service details',
        statusCode: error.statusCode
      };
    }
  }

  // Search services
  public async searchServices(query: string, filters?: Partial<ServiceFilter>): Promise<ServicesListResponse> {
    try {
      console.log('🔍 Searching services:', query);

      const searchFilters: ServiceFilter = {
        search: query,
        ...filters
      };

      return await this.getServices(searchFilters);
    } catch (error: any) {
      console.error('❌ Search services failed:', error);
      return {
        success: false,
        message: error.message || 'Search failed',
        statusCode: error.statusCode
      };
    }
  }

  // Get popular services
  public async getPopularServices(limit: number = 10): Promise<ServicesListResponse> {
    try {
      console.log('⭐ Fetching popular services...');

      const response = await unifiedApiService.get(
        `${API_CONFIG.ENDPOINTS.SERVICES.POPULAR}?limit=${limit}`
      );

      if (response.success) {
        const services = response.data?.services || response.data || [];
        console.log('✅ Popular services fetched successfully:', services.length);
        
        return {
          success: true,
          data: {
            services,
            categories: []
          },
          message: response.message || 'Popular services fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch popular services',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch popular services failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch popular services',
        statusCode: error.statusCode
      };
    }
  }

  // Get services by category
  public async getServicesByCategory(categoryId: string, page: number = 1, limit: number = 20): Promise<ServicesListResponse> {
    try {
      console.log('📂 Fetching services by category:', categoryId);

      return await this.getServices({
        category: categoryId,
        page,
        limit
      });
    } catch (error: any) {
      console.error('❌ Fetch services by category failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch services by category',
        statusCode: error.statusCode
      };
    }
  }

  // Clear cache
  public clearCache(): void {
    console.log('🧹 Clearing services cache');
    this.cachedServices = [];
    this.cachedCategories = [];
    this.lastCacheTime = 0;
  }

  // Check if cache should be used
  private shouldUseCache(): boolean {
    const now = Date.now();
    const cacheAge = now - this.lastCacheTime;
    return cacheAge < this.CACHE_DURATION && this.cachedServices.length > 0;
  }

  // Get cached services (for offline use)
  public getCachedServices(): Service[] {
    return [...this.cachedServices];
  }

  // Get cached categories (for offline use)
  public getCachedCategories(): ServiceCategory[] {
    return [...this.cachedCategories];
  }

  // Calculate service price with discount
  public calculateDiscountedPrice(service: Service): number {
    if (!service.discount) {
      return service.price;
    }

    const now = new Date();
    const validUntil = service.discount.validUntil ? new Date(service.discount.validUntil) : null;
    
    if (validUntil && now > validUntil) {
      return service.price;
    }

    if (service.discount.type === 'percentage') {
      const discountAmount = service.price * (service.discount.value / 100);
      return Math.max(0, service.price - discountAmount);
    } else if (service.discount.type === 'fixed') {
      return Math.max(0, service.price - service.discount.value);
    }

    return service.price;
  }

  // Check if service has active discount
  public hasActiveDiscount(service: Service): boolean {
    if (!service.discount) return false;

    const now = new Date();
    const validUntil = service.discount.validUntil ? new Date(service.discount.validUntil) : null;
    
    return !validUntil || now <= validUntil;
  }
}

// Export singleton instance
export default ServicesService.getInstance();
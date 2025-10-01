import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Service, ServiceCategory, SearchParams } from '../types/api';

class ServiceService {
  // Backwards-compatible alias used by stores/hooks
  async getServices(params?: SearchParams): Promise<ApiResponse<Service[]>> {
    return this.getAllServices(params);
  }

  async getAllServices(params?: SearchParams): Promise<ApiResponse<Service[]>> {
    try {
      const endpoint = API_ENDPOINTS.SERVICES.ALL;
      if (!endpoint) {
        throw new Error('SERVICES.ALL endpoint is not defined');
      }
      return await httpClient.get(endpoint, { params });
    } catch (error) {
      console.error('Get all services error:', error);
      throw error;
    }
  }


  async getPopularServices(limit?: number): Promise<ApiResponse<Service[]>> {
    try {
      const endpoint = API_ENDPOINTS.SERVICES.POPULAR;
      if (!endpoint) {
        throw new Error('SERVICES.POPULAR endpoint is not defined');
      }
      const params = limit ? { limit } : undefined;
      return await httpClient.get(endpoint, { params });
    } catch (error) {
      console.error('Get popular services error:', error);
      // ✅ Return empty array to prevent app crashes
      return { 
        success: true, 
        status: 'success',
        message: 'No popular services available',
        data: [] 
      };
    }
  }

 
  async getTopServices(limit?: number): Promise<ApiResponse<Service[]>> {
    try {
      const endpoint = API_ENDPOINTS.SERVICES.TOP_SERVICES;
      if (!endpoint) {
        throw new Error('SERVICES.TOP_SERVICES endpoint is not defined');
      }
      const params = limit ? { limit } : undefined;
      return await httpClient.get(endpoint, { params });
    } catch (error) {
      console.error('Get top services error:', error);
      throw error;
    }
  }

  /**
   * Get service categories
   */
  async getServiceCategories(): Promise<ApiResponse<ServiceCategory[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.SERVICES.CATEGORIES);
    } catch (error) {
      console.error('Get service categories error:', error);
      throw error;
    }
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(
    category: string,
    params?: SearchParams
  ): Promise<ApiResponse<Service[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.SERVICES.BY_CATEGORY(category), { params });
    } catch (error) {
      console.error('Get services by category error:', error);
      throw error;
    }
  }

  /**
   * Search services
   */
  async searchServices(params: SearchParams): Promise<ApiResponse<Service[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.SERVICES.SEARCH, { params });
    } catch (error) {
      console.error('Search services error:', error);
      throw error;
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.get(API_ENDPOINTS.SERVICES.BY_ID(serviceId));
    } catch (error) {
      console.error('Get service by ID error:', error);
      throw error;
    }
  }

  /**
   * Create a new service (Admin only)
   */
  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.post(API_ENDPOINTS.SERVICES.ALL, serviceData);
    } catch (error) {
      console.error('Create service error:', error);
      throw error;
    }
  }

  /**
   * Update service (Admin only)
   */
  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.SERVICES.BY_ID(serviceId), serviceData);
    } catch (error) {
      console.error('Update service error:', error);
      throw error;
    }
  }

  /**
   * Delete service (Admin only)
   */
  async deleteService(serviceId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(API_ENDPOINTS.SERVICES.BY_ID(serviceId));
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const serviceService = new ServiceService();
export default serviceService;

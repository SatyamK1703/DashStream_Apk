import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS as ENDPOINTS } from '../config/config';
import { Service, ServiceCategory, SearchParams } from '../types/api';

class ServiceService {
  async getAllServices(params?: SearchParams): Promise<ApiResponse<Service[]>> {
    try {
      return await httpClient.get(ENDPOINTS.SERVICES.ALL, { params });
    } catch (error) {
      console.error('Get all services error:', error);
      throw error;
    }
  }


  async getPopularServices(limit?: number): Promise<ApiResponse<Service[]>> {
    try {
      const params = limit ? { limit } : undefined;
      return await httpClient.get(ENDPOINTS.SERVICES.POPULAR, { params });
    } catch (error) {
      console.error('Get popular services error:', error);
      // ✅ Return empty array to prevent app crashes
      return { success: true, data: [] };
    }
  }

 
  async getTopServices(limit?: number): Promise<ApiResponse<Service[]>> {
    try {
      const params = limit ? { limit } : undefined;
      return await httpClient.get(ENDPOINTS.SERVICES.TOP_SERVICES, { params });
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
      return await httpClient.get(ENDPOINTS.SERVICES.CATEGORIES);
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
      return await httpClient.get(ENDPOINTS.SERVICES.BY_CATEGORY(category), { params });
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
      return await httpClient.get(ENDPOINTS.SERVICES.SEARCH, { params });
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
      return await httpClient.get(ENDPOINTS.SERVICES.BY_ID(serviceId));
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
      return await httpClient.post(ENDPOINTS.SERVICES.ALL, serviceData);
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
      return await httpClient.patch(ENDPOINTS.SERVICES.BY_ID(serviceId), serviceData);
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
      return await httpClient.delete(ENDPOINTS.SERVICES.BY_ID(serviceId));
    } catch (error) {
      console.error('Delete service error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const serviceService = new ServiceService();
export default serviceService;

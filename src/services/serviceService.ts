// src/services/serviceService.ts
import dataService from './dataService';
import { ApiResponse } from './apiService';
import { Service, ServiceCategory } from '../types/ServiceType';

/**
 * Service Service - Provides service-related API operations
 * Acts as a wrapper around dataService for service-specific operations
 */
class ServiceServiceClass {
  
  /**
   * Get a single service by ID
   */
  async getService(serviceId: string): Promise<ApiResponse<{ service: Service }>> {
    try {
      const response = await dataService.getServiceById(serviceId);
      // Transform response to match expected format
      return {
        success: response.success,
        data: {
          service: response.data
        },
        message: response.message
      };
    } catch (error) {
      console.error('Error in getService:', error);
      throw error;
    }
  }

  /**
   * Get all services with optional filters
   */
  async getAllServices(params?: { 
    category?: string; 
    search?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ services: Service[]; total?: number; page?: number; limit?: number }>> {
    try {
      const response = await dataService.getAllServices(params);
      return response;
    } catch (error) {
      console.error('Error in getAllServices:', error);
      throw error;
    }
  }

  /**
   * Get all service categories
   */
  async getServiceCategories(): Promise<ApiResponse<{ categories: ServiceCategory[] }>> {
    try {
      const response = await dataService.getAllServiceCategories();
      // Transform response to match expected format
      return {
        success: response.success,
        data: {
          categories: response.data
        },
        message: response.message
      };
    } catch (error) {
      console.error('Error in getServiceCategories:', error);
      throw error;
    }
  }

  /**
   * Create a new service (for professionals/admin)
   */
  async createService(serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await dataService.createService(serviceData);
    } catch (error) {
      console.error('Error in createService:', error);
      throw error;
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceId: string, serviceData: Partial<Service>): Promise<ApiResponse<Service>> {
    try {
      return await dataService.updateService(serviceId, serviceData);
    } catch (error) {
      console.error('Error in updateService:', error);
      throw error;
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await dataService.deleteService(serviceId);
    } catch (error) {
      console.error('Error in deleteService:', error);
      throw error;
    }
  }

  /**
   * Search services by query
   */
  async searchServices(query: string, params?: { 
    category?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ services: Service[]; total?: number; page?: number; limit?: number }>> {
    try {
      return await this.getAllServices({
        ...params,
        search: query
      });
    } catch (error) {
      console.error('Error in searchServices:', error);
      throw error;
    }
  }

  /**
   * Get services by category
   */
  async getServicesByCategory(category: string, params?: { 
    search?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ services: Service[]; total?: number; page?: number; limit?: number }>> {
    try {
      return await this.getAllServices({
        ...params,
        category
      });
    } catch (error) {
      console.error('Error in getServicesByCategory:', error);
      throw error;
    }
  }

  /**
   * Get featured services
   */
  async getFeaturedServices(limit: number = 10): Promise<ApiResponse<{ services: Service[] }>> {
    try {
      const response = await this.getAllServices({ limit });
      return response;
    } catch (error) {
      console.error('Error in getFeaturedServices:', error);
      throw error;
    }
  }

  /**
   * Get popular services
   */
  async getPopularServices(limit: number = 10): Promise<ApiResponse<{ services: Service[] }>> {
    try {
      // For now, returns the same as featured services
      // In the future, this could be based on booking count or ratings
      const response = await this.getAllServices({ limit });
      return response;
    } catch (error) {
      console.error('Error in getPopularServices:', error);
      throw error;
    }
  }

  /**
   * Get services by professional ID
   */
  async getServicesByProfessional(professionalId: string, params?: { 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ services: Service[]; total?: number; page?: number; limit?: number }>> {
    try {
      // Note: This would need a specific endpoint in the backend
      // For now, we'll filter all services (not efficient for large datasets)
      const response = await this.getAllServices(params);
      
      if (response.success && response.data.services) {
        const filteredServices = response.data.services.filter(
          service => service.professional?.id === professionalId
        );
        
        return {
          success: true,
          data: {
            services: filteredServices,
            total: filteredServices.length,
            page: params?.page || 1,
            limit: params?.limit || 10
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error in getServicesByProfessional:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const ServiceService = new ServiceServiceClass();
export default ServiceService;
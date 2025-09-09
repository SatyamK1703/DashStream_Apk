// src/services/vehicleService.ts
import dataService from './dataService';
import { ApiResponse } from './apiService';

// Vehicle interface specific to the VehicleService
export interface Vehicle {
  _id: string;
  type: 'car' | 'motorcycle' | 'bicycle' | '2 Wheeler' | '4 Wheeler';
  brand: string;
  model: string;
  year?: number;
  color: string;
  licensePlate?: string;
  isDefault: boolean;
  image?: {
    url: string;
    public_id?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Create Vehicle Request interface
export interface CreateVehicleRequest {
  type: 'car' | 'motorcycle' | 'bicycle' | '2 Wheeler' | '4 Wheeler';
  brand: string;
  model: string;
  year?: number;
  color: string;
  licensePlate?: string;
  isDefault?: boolean;
}

// Update Vehicle Request interface
export interface UpdateVehicleRequest {
  type?: 'car' | 'motorcycle' | 'bicycle' | '2 Wheeler' | '4 Wheeler';
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  isDefault?: boolean;
}

/**
 * Vehicle Service - Provides vehicle-related API operations
 * Acts as a wrapper around dataService for vehicle-specific operations
 */
class VehicleServiceClass {
  
  /**
   * Get user's vehicles
   */
  async getMyVehicles(): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
    try {
      const response = await dataService.getMyVehicles();
      
      // Transform the response to match expected format
      const vehicles = (response.data || []).map((vehicle: any) => ({
        _id: vehicle._id || vehicle.id,
        type: this.mapVehicleType(vehicle.type),
        brand: vehicle.brand || 'Unknown',
        model: vehicle.model || 'Unknown',
        year: vehicle.year,
        color: vehicle.color || 'Unknown',
        licensePlate: vehicle.licensePlate,
        isDefault: vehicle.isDefault || false,
        image: vehicle.image ? {
          url: vehicle.image.url || vehicle.image,
          public_id: vehicle.image.public_id
        } : undefined,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt
      }));

      return {
        success: response.success,
        data: { vehicles },
        message: response.message || 'Vehicles retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getMyVehicles:', error);
      return {
        success: false,
        data: { vehicles: [] },
        message: 'Failed to retrieve vehicles'
      };
    }
  }

  /**
   * Get a specific vehicle by ID
   */
  async getVehicle(vehicleId: string): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await dataService.getVehicle(vehicleId);
      
      if (response.success && response.data) {
        const vehicle = {
          _id: response.data._id || response.data.id,
          type: this.mapVehicleType(response.data.type),
          brand: response.data.brand || 'Unknown',
          model: response.data.model || 'Unknown',
          year: response.data.year,
          color: response.data.color || 'Unknown',
          licensePlate: response.data.licensePlate,
          isDefault: response.data.isDefault || false,
          image: response.data.image ? {
            url: response.data.image.url || response.data.image,
            public_id: response.data.image.public_id
          } : undefined,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };

        return {
          success: true,
          data: vehicle,
          message: 'Vehicle retrieved successfully'
        };
      }

      return {
        success: false,
        data: {} as Vehicle,
        message: 'Vehicle not found'
      };
    } catch (error) {
      console.error('Error in getVehicle:', error);
      throw error;
    }
  }

  /**
   * Get user's default vehicle
   */
  async getDefaultVehicle(): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await dataService.getMyDefaultVehicle();
      
      if (response.success && response.data) {
        const vehicle = {
          _id: response.data._id || response.data.id,
          type: this.mapVehicleType(response.data.type),
          brand: response.data.brand || 'Unknown',
          model: response.data.model || 'Unknown',
          year: response.data.year,
          color: response.data.color || 'Unknown',
          licensePlate: response.data.licensePlate,
          isDefault: true,
          image: response.data.image ? {
            url: response.data.image.url || response.data.image,
            public_id: response.data.image.public_id
          } : undefined,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };

        return {
          success: true,
          data: vehicle,
          message: 'Default vehicle retrieved successfully'
        };
      }

      return {
        success: false,
        data: {} as Vehicle,
        message: 'No default vehicle found'
      };
    } catch (error) {
      console.error('Error in getDefaultVehicle:', error);
      throw error;
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await dataService.createVehicle({
        ...vehicleData,
        type: this.mapVehicleTypeToBackend(vehicleData.type)
      });

      if (response.success && response.data) {
        const vehicle = {
          _id: response.data._id || response.data.id,
          type: this.mapVehicleType(response.data.type),
          brand: response.data.brand,
          model: response.data.model,
          year: response.data.year,
          color: response.data.color,
          licensePlate: response.data.licensePlate,
          isDefault: response.data.isDefault || false,
          image: response.data.image ? {
            url: response.data.image.url || response.data.image,
            public_id: response.data.image.public_id
          } : undefined,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };

        return {
          success: true,
          data: vehicle,
          message: 'Vehicle created successfully'
        };
      }

      return response;
    } catch (error) {
      console.error('Error in createVehicle:', error);
      throw error;
    }
  }

  /**
   * Update an existing vehicle
   */
  async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      const updateData = { ...vehicleData };
      if (updateData.type) {
        updateData.type = this.mapVehicleTypeToBackend(updateData.type);
      }

      const response = await dataService.updateVehicle(vehicleId, updateData);

      if (response.success && response.data) {
        const vehicle = {
          _id: response.data._id || response.data.id,
          type: this.mapVehicleType(response.data.type),
          brand: response.data.brand,
          model: response.data.model,
          year: response.data.year,
          color: response.data.color,
          licensePlate: response.data.licensePlate,
          isDefault: response.data.isDefault || false,
          image: response.data.image ? {
            url: response.data.image.url || response.data.image,
            public_id: response.data.image.public_id
          } : undefined,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };

        return {
          success: true,
          data: vehicle,
          message: 'Vehicle updated successfully'
        };
      }

      return response;
    } catch (error) {
      console.error('Error in updateVehicle:', error);
      throw error;
    }
  }

  /**
   * Delete a vehicle
   */
  async deleteVehicle(vehicleId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await dataService.deleteVehicle(vehicleId);
    } catch (error) {
      console.error('Error in deleteVehicle:', error);
      throw error;
    }
  }

  /**
   * Set a vehicle as default
   */
  async setDefaultVehicle(vehicleId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await dataService.setDefaultVehicle(vehicleId);
    } catch (error) {
      console.error('Error in setDefaultVehicle:', error);
      throw error;
    }
  }

  /**
   * Upload vehicle image
   */
  async uploadVehicleImage(vehicleId: string, imageData: FormData): Promise<ApiResponse<any>> {
    try {
      return await dataService.uploadVehicleImage(vehicleId, imageData);
    } catch (error) {
      console.error('Error in uploadVehicleImage:', error);
      throw error;
    }
  }

  /**
   * Map vehicle type from backend format to frontend format
   */
  private mapVehicleType(backendType: string): 'car' | 'motorcycle' | 'bicycle' | '2 Wheeler' | '4 Wheeler' {
    switch (backendType) {
      case '4 Wheeler':
      case 'car':
        return 'car';
      case '2 Wheeler':
      case 'motorcycle':
        return 'motorcycle';
      case 'bicycle':
        return 'bicycle';
      default:
        return 'car';
    }
  }

  /**
   * Map vehicle type from frontend format to backend format
   */
  private mapVehicleTypeToBackend(frontendType: string): '2 Wheeler' | '4 Wheeler' {
    switch (frontendType) {
      case 'car':
      case '4 Wheeler':
        return '4 Wheeler';
      case 'motorcycle':
      case 'bicycle':
      case '2 Wheeler':
        return '2 Wheeler';
      default:
        return '4 Wheeler';
    }
  }

  /**
   * Search vehicles by query
   */
  async searchVehicles(query: string): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
    try {
      const response = await this.getMyVehicles();
      
      if (response.success && response.data.vehicles) {
        const filteredVehicles = response.data.vehicles.filter(vehicle =>
          vehicle.brand.toLowerCase().includes(query.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(query.toLowerCase()) ||
          (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(query.toLowerCase()))
        );

        return {
          success: true,
          data: { vehicles: filteredVehicles },
          message: 'Vehicles searched successfully'
        };
      }

      return response;
    } catch (error) {
      console.error('Error in searchVehicles:', error);
      return {
        success: false,
        data: { vehicles: [] },
        message: 'Failed to search vehicles'
      };
    }
  }

  /**
   * Filter vehicles by type
   */
  async getVehiclesByType(type: 'car' | 'motorcycle' | 'bicycle'): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
    try {
      const response = await this.getMyVehicles();
      
      if (response.success && response.data.vehicles) {
        const filteredVehicles = response.data.vehicles.filter(vehicle => vehicle.type === type);

        return {
          success: true,
          data: { vehicles: filteredVehicles },
          message: 'Vehicles filtered successfully'
        };
      }

      return response;
    } catch (error) {
      console.error('Error in getVehiclesByType:', error);
      return {
        success: false,
        data: { vehicles: [] },
        message: 'Failed to filter vehicles'
      };
    }
  }
}

// Create and export a singleton instance
export const VehicleService = new VehicleServiceClass();
export default VehicleService;
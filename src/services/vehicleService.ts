import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { Vehicle, CreateVehicleRequest } from '../types/api';

class VehicleService {
  /**
   * Get user's vehicles
   */
  async getMyVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      return await httpClient.get(ENDPOINTS.VEHICLES.MY_VEHICLES);
    } catch (error) {
      console.error('Get my vehicles error:', error);
      throw error;
    }
  }

  /**
   * Add a new vehicle
   */
  async createVehicle(data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      return await httpClient.post(ENDPOINTS.VEHICLES.CREATE, data);
    } catch (error) {
      console.error('Create vehicle error:', error);
      throw error;
    }
  }

  /**
   * Update vehicle details
   */
  async updateVehicle(vehicleId: string, data: Partial<CreateVehicleRequest>): Promise<ApiResponse<Vehicle>> {
    try {
      return await httpClient.patch(ENDPOINTS.VEHICLES.UPDATE(vehicleId), data);
    } catch (error) {
      console.error('Update vehicle error:', error);
      throw error;
    }
  }

  /**
   * Delete vehicle
   */
  async deleteVehicle(vehicleId: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(ENDPOINTS.VEHICLES.DELETE(vehicleId));
    } catch (error) {
      console.error('Delete vehicle error:', error);
      throw error;
    }
  }

  /**
   * Set default vehicle
   */
  async setDefaultVehicle(vehicleId: string): Promise<ApiResponse<Vehicle>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.VEHICLES.UPDATE(vehicleId)}/set-default`);
    } catch (error) {
      console.error('Set default vehicle error:', error);
      throw error;
    }
  }

  /**
   * Get vehicle makes (for dropdown options)
   */
  async getVehicleMakes(type?: string): Promise<ApiResponse<string[]>> {
    try {
      const params = type ? { type } : undefined;
      return await httpClient.get('/vehicles/makes', { params });
    } catch (error) {
      console.error('Get vehicle makes error:', error);
      throw error;
    }
  }

  /**
   * Get vehicle models by make
   */
  async getVehicleModels(make: string, type?: string): Promise<ApiResponse<string[]>> {
    try {
      const params = { make, ...(type && { type }) };
      return await httpClient.get('/vehicles/models', { params });
    } catch (error) {
      console.error('Get vehicle models error:', error);
      throw error;
    }
  }

  /**
   * Get vehicle years for make/model
   */
  async getVehicleYears(make: string, model: string): Promise<ApiResponse<number[]>> {
    try {
      const params = { make, model };
      return await httpClient.get('/vehicles/years', { params });
    } catch (error) {
      console.error('Get vehicle years error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const vehicleService = new VehicleService();
export default vehicleService;
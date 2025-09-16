import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { CreateVehicleRequest, Vehicle as ApiVehicle } from '../types/api';

class VehicleService {
  async getMyVehicles(): Promise<ApiResponse<ApiVehicle[]>> {
    try {
      return await httpClient.get(ENDPOINTS.VEHICLES.MY_VEHICLES);
    } catch (error) {
      console.error('getMyVehicles error:', error);
      throw error;
    }
  }

  /**
   * Create vehicle. Accepts either a JSON payload or a FormData when an image is included.
   */
  async createVehicle(data: CreateVehicleRequest | FormData): Promise<ApiResponse<ApiVehicle>> {
    try {
      if (data instanceof FormData) {
        // Use uploadFile to ensure multipart/form-data headers
        return await httpClient.uploadFile(ENDPOINTS.VEHICLES.CREATE, data);
      }
      return await httpClient.post(ENDPOINTS.VEHICLES.CREATE, data as CreateVehicleRequest);
    } catch (error) {
      console.error('createVehicle error:', error);
      throw error;
    }
  }

  async updateVehicle(id: string, data: Partial<CreateVehicleRequest> | FormData): Promise<ApiResponse<ApiVehicle>> {
    try {
      if (data instanceof FormData) {
        // Some backends accept multipart on PATCH; if not, callers should upload via a dedicated endpoint
        return await httpClient.uploadFile(ENDPOINTS.VEHICLES.UPDATE(id), data);
      }
      return await httpClient.patch(ENDPOINTS.VEHICLES.UPDATE(id), data as Partial<CreateVehicleRequest>);
    } catch (error) {
      console.error('updateVehicle error:', error);
      throw error;
    }
  }

  async deleteVehicle(id: string): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(ENDPOINTS.VEHICLES.DELETE(id));
    } catch (error) {
      console.error('deleteVehicle error:', error);
      throw error;
    }
  }
}

export const vehicleService = new VehicleService();
export default vehicleService;
import { useCallback } from 'react';
import { useApi } from './useApi';
import { vehicleService } from '../services';
import { CreateVehicleRequest } from '../types/api';

// Hook for fetching user vehicles
export const useMyVehicles = () => {
  const apiCall = useCallback(() => vehicleService.getMyVehicles(), []);
  return useApi(apiCall, { showErrorAlert: false });
};

// Hook for creating a vehicle
export const useCreateVehicle = () => {
  const apiCall = useCallback((vehicleData: CreateVehicleRequest) => vehicleService.createVehicle(vehicleData), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for updating a vehicle
export const useUpdateVehicle = () => {
  const apiCall = useCallback((vehicleId: string, vehicleData: Partial<CreateVehicleRequest>) =>
    vehicleService.updateVehicle(vehicleId, vehicleData), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for deleting a vehicle
export const useDeleteVehicle = () => {
  const apiCall = useCallback((vehicleId: string) => vehicleService.deleteVehicle(vehicleId), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for setting default vehicle
export const useSetDefaultVehicle = () => {
  // setDefaultVehicle is not implemented in vehicleService; use updateVehicle instead
  const apiCall = useCallback((vehicleId: string) => vehicleService.updateVehicle(vehicleId, { isDefault: true } as any), []);
  return useApi(apiCall, { showErrorAlert: true });
};
// Note: additional helper hooks for makes/models/years were removed
// because the backend vehicle service does not expose dedicated API_ENDPOINTS.
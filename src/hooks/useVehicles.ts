import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { vehicleService } from '../services';
import { Vehicle, CreateVehicleRequest } from '../types/api';

// Hook for fetching user vehicles
export const useMyVehicles = () => {
  return useApi(
    () => vehicleService.getMyVehicles(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for creating a vehicle
export const useCreateVehicle = () => {
  return useApi(
    (vehicleData: CreateVehicleRequest) => vehicleService.createVehicle(vehicleData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for updating a vehicle
export const useUpdateVehicle = () => {
  return useApi(
    (vehicleId: string, vehicleData: Partial<CreateVehicleRequest>) => 
      vehicleService.updateVehicle(vehicleId, vehicleData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for deleting a vehicle
export const useDeleteVehicle = () => {
  return useApi(
    (vehicleId: string) => vehicleService.deleteVehicle(vehicleId),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for setting default vehicle
export const useSetDefaultVehicle = () => {
  return useApi(
    (vehicleId: string) => vehicleService.setDefaultVehicle(vehicleId),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for vehicle makes
export const useVehicleMakes = (type?: string) => {
  const api = useApi(
    () => vehicleService.getVehicleMakes(type),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    api.execute();
  }, [type]);

  return api;
};

// Hook for vehicle models
export const useVehicleModels = (make: string | null, type?: string) => {
  const [models, setModels] = useState<string[]>([]);
  
  const api = useApi(
    () => vehicleService.getVehicleModels(make!, type),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setModels(data || []);
      },
    }
  );

  useEffect(() => {
    if (make) {
      api.execute();
    } else {
      setModels([]);
    }
  }, [make, type]);

  return {
    ...api,
    models,
  };
};

// Hook for vehicle years
export const useVehicleYears = (make: string | null, model: string | null) => {
  const [years, setYears] = useState<number[]>([]);
  
  const api = useApi(
    () => vehicleService.getVehicleYears(make!, model!),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setYears(data || []);
      },
    }
  );

  useEffect(() => {
    if (make && model) {
      api.execute();
    } else {
      setYears([]);
    }
  }, [make, model]);

  return {
    ...api,
    years,
  };
};
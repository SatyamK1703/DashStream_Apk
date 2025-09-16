import { useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { userService } from '../services';
import { CreateAddressRequest, UpdateProfileRequest } from '../types/api';

// Hook for fetching user profile
export const useUserProfile = () => {
  const apiCall = useCallback(() => userService.getUserProfile(), []);
  return useApi(apiCall, { showErrorAlert: false });
};

// Hook for updating user profile  
export const useUpdateProfile = () => {
  const apiCall = useCallback((profileData: UpdateProfileRequest) => userService.updateProfile(profileData), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for fetching user addresses
export const useMyAddresses = () => {
  const apiCall = useCallback(() => userService.getMyAddresses(), []);
  return useApi(apiCall, { showErrorAlert: false });
};

// Hook for creating an address
export const useCreateAddress = () => {
  const apiCall = useCallback((addressData: CreateAddressRequest) => userService.createAddress(addressData), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for updating an address
export const useUpdateAddress = () => {
  const apiCall = useCallback((addressId: string, addressData: Partial<CreateAddressRequest>) =>
    userService.updateAddress(addressId, addressData), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for deleting an address
export const useDeleteAddress = () => {
  const apiCall = useCallback((addressId: string) => userService.deleteAddress(addressId), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for setting default address
export const useSetDefaultAddress = () => {
  const apiCall = useCallback((addressId: string) => userService.setDefaultAddress(addressId), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for uploading profile image
export const useUploadProfileImage = () => {
  const apiCall = useCallback((imageFile: FormData) => userService.updateProfileImage(imageFile), []);
  return useApi(apiCall, { showErrorAlert: true });
};

// Hook for fetching professionals
export const useProfessionals = () => {
  const apiCall = useCallback((params?: {
    location?: { latitude: number; longitude: number; radius?: number };
    specializations?: string[];
    minRating?: number;
    sortBy?: 'rating' | 'distance' | 'experience';
    page?: number;
    limit?: number;
  }) => userService.getProfessionals(params), []);
  return useApi(apiCall, { showErrorAlert: false });
};

// Hook for professional details
export const useProfessionalDetails = (professionalId: string | null) => {
  const apiCall = useCallback(() => userService.getProfessionalDetails(professionalId!), [professionalId]);
  const api = useApi(apiCall, { showErrorAlert: false });

  useEffect(() => {
    if (professionalId && api.execute) {
      // call execute but don't depend on `api` identity to avoid re-renders
      api.execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId]);

  return api;
};

// Professional-specific hooks
export const useUpdateProfessionalProfile = () => {
  const apiCall = useCallback((data: {
    specializations?: string[];
    experience?: number;
    serviceAreas?: any[];
    pricing?: any[];
    bio?: string;
  }) => userService.updateProfessionalProfile(data), []);
  return useApi(apiCall, { showErrorAlert: true });
};

export const useToggleAvailability = () => {
  const apiCall = useCallback(() => userService.toggleAvailability(), []);
  return useApi(apiCall, { showErrorAlert: true });
};
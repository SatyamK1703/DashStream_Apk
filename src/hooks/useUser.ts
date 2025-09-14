import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { userService } from '../services';
import { Address, CreateAddressRequest, User } from '../types/api';

// Hook for fetching user profile
export const useUserProfile = () => {
  return useApi(
    () => userService.getUserProfile(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for updating user profile  
export const useUpdateProfile = () => {
  return useApi(
    (profileData: Partial<User>) => userService.updateProfile(profileData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for fetching user addresses
export const useMyAddresses = () => {
  return useApi(
    () => userService.getMyAddresses(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for creating an address
export const useCreateAddress = () => {
  return useApi(
    (addressData: CreateAddressRequest) => userService.createAddress(addressData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for updating an address
export const useUpdateAddress = () => {
  return useApi(
    (addressId: string, addressData: Partial<CreateAddressRequest>) => 
      userService.updateAddress(addressId, addressData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for deleting an address
export const useDeleteAddress = () => {
  return useApi(
    (addressId: string) => userService.deleteAddress(addressId),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for setting default address
export const useSetDefaultAddress = () => {
  return useApi(
    (addressId: string) => userService.setDefaultAddress(addressId),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for uploading profile image
export const useUploadProfileImage = () => {
  return useApi(
    (imageFile: FormData) => userService.updateProfileImage(imageFile),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for fetching professionals
export const useProfessionals = () => {
  return useApi(
    (params?: {
      location?: { latitude: number; longitude: number; radius?: number };
      specializations?: string[];
      minRating?: number;
      sortBy?: 'rating' | 'distance' | 'experience';
      page?: number;
      limit?: number;
    }) => userService.getProfessionals(params),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for professional details
export const useProfessionalDetails = (professionalId: string | null) => {
  const api = useApi(
    () => userService.getProfessionalDetails(professionalId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (professionalId) {
      api.execute();
    }
  }, [professionalId]);

  return api;
};

// Professional-specific hooks
export const useUpdateProfessionalProfile = () => {
  return useApi(
    (data: {
      specializations?: string[];
      experience?: number;
      serviceAreas?: any[];
      pricing?: any[];
      bio?: string;
    }) => userService.updateProfessionalProfile(data),
    {
      showErrorAlert: true,
    }
  );
};

export const useToggleAvailability = () => {
  return useApi(
    () => userService.toggleAvailability(),
    {
      showErrorAlert: true,
    }
  );
};
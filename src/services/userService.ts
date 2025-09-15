// Production User Service
import apiService from './apiService';
import { API_CONFIG } from '../constants/apiConfig';

// Types
export interface Address {
  _id?: string;
  name: string;
  address: string;
  city: string;
  landmark?: string;
  pincode: string;
  isDefault?: boolean;
  type?: 'home' | 'work' | 'other';
}

export interface Vehicle {
  _id?: string;
  type: '2 Wheeler' | '4 Wheeler';
  brand?: string;
  model?: string;
  registrationNumber?: string;
  isDefault?: boolean;
}

export interface UserProfile {
  _id: string;
  name?: string;
  email?: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  profileImage?: string;
  profileComplete: boolean;
  isPhoneVerified: boolean;
  addresses?: Address[];
  vehicles?: Vehicle[];
  preferences?: {
    notifications: boolean;
    newsletter: boolean;
    smsAlerts: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  success: boolean;
  data?: UserProfile;
  message: string;
  statusCode?: number;
}

export interface AddressResponse {
  success: boolean;
  data?: { addresses: Address[] };
  message: string;
  statusCode?: number;
}

export interface VehicleResponse {
  success: boolean;
  data?: { vehicles: Vehicle[] };
  message: string;
  statusCode?: number;
}

class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Get current user profile
  public async getCurrentUser(): Promise<UserResponse> {
    try {
      console.log('👤 Fetching current user profile...');

      // Authentication will be handled by apiService

      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);

      if (response.success && response.data) {
        console.log('✅ User profile fetched successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Profile fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch user profile',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch user profile failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch user profile',
        statusCode: error.statusCode
      };
    }
  }

  // Update user profile
  public async updateProfile(profileData: Partial<UserProfile>): Promise<UserResponse> {
    try {
      console.log('📝 Updating user profile...');

      // Authentication will be handled by apiService

      const response = await apiService.put(
        API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE,
        profileData
      );

      if (response.success && response.data) {
        console.log('✅ Profile updated successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Profile updated successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to update profile',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Update profile failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile',
        statusCode: error.statusCode
      };
    }
  }

  // Get user addresses
  public async getMyAddresses(): Promise<AddressResponse> {
    try {
      console.log('🏠 Fetching user addresses...');

      // Authentication will be handled by apiService

      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.ADDRESSES);

      if (response.success) {
        const addresses = response.data?.addresses || response.data || [];
        console.log('✅ Addresses fetched successfully:', addresses.length);
        
        return {
          success: true,
          data: { addresses },
          message: response.message || 'Addresses fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch addresses',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch addresses failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch addresses',
        statusCode: error.statusCode
      };
    }
  }

  // Add new address
  public async addAddress(addressData: Omit<Address, '_id'>): Promise<AddressResponse> {
    try {
      console.log('➕ Adding new address...');

      // Authentication will be handled by apiService

      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.USERS.ADDRESSES,
        addressData
      );

      if (response.success) {
        console.log('✅ Address added successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Address added successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to add address',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Add address failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to add address',
        statusCode: error.statusCode
      };
    }
  }

  // Update address
  public async updateAddress(addressId: string, addressData: Partial<Address>): Promise<AddressResponse> {
    try {
      console.log('📝 Updating address:', addressId);

      // Authentication will be handled by apiService

      const response = await apiService.put(
        `${API_CONFIG.ENDPOINTS.USERS.ADDRESSES}/${addressId}`,
        addressData
      );

      if (response.success) {
        console.log('✅ Address updated successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Address updated successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to update address',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Update address failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update address',
        statusCode: error.statusCode
      };
    }
  }

  // Delete address
  public async deleteAddress(addressId: string): Promise<AddressResponse> {
    try {
      console.log('🗑️ Deleting address:', addressId);

      // Authentication will be handled by apiService

      const response = await apiService.delete(
        `${API_CONFIG.ENDPOINTS.USERS.ADDRESSES}/${addressId}`
      );

      if (response.success) {
        console.log('✅ Address deleted successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Address deleted successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to delete address',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Delete address failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete address',
        statusCode: error.statusCode
      };
    }
  }

  // Get user vehicles
  public async getMyVehicles(): Promise<VehicleResponse> {
    try {
      console.log('🚗 Fetching user vehicles...');

      // Authentication will be handled by apiService

      const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.VEHICLES);

      if (response.success) {
        const vehicles = response.data?.vehicles || response.data || [];
        console.log('✅ Vehicles fetched successfully:', vehicles.length);
        
        return {
          success: true,
          data: { vehicles },
          message: response.message || 'Vehicles fetched successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to fetch vehicles',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Fetch vehicles failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch vehicles',
        statusCode: error.statusCode
      };
    }
  }

  // Add new vehicle
  public async addVehicle(vehicleData: Omit<Vehicle, '_id'>): Promise<VehicleResponse> {
    try {
      console.log('➕ Adding new vehicle...');

      // Authentication will be handled by apiService

      const response = await apiService.post(
        API_CONFIG.ENDPOINTS.USERS.VEHICLES,
        vehicleData
      );

      if (response.success) {
        console.log('✅ Vehicle added successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Vehicle added successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to add vehicle',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Add vehicle failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to add vehicle',
        statusCode: error.statusCode
      };
    }
  }

  // Update vehicle
  public async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<VehicleResponse> {
    try {
      console.log('📝 Updating vehicle:', vehicleId);

      // Authentication will be handled by apiService

      const response = await apiService.put(
        `${API_CONFIG.ENDPOINTS.USERS.VEHICLES}/${vehicleId}`,
        vehicleData
      );

      if (response.success) {
        console.log('✅ Vehicle updated successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Vehicle updated successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to update vehicle',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Update vehicle failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update vehicle',
        statusCode: error.statusCode
      };
    }
  }

  // Delete vehicle
  public async deleteVehicle(vehicleId: string): Promise<VehicleResponse> {
    try {
      console.log('🗑️ Deleting vehicle:', vehicleId);

      // Authentication will be handled by apiService

      const response = await apiService.delete(
        `${API_CONFIG.ENDPOINTS.USERS.VEHICLES}/${vehicleId}`
      );

      if (response.success) {
        console.log('✅ Vehicle deleted successfully');
        return {
          success: true,
          data: response.data,
          message: response.message || 'Vehicle deleted successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to delete vehicle',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Delete vehicle failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to delete vehicle',
        statusCode: error.statusCode
      };
    }
  }

  // Change password
  public async changePassword(currentPassword: string, newPassword: string): Promise<UserResponse> {
    try {
      console.log('🔒 Changing password...');

      // Authentication will be handled by apiService

      const response = await apiService.put(
        API_CONFIG.ENDPOINTS.USERS.CHANGE_PASSWORD,
        {
          currentPassword,
          newPassword
        }
      );

      if (response.success) {
        console.log('✅ Password changed successfully');
        return {
          success: true,
          message: response.message || 'Password changed successfully',
          statusCode: response.statusCode
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to change password',
          statusCode: response.statusCode
        };
      }
    } catch (error: any) {
      console.error('❌ Change password failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to change password',
        statusCode: error.statusCode
      };
    }
  }
}

// Export singleton instance
export default UserService.getInstance();
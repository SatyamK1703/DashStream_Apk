// src/services/userService.ts
import dataService from './dataService';
import { ApiResponse } from './apiService';
import { User, Customer, Professional, Address, Vehicle, CreateAddressRequest, CreateVehicleRequest, UpdateAddressRequest, UpdateVehicleRequest } from '../types/UserType';

/**
 * User Service - Provides user-related API operations
 * Acts as a wrapper around dataService for user-specific operations
 */
class UserServiceClass {
  
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User | Customer | Professional>> {
    try {
      const user = await dataService.getCurrentUser();
      return {
        success: true,
        data: user as any,
        message: 'User retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await dataService.updateUser(profileData);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Get user addresses
   * Note: Since there's no specific address endpoint, this returns addresses from user profile
   */
  async getMyAddresses(): Promise<ApiResponse<{ addresses: Address[] }>> {
    try {
      const user = await dataService.getCurrentUser();
      const customer = user as Customer;
      
      return {
        success: true,
        data: {
          addresses: customer?.addresses || []
        },
        message: 'Addresses retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getMyAddresses:', error);
      return {
        success: false,
        data: { addresses: [] },
        message: 'Failed to retrieve addresses'
      };
    }
  }

  /**
   * Get user vehicles
   * Uses existing vehicle endpoints from dataService
   */
  async getMyVehicles(): Promise<ApiResponse<{ vehicles: Vehicle[] }>> {
    try {
      const response = await dataService.getMyVehicles();
      return {
        success: response.success,
        data: {
          vehicles: response.data || []
        },
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
   * Get default vehicle
   */
  async getDefaultVehicle(): Promise<ApiResponse<Vehicle>> {
    try {
      return await dataService.getMyDefaultVehicle();
    } catch (error) {
      console.error('Error in getDefaultVehicle:', error);
      throw error;
    }
  }

  /**
   * Create a new address
   * Note: This would need a specific backend endpoint
   */
  async createAddress(addressData: CreateAddressRequest): Promise<ApiResponse<Address>> {
    try {
      // For now, this is a placeholder - you'd need to implement the backend endpoint
      return {
        success: false,
        message: 'Address creation endpoint not yet implemented',
        data: {} as Address
      };
    } catch (error) {
      console.error('Error in createAddress:', error);
      throw error;
    }
  }

  /**
   * Update an address
   * Note: This would need a specific backend endpoint
   */
  async updateAddress(addressId: string, addressData: UpdateAddressRequest): Promise<ApiResponse<Address>> {
    try {
      // For now, this is a placeholder - you'd need to implement the backend endpoint
      return {
        success: false,
        message: 'Address update endpoint not yet implemented',
        data: {} as Address
      };
    } catch (error) {
      console.error('Error in updateAddress:', error);
      throw error;
    }
  }

  /**
   * Delete an address
   * Note: This would need a specific backend endpoint
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // For now, this is a placeholder - you'd need to implement the backend endpoint
      return {
        success: false,
        message: 'Address deletion endpoint not yet implemented'
      };
    } catch (error) {
      console.error('Error in deleteAddress:', error);
      throw error;
    }
  }

  /**
   * Set default address
   * Note: This would need a specific backend endpoint
   */
  async setDefaultAddress(addressId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      // For now, this is a placeholder - you'd need to implement the backend endpoint
      return {
        success: false,
        message: 'Set default address endpoint not yet implemented'
      };
    } catch (error) {
      console.error('Error in setDefaultAddress:', error);
      throw error;
    }
  }

  /**
   * Create a new vehicle
   */
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      return await dataService.createVehicle(vehicleData);
    } catch (error) {
      console.error('Error in createVehicle:', error);
      throw error;
    }
  }

  /**
   * Update a vehicle
   */
  async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleRequest): Promise<ApiResponse<Vehicle>> {
    try {
      return await dataService.updateVehicle(vehicleId, vehicleData);
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
   * Set default vehicle
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
   * Get user by ID (admin functionality)
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      return await dataService.getUserById(userId);
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin functionality)
   */
  async getAllUsers(params?: { 
    role?: string; 
    search?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ users: User[]; total: number; page: number; limit: number }>> {
    try {
      return await dataService.getAllUsers(params);
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      throw error;
    }
  }

  /**
   * Create user (admin functionality)
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await dataService.createUser(userData);
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  /**
   * Update user by ID (admin functionality)
   */
  async updateUserById(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      return await dataService.updateUserById(userId, userData);
    } catch (error) {
      console.error('Error in updateUserById:', error);
      throw error;
    }
  }

  /**
   * Delete user (admin functionality)
   */
  async deleteUser(userId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      return await dataService.deleteUser(userId);
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  }

  /**
   * Get user bookings
   */
  async getUserBookings(params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<any>> {
    try {
      return await dataService.getUserBookings(params);
    } catch (error) {
      console.error('Error in getUserBookings:', error);
      throw error;
    }
  }

  /**
   * Get user payments
   */
  async getUserPayments(params?: { 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<any>> {
    try {
      return await dataService.getUserPayments(params);
    } catch (error) {
      console.error('Error in getUserPayments:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const UserService = new UserServiceClass();
export default UserService;
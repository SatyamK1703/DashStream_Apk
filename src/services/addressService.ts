import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import { Address, CreateAddressRequest } from '../types/api';

class AddressService {
  /**
   * Get all user addresses
   */
  async getMyAddresses(): Promise<Address[]> {
    try {
      const response = await httpClient.get(API_ENDPOINTS.ADDRESSES.ALL);
      return response.data.addresses;
    } catch (error) {
      console.error('Get addresses error:', error);
      throw error;
    }
  }

  /**
   * Create new address
   */
  async createAddress(data: CreateAddressRequest): Promise<Address> {
    try {
      const response = await httpClient.post(API_ENDPOINTS.ADDRESSES.CREATE, data);
      return response.data.address;
    } catch (error) {
      console.error('Create address error:', error);
      throw error;
    }
  }

  /**
   * Update address
   */
  async updateAddress(addressId: string, data: Partial<CreateAddressRequest>): Promise<Address> {
    try {
      const response = await httpClient.patch(API_ENDPOINTS.ADDRESSES.BY_ID(addressId), data);
      return response.data.address;
    } catch (error) {
      console.error('Update address error:', error);
      throw error;
    }
  }

  /**
   * Delete address
   */
  async deleteAddress(addressId: string): Promise<void> {
    try {
      await httpClient.delete(API_ENDPOINTS.ADDRESSES.BY_ID(addressId));
      return;
    } catch (error) {
      console.error('Delete address error:', error);
      throw error;
    }
  }

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      const response = await httpClient.patch(API_ENDPOINTS.ADDRESSES.SET_DEFAULT(addressId));
      return response.data.address;
    } catch (error) {
      console.error('Set default address error:', error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
export default addressService;

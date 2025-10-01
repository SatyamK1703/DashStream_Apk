// src/store/addressStore.ts
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { userService } from '../services';
import { Address } from '../types/api';
import { useAuthStore } from './authStore';

interface AddressState {
  // State
  addresses: Address[];
  defaultAddress: Address | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; address?: Address; error?: string }>;
  updateAddress: (id: string, updates: Partial<Address>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utilities
  clearError: () => void;
  getAddressById: (id: string) => Address | null;
  getAddressesByType: (type: 'home' | 'work' | 'other') => Address[];
}

export const useAddressStore = create<AddressState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      addresses: [],
      defaultAddress: null,
      isLoading: false,
      error: null,

      // Actions
      fetchAddresses: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          set({ addresses: [], defaultAddress: null });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await userService.getAddresses();
          
          if (response.success && response.data) {
            const addresses = response.data;
            const defaultAddress = addresses.find(addr => addr.isDefault) || null;
            
            set({ 
              addresses,
              defaultAddress,
              isLoading: false 
            });
          } else {
            set({ 
              error: response.message || 'Failed to fetch addresses',
              isLoading: false 
            });
          }
        } catch (error: any) {
          console.error('Error fetching addresses:', error);
          set({ 
            error: error.message || 'Failed to fetch addresses',
            isLoading: false 
          });
        }
      },

      addAddress: async (addressData: Omit<Address, '_id' | 'createdAt' | 'updatedAt'>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.addAddress(addressData);
          
          if (response.success && response.data) {
            const { addresses } = get();
            const newAddress = response.data;
            
            set({ 
              addresses: [...addresses, newAddress],
              defaultAddress: newAddress.isDefault ? newAddress : get().defaultAddress,
              isLoading: false 
            });
            
            return { success: true, address: newAddress };
          } else {
            const error = response.message || 'Failed to add address';
            set({ error, isLoading: false });
            return { success: false, error };
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to add address';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      updateAddress: async (id: string, updates: Partial<Address>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.updateAddress(id, updates);
          
          if (response.success) {
            const { addresses } = get();
            const updatedAddresses = addresses.map(address =>
              address._id === id ? { ...address, ...updates } : address
            );
            
            const defaultAddress = updatedAddresses.find(addr => addr.isDefault) || null;
            
            set({ 
              addresses: updatedAddresses,
              defaultAddress,
              isLoading: false 
            });
            
            return { success: true };
          } else {
            const error = response.message || 'Failed to update address';
            set({ error, isLoading: false });
            return { success: false, error };
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to update address';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      deleteAddress: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.deleteAddress(id);
          
          if (response.success) {
            const { addresses, defaultAddress } = get();
            const updatedAddresses = addresses.filter(address => address._id !== id);
            
            set({ 
              addresses: updatedAddresses,
              defaultAddress: defaultAddress?._id === id ? null : defaultAddress,
              isLoading: false 
            });
            
            return { success: true };
          } else {
            const error = response.message || 'Failed to delete address';
            set({ error, isLoading: false });
            return { success: false, error };
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to delete address';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      setDefaultAddress: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await userService.setDefaultAddress(id);
          
          if (response.success) {
            const { addresses } = get();
            const updatedAddresses = addresses.map(address => ({
              ...address,
              isDefault: address._id === id
            }));
            
            const newDefaultAddress = updatedAddresses.find(addr => addr._id === id) || null;
            
            set({ 
              addresses: updatedAddresses,
              defaultAddress: newDefaultAddress,
              isLoading: false 
            });
            
            return { success: true };
          } else {
            const error = response.message || 'Failed to set default address';
            set({ error, isLoading: false });
            return { success: false, error };
          }
        } catch (error: any) {
          const errorMsg = error.message || 'Failed to set default address';
          set({ error: errorMsg, isLoading: false });
          return { success: false, error: errorMsg };
        }
      },

      // Utilities
      clearError: () => set({ error: null }),

      getAddressById: (id: string) => {
        const { addresses } = get();
        return addresses.find(address => address._id === id) || null;
      },

      getAddressesByType: (type: 'home' | 'work' | 'other') => {
        const { addresses } = get();
        return addresses.filter(address => address.type === type);
      },
    })),
    { name: 'Address' }
  )
);
// src/store/checkoutStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Address } from '../types/api';

export interface CheckoutState {
  // Selected address for checkout
  selectedAddress: Address | null;
  
  // Checkout form data
  selectedDate: Date;
  selectedTimeSlot: string | null;
  specialInstructions: string;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setSelectedAddress: (address: Address | null) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTimeSlot: (slot: string | null) => void;
  setSpecialInstructions: (instructions: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Utilities
  clearCheckout: () => void;
  updateCheckoutData: (data: Partial<CheckoutState>) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    selectedAddress: null,
    selectedDate: new Date(),
    selectedTimeSlot: null,
    specialInstructions: '',
    isLoading: false,

    // Actions
    setSelectedAddress: (address) => {
      set({ selectedAddress: address });
    },

    setSelectedDate: (date) => {
      set({ selectedDate: date });
    },

    setSelectedTimeSlot: (slot) => {
      set({ selectedTimeSlot: slot });
    },

    setSpecialInstructions: (instructions) => {
      set({ specialInstructions: instructions });
    },

    setLoading: (isLoading) => {
      set({ isLoading });
    },

    // Utilities
    clearCheckout: () => {
      set({
        selectedAddress: null,
        selectedDate: new Date(),
        selectedTimeSlot: null,
        specialInstructions: '',
        isLoading: false,
      });
    },

    updateCheckoutData: (data) => {
      set((state) => ({ ...state, ...data }));
    },
  }))
);
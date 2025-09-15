// src/store/bookingStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import dataService from '../services/dataService';
import { Booking } from '../types/BookingType';
import { useAuthStore } from './authStore';

interface BookingState {
  // State
  bookings: Booking[];
  activeBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBookings: () => Promise<void>;
  getBookingDetails: (bookingId: string) => Promise<Booking | null>;
  createBooking: (bookingData: any) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<{ success: boolean; error?: string }>;
  
  // Filters and sorting
  getBookingsByStatus: (status: string) => Booking[];
  getRecentBookings: (limit?: number) => Booking[];
  searchBookings: (query: string) => Booking[];
  
  // Utilities
  clearError: () => void;
  setActiveBooking: (booking: Booking | null) => void;
}

export const useBookingStore = create<BookingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    bookings: [],
    activeBooking: null,
    isLoading: false,
    error: null,

    // Actions
    fetchBookings: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        set({ bookings: [], isLoading: false });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await dataService.getBookings();
        if (response.success) {
          set({ 
            bookings: response.data || [],
            isLoading: false 
          });
        } else {
          set({ 
            error: response.error || 'Failed to fetch bookings',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching bookings:', error);
        set({ 
          error: error.message || 'Failed to fetch bookings',
          isLoading: false 
        });
      }
    },

    getBookingDetails: async (bookingId: string) => {
      const { bookings } = get();
      
      // Check cache first
      const cachedBooking = bookings.find(b => b.id === bookingId);
      if (cachedBooking) return cachedBooking;

      try {
        const response = await dataService.getBookingById(bookingId);
        if (response.success && response.data) {
          // Update cache
          const updatedBookings = [...bookings];
          const existingIndex = updatedBookings.findIndex(b => b.id === bookingId);
          if (existingIndex >= 0) {
            updatedBookings[existingIndex] = response.data;
          } else {
            updatedBookings.push(response.data);
          }
          set({ bookings: updatedBookings });
          return response.data;
        }
        return null;
      } catch (error) {
        console.error('Error fetching booking details:', error);
        return null;
      }
    },

    createBooking: async (bookingData: any) => {
      set({ isLoading: true, error: null });
      try {
        const response = await dataService.createBooking(bookingData);
        if (response.success && response.data) {
          const { bookings } = get();
          set({ 
            bookings: [response.data, ...bookings],
            activeBooking: response.data,
            isLoading: false 
          });
          return { success: true, booking: response.data };
        } else {
          const error = response.error || 'Failed to create booking';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create booking';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    cancelBooking: async (bookingId: string, reason?: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await dataService.cancelBooking(bookingId, reason);
        if (response.success) {
          const { bookings } = get();
          const updatedBookings = bookings.map(booking => 
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as any, cancellationReason: reason }
              : booking
          );
          set({ 
            bookings: updatedBookings,
            isLoading: false 
          });
          return { success: true };
        } else {
          const error = response.error || 'Failed to cancel booking';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to cancel booking';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    updateBookingStatus: async (bookingId: string, status: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await dataService.updateBookingStatus(bookingId, status);
        if (response.success && response.data) {
          const { bookings } = get();
          const updatedBookings = bookings.map(booking => 
            booking.id === bookingId ? response.data : booking
          );
          set({ 
            bookings: updatedBookings,
            isLoading: false 
          });
          return { success: true };
        } else {
          const error = response.error || 'Failed to update booking status';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update booking status';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    // Filter and search utilities
    getBookingsByStatus: (status: string) => {
      const { bookings } = get();
      return bookings.filter(booking => booking.status === status);
    },

    getRecentBookings: (limit = 10) => {
      const { bookings } = get();
      return bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
    },

    searchBookings: (query: string) => {
      const { bookings } = get();
      const lowercaseQuery = query.toLowerCase();
      return bookings.filter(booking => 
        booking.id.toLowerCase().includes(lowercaseQuery) ||
        booking.services?.some(service => 
          service.name?.toLowerCase().includes(lowercaseQuery)
        ) ||
        booking.status.toLowerCase().includes(lowercaseQuery)
      );
    },

    // Utility actions
    clearError: () => set({ error: null }),

    setActiveBooking: (activeBooking) => set({ activeBooking }),
  }))
);
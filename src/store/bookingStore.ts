// src/store/bookingStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { bookingService } from '../services';
import { Booking, BookingFilter, BookingStats } from '../types/booking';
import { useAuthStore } from './authStore';

interface BookingState {
  // State
  bookings: Booking[];
  activeBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBookings: (filters?: BookingFilter) => Promise<void>;
  getBookingDetails: (bookingId: string) => Promise<Booking | null>;
  createBooking: (bookingData: any) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  updateBookingStatus: (bookingId: string, status: string) => Promise<{ success: boolean; error?: string }>;
  
  // Filters and sorting
  getBookingsByStatus: (status: string) => Booking[];
  getRecentBookings: (limit?: number) => Booking[];
  searchBookings: (query: string) => Booking[];
  getBookingStats: () => BookingStats;
  
  // Utilities
  clearError: () => void;
  setActiveBooking: (booking: Booking | null) => void;
  refreshBookings: () => Promise<void>;
}

export const useBookingStore = create<BookingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    bookings: [],
    activeBooking: null,
    isLoading: false,
    error: null,

    // Actions
    fetchBookings: async (filters?: BookingFilter) => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) {
        set({ bookings: [], isLoading: false });
        return;
      }

      set({ isLoading: true, error: null });
      try {
        const response = await bookingService.getBookings(filters);
        
        if (response.success && response.data) {
          set({ bookings: response.data, isLoading: false });
        } else {
          set({ 
            error: response.message || 'Failed to fetch bookings',
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
      try {
        const response = await bookingService.getBookingById(bookingId);
        
        if (response.success && response.data) {
          // Update booking in the list if it exists
          const { bookings } = get();
          const updatedBookings = bookings.map(booking =>
            booking.id === bookingId ? response.data : booking
          );
          if (!bookings.find(b => b.id === bookingId)) {
            updatedBookings.push(response.data);
          }
          set({ bookings: updatedBookings });
          
          return response.data;
        }
        return null;
      } catch (error: any) {
        console.error('Error fetching booking details:', error);
        set({ error: error.message || 'Failed to fetch booking details' });
        return null;
      }
    },

    createBooking: async (bookingData: any) => {
      set({ isLoading: true, error: null });
      try {
        const response = await bookingService.createBooking(bookingData);
        
        if (response.success && response.data) {
          const { bookings } = get();
          set({ 
            bookings: [response.data, ...bookings],
            isLoading: false 
          });
          return { success: true, booking: response.data };
        } else {
          const error = response.message || 'Failed to create booking';
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
        const response = await bookingService.cancelBooking(bookingId, reason);
        
        if (response.success) {
          const { bookings } = get();
          const updatedBookings = bookings.map(booking =>
            booking.id === bookingId 
              ? { ...booking, status: 'cancelled' as const }
              : booking
          );
          set({ bookings: updatedBookings, isLoading: false });
          return { success: true };
        } else {
          const error = response.message || 'Failed to cancel booking';
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
        const response = await bookingService.updateBookingStatus(bookingId, status);
        
        if (response.success) {
          const { bookings } = get();
          const updatedBookings = bookings.map(booking =>
            booking.id === bookingId 
              ? { ...booking, status: status as any }
              : booking
          );
          set({ bookings: updatedBookings, isLoading: false });
          return { success: true };
        } else {
          const error = response.message || 'Failed to update booking status';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update booking status';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    // Filters and sorting
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
        booking.serviceName.toLowerCase().includes(lowercaseQuery) ||
        booking.customerName.toLowerCase().includes(lowercaseQuery) ||
        booking.id.toLowerCase().includes(lowercaseQuery) ||
        booking.status.toLowerCase().includes(lowercaseQuery)
      );
    },

    getBookingStats: (): BookingStats => {
      const { bookings } = get();
      
      return {
        total: bookings.length,
        completed: bookings.filter(b => b.status === 'completed').length,
        pending: bookings.filter(b => b.status === 'pending').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        totalRevenue: bookings
          .filter(b => b.status === 'completed' && b.paymentStatus === 'paid')
          .reduce((sum, b) => sum + b.totalPrice, 0),
      };
    },

    // Utilities
    clearError: () => set({ error: null }),
    
    setActiveBooking: (activeBooking: Booking | null) => set({ activeBooking }),
    
    refreshBookings: async () => {
      const { fetchBookings } = get();
      await fetchBookings();
    },
  }))
);
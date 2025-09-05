// src/contexts/BookingContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

// Define booking type
type Booking = {
  id: string;
  serviceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt: string;
  serviceName?: string;
  serviceImage?: string;
  // Add other booking properties as needed
};

// Define booking context state
type BookingContextType = {
  bookings: Booking[];
  isLoading: boolean;
  fetchBookings: () => Promise<void>;
  getBookingDetails: (bookingId: string) => Promise<Booking | null>;
  createBooking: (bookingData: any) => Promise<{ success: boolean; booking?: Booking; error?: string }>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
};

// Create context with default values
const BookingContext = createContext<BookingContextType>({
  bookings: [],
  isLoading: false,
  fetchBookings: async () => {},
  getBookingDetails: async () => null,
  createBooking: async () => ({ success: false }),
  cancelBooking: async () => ({ success: false }),
});

// Booking provider component
export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  
  // Fetch bookings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      // Clear bookings when logged out
      setBookings([]);
    }
  }, [isAuthenticated]);
  
  // Fetch bookings from API
  const fetchBookings = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      const result = await api.fetchBookings();
      if (result.success && result.bookings) {
        setBookings(result.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get booking details
  const getBookingDetails = async (bookingId: string): Promise<Booking | null> => {
    try {
      const result = await api.getBookingDetails(bookingId);
      if (result.success && result.booking) {
        return result.booking;
      }
      return null;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return null;
    }
  };
  
  // Create booking
  const createBooking = async (bookingData: any) => {
    try {
      const result = await api.createBooking(bookingData);
      
      if (result.success && result.booking) {
        // Add new booking to state
        setBookings(prevBookings => [result.booking, ...prevBookings]);
        return { success: true, booking: result.booking };
      }
      
      return { success: false, error: result.error || 'Failed to create booking' };
    } catch (error: any) {
      console.error('Error creating booking:', error);
      return { success: false, error: 'Failed to create booking. Please try again.' };
    }
  };
  
  // Cancel booking
  const cancelBooking = async (bookingId: string, reason?: string) => {
    try {
      const result = await api.cancelBooking(bookingId, reason);
      
      if (result.success) {
        // Update booking in state
        setBookings(prevBookings =>
          prevBookings.map(booking =>
            booking.id === bookingId
              ? { ...booking, status: 'cancelled' }
              : booking
          )
        );
        return { success: true };
      }
      
      return { success: false, error: result.error || 'Failed to cancel booking' };
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      return { success: false, error: 'Failed to cancel booking. Please try again.' };
    }
  };
  
  // Provide booking context value
  const value = {
    bookings,
    isLoading,
    fetchBookings,
    getBookingDetails,
    createBooking,
    cancelBooking,
  };
  
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

// Custom hook to use booking context
export const useBookings = () => useContext(BookingContext);

export default BookingContext;
import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { bookingService } from '../services';
import { Booking, CreateBookingRequest } from '../types/api';

// Hook for fetching user bookings
export const useMyBookings = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return usePaginatedApi(
    (params) => bookingService.getMyBookings({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for creating a booking
export const useCreateBooking = () => {
  return useApi(
    (bookingData: CreateBookingRequest) => bookingService.createBooking(bookingData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for booking details
export const useBookingDetails = (bookingId: string | null) => {
  const api = useApi(
    () => bookingService.getBookingById(bookingId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (bookingId) {
      api.execute();
    }
  }, [bookingId]);

  return api;
};

// Hook for canceling a booking
export const useCancelBooking = () => {
  return useApi(
    (bookingId: string, reason?: string) => 
      bookingService.cancelBooking(bookingId, reason),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for updating booking status (Professional use)
export const useUpdateBookingStatus = () => {
  return useApi(
    (bookingId: string, status: string, notes?: string) => 
      bookingService.updateBookingStatus(bookingId, status as any, notes),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for rating a booking
export const useRateBooking = () => {
  return useApi(
    (bookingId: string, rating: number, review?: string) => 
      bookingService.rateBooking(bookingId, rating, review),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for booking tracking
export const useBookingTracking = (bookingId: string | null) => {
  const [trackingData, setTrackingData] = useState<any>(null);

  const api = useApi(
    () => bookingService.getBookingTracking(bookingId!),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setTrackingData(data);
      },
    }
  );

  useEffect(() => {
    if (bookingId) {
      api.execute();
    }
  }, [bookingId]);

  return {
    ...api,
    trackingData,
  };
};

// Hook for available time slots
export const useAvailableTimeSlots = () => {
  return useApi(
    (params: {
      serviceId: string;
      date: string;
      location?: { latitude: number; longitude: number };
    }) => bookingService.getAvailableTimeSlots(params),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for price calculation
export const usePriceCalculation = () => {
  return useApi(
    (params: {
      serviceId: string;
      vehicleType?: string;
      location?: { latitude: number; longitude: number };
      addOns?: string[];
      membershipId?: string;
      promoCode?: string;
    }) => bookingService.calculatePrice(params),
    {
      showErrorAlert: false,
    }
  );
};
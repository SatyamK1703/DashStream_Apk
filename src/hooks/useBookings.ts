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
  const [processedData, setProcessedData] = useState<any>(null);
  
  const api = useApi(
    () => bookingService.getBookingById(bookingId!),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        if (__DEV__) {
          console.log('Booking details API response:', JSON.stringify(data, null, 2));
        }
        
        // Handle different response formats
        // The API might return data in different formats:
        // 1. { booking: {...} }
        // 2. { data: { booking: {...} } }
        // 3. { data: {...} } (where data is the booking object itself)
        
        let booking = null;
        
        if (data?.booking) {
          // Format 1: { booking: {...} }
          booking = data.booking;
        } else if (data?.data?.booking) {
          // Format 2: { data: { booking: {...} } }
          booking = data.data.booking;
        } else if (data?.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
          // Format 3: { data: {...} } (where data is the booking object itself)
          booking = data.data;
        } else if (typeof data === 'object' && !Array.isArray(data)) {
          // Format 4: data is the booking object itself
          booking = data;
        }
        
        if (booking) {
          setProcessedData({ booking });
        } else {
          console.error('Could not extract booking data from API response');
        }
      }
    }
  );

  useEffect(() => {
    if (bookingId) {
      api.execute();
    }
  }, [bookingId]);

  return {
    ...api,
    data: processedData || api.data
  };
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
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Get booking details as fallback
  const bookingDetailsApi = useApi(
    () => bookingService.getBookingById(bookingId!),
    {
      showErrorAlert: false,
      executeOnMount: false,
    }
  );

  const api = useApi(
    () => bookingService.getBookingTracking(bookingId!),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        // Handle different response formats
        const trackingInfo = data?.data || data;
        
        if (__DEV__) {
          console.log('Tracking API response:', JSON.stringify(data, null, 2));
        }
        
        setTrackingData(trackingInfo);
        setFallbackUsed(false);
      },
      onError: async (error) => {
        // If tracking endpoint returns 404 or any error, use booking data as fallback
        try {
          // Get booking details instead
          const bookingResult = await bookingDetailsApi.execute();
          
          if (__DEV__) {
            console.log('Fallback booking data:', JSON.stringify(bookingResult, null, 2));
          }
          
          // Extract booking data from response
          let booking = null;
          
          if (bookingResult?.booking) {
            booking = bookingResult.booking;
          } else if (bookingResult?.data?.booking) {
            booking = bookingResult.data.booking;
          } else if (bookingResult?.data?.data) {
            booking = bookingResult.data.data;
          } else if (bookingResult?.data) {
            booking = bookingResult.data;
          } else {
            booking = bookingResult;
          }
          
          if (booking) {
            // Create a fallback tracking object from booking data
            const fallbackTracking = {
              status: booking.status,
              timeline: booking.trackingUpdates || [],
              // No location data in fallback
            };
            
            setTrackingData(fallbackTracking);
            setFallbackUsed(true);
            console.log('Using booking data as fallback for tracking');
          } else {
            console.error('No valid booking data found for fallback');
          }
        } catch (fallbackError) {
          console.error('Fallback tracking error:', fallbackError);
        }
      }
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
    fallbackUsed,
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
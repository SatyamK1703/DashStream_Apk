// src/store/dataStore.ts
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import { serviceService, offerService, bookingService, professionalService, userService } from '../services';
import { Service, Offer, Booking, Professional, User } from '../types/api';

interface DataState {
  // Services
  services: Service[];
  popularServices: Service[];
  isLoadingServices: boolean;
  
  // Offers
  offers: Offer[];
  activeOffers: Offer[];
  featuredOffers: Offer[];
  isLoadingOffers: boolean;
  
  // Bookings
  bookings: Booking[];
  isLoadingBookings: boolean;
  
  // Professionals
  professionals: Professional[];
  nearbyProfessionals: Professional[];
  isLoadingProfessionals: boolean;
  
  // Users
  users: User[];
  isLoadingUsers: boolean;
  
  // Actions
  fetchServices: (filters?: any) => Promise<void>;
  getServiceById: (id: string) => Promise<Service | null>;
  getPopularServices: (limit?: number) => Promise<Service[]>;
  
  fetchOffers: () => Promise<void>;
  getOfferById: (id: string) => Promise<Offer | null>;
  validateOfferCode: (code: string, serviceId?: string, orderAmount?: number) => Promise<{ isValid: boolean; offer?: Offer; error?: string }>;
  
  fetchBookings: (userId?: string) => Promise<void>;
  createBooking: (bookingData: any) => Promise<Booking>;
  updateBookingStatus: (id: string, status: string) => Promise<Booking | null>;
  getBookingById: (id: string) => Promise<Booking | null>;
  
  fetchProfessionals: (filters?: any) => Promise<void>;
  searchNearbyProfessionals: (location: { latitude: number; longitude: number }, radius?: number) => Promise<void>;
  getProfessionalById: (id: string) => Promise<Professional | null>;
  
  fetchUsers: (filters?: any) => Promise<void>;
  getUserById: (id: string) => Promise<User | null>;
  
  // Utility actions
  clearCache: () => void;
  refreshAllData: () => Promise<void>;
}

export const useDataStore = create<DataState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      services: [],
      popularServices: [],
      isLoadingServices: false,
      
      offers: [],
      activeOffers: [],
      featuredOffers: [],
      isLoadingOffers: false,
      
      bookings: [],
      isLoadingBookings: false,
      
      professionals: [],
      nearbyProfessionals: [],
      isLoadingProfessionals: false,
      
      users: [],
      isLoadingUsers: false,

      // Service actions
      fetchServices: async (filters = {}) => {
        set({ isLoadingServices: true });
        try {
          const response = await serviceService.getServices(filters);
          const services = response.success ? response.data : [];
          
          set({ 
            services,
            isLoadingServices: false 
          });
        } catch (error) {
          console.error('Error fetching services:', error);
          set({ 
            services: [],
            isLoadingServices: false 
          });
        }
      },

      getServiceById: async (id: string) => {
        const { services } = get();
        const cachedService = services.find(s => s._id === id);
        if (cachedService) return cachedService;

        try {
          const response = await serviceService.getServiceById(id);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('Error fetching service by ID:', error);
          return null;
        }
      },

      getPopularServices: async (limit = 10) => {
        try {
          const response = await serviceService.getPopularServices(limit);
          const popularServices = response.success ? response.data : [];
          
          set({ popularServices });
          return popularServices;
        } catch (error) {
          console.error('Error fetching popular services:', error);
          set({ popularServices: [] });
          return [];
        }
      },

      // Offer actions
      fetchOffers: async () => {
        set({ isLoadingOffers: true });
        try {
          const response = await offerService.getOffers();
          const offers = response.success ? response.data : [];
          
          const activeOffers = offers.filter(offer => offer.isActive && new Date(offer.validUntil) > new Date());
          const featuredOffers = activeOffers.filter(offer => offer.isFeatured);
          
          set({ 
            offers,
            activeOffers,
            featuredOffers,
            isLoadingOffers: false 
          });
        } catch (error) {
          console.error('Error fetching offers:', error);
          set({ 
            offers: [],
            activeOffers: [],
            featuredOffers: [],
            isLoadingOffers: false 
          });
        }
      },

      getOfferById: async (id: string) => {
        const { offers } = get();
        const cachedOffer = offers.find(o => o._id === id);
        if (cachedOffer) return cachedOffer;

        try {
          const response = await offerService.getOfferById(id);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('Error fetching offer by ID:', error);
          return null;
        }
      },

      validateOfferCode: async (code: string, serviceId?: string, orderAmount?: number) => {
        try {
          const response = await offerService.validateOfferCode(code, serviceId, orderAmount);
          return response;
        } catch (error: any) {
          console.error('Error validating offer code:', error);
          return {
            isValid: false,
            error: error.message || 'Failed to validate offer code'
          };
        }
      },

      // Booking actions
      fetchBookings: async (userId?: string) => {
        set({ isLoadingBookings: true });
        try {
          const response = await bookingService.getBookings({ userId });
          const bookings = response.success ? response.data : [];
          
          set({ 
            bookings,
            isLoadingBookings: false 
          });
        } catch (error) {
          console.error('Error fetching bookings:', error);
          set({ 
            bookings: [],
            isLoadingBookings: false 
          });
        }
      },

      createBooking: async (bookingData: any) => {
        try {
          const response = await bookingService.createBooking(bookingData);
          if (response.success && response.data) {
            const { bookings } = get();
            set({ bookings: [response.data, ...bookings] });
            return response.data;
          }
          throw new Error(response.message || 'Failed to create booking');
        } catch (error) {
          console.error('Error creating booking:', error);
          throw error;
        }
      },

      updateBookingStatus: async (id: string, status: string) => {
        try {
          const response = await bookingService.updateBookingStatus(id, status);
          if (response.success && response.data) {
            const { bookings } = get();
            const updatedBookings = bookings.map(booking => 
              booking._id === id ? response.data : booking
            );
            set({ bookings: updatedBookings });
            return response.data;
          }
          return null;
        } catch (error) {
          console.error('Error updating booking status:', error);
          return null;
        }
      },

      getBookingById: async (id: string) => {
        const { bookings } = get();
        const cachedBooking = bookings.find(b => b._id === id);
        if (cachedBooking) return cachedBooking;

        try {
          const response = await bookingService.getBookingById(id);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('Error fetching booking by ID:', error);
          return null;
        }
      },

      // Professional actions
      fetchProfessionals: async (filters = {}) => {
        set({ isLoadingProfessionals: true });
        try {
          const response = await professionalService.getProfessionals(filters);
          const professionals = response.success ? response.data : [];
          
          set({ 
            professionals,
            isLoadingProfessionals: false 
          });
        } catch (error) {
          console.error('Error fetching professionals:', error);
          set({ 
            professionals: [],
            isLoadingProfessionals: false 
          });
        }
      },

      searchNearbyProfessionals: async (location: { latitude: number; longitude: number }, radius = 10) => {
        set({ isLoadingProfessionals: true });
        try {
          const response = await professionalService.getNearbyProfessionals(location, radius);
          const nearbyProfessionals = response.success ? response.data : [];
          
          set({ 
            nearbyProfessionals,
            isLoadingProfessionals: false 
          });
        } catch (error) {
          console.error('Error fetching nearby professionals:', error);
          set({ 
            nearbyProfessionals: [],
            isLoadingProfessionals: false 
          });
        }
      },

      getProfessionalById: async (id: string) => {
        const { professionals } = get();
        const cachedProfessional = professionals.find(p => p._id === id);
        if (cachedProfessional) return cachedProfessional;

        try {
          const response = await professionalService.getProfessionalById(id);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('Error fetching professional by ID:', error);
          return null;
        }
      },

      // User actions
      fetchUsers: async (filters = {}) => {
        set({ isLoadingUsers: true });
        try {
          const response = await userService.getUsers(filters);
          const users = response.success ? response.data : [];
          
          set({ 
            users,
            isLoadingUsers: false 
          });
        } catch (error) {
          console.error('Error fetching users:', error);
          set({ 
            users: [],
            isLoadingUsers: false 
          });
        }
      },

      getUserById: async (id: string) => {
        const { users } = get();
        const cachedUser = users.find(u => u._id === id);
        if (cachedUser) return cachedUser;

        try {
          const response = await userService.getUserById(id);
          return response.success ? response.data : null;
        } catch (error) {
          console.error('Error fetching user by ID:', error);
          return null;
        }
      },

      // Utility actions
      clearCache: () => {
        set({
          services: [],
          popularServices: [],
          offers: [],
          activeOffers: [],
          featuredOffers: [],
          bookings: [],
          professionals: [],
          nearbyProfessionals: [],
          users: []
        });
      },

      refreshAllData: async () => {
        const { 
          fetchServices, 
          fetchOffers, 
          fetchBookings, 
          fetchProfessionals 
        } = get();
        
        await Promise.all([
          fetchServices(),
          fetchOffers(),
          fetchBookings(),
          fetchProfessionals()
        ]);
      },
    })),
    { name: 'Data' }
  )
);
// src/store/dataStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import dataService from '../services/dataService';
import { Service } from '../types/ServiceType';
import { Offer } from '../types/OfferType';
import { Booking } from '../types/BookingType';
import { Professional, User } from '../types/UserType';
import { mockServices, mockOffers } from '../data/mockServices';
import { isExpoGo } from '../utils/expoGoCompat';

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
        let services: Service[];
        
        if (isExpoGo()) {
          // Use mock data for Expo Go
          services = mockServices;
        } else {
          const response = await dataService.getServices(filters);
          services = response.success ? response.data : [];
        }
        
        set({ 
          services,
          isLoadingServices: false 
        });
      } catch (error) {
        console.error('Error fetching services:', error);
        set({ 
          services: isExpoGo() ? mockServices : [],
          isLoadingServices: false 
        });
      }
    },

    getServiceById: async (id: string) => {
      const { services } = get();
      const cachedService = services.find(s => s.id === id);
      if (cachedService) return cachedService;

      try {
        if (isExpoGo()) {
          return mockServices.find(s => s.id === id) || null;
        }
        
        const response = await dataService.getServiceById(id);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Error fetching service by ID:', error);
        return null;
      }
    },

    getPopularServices: async (limit = 10) => {
      try {
        let popularServices: Service[];
        
        if (isExpoGo()) {
          popularServices = mockServices.slice(0, limit);
        } else {
          const response = await dataService.getPopularServices(limit);
          popularServices = response.success ? response.data : [];
        }
        
        set({ popularServices });
        return popularServices;
      } catch (error) {
        console.error('Error fetching popular services:', error);
        const fallback = isExpoGo() ? mockServices.slice(0, limit) : [];
        set({ popularServices: fallback });
        return fallback;
      }
    },

    // Offer actions
    fetchOffers: async () => {
      set({ isLoadingOffers: true });
      try {
        let offers: Offer[];
        
        if (isExpoGo()) {
          offers = mockOffers;
        } else {
          const response = await dataService.getOffers();
          offers = response.success ? response.data : [];
        }
        
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
        const fallback = isExpoGo() ? mockOffers : [];
        set({ 
          offers: fallback,
          activeOffers: fallback.filter(o => o.isActive),
          featuredOffers: fallback.filter(o => o.isActive && o.isFeatured),
          isLoadingOffers: false 
        });
      }
    },

    getOfferById: async (id: string) => {
      const { offers } = get();
      const cachedOffer = offers.find(o => o.id === id);
      if (cachedOffer) return cachedOffer;

      try {
        if (isExpoGo()) {
          return mockOffers.find(o => o.id === id) || null;
        }
        
        const response = await dataService.getOfferById(id);
        return response.success ? response.data : null;
      } catch (error) {
        console.error('Error fetching offer by ID:', error);
        return null;
      }
    },

    validateOfferCode: async (code: string, serviceId?: string, orderAmount?: number) => {
      try {
        if (isExpoGo()) {
          const offer = mockOffers.find(o => o.code === code && o.isActive);
          return {
            isValid: !!offer,
            offer: offer || undefined,
            error: offer ? undefined : 'Invalid offer code'
          };
        }
        
        const response = await dataService.validateOfferCode(code, serviceId, orderAmount);
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
        const response = await dataService.getBookings(userId);
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
        const response = await dataService.createBooking(bookingData);
        if (response.success && response.data) {
          const { bookings } = get();
          set({ bookings: [...bookings, response.data] });
          return response.data;
        }
        throw new Error(response.error || 'Failed to create booking');
      } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
      }
    },

    updateBookingStatus: async (id: string, status: string) => {
      try {
        const response = await dataService.updateBookingStatus(id, status);
        if (response.success && response.data) {
          const { bookings } = get();
          const updatedBookings = bookings.map(booking => 
            booking.id === id ? response.data : booking
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
      const cachedBooking = bookings.find(b => b.id === id);
      if (cachedBooking) return cachedBooking;

      try {
        const response = await dataService.getBookingById(id);
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
        const response = await dataService.getProfessionals(filters);
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
        const response = await dataService.getNearbyProfessionals(location, radius);
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
      const cachedProfessional = professionals.find(p => p.id === id);
      if (cachedProfessional) return cachedProfessional;

      try {
        const response = await dataService.getProfessionalById(id);
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
        const response = await dataService.getUsers(filters);
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
      const cachedUser = users.find(u => u.id === id);
      if (cachedUser) return cachedUser;

      try {
        const response = await dataService.getUserById(id);
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
  }))
);
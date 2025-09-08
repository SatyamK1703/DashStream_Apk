// src/contexts/DataContext.tsx
// This context replaces API-based contexts with data service integration

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import dataService, { Service, Offer, Booking, Professional, User } from '../services/dataService';

// Context types
interface DataContextType {
  // Services
  services: Service[];
  popularServices: Service[];
  isLoadingServices: boolean;
  fetchServices: (filters?: any) => Promise<void>;
  getServiceById: (id: string) => Promise<Service | null>;
  getPopularServices: (limit?: number) => Promise<Service[]>;
  
  // Offers
  offers: Offer[];
  activeOffers: Offer[];
  featuredOffers: Offer[];
  isLoadingOffers: boolean;
  fetchOffers: () => Promise<void>;
  getOfferById: (id: string) => Promise<Offer | null>;
  validateOfferCode: (code: string, serviceId?: string, orderAmount?: number) => Promise<{ isValid: boolean; offer?: Offer; error?: string }>;
  
  // Bookings
  bookings: Booking[];
  isLoadingBookings: boolean;
  fetchBookings: (userId?: string) => Promise<void>;
  createBooking: (bookingData: any) => Promise<Booking>;
  updateBookingStatus: (id: string, status: string) => Promise<Booking | null>;
  getBookingById: (id: string) => Promise<Booking | null>;
  
  // Professionals
  professionals: Professional[];
  isLoadingProfessionals: boolean;
  fetchProfessionals: () => Promise<void>;
  getProfessionalById: (id: string) => Promise<Professional | null>;
  
  // User
  currentUser: User | null;
  isLoadingUser: boolean;
  setCurrentUser: (user: User) => Promise<void>;
  clearUserData: () => Promise<void>;
  
  // Dashboard (for admin)
  dashboardStats: any;
  recentBookings: Booking[];
  topProfessionals: Professional[];
  isLoadingDashboard: boolean;
  fetchDashboardData: () => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

// Create context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [services, setServices] = useState<Service[]>([]);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoadingProfessionals, setIsLoadingProfessionals] = useState(false);
  
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [topProfessionals, setTopProfessionals] = useState<Professional[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoadingUser(true);
      const user = await dataService.getCurrentUser();
      setCurrentUserState(user);
    } catch (err) {
      console.error('Error initializing user data:', err);
      setError('Failed to load user data');
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Services methods
  const fetchServices = async (filters?: any) => {
    try {
      setIsLoadingServices(true);
      setError(null);
      const servicesData = await dataService.getServices(filters);
      setServices(servicesData);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message || 'Failed to fetch services');
    } finally {
      setIsLoadingServices(false);
    }
  };

  const getServiceById = async (id: string): Promise<Service | null> => {
    try {
      return await dataService.getServiceById(id);
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError(err.message || 'Failed to fetch service');
      return null;
    }
  };

  const getPopularServices = async (limit?: number): Promise<Service[]> => {
    try {
      const popular = await dataService.getPopularServices(limit);
      setPopularServices(popular);
      return popular;
    } catch (err: any) {
      console.error('Error fetching popular services:', err);
      setError(err.message || 'Failed to fetch popular services');
      return [];
    }
  };

  // Offers methods
  const fetchOffers = async () => {
    try {
      setIsLoadingOffers(true);
      setError(null);
      const [offersData, activeData, featuredData] = await Promise.all([
        dataService.getData<Offer>('offers'),
        dataService.getActiveOffers(),
        dataService.getFeaturedOffers()
      ]);
      setOffers(offersData);
      setActiveOffers(activeData);
      setFeaturedOffers(featuredData);
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err.message || 'Failed to fetch offers');
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const getOfferById = async (id: string): Promise<Offer | null> => {
    try {
      return await dataService.getOfferById(id);
    } catch (err: any) {
      console.error('Error fetching offer:', err);
      setError(err.message || 'Failed to fetch offer');
      return null;
    }
  };

  const validateOfferCode = async (code: string, serviceId?: string, orderAmount?: number) => {
    try {
      return await dataService.validateOfferCode(code, serviceId, orderAmount);
    } catch (err: any) {
      console.error('Error validating offer code:', err);
      setError(err.message || 'Failed to validate offer code');
      return { isValid: false, error: 'Validation failed' };
    }
  };

  // Bookings methods
  const fetchBookings = async (userId?: string) => {
    try {
      setIsLoadingBookings(true);
      setError(null);
      const bookingsData = await dataService.getBookings(userId);
      setBookings(bookingsData);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const createBooking = async (bookingData: any): Promise<Booking> => {
    try {
      setError(null);
      const newBooking = await dataService.createBooking(bookingData);
      // Refresh bookings list
      await fetchBookings(currentUser?.id);
      return newBooking;
    } catch (err: any) {
      console.error('Error creating booking:', err);
      setError(err.message || 'Failed to create booking');
      throw err;
    }
  };

  const updateBookingStatus = async (id: string, status: string): Promise<Booking | null> => {
    try {
      setError(null);
      const updatedBooking = await dataService.updateBookingStatus(id, status);
      // Refresh bookings list
      await fetchBookings(currentUser?.id);
      return updatedBooking;
    } catch (err: any) {
      console.error('Error updating booking:', err);
      setError(err.message || 'Failed to update booking');
      return null;
    }
  };

  const getBookingById = async (id: string): Promise<Booking | null> => {
    try {
      return await dataService.getBookingById(id);
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.message || 'Failed to fetch booking');
      return null;
    }
  };

  // Professionals methods
  const fetchProfessionals = async () => {
    try {
      setIsLoadingProfessionals(true);
      setError(null);
      const professionalsData = await dataService.getProfessionals();
      setProfessionals(professionalsData);
    } catch (err: any) {
      console.error('Error fetching professionals:', err);
      setError(err.message || 'Failed to fetch professionals');
    } finally {
      setIsLoadingProfessionals(false);
    }
  };

  const getProfessionalById = async (id: string): Promise<Professional | null> => {
    try {
      return await dataService.getProfessionalById(id);
    } catch (err: any) {
      console.error('Error fetching professional:', err);
      setError(err.message || 'Failed to fetch professional');
      return null;
    }
  };

  // User methods
  const setCurrentUser = async (user: User): Promise<void> => {
    try {
      setError(null);
      await dataService.setCurrentUser(user);
      setCurrentUserState(user);
    } catch (err: any) {
      console.error('Error setting current user:', err);
      setError(err.message || 'Failed to set user data');
    }
  };

  const clearUserData = async (): Promise<void> => {
    try {
      setError(null);
      await dataService.clearUserData();
      setCurrentUserState(null);
    } catch (err: any) {
      console.error('Error clearing user data:', err);
      setError(err.message || 'Failed to clear user data');
    }
  };

  // Dashboard methods
  const fetchDashboardData = async () => {
    try {
      setIsLoadingDashboard(true);
      setError(null);
      const [stats, recent, top] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getRecentBookings(5),
        dataService.getTopProfessionals(5)
      ]);
      setDashboardStats(stats);
      setRecentBookings(recent);
      setTopProfessionals(top);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // Error handling
  const clearError = () => setError(null);

  // Context value
  const contextValue: DataContextType = {
    // Services
    services,
    popularServices,
    isLoadingServices,
    fetchServices,
    getServiceById,
    getPopularServices,
    
    // Offers
    offers,
    activeOffers,
    featuredOffers,
    isLoadingOffers,
    fetchOffers,
    getOfferById,
    validateOfferCode,
    
    // Bookings
    bookings,
    isLoadingBookings,
    fetchBookings,
    createBooking,
    updateBookingStatus,
    getBookingById,
    
    // Professionals
    professionals,
    isLoadingProfessionals,
    fetchProfessionals,
    getProfessionalById,
    
    // User
    currentUser,
    isLoadingUser,
    setCurrentUser,
    clearUserData,
    
    // Dashboard
    dashboardStats,
    recentBookings,
    topProfessionals,
    isLoadingDashboard,
    fetchDashboardData,
    
    // Error handling
    error,
    clearError
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;

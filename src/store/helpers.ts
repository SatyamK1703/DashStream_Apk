// src/store/helpers.ts
// Helper hooks for common store combinations
import { useAuthStore } from './authStore';
import { useCartStore } from './cartStore';
import { useBookingStore } from './bookingStore';
import { useLocationStore } from './locationStore';
import { useNotificationStore } from './notificationStore';
import { usePaymentStore } from './paymentStore';
import { useServiceStore } from './serviceStore';
import { useAddressStore } from './addressStore';
import { useOfferStore } from './offerStore';

// Store initialization hook
export const useInitializeStores = () => {
  const initAuth = useAuthStore(state => state.initAuth);
  const fetchServices = useServiceStore(state => state.fetchServices);
  const fetchOffers = useOfferStore(state => state.fetchOffers);
  const registerForPushNotifications = useNotificationStore(state => state.registerForPushNotifications);
  const requestLocationPermission = useLocationStore(state => state.requestLocationPermission);

  const initializeApp = async () => {
    try {
      // Initialize authentication first
      await initAuth();
      
      // Initialize other stores in parallel, but handle failures gracefully
      const initPromises = [
        fetchServices().catch(console.error),
        fetchOffers().catch(console.error),
        registerForPushNotifications().catch(console.error),
        requestLocationPermission().catch(console.error),
      ];
      
      await Promise.allSettled(initPromises);
      
      console.log('All stores initialized successfully');
    } catch (error) {
      console.error('Error initializing stores:', error);
    }
  };

  return { initializeApp };
};

// Helper hooks for common combinations
export const useAuth = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isGuest = useAuthStore(state => state.isGuest);
  const isLoading = useAuthStore(state => state.isLoading);
  const isBooting = useAuthStore(state => state.isBooting);
  const login = useAuthStore(state => state.login);
  const verifyOtp = useAuthStore(state => state.verifyOtp);
  const logout = useAuthStore(state => state.logout);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);
  const refreshUser = useAuthStore(state => state.refreshUser);
  const recheckAuth = useAuthStore(state => state.recheckAuth);
  
  return {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    isBooting,
    login,
    verifyOtp,
    logout,
    updateUserProfile,
    refreshUser,
    recheckAuth,
    // Legacy method names for backward compatibility
    setUser: useAuthStore(state => state.setUser),
  };
};

export const useCart = () => {
  const items = useCartStore(state => state.items);
  const total = useCartStore(state => state.total);
  const itemCount = useCartStore(state => state.itemCount);
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clear = useCartStore(state => state.clear);
  
  return {
    items,
    total,
    itemCount,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
};

export const useUserBookings = () => {
  const bookings = useBookingStore(state => state.bookings);
  const isLoading = useBookingStore(state => state.isLoading);
  const fetchBookings = useBookingStore(state => state.fetchBookings);
  const createBooking = useBookingStore(state => state.createBooking);
  const getRecentBookings = useBookingStore(state => state.getRecentBookings);
  
  return {
    bookings,
    isLoading,
    fetchBookings,
    createBooking,
    recentBookings: getRecentBookings ? getRecentBookings(5) : [],
  };
};

export const useLocation = () => {
  const currentLocation = useLocationStore(state => state.currentLocation);
  const isTracking = useLocationStore(state => state.isTracking);
  const startTracking = useLocationStore(state => state.startTracking);
  const stopTracking = useLocationStore(state => state.stopTracking);
  const updateCurrentLocation = useLocationStore(state => state.updateCurrentLocation);
  
  return {
    currentLocation,
    isTracking,
    startTracking,
    stopTracking,
    updateCurrentLocation,
  };
};

export const useNotifications = () => {
  const notifications = useNotificationStore(state => state.notifications);
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const markAsRead = useNotificationStore(state => state.markAsRead);
  const markAllAsRead = useNotificationStore(state => state.markAllAsRead);
  const getUnreadNotifications = useNotificationStore(state => state.getUnreadNotifications);
  const fetchNotifications = useNotificationStore(state => state.fetchNotifications);
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    unreadNotifications: getUnreadNotifications ? getUnreadNotifications() : [],
  };
};

export const useAddresses = () => {
  const addresses = useAddressStore(state => state.addresses);
  const defaultAddress = useAddressStore(state => state.defaultAddress);
  const isLoading = useAddressStore(state => state.isLoading);
  const error = useAddressStore(state => state.error);
  const fetchAddresses = useAddressStore(state => state.fetchAddresses);
  const addAddress = useAddressStore(state => state.addAddress);
  const updateAddress = useAddressStore(state => state.updateAddress);
  const deleteAddress = useAddressStore(state => state.deleteAddress);
  const setDefaultAddress = useAddressStore(state => state.setDefaultAddress);
  
  return {
    addresses,
    defaultAddress,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};

export const useOffers = () => {
  const offers = useOfferStore(state => state.offers);
  const activeOffers = useOfferStore(state => state.activeOffers);
  const featuredOffers = useOfferStore(state => state.featuredOffers);
  const appliedOffer = useOfferStore(state => state.appliedOffer);
  const isLoading = useOfferStore(state => state.isLoading);
  const fetchOffers = useOfferStore(state => state.fetchOffers);
  const validateOfferCode = useOfferStore(state => state.validateOfferCode);
  const applyOffer = useOfferStore(state => state.applyOffer);
  const removeAppliedOffer = useOfferStore(state => state.removeAppliedOffer);
  const calculateDiscount = useOfferStore(state => state.calculateDiscount);
  
  return {
    offers,
    activeOffers,
    featuredOffers,
    appliedOffer,
    isLoading,
    fetchOffers,
    validateOfferCode,
    applyOffer,
    removeAppliedOffer,
    calculateDiscount,
  };
};

export const usePayments = () => {
  const paymentMethods = usePaymentStore(state => state.paymentMethods);
  const paymentHistory = usePaymentStore(state => state.paymentHistory);
  const selectedPaymentMethod = usePaymentStore(state => state.selectedPaymentMethod);
  const currentTransaction = usePaymentStore(state => state.currentTransaction);
  const isLoading = usePaymentStore(state => state.isLoading);
  const fetchPaymentMethods = usePaymentStore(state => state.fetchPaymentMethods);
  const fetchPaymentHistory = usePaymentStore(state => state.fetchPaymentHistory);
  const processPayment = usePaymentStore(state => state.processPayment);
  const setSelectedPaymentMethod = usePaymentStore(state => state.setSelectedPaymentMethod);
  const getTotalSpent = usePaymentStore(state => state.getTotalSpent);
  
  return {
    paymentMethods,
    paymentHistory,
    selectedPaymentMethod,
    currentTransaction,
    isLoading,
    fetchPaymentMethods,
    fetchPaymentHistory,
    processPayment,
    setSelectedPaymentMethod,
    getTotalSpent,
  };
};

export const useServices = () => {
  const services = useServiceStore(state => state.services);
  const popularServices = useServiceStore(state => state.popularServices);
  const featuredServices = useServiceStore(state => state.featuredServices);
  const categories = useServiceStore(state => state.categories);
  const selectedService = useServiceStore(state => state.selectedService);
  const relatedServices = useServiceStore(state => state.relatedServices);
  const isLoading = useServiceStore(state => state.isLoading);
  const fetchServices = useServiceStore(state => state.fetchServices);
  const fetchPopularServices = useServiceStore(state => state.fetchPopularServices);
  const fetchFeaturedServices = useServiceStore(state => state.fetchFeaturedServices);
  const setSelectedService = useServiceStore(state => state.setSelectedService);
  const searchServices = useServiceStore(state => state.searchServices);
  const applyFilters = useServiceStore(state => state.applyFilters);
  
  return {
    services,
    popularServices,
    featuredServices,
    categories,
    selectedService,
    relatedServices,
    isLoading,
    fetchServices,
    fetchPopularServices,
    fetchFeaturedServices,
    setSelectedService,
    searchServices,
    applyFilters,
  };
};
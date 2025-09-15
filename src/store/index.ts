// src/store/index.ts
// Export all Zustand stores

// Auth store
export { useAuthStore } from './authStore';
export type { AuthUser } from '../types/auth';

// Data store
export { useDataStore } from './dataStore';

// Booking store
export { useBookingStore } from './bookingStore';

// Location store
export { useLocationStore } from './locationStore';

// Payment store
export { usePaymentStore } from './paymentStore';

// Notification store
export { useNotificationStore } from './notificationStore';

// Service store
export { useServiceStore } from './serviceStore';

// Store initialization hook
export const useInitializeStores = () => {
  const initAuth = useAuthStore(state => state.initAuth);
  const fetchServices = useServiceStore(state => state.fetchServices);
  const fetchOffers = useDataStore(state => state.fetchOffers);
  const registerForPushNotifications = useNotificationStore(state => state.registerForPushNotifications);
  const requestLocationPermission = useLocationStore(state => state.requestLocationPermission);

  const initializeApp = async () => {
    try {
      // Initialize authentication first
      await initAuth();
      
      // Initialize other stores in parallel
      await Promise.all([
        fetchServices(),
        fetchOffers(),
        registerForPushNotifications(),
        requestLocationPermission(),
      ]);
      
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
  const login = useAuthStore(state => state.verifyOtp);
  const logout = useAuthStore(state => state.logout);
  
  return {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    login,
    logout,
  };
};

export const useCart = () => {
  const cart = useServiceStore(state => state.cart);
  const cartTotal = useServiceStore(state => state.cartTotal);
  const addToCart = useServiceStore(state => state.addToCart);
  const removeFromCart = useServiceStore(state => state.removeFromCart);
  const updateCartItem = useServiceStore(state => state.updateCartItem);
  const clearCart = useServiceStore(state => state.clearCart);
  
  return {
    cart,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    itemCount: cart.length,
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
    recentBookings: getRecentBookings(5),
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
    unreadNotifications: getUnreadNotifications(),
  };
};
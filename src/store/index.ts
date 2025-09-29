// src/store/index.ts
// Export all Zustand stores

// Auth store
export { useAuthStore, type User, type UserRole } from './authStore';

// Cart store
export { useCartStore, type CartItem } from './cartStore';

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

// Address store
export { useAddressStore } from './addressStore';

// Offer store
export { useOfferStore } from './offerStore';

// Export helper hooks from separate file to avoid circular dependencies
export {
  useInitializeStores,
  useAuth,
  useCart,
  useUserBookings,
  useLocation,
  useNotifications,
  useAddresses,
  useOffers,
  usePayments,
  useServices,
} from './helpers';
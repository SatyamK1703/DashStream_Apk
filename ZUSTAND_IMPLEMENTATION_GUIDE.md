# Zustand State Management Implementation Guide

## Overview

This project now uses **Zustand** for state management, replacing the previous Context API implementation. Zustand provides a simpler, more performant, and type-safe approach to state management in React Native.

## Store Architecture

### Available Stores

1. **AuthStore** (`authStore.ts`) - User authentication and profile management
2. **DataStore** (`dataStore.ts`) - General data fetching and caching
3. **BookingStore** (`bookingStore.ts`) - Booking management and operations
4. **LocationStore** (`locationStore.ts`) - GPS tracking and location services
5. **PaymentStore** (`paymentStore.ts`) - Payment methods and transactions
6. **NotificationStore** (`notificationStore.ts`) - Push notifications and alerts
7. **ServiceStore** (`serviceStore.ts`) - Service catalog and cart management

## Quick Start

### Basic Usage

```typescript
import { useAuthStore, useServiceStore } from '../store';

const MyComponent = () => {
  // Get state and actions from store
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { services, fetchServices, addToCart } = useServiceStore();

  // Use in component
  return (
    <View>
      {isAuthenticated ? (
        <Text>Welcome, {user?.name}</Text>
      ) : (
        <Button title="Login" onPress={() => login(phone, otp)} />
      )}
    </View>
  );
};
```

### Using Helper Hooks

```typescript
import { useAuth, useCart, useUserBookings } from '../store';

const MyComponent = () => {
  // Simplified auth hook
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Cart management
  const { cart, cartTotal, addToCart, clearCart } = useCart();
  
  // User bookings
  const { bookings, recentBookings, createBooking } = useUserBookings();
  
  return (
    // Your component JSX
  );
};
```

## Store Features

### Authentication Store

```typescript
const authStore = useAuthStore();

// State
authStore.user              // Current user object
authStore.isAuthenticated   // Boolean auth status
authStore.isGuest          // Guest mode status
authStore.isLoading        // Loading state

// Actions
await authStore.sendOtp(phone)
await authStore.verifyOtp(phone, otp)
await authStore.logout()
await authStore.loginAsGuest()
await authStore.updateUserProfile(userData)
```

### Service Store (with Cart)

```typescript
const serviceStore = useServiceStore();

// State
serviceStore.services       // All services
serviceStore.cart          // Cart items
serviceStore.cartTotal     // Total cart value
serviceStore.searchQuery   // Current search

// Actions
await serviceStore.fetchServices()
serviceStore.addToCart(service, quantity)
serviceStore.removeFromCart(serviceId)
serviceStore.setSearchQuery(query)
const filtered = serviceStore.applyFilters()
```

### Booking Store

```typescript
const bookingStore = useBookingStore();

// State
bookingStore.bookings      // User bookings
bookingStore.activeBooking // Currently active booking
bookingStore.isLoading     // Loading state

// Actions
await bookingStore.fetchBookings()
await bookingStore.createBooking(bookingData)
await bookingStore.cancelBooking(id, reason)
const recent = bookingStore.getRecentBookings(5)
```

### Location Store

```typescript
const locationStore = useLocationStore();

// State
locationStore.currentLocation    // Current GPS position
locationStore.isTracking        // Tracking status
locationStore.hasLocationPermission // Permission status

// Actions
await locationStore.requestLocationPermission()
await locationStore.startTracking()
await locationStore.stopTracking()
await locationStore.updateCurrentLocation()
```

### Payment Store

```typescript
const paymentStore = usePaymentStore();

// State
paymentStore.paymentMethods     // Saved payment methods
paymentStore.paymentHistory     // Transaction history
paymentStore.selectedPaymentMethod // Currently selected method

// Actions
paymentStore.addPaymentMethod(method)
paymentStore.setSelectedPaymentMethod(method)
await paymentStore.processPayment(amount, bookingId)
await paymentStore.refundPayment(transactionId)
```

### Notification Store

```typescript
const notificationStore = useNotificationStore();

// State
notificationStore.notifications    // All notifications
notificationStore.unreadCount     // Count of unread notifications
notificationStore.hasPermission   // Notification permission

// Actions
await notificationStore.requestPermission()
await notificationStore.registerForPushNotifications()
notificationStore.markAsRead(notificationId)
notificationStore.markAllAsRead()
```

## Migration from Context API

### Before (Context API)
```typescript
// Old way with Context API
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

const MyComponent = () => {
  const { user, login, logout } = useAuth();
  const { services, fetchServices } = useData();
  
  // Component logic
};
```

### After (Zustand)
```typescript
// New way with Zustand
import { useAuthStore, useDataStore } from '../store';
// Or use helper hooks
import { useAuth } from '../store';

const MyComponent = () => {
  const { user, login, logout } = useAuth(); // Helper hook
  const { services, fetchServices } = useDataStore(); // Direct store access
  
  // Component logic
};
```

## Advanced Usage

### Subscribing to Specific State Changes

```typescript
import { useAuthStore } from '../store';

const MyComponent = () => {
  // Only re-render when user changes
  const user = useAuthStore(state => state.user);
  
  // Only re-render when loading state changes
  const isLoading = useAuthStore(state => state.isLoading);
  
  return (
    // Component JSX
  );
};
```

### Using Store Outside Components

```typescript
import { useAuthStore, useNotificationStore } from '../store';

// Access store state outside React components
const handleLogout = async () => {
  const { logout } = useAuthStore.getState();
  const { scheduleLocalNotification } = useNotificationStore.getState();
  
  await logout();
  await scheduleLocalNotification('Logged Out', 'You have been logged out successfully');
};
```

### Store Persistence

Some stores (like AuthStore) automatically persist data to AsyncStorage:

```typescript
// AuthStore automatically persists:
// - user
// - isAuthenticated  
// - isGuest

// Data is restored when app restarts
```

## Best Practices

### 1. Use Helper Hooks for Common Patterns
```typescript
// Good - using helper hook
const { user, isAuthenticated } = useAuth();

// Less optimal - direct store access for simple patterns
const user = useAuthStore(state => state.user);
const isAuthenticated = useAuthStore(state => state.isAuthenticated);
```

### 2. Selective Subscriptions
```typescript
// Good - only subscribe to what you need
const cartTotal = useServiceStore(state => state.cartTotal);

// Bad - subscribing to entire store
const { cartTotal } = useServiceStore();
```

### 3. Async Operations
```typescript
// Good - proper error handling
const handleCreateBooking = async () => {
  try {
    const result = await createBooking(bookingData);
    if (result.success) {
      // Handle success
    } else {
      // Handle error
      console.error(result.error);
    }
  } catch (error) {
    console.error('Booking failed:', error);
  }
};
```

### 4. Store Initialization
The app automatically initializes all stores on startup via the `useInitializeStores` hook in `App.tsx`.

## Performance Benefits

1. **No Context Nesting** - Eliminates provider hell
2. **Selective Re-renders** - Components only re-render when subscribed state changes
3. **Smaller Bundle Size** - More efficient than Context API + useReducer
4. **DevTools Support** - Better debugging with Zustand DevTools
5. **TypeScript Integration** - Full type safety throughout

## Error Handling

All stores include consistent error handling:

```typescript
const MyComponent = () => {
  const { error, clearError } = useBookingStore();
  
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      clearError(); // Clear error after showing
    }
  }, [error]);
  
  return (
    // Component JSX
  );
};
```

## Testing

Zustand stores are easy to test:

```typescript
import { useAuthStore } from '../store/authStore';

// Test store actions
it('should login user correctly', async () => {
  const { verifyOtp } = useAuthStore.getState();
  const result = await verifyOtp('1234567890', '123456');
  
  expect(result.success).toBe(true);
  expect(useAuthStore.getState().isAuthenticated).toBe(true);
});
```

## Troubleshooting

### Common Issues

1. **Store not updating** - Make sure you're subscribing to the right part of state
2. **Persistent data not loading** - Check AsyncStorage permissions
3. **Memory leaks** - Zustand automatically handles subscriptions, but be careful with manual subscriptions

### Debug Tips

```typescript
// Log store state
console.log('Auth state:', useAuthStore.getState());

// Subscribe to all state changes (debugging only)
useAuthStore.subscribe(console.log);
```

This implementation provides a much cleaner, more maintainable, and performant state management solution compared to the previous Context API approach.
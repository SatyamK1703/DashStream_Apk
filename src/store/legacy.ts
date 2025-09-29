// src/store/legacy.ts
// Legacy compatibility layer for migration from Context to Zustand stores
// This file provides backward compatible exports to ease the transition

import { useAuth as useModernAuth, useCart as useModernCart } from './index';

// Legacy auth hook compatibility
export const useAuthContext = () => {
  const auth = useModernAuth();
  
  return {
    user: auth.user,
    isLoading: auth.isLoading,
    isBooting: auth.isBooting,
    login: auth.login,
    verifyOtp: auth.verifyOtp,
    logout: auth.logout,
    updateUserProfile: auth.updateUserProfile,
    refreshUser: auth.refreshUser,
    recheckAuth: auth.recheckAuth,
    setUser: auth.setUser,
  };
};

// Legacy cart hook compatibility  
export const useCartContext = () => {
  const cart = useModernCart();
  
  return {
    items: cart.items,
    addItem: cart.addItem,
    removeItem: cart.removeItem,
    updateQuantity: cart.updateQuantity,
    clear: cart.clear,
  };
};

// Re-export modern hooks for consistency
export { useAuth, useCart } from './index';

// Note: This file can be removed once all components are migrated to use the new store hooks directly
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import dataService from '../services/dataService';
import { AuthUser } from '../types/auth';

// Use AuthUser type from types
type User = AuthUser;

// Define auth context state
type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {}, // Default implementation that does nothing
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  logout: async () => {},
  loginAsGuest: async () => ({ success: false }),
  
  updateUserProfile: async () => ({ success: false }),
});

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Check for existing session on app start
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        // Get current user from data service using the new method
        const currentUser = await dataService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear corrupted data
        await dataService.clearUserData();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);
  
  // Send OTP for authentication
  const sendOtp = async (phone: string) => {
    try {
      const response = await dataService.sendOtp(phone);
      return { 
        success: response.success, 
        message: response.message || 'OTP sent successfully'
      };
    } catch (error: any) {
      console.error('Error in sendOtp:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send OTP'
      };
    }
  };
  
  // Verify OTP and login
  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const response = await dataService.verifyOtp(phone, otp);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        return { 
          success: false, 
          error: response.message || 'Invalid OTP'
        };
      }
    } catch (error: any) {
      console.error('Error in verifyOtp:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to verify OTP'
      };
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      await dataService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error in logout:', error);
      // Even if API call fails, clear local data
      try {
        await dataService.clearUserData();
        setUser(null);
      } catch (innerError) {
        console.error('Error clearing user data during logout:', innerError);
      }
    }
  };

  // Login as guest
  const loginAsGuest = async () => {
    try {
      // Create a guest user locally
      const guestUser: User = {
        id: 'guest-' + Date.now(),
        name: 'Guest User',
        phone: '',
        role: 'customer',
        email: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store guest user in local storage
      await dataService.setCurrentUser(guestUser);
      setUser(guestUser);
      
      return { success: true, user: guestUser };
    } catch (error: any) {
      console.error('Error in loginAsGuest:', error);
      return { 
        success: false,
        error: error.message || 'Failed to login as guest'
      };
    }
  };


  // Update user profile
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }
      
      // Determine if the current user is a guest user
      const isGuestUser = user ? user.id?.startsWith('guest-') || user.name === 'Guest User' : false;
      
      // If it's a guest user, just update locally
      if (isGuestUser) {
        const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
        await dataService.setCurrentUser(updatedUser);
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      }
      
      // For regular users, update via API
      const response = await dataService.updateUser(userData);
      
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true, user: response.data };
      } else {
        return { 
          success: false, 
          error: response.message || 'Failed to update profile'
        };
      }
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message || 'Failed to update profile. Please try again.' };
    }
  };
  
  // Determine if the current user is a guest user
  const isGuest = user ? user.id?.startsWith('guest-') || user.name === 'Guest User' : false;
  
  // Provide auth context value
  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    isGuest,
    sendOtp,
    verifyOtp,
    logout,
    loginAsGuest,
    updateUserProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
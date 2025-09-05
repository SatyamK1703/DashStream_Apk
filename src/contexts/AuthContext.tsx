// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import * as api from '../services/api';
import apiService from '../services/apiService';
import authService, { AuthUser } from '../services/AuthService';

// Use AuthUser type from AuthService
type User = AuthUser;

// Define auth context state
type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
};

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => null, // Default implementation that does nothing
  isLoading: true,
  isAuthenticated: false,
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  logout: async () => {},
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
        // Get current user from AuthService
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);
  
  // Send OTP for authentication
  const sendOtp = async (phone: string) => {
    try {
      const result = await api.sendOtp(phone);
      return result;
    } catch (error) {
      console.error('Error in sendOtp:', error);
      return { success: false, error: 'Failed to send OTP. Please try again.' };
    }
  };
  
  // Verify OTP and login
  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const result = await api.verifyOtp(phone, otp);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Error in verifyOtp:', error);
      return { success: false, error: 'Failed to verify OTP. Please try again.' };
    }
  };
  
  // Logout user
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Error in logout:', error);
    }
  };
  
  // Update user profile
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      if (userData.displayName) {
        const result = await authService.updateProfile(userData.displayName);
        
        if (result.success && result.user) {
          setUser(result.user);
        }
        
        return result;
      } else if (userData.email) {
        const result = await authService.updateEmail(userData.email);
        
        if (result.success && result.user) {
          setUser(result.user);
        }
        
        return result;
      }
      
      // Fall back to the original API if other fields need to be updated
      const result = await api.updateUserProfile({ ...user, ...userData });
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: 'Failed to update profile. Please try again.' };
    }
  };
  
  // Provide auth context value
  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    sendOtp,
    verifyOtp,
    logout,
    updateUserProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
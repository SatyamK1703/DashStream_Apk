// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import * as api from '../services/api';
import apiService from '../services/apiService';

// Define user type
type User = {
  id: string;
  name?: string;
  phone: string;
  email?: string;
  role: string;
  profileImage?: string;
  // Add other user properties as needed
};

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
        // Check for auth token
        const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        
        if (token) {
          // Set token in API service
          apiService.setToken(token);
          
          // Get user data from storage
          const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
          
          if (userData) {
            setUser(JSON.parse(userData));
          } else {
            // If we have token but no user data, fetch from API
            const { success, user: fetchedUser } = await api.getUserProfile();
            if (success && fetchedUser) {
              setUser(fetchedUser);
              await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(fetchedUser));
            } else {
              // If we can't get user data, clear token
              await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
              apiService.clearToken();
            }
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Clear potentially corrupted data
        await AsyncStorage.multiRemove([
          APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
          APP_CONFIG.STORAGE_KEYS.USER_DATA,
        ]);
        apiService.clearToken();
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
      await api.logout();
    } catch (error) {
      console.error('Error in logout:', error);
    } finally {
      // Clear user data regardless of API success
      setUser(null);
      await AsyncStorage.multiRemove([
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
      ]);
      apiService.clearToken();
    }
  };
  
  // Update user profile
  const updateUserProfile = async (userData: Partial<User>) => {
    try {
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
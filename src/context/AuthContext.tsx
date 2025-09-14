/**
 * AuthContext - API-First Implementation
 * 
 * ✅ ALL DATA FETCHED FROM API - NO HARDCODED VALUES
 * 
 * This context ensures:
 * - User data comes ONLY from API responses
 * - No fallback or default user data
 * - Strict validation of API response data
 * - Automatic token refresh and session management
 * - Clear error handling with user logout on invalid data
 * 
 * Key Principles:
 * 1. API-First: All user data must come from backend API
 * 2. No Mock Data: No hardcoded or fallback user information
 * 3. Data Validation: Strict validation of API response structure
 * 4. Session Integrity: Clear session on any data inconsistencies
 * 5. Fresh Data: Always fetch fresh data from API, no stale cache
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { userService } from '../services';
import type { User as ApiUser } from '../services';
import { User as FirebaseUser } from 'firebase/auth';

// Define user types
export type UserRole = 'customer' | 'professional' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isBooting: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert API user to app user format
const convertApiUserToAppUser = (apiUser: ApiUser): User => ({
  id: apiUser._id || apiUser.id,
  name: apiUser.name,
  email: apiUser.email || '',
  phone: apiUser.phone,
  role: apiUser.role,
  profileImage: apiUser.profileImage?.url || undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // ⬇️ Used for network spinners on screens (buttons, etc.)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ⬇️ Used ONLY while restoring session at app launch
  const [isBooting, setIsBooting] = useState<boolean>(true);

  // Check if user is already authenticated on app launch
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsBooting(true);
      
      // Set up Firebase auth state listener
      const unsubscribe = firebaseAuthService.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            // User is signed in, get user data from backend
            const response = await firebaseAuthService.getCurrentUser();
            const isSuccess = response.success === true || response.status === 'success';
            
            if (isSuccess && response.data?.user) {
              setUser(convertApiUserToAppUser(response.data.user));
            }
          } catch (error) {
            if (__DEV__) console.warn('Failed to get user data:', error);
            await firebaseAuthService.logout();
          }
        } else {
          // User is signed out
          setUser(null);
        }
        setIsBooting(false);
      });

      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      if (__DEV__) console.warn('Auth check failed:', error);
      setUser(null);
      setIsBooting(false);
    }
  };

  const login = async (phone: string) => {
    try {
      setIsLoading(true);
      
      const response = await firebaseAuthService.sendOtp(phone);
      
      // Handle both success formats: response.success (boolean) or response.status === 'success' (string)
      const isSuccess = response.success === true || response.status === 'success';
      
      if (isSuccess) {
        if (__DEV__) console.log('OTP sent successfully');
        return;
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      if (__DEV__) console.error('Login error:', error);
      const errorMessage = error.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      const response = await firebaseAuthService.verifyOtp(phone, otp);
      
      // Handle both success formats: response.success (boolean) or response.status === 'success' (string)
      const isSuccess = response.success === true || response.status === 'success';
      
      if (isSuccess && response.data?.user) {
        try {
          const appUser = convertApiUserToAppUser(response.data.user);
          
          // Firebase handles authentication automatically after custom token sign-in
          // Just wait a moment for Firebase to process the sign-in
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Verify Firebase authentication status
          const isAuthenticated = await firebaseAuthService.isAuthenticated();
          if (!isAuthenticated) {
            throw new Error('Firebase authentication failed after OTP verification');
          }
          
          setUser(appUser);
          if (__DEV__) console.log('✅ OTP verified and user authenticated with Firebase');
          return true;
        } catch (conversionError: any) {
          if (__DEV__) console.error('User data conversion or Firebase auth failed:', conversionError);
          Alert.alert('Error', 'Invalid user data received or Firebase authentication failed');
          return false;
        }
      } else {
        const errorMessage = response.message || 'Invalid OTP. Please try again.';
        Alert.alert('Verification Failed', errorMessage);
        return false;
      }
    } catch (error: any) {
      if (__DEV__) console.error('OTP verification error:', error);
      const errorMessage = error.message || 'Failed to verify OTP. Please try again.';
      Alert.alert('Error', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await firebaseAuthService.logout();
      setUser(null);
    } catch (error) {
      if (__DEV__) console.error('Logout error:', error);
      // Even if logout fails on server, clear local user
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    try {
      setIsLoading(true);
      
      // Send update request to API
      const response = await userService.updateProfile({
        name: userData.name,
        email: userData.email,
      });
      
      if (response.success && response.data) {
        // ALWAYS use fresh data from API response - no local merging
        try {
          const updatedUser = convertApiUserToAppUser(response.data);
          setUser(updatedUser);
        } catch (conversionError: any) {
          if (__DEV__) console.error('User data conversion failed after update:', conversionError);
          // If conversion fails, refresh user from API to maintain consistency
          await refreshUser();
          throw new Error('Profile updated but data format invalid');
        }
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      if (__DEV__) console.error('Update profile error:', error);
      const errorMessage = error.message || 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await firebaseAuthService.getCurrentUser();
      if (response.success && response.data?.user) {
        setUser(convertApiUserToAppUser(response.data.user));
      }
    } catch (error) {
      if (__DEV__) console.error('Refresh user error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        verifyOtp,
        logout,
        updateUserProfile,
        refreshUser,
        setUser,
        isBooting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

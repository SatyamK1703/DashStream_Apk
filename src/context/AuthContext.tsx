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

import { userService, authService } from '../services';
import httpClient from '../services/httpClient';
import type { User as ApiUser } from '../services';


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
  recheckAuth: () => Promise<void>;
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
    // Add a timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      if (isBooting) {
        if (__DEV__) console.warn('⚠️ Auth check timeout - forcing boot completion');
        setIsBooting(false);
        setUser(null);
      }
    }, 10000); // 10 second timeout

    checkAuthStatus().finally(() => {
      clearTimeout(authTimeout);
    });
    
    // Set up callback for token refresh events
    httpClient.setTokenRefreshCallback(() => {
      if (__DEV__) console.log('🔄 Token refresh event triggered...');
      
      // Check if we still have tokens after refresh attempt
      setTimeout(async () => {
        try {
          const hasTokens = await authService.isAuthenticated();
          if (!hasTokens) {
            if (__DEV__) console.log('🚪 No tokens after refresh - user logged out');
            setUser(null);
            return;
          }
          
          // If we have tokens, try to refresh user data
          await refreshUser();
        } catch (error: any) {
          if (__DEV__) console.error('❌ Error in token refresh callback:', error);
          
          // Check if this is a "user no longer exists" error
          const errorCode = error?.response?.data?.errorCode;
          const isUserNotFound = errorCode === 'APP-401-051' || 
                               error?.response?.data?.message?.includes('User no longer exists');
          
          if (isUserNotFound) {
            if (__DEV__) console.log('🚪 User no longer exists - forcing complete logout');
            try {
              await authService.logout();
            } catch (logoutError) {
              if (__DEV__) console.warn('Error during forced logout:', logoutError);
            }
          }
          
          // Force logout to prevent infinite loops
          setUser(null);
        }
      }, 500);
    });

    // Cleanup callback on unmount
    return () => {
      clearTimeout(authTimeout);
      httpClient.setTokenRefreshCallback(null);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsBooting(true);

      // Check if we have tokens first
      const isAuthenticated = await authService.isAuthenticated();
      if (!isAuthenticated) {
        if (__DEV__) console.log('No auth tokens found');
        setUser(null);
        setIsBooting(false);
        return;
      }

      // If tokens exist, fetch current user
      const response = await authService.getCurrentUser();
      if (__DEV__) {
        console.log('Auth check response:', {
          success: response.success,
          status: response.status,
          hasData: !!response.data,
          hasUser: !!response.data?.user,
          dataValue: response.data
        });
      }

      const isSuccess = response.success === true || response.status === 'success';
      if (isSuccess && response.data?.user) {
        setUser(convertApiUserToAppUser(response.data.user));
        if (__DEV__) console.log('✅ User authenticated successfully');
      } else {
        if (__DEV__) console.warn('Auth check failed: Invalid response data', {
          isSuccess,
          hasData: !!response.data,
          hasUser: !!response.data?.user,
          responseData: response.data
        });
        
        // If the response indicates success but data is undefined/invalid,
        // it might be a token issue - clear tokens and force re-authentication
        if (isSuccess && !response.data?.user) {
          if (__DEV__) console.log('🔄 Success response but no user data - clearing tokens');
          await authService.logout();
        }
        
        setUser(null);
      }
    } catch (error) {
      if (__DEV__) console.warn('Auth check failed:', error);
      
      // If it's an authentication error, clear tokens
      if ((error as any)?.statusCode === 401) {
        if (__DEV__) console.log('🚪 Authentication error during check - clearing tokens');
        try {
          await authService.logout();
        } catch (logoutError) {
          if (__DEV__) console.warn('Error during logout:', logoutError);
        }
      }
      
      setUser(null);
    } finally {
      setIsBooting(false);
    }
  };

  const login = async (phone: string) => {
    try {
      setIsLoading(true);

      const response = await authService.sendOtp({ phone });

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

      const response = await authService.verifyOtp({ phone, otp });

      // Handle both success formats: response.success (boolean) or response.status === 'success' (string)
      const isSuccess = response.success === true || response.status === 'success';

      if (isSuccess && response.data?.user) {
        const appUser = convertApiUserToAppUser(response.data.user);
        setUser(appUser);
        if (__DEV__) console.log('✅ OTP verified and user authenticated');
        return true;
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
      await authService.logout();
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
      if (__DEV__) {
        console.log('🔄 Refreshing user data...');
      }
      
      // Add a small delay to ensure any token refresh operations are complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await authService.getCurrentUser();
      if (__DEV__) {
        console.log('📋 Refresh user response:', {
          success: response.success,
          status: response.status,
          hasData: !!response.data,
          hasUser: !!response.data?.user,
          dataValue: response.data
        });
      }
      
      const isSuccess = response.success === true || response.status === 'success';
      if (isSuccess && response.data?.user) {
        const appUser = convertApiUserToAppUser(response.data.user);
        setUser(appUser);
        if (__DEV__) {
          console.log('✅ User data refreshed successfully:', appUser.name);
        }
      } else {
        if (__DEV__) {
          console.warn('⚠️ Refresh user failed: Invalid response data', {
            isSuccess,
            hasData: !!response.data,
            hasUser: !!response.data?.user,
            responseData: response.data
          });
        }
        
        // If the response indicates success but data is undefined/invalid,
        // it might be a token issue - clear tokens and force re-authentication
        if (isSuccess && !response.data?.user) {
          if (__DEV__) console.log('🔄 Success response but no user data during refresh - clearing tokens');
          try {
            await authService.logout();
          } catch (logoutError) {
            if (__DEV__) console.warn('Error during logout in refresh:', logoutError);
          }
        }
        
        // Check if we still have valid tokens
        const hasTokens = await authService.isAuthenticated();
        if (!hasTokens) {
          if (__DEV__) {
            console.log('🚪 No valid tokens found, logging out user');
          }
        }
        
        setUser(null);
      }
    } catch (error) {
      if (__DEV__) console.error('❌ Refresh user error:', error);
      
      // If there's an authentication error, clear the user and tokens
      if ((error as any)?.statusCode === 401) {
        if (__DEV__) {
          console.log('🚪 Authentication error during refresh, clearing user and tokens');
        }
        try {
          await authService.logout();
        } catch (logoutError) {
          if (__DEV__) console.warn('Error during logout after auth error:', logoutError);
        }
        setUser(null);
      }
    }
  };

  const recheckAuth = async () => {
    await checkAuthStatus();
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
        recheckAuth,
        setUser,
        isBooting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

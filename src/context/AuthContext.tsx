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
    // Run auth boot once on mount. Avoid depending on `isBooting` so
    // rapid reloads won't repeatedly trigger the boot logic.
    let mounted = true;

    // Minimal visible loader duration to avoid flicker during fast reloads
    const minLoaderMs = 400;
    const bootStart = Date.now();

    // Add a timeout to prevent infinite loading (10s), but still
    // ensure the minimal loader time is respected when completing.
    const authTimeout = setTimeout(() => {
      if (mounted) {
        if (__DEV__) console.warn('⚠️ Auth check timeout - forcing boot completion');
        setIsBooting(false);
        setUser(null);
      }
    }, 10000);

    // Run the check and ensure loader is visible at least `minLoaderMs`
    checkAuthStatus()
      .catch((err) => {
        if (__DEV__) console.warn('Auth boot failed:', err);
      })
      .finally(() => {
        const elapsed = Date.now() - bootStart;
        const remaining = Math.max(0, minLoaderMs - elapsed);
        setTimeout(() => {
          if (!mounted) return;
          clearTimeout(authTimeout);
          setIsBooting(false);
        }, remaining);
      });

    // Only set token refresh callback once
    const tokenRefreshHandler = () => {
      if (__DEV__) console.log('🔄 Token refresh event triggered...');

      // debounce to avoid multiple refresh attempts in quick succession
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
    };

    httpClient.setTokenRefreshCallback(tokenRefreshHandler);

    return () => {
      mounted = false;
      clearTimeout(authTimeout);
      httpClient.setTokenRefreshCallback(null);
    };
  }, []);

  const checkAuthStatus = async () => {
    // Implement a limited retry/backoff mechanism to avoid hammering the backend
    const maxAttempts = 3;
    let attempt = 0;

    // Throttle repeated 'no tokens' logs to once per 2s to avoid spamming during fast reloads
    let lastNoTokenLogAt = 0;

    const attemptFetch = async (): Promise<void> => {
      attempt += 1;
      try {
        setIsBooting(true);

        // Respect client-side rate-limit window if set by httpClient
        // @ts-ignore - access internal guard timestamp
        const rateLimitUntil = (httpClient as any).rateLimitUntil as number | null;
        if (rateLimitUntil && Date.now() < rateLimitUntil) {
          const wait = rateLimitUntil - Date.now();
          if (__DEV__) console.warn('Auth boot waiting due to rate-limit until', new Date(rateLimitUntil).toISOString());
          await new Promise((res) => setTimeout(res, wait));
        }

        // Check if we have tokens first
        const isAuthenticated = await authService.isAuthenticated();
        if (!isAuthenticated) {
          if (__DEV__) {
            const now = Date.now();
            if (now - lastNoTokenLogAt > 2000) {
              console.log('No auth tokens found');
              lastNoTokenLogAt = now;
            }
          }
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
          return;
        }

        if (__DEV__) console.warn('Auth check failed: Invalid response data', {
          isSuccess,
          hasData: !!response.data,
          hasUser: !!response.data?.user,
          responseData: response.data
        });

        // If the response indicates success but no user, logout and stop
        if (isSuccess && !response.data?.user) {
          if (__DEV__) console.log('🔄 Success response but no user data - clearing tokens');
          await authService.logout();
          setUser(null);
          setIsBooting(false);
          return;
        }

        // If we reach here, it's a transient failure; decide whether to retry
        if (attempt < maxAttempts) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          if (__DEV__) console.log(`Auth check attempt ${attempt} failed, retrying after ${backoff}ms`);
          await new Promise((res) => setTimeout(res, backoff));
          return attemptFetch();
        }

        // Exhausted attempts - degrade gracefully
        setUser(null);
        setIsBooting(false);
        return;
      } catch (error: any) {
        if (__DEV__) console.warn('Auth check failed (attempt):', error);

        // If server responded with network error or 5xx, allow retry until maxAttempts
        const status = error?.response?.status;
        const isNetworkError = error?.status === 'network_error' || !status;

        if (attempt < maxAttempts && (isNetworkError || (status >= 500 && status < 600))) {
          const backoff = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          if (__DEV__) console.log(`Network/server error during auth check, retrying attempt ${attempt + 1} after ${backoff}ms`);
          await new Promise((res) => setTimeout(res, backoff));
          return attemptFetch();
        }

        // On auth-specific errors (401) or exhausted retries, clear tokens and stop
        if (error?.response?.status === 401) {
          if (__DEV__) console.log('🚪 Authentication error during check - clearing tokens');
          try {
            await authService.logout();
          } catch (logoutError) {
            if (__DEV__) console.warn('Error during logout:', logoutError);
          }
        }

        setUser(null);
        setIsBooting(false);
        return;
      }
    };

    return attemptFetch();
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
      // If a profile image was provided and it's a local URI (not an http(s) URL), upload it first
      const isLocalImage =
        typeof userData.profileImage === 'string' &&
        !userData.profileImage.startsWith('http');

      if (isLocalImage) {
        try {
          const uri = userData.profileImage as string;
          const filename = uri.split('/').pop() || 'profile.jpg';
          const match = filename.match(/\.(\w+)$/);
          const ext = match ? match[1].toLowerCase() : 'jpg';
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

          const formData = new FormData();
          // Form field name expected by backend is usually 'image' or 'file' - use 'image' here
          // React Native FormData file object shape
          // @ts-ignore - platform FormData file shape
          formData.append('image', {
            uri,
            name: filename,
            type: mime,
          });

          const imgResp = await userService.updateProfileImage(formData);
          if (imgResp && imgResp.success && imgResp.data) {
            try {
              const updated = convertApiUserToAppUser(imgResp.data);
              setUser(updated);
            } catch (convErr: any) {
              if (__DEV__) console.error('Conversion failed for image upload response:', convErr);
              await refreshUser();
              throw new Error('Profile image uploaded but server returned unexpected data');
            }
          } else {
            throw new Error(imgResp?.message || 'Failed to upload profile image');
          }
        } catch (imgErr: any) {
          if (__DEV__) console.error('Profile image upload failed:', imgErr);
          // Surface the error to caller/UI
          throw imgErr;
        }
      }

      // Update textual fields (name/email) if provided
      if (userData.name || userData.email) {
        const response = await userService.updateProfile({
          name: userData.name,
          email: userData.email,
        });

        if (response && response.success && response.data) {
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
          throw new Error(response?.message || 'Failed to update profile');
        }
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

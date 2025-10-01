// src/store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist, devtools } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, userService } from '../services';
import httpClient from '../services/httpClient';

export type UserRole = 'customer' | 'professional' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  isGuest?: boolean;
}

interface AuthState {
  // State
  user: User | null;
  isLoading: boolean;
  isBooting: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setBooting: (booting: boolean) => void;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  recheckAuth: () => Promise<void>;
  initAuth: () => Promise<void>;
}

// Helper function to convert API user to app user format
const convertApiUserToAppUser = (apiUser: any): User => ({
  id: apiUser._id || apiUser.id,
  name: apiUser.name,
  email: apiUser.email || '',
  phone: apiUser.phone,
  role: apiUser.role,
  profileImage: apiUser.profileImage?.url || undefined,
});

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isLoading: false,
        isBooting: true,
        isAuthenticated: false,
        isGuest: false,

        // Actions
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user && !user.isGuest,
          isGuest: !!user?.isGuest 
        }),

        setLoading: (isLoading) => set({ isLoading }),
        
        setBooting: (isBooting) => set({ isBooting }),

        login: async (phone: string) => {
          set({ isLoading: true });
          try {
            const response = await authService.sendOtp({ phone });
            const isSuccess = response.success === true || response.status === 'success';

            if (isSuccess) {
              if (__DEV__) console.log('OTP sent successfully');
            } else {
              throw new Error(response.message || 'Failed to send OTP');
            }
          } catch (error: any) {
            if (__DEV__) console.error('Login error:', error);
            throw error;
          } finally {
            set({ isLoading: false });
          }
        },

        verifyOtp: async (phone: string, otp: string): Promise<boolean> => {
          set({ isLoading: true });
          try {
            const response = await authService.verifyOtp({ phone, otp });
            const isSuccess = response.success === true || response.status === 'success';

            if (isSuccess && response.data?.user) {
              const appUser = convertApiUserToAppUser(response.data.user);
              set({ 
                user: appUser,
                isAuthenticated: !appUser.isGuest,
                isGuest: !!appUser.isGuest,
                isLoading: false 
              });
              if (__DEV__) console.log('✅ OTP verified and user authenticated');
              return true;
            } else {
              set({ isLoading: false });
              return false;
            }
          } catch (error: any) {
            if (__DEV__) console.error('OTP verification error:', error);
            set({ isLoading: false });
            return false;
          }
        },

        logout: async () => {
          set({ isLoading: true });
          try {
            await authService.logout();
            set({ 
              user: null, 
              isAuthenticated: false, 
              isGuest: false, 
              isLoading: false 
            });
          } catch (error) {
            if (__DEV__) console.error('Logout error:', error);
            // Force logout even if service call fails
            set({ 
              user: null, 
              isAuthenticated: false, 
              isGuest: false, 
              isLoading: false 
            });
          }
        },

        updateUserProfile: async (userData: Partial<User>) => {
          const { user } = get();
          if (!user) throw new Error('User not authenticated');

          set({ isLoading: true });
          try {
            // Handle profile image upload if provided
            const isLocalImage = 
              typeof userData.profileImage === 'string' &&
              !userData.profileImage.startsWith('http');

            if (isLocalImage) {
              const uri = userData.profileImage as string;
              const filename = uri.split('/').pop() || 'profile.jpg';
              const match = filename.match(/\.(\w+)$/);
              const ext = match ? match[1].toLowerCase() : 'jpg';
              const mime = ext === 'png' ? 'image/png' : 'image/jpeg';

              const formData = new FormData();
              // @ts-ignore - platform FormData file shape
              formData.append('image', {
                uri,
                name: filename,
                type: mime,
              });

              const imgResp = await userService.updateProfileImage(formData);
              if (imgResp && imgResp.success && imgResp.data) {
                const updated = convertApiUserToAppUser(imgResp.data);
                set({ user: updated, isLoading: false });
                return;
              } else {
                throw new Error(imgResp?.message || 'Failed to upload profile image');
              }
            }

            // Update textual fields if provided
            if (userData.name || userData.email) {
              const response = await userService.updateProfile({
                name: userData.name,
                email: userData.email,
              });

              if (response && response.success && response.data) {
                const updatedUser = convertApiUserToAppUser(response.data);
                set({ user: updatedUser, isLoading: false });
              } else {
                throw new Error(response?.message || 'Failed to update profile');
              }
            }
          } catch (error: any) {
            if (__DEV__) console.error('Update profile error:', error);
            set({ isLoading: false });
            throw error;
          }
        },

        refreshUser: async () => {
          try {
            if (__DEV__) console.log('🔄 Refreshing user data...');
            
            // Add a small delay to ensure any token refresh operations are complete
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const response = await authService.getCurrentUser();
            const isSuccess = response.success === true || response.status === 'success';
            
            if (isSuccess && response.data?.user) {
              const appUser = convertApiUserToAppUser(response.data.user);
              set({ user: appUser });
              if (__DEV__) console.log('✅ User data refreshed successfully:', appUser.name);
            } else {
              if (__DEV__) console.warn('⚠️ Refresh user failed: Invalid response data');
              
              // If the response indicates success but data is undefined/invalid,
              // it might be a token issue - clear tokens and force re-authentication
              if (isSuccess && !response.data?.user) {
                if (__DEV__) console.log('🔄 Success response but no user data during refresh - clearing tokens');
                await authService.logout();
              }
              
              // Check if we still have valid tokens
              const hasTokens = await authService.isAuthenticated();
              if (!hasTokens && __DEV__) {
                console.log('🚪 No valid tokens found, logging out user');
              }
              
              set({ user: null, isAuthenticated: false, isGuest: false });
            }
          } catch (error: any) {
            if (__DEV__) console.error('❌ Refresh user error:', error);
            
            // If there's an authentication error, clear the user and tokens
            if (error?.statusCode === 401) {
              if (__DEV__) console.log('🚪 Authentication error during refresh, clearing user and tokens');
              try {
                await authService.logout();
              } catch (logoutError) {
                if (__DEV__) console.warn('Error during logout after auth error:', logoutError);
              }
              set({ user: null, isAuthenticated: false, isGuest: false });
            }
          }
        },

        recheckAuth: async () => {
          await get().initAuth();
        },

        initAuth: async () => {
          let mounted = true;
          const minLoaderMs = 400;
          const bootStart = Date.now();

          // Add a timeout to prevent infinite loading
          const authTimeout = setTimeout(() => {
            if (mounted) {
              if (__DEV__) console.warn('⚠️ Auth check timeout - forcing boot completion');
              set({ isBooting: false, user: null, isAuthenticated: false, isGuest: false });
            }
          }, 10000);

          const checkAuthStatus = async (): Promise<void> => {
            const maxAttempts = 3;
            let attempt = 0;

            const attemptFetch = async (): Promise<void> => {
              attempt += 1;
              try {
                set({ isBooting: true });

                // Check if we have tokens first
                const isAuthenticated = await authService.isAuthenticated();
                if (!isAuthenticated) {
                  if (__DEV__) console.log('No auth tokens found');
                  set({ user: null, isAuthenticated: false, isGuest: false, isBooting: false });
                  return;
                }

                // If tokens exist, fetch current user
                const response = await authService.getCurrentUser();
                const isSuccess = response.success === true || response.status === 'success';
                
                if (isSuccess && response.data?.user) {
                  const appUser = convertApiUserToAppUser(response.data.user);
                  set({ 
                    user: appUser,
                    isAuthenticated: !appUser.isGuest,
                    isGuest: !!appUser.isGuest
                  });
                  if (__DEV__) console.log('✅ User authenticated successfully');
                  return;
                }

                if (__DEV__) console.warn('Auth check failed: Invalid response data');

                // If the response indicates success but no user, logout and stop
                if (isSuccess && !response.data?.user) {
                  if (__DEV__) console.log('🔄 Success response but no user data - clearing tokens');
                  await authService.logout();
                  set({ user: null, isAuthenticated: false, isGuest: false, isBooting: false });
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
                set({ user: null, isAuthenticated: false, isGuest: false, isBooting: false });
              } catch (error: any) {
                if (__DEV__) console.warn('Auth check failed (attempt):', error);

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

                set({ user: null, isAuthenticated: false, isGuest: false, isBooting: false });
              }
            };

            return attemptFetch();
          };

          try {
            await checkAuthStatus();
          } catch (err) {
            if (__DEV__) console.warn('Auth boot failed:', err);
          } finally {
            const elapsed = Date.now() - bootStart;
            const remaining = Math.max(0, minLoaderMs - elapsed);
            setTimeout(() => {
              if (!mounted) return;
              clearTimeout(authTimeout);
              set({ isBooting: false });
            }, remaining);
          }

          // Set token refresh callback
          const tokenRefreshHandler = () => {
            if (__DEV__) console.log('🔄 Token refresh event triggered...');

            setTimeout(async () => {
              try {
                const hasTokens = await authService.isAuthenticated();
                if (!hasTokens) {
                  if (__DEV__) console.log('🚪 No tokens after refresh - user logged out');
                  set({ user: null, isAuthenticated: false, isGuest: false });
                  return;
                }

                // If we have tokens, try to refresh user data
                await get().refreshUser();
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
                set({ user: null, isAuthenticated: false, isGuest: false });
              }
            }, 500);
          };

          httpClient.setTokenRefreshCallback(tokenRefreshHandler);

          return () => {
            mounted = false;
            clearTimeout(authTimeout);
            httpClient.setTokenRefreshCallback(null);
          };
        },
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isGuest: state.isGuest 
        }),
      }
    ),
    { name: 'Auth' }
  )
);
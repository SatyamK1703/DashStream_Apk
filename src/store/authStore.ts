// src/store/authStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dataService from '../services/dataService';
import { AuthUser } from '../types/auth';

interface AuthState {
  // State
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (userData: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isGuest: false,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user && !user.isGuest,
        isGuest: !!user?.isGuest 
      }),

      setLoading: (isLoading) => set({ isLoading }),

      sendOtp: async (phone: string) => {
        set({ isLoading: true });
        try {
          const response = await dataService.sendOtp(phone);
          if (response.success) {
            return { success: true };
          } else {
            return { success: false, error: response.error || 'Failed to send OTP' };
          }
        } catch (error: any) {
          return { success: false, error: error.message || 'Failed to send OTP' };
        } finally {
          set({ isLoading: false });
        }
      },

      verifyOtp: async (phone: string, otp: string) => {
        set({ isLoading: true });
        try {
          const response = await dataService.verifyOtp(phone, otp);
          if (response.success && response.user) {
            const user = response.user;
            set({ 
              user, 
              isAuthenticated: !user.isGuest,
              isGuest: user.isGuest,
              isLoading: false 
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error || 'Invalid OTP' };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'OTP verification failed' };
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await dataService.logout();
          set({ 
            user: null, 
            isAuthenticated: false, 
            isGuest: false, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Logout error:', error);
          // Force logout even if service call fails
          set({ 
            user: null, 
            isAuthenticated: false, 
            isGuest: false, 
            isLoading: false 
          });
        }
      },

      loginAsGuest: async () => {
        set({ isLoading: true });
        try {
          const response = await dataService.loginAsGuest();
          if (response.success && response.user) {
            const user = response.user;
            set({ 
              user, 
              isAuthenticated: false,
              isGuest: true,
              isLoading: false 
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error || 'Guest login failed' };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Guest login failed' };
        }
      },

      updateUserProfile: async (userData: Partial<AuthUser>) => {
        const { user } = get();
        if (!user) return { success: false, error: 'User not authenticated' };

        set({ isLoading: true });
        try {
          const response = await dataService.updateUserProfile(user.id, userData);
          if (response.success && response.user) {
            set({ 
              user: response.user, 
              isLoading: false 
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.error || 'Profile update failed' };
          }
        } catch (error: any) {
          set({ isLoading: false });
          return { success: false, error: error.message || 'Profile update failed' };
        }
      },

      initAuth: async () => {
        set({ isLoading: true });
        try {
          const response = await dataService.getCurrentUser();
          if (response.success && response.user) {
            const user = response.user;
            set({ 
              user, 
              isAuthenticated: !user.isGuest,
              isGuest: user.isGuest,
              isLoading: false 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              isGuest: false, 
              isLoading: false 
            });
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isGuest: false, 
            isLoading: false 
          });
        }
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
  )
);
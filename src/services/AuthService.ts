// src/services/AuthService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import * as api from './api';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  constructor() {
    this.loadUserFromStorage();
  }

  private async loadUserFromStorage(): Promise<void> {
    try {
      const userJson = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER);
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<AuthResult> {
    try {
      // Call the backend API to register the user
      const response = await api.register(email, password, displayName);
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, error: response.error || 'Registration failed' };
    } catch (error: any) {
      console.error('Error registering user:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to register. Please try again.' 
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Call the backend API to login
      const response = await api.login(email, password);
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, error: response.error || 'Login failed' };
    } catch (error: any) {
      console.error('Error logging in:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to login. Please try again.' 
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      // Call the backend API to reset password
      const response = await api.resetPassword(email);
      
      if (response.success) {
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Password reset failed' };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to reset password. Please try again.' 
      };
    }
  }

  async updateProfile(displayName: string): Promise<AuthResult> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Call the backend API to update profile
      const response = await api.updateUserProfile({
        displayName
      });
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, error: response.error || 'Profile update failed' };
    } catch (error: any) {
      console.error('Error updating profile:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile. Please try again.' 
      };
    }
  }

  async updateEmail(email: string): Promise<AuthResult> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Call the backend API to update email
      const response = await api.updateUserProfile({
        email
      });
      
      if (response.success && response.data) {
        this.currentUser = response.data.user;
        return { success: true, user: this.currentUser };
      }
      
      return { success: false, error: response.error || 'Email update failed' };
    } catch (error: any) {
      console.error('Error updating email:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update email. Please try again.' 
      };
    }
  }

  async updatePassword(password: string): Promise<AuthResult> {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Call the backend API to update password
      const response = await api.updatePassword(password);
      
      if (response.success) {
        return { success: true };
      }
      
      return { success: false, error: response.error || 'Password update failed' };
    } catch (error: any) {
      console.error('Error updating password:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to update password. Please try again.' 
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Call the backend API to logout
      await api.logout();
      
      // Clear user data
      this.currentUser = null;
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}

export const authService = new AuthService();
export default authService;
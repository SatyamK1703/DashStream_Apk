// Backend Integration Service for Production-Ready API Communication
import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';
import { Platform } from 'react-native';

class BackendIntegration {
  private static instance: BackendIntegration;
  private initialized = false;

  public static getInstance(): BackendIntegration {
    if (!BackendIntegration.instance) {
      BackendIntegration.instance = new BackendIntegration();
    }
    return BackendIntegration.instance;
  }

  // Initialize the integration service
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load stored auth token
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        apiService.setAuthToken(storedToken);
      }

      // Test connectivity
      await this.testConnection();
      
      this.initialized = true;
      console.log('✅ Backend integration initialized successfully');
    } catch (error) {
      console.error('❌ Backend integration initialization failed:', error);
      throw new Error('Failed to initialize backend integration');
    }
  }

  // Test backend connection
  public async testConnection(): Promise<boolean> {
    try {
      const response = await apiService.get('/health');
      return response.success;
    } catch (error) {
      console.error('Backend connection test failed:', error);
      return false;
    }
  }

  // Authentication methods with proper error handling
  public async sendOtp(phone: string) {
    try {
      // Format phone number for consistent backend processing
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
        phone: formattedPhone
      });

      if (response.success) {
        // Store phone number for verification
        await AsyncStorage.setItem('pendingVerificationPhone', formattedPhone);
        return {
          success: true,
          message: response.message || 'OTP sent successfully',
          phone: formattedPhone
        };
      } else {
        throw new Error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.',
        error: error
      };
    }
  }

  public async verifyOtp(phone: string, otp: string) {
    try {
      const formattedPhone = this.formatPhoneNumber(phone);
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
        phone: formattedPhone,
        otp: otp.trim()
      });

      if (response.success && response.data) {
        // Handle successful verification
        const { token, user } = response.data;
        
        if (token) {
          // Store auth token
          apiService.setAuthToken(token);
          await AsyncStorage.setItem('authToken', token);
        }

        if (user) {
          // Store user data
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }

        // Clear pending verification phone
        await AsyncStorage.removeItem('pendingVerificationPhone');

        return {
          success: true,
          data: { token, user },
          message: response.message || 'Login successful'
        };
      } else {
        throw new Error(response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed. Please try again.',
        error: error
      };
    }
  }

  public async logout() {
    try {
      // Call backend logout endpoint
      await apiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage
      await this.clearLocalData();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    } catch (error: any) {
      console.error('Logout error:', error);
      
      // Clear local data even if backend call fails
      await this.clearLocalData();
      
      return {
        success: true,
        message: 'Logged out successfully'
      };
    }
  }

  // Data synchronization methods
  public async syncUserData() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      if (response.success && response.data) {
        // Update local storage with latest user data
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user || response.data));
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('User data sync failed:', error);
      return null;
    }
  }

  public async syncServices() {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.SERVICES.LIST);
      
      if (response.success && response.data) {
        // Cache services data
        await AsyncStorage.setItem('cachedServices', JSON.stringify({
          data: response.data,
          timestamp: Date.now()
        }));
        
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Services sync failed:', error);
      return null;
    }
  }

  // Utility methods
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Add country code if not present
    if (!formatted.startsWith('+')) {
      // Default to India (+91) if no country code
      if (formatted.length === 10) {
        formatted = `+91${formatted}`;
      } else {
        formatted = `+${formatted}`;
      }
    }
    
    return formatted;
  }

  private async clearLocalData(): Promise<void> {
    try {
      const keys = [
        'authToken',
        'userData',
        'cachedServices',
        'pendingVerificationPhone'
      ];
      
      await AsyncStorage.multiRemove(keys);
      apiService.clearAuthToken();
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }

  // Health check for production monitoring
  public async performHealthCheck() {
    const checks = {
      connectivity: false,
      authentication: false,
      services: false,
      timestamp: new Date().toISOString()
    };

    try {
      // Test basic connectivity
      checks.connectivity = await this.testConnection();
      
      // Test authentication if token exists
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        try {
          const userResponse = await apiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
          checks.authentication = userResponse.success;
        } catch (error) {
          checks.authentication = false;
        }
      }
      
      // Test services endpoint
      try {
        const servicesResponse = await apiService.get(API_CONFIG.ENDPOINTS.SERVICES.LIST);
        checks.services = servicesResponse.success;
      } catch (error) {
        checks.services = false;
      }
      
      return checks;
    } catch (error) {
      console.error('Health check failed:', error);
      return checks;
    }
  }

  // Production monitoring
  public async reportError(error: any, context: string) {
    try {
      // In production, you might want to send errors to a monitoring service
      const errorReport = {
        error: error.message || error.toString(),
        context,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
        version: '1.0.0' // You can get this from app config
      };
      
      console.error('Error Report:', errorReport);
      
      // You can implement error reporting to services like Sentry here
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }
}

// Export singleton instance
export const backendIntegration = BackendIntegration.getInstance();
export default backendIntegration;
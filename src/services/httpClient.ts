import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, APP_CONFIG } from '../config/env';
import { auth } from '../config/firebase';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  status: string;
  message: string;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    requestTime?: string;
  };
}

export interface ApiError {
  success: false;
  status: string;
  message: string;
  error?: {
    code: string;
    details?: any;
  };
  statusCode: number;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@DashStream:access_token',
  REFRESH_TOKEN: '@DashStream:refresh_token',
  USER_DATA: '@DashStream:user_data',
};

class HttpClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: config.API_URL,
      timeout: APP_CONFIG.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': APP_CONFIG.APP_VERSION,
        'X-Platform': 'mobile',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add Firebase ID token to requests
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const idToken = await currentUser.getIdToken();
            if (idToken && config.headers) {
              config.headers.Authorization = `Bearer ${idToken}`;
            }
          }
        } catch (error) {
          console.warn('Failed to get Firebase ID token:', error);
        }

        // Add request timestamp
        if (config.headers) {
          config.headers['X-Request-Time'] = new Date().toISOString();
        }

        // Log request in development
        if (__DEV__) {
          console.log(`🔵 ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Log response in development
        if (__DEV__) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle Firebase token refresh on 401
        if (error.response?.status === 401 && !originalRequest._retry && auth.currentUser) {
          originalRequest._retry = true;

          try {
            // Force refresh Firebase ID token
            const newIdToken = await auth.currentUser.getIdToken(true);
            if (newIdToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newIdToken}`;
              if (__DEV__) console.log('🔄 Retrying request with refreshed Firebase token');
              return this.client(originalRequest);
            }
          } catch (refreshError: any) {
            if (__DEV__) console.error('Firebase token refresh failed:', refreshError);
            // Token refresh failed, likely need to re-authenticate
            return Promise.reject(this.handleError(error));
          }
        }

        // Log error in development
        if (__DEV__) {
          console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Firebase handles token refresh automatically, so these methods are simplified
  private async refreshFirebaseToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken(true); // Force refresh
      }
      return null;
    } catch (error: any) {
      if (__DEV__) console.error('Firebase token refresh failed:', error.message || error);
      throw error;
    }
  }

  private async clearAuthTokens(): Promise<void> {
    try {
      // Clear AsyncStorage user data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN, // Keep for backward compatibility during migration
        STORAGE_KEYS.REFRESH_TOKEN, // Keep for backward compatibility during migration
        STORAGE_KEYS.USER_DATA,
      ]);
      
      // Sign out from Firebase (this clears Firebase tokens)
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch (error) {
      if (__DEV__) console.error('Error clearing auth tokens:', error);
    }
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }

    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        status: 'timeout',
        message: 'Request timeout. Please check your internet connection.',
        statusCode: 408,
      };
    }

    if (error.code === 'ERR_NETWORK') {
      return {
        success: false,
        status: 'network_error',
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      };
    }

    return {
      success: false,
      status: 'unknown_error',
      message: error.message || 'An unexpected error occurred.',
      statusCode: error.response?.status || 500,
    };
  }

  // Public methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Upload file with progress
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  }

  // Firebase Auth methods - simplified since Firebase handles tokens automatically
  
  // Check if user is authenticated with Firebase
  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  // Get current Firebase ID token
  async getIdToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if authenticated
      const currentUser = auth.currentUser;
      if (currentUser) {
        await this.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthTokens();
    }
  }
}

// Create singleton instance
const httpClient = new HttpClient();
export default httpClient;
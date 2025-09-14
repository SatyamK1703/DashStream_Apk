import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, APP_CONFIG } from '../config/env';

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
        // Add access token to requests
        const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
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

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Check if we have a refresh token before attempting refresh
          const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
          const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          
          if (__DEV__) {
            console.log('🔍 401 Token Debug:', {
              hasRefreshToken: !!refreshToken,
              hasAccessToken: !!accessToken,
              refreshTokenLength: refreshToken ? refreshToken.length : 0,
              accessTokenLength: accessToken ? accessToken.length : 0,
              url: error.config?.url
            });
          }
          
          if (!refreshToken) {
            // No refresh token available, clear any stale tokens and fail
            await this.clearAuthTokens();
            if (__DEV__) console.warn('401 error but no refresh token available - clearing all tokens');
            return Promise.reject(this.handleError(error));
          }

          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              if (__DEV__) console.log('🔄 Retrying request with new token');
              return this.client(originalRequest);
            }
          } catch (refreshError: any) {
            // Refresh failed, clear tokens and fail
            await this.clearAuthTokens();
            if (__DEV__) console.error('Token refresh failed, redirecting to login');
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

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple refresh attempts
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const result = await this.refreshTokenPromise;
      return result;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        if (__DEV__) console.warn('No refresh token available - user needs to log in again');
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${config.API_URL}/auth/refresh-token`,
        { refreshToken },
        { 
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      // Handle different response structures
      const responseData = response.data;
      const tokenData = responseData.data || responseData;
      
      // Backend may return "token" instead of "accessToken"
      const accessToken = tokenData.accessToken || tokenData.token;
      const newRefreshToken = tokenData.refreshToken;

      if (!accessToken) {
        throw new Error('No access token in refresh response');
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }

      if (__DEV__) console.log('Token refreshed successfully');
      return accessToken;
    } catch (error: any) {
      if (__DEV__) console.error('Token refresh failed:', error.message || error);
      // Clear tokens on refresh failure
      await this.clearAuthTokens();
      throw error;
    }
  }

  private async clearAuthTokens(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
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

  // Set authentication tokens
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      if (__DEV__) {
        console.log('🔒 Storing tokens:', {
          accessTokenLength: accessToken ? accessToken.length : 0,
          refreshTokenLength: refreshToken ? refreshToken.length : 0,
          accessTokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'missing',
          refreshTokenPreview: refreshToken ? refreshToken.substring(0, 20) + '...' : 'missing'
        });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      // Verify storage worked
      const storedAccessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (__DEV__) {
        console.log('🔍 Token storage verification:', {
          accessTokenStored: !!storedAccessToken,
          refreshTokenStored: !!storedRefreshToken,
          storageSuccessful: !!(storedAccessToken && storedRefreshToken)
        });
      }

      if (!storedAccessToken || !storedRefreshToken) {
        throw new Error('Token storage failed - tokens not found after storage');
      }
    } catch (error) {
      console.error('❌ Token storage error:', error);
      throw error;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Need both tokens to be considered authenticated
    // If we only have access token but no refresh token, we can't refresh when it expires
    return !!(accessToken && refreshToken);
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      // Call logout endpoint if authenticated
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
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
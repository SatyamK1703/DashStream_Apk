import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config, APP_CONFIG, ENDPOINTS } from '../config/env';

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
  private onTokenRefreshCallback: (() => void) | null = null;

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
        try {
          // Attach JWT access token from storage
          const accessToken = await this.getAccessToken();
          if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
            if (__DEV__ && config.url?.includes('/auth/me')) {
              console.log('🔑 Using token for /auth/me:', {
                tokenLength: accessToken.length,
                tokenPreview: accessToken.substring(0, 20) + '...'
              });
            }
          } else if (__DEV__ && config.url?.includes('/auth/me')) {
            console.warn('⚠️ No access token found for /auth/me request');
          }
        } catch (error) {
          if (__DEV__) console.warn('Failed to read access token:', error);
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
            hasAuth: !!config.headers?.Authorization
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
          
          // Special logging for /auth/me to debug the issue
          if (response.config.url?.includes('/auth/me')) {
            console.log('🔍 /auth/me detailed response:', {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              dataType: typeof response.data,
              dataKeys: response.data ? Object.keys(response.data) : 'No data',
              fullData: JSON.stringify(response.data, null, 2),
              hasUserInData: !!(response.data?.data?.user),
              userDataType: typeof response.data?.data?.user
            });
            
            // If data is undefined but status is 200, this might be a backend issue
            if (response.status === 200 && response.data?.data === undefined) {
              console.warn('⚠️ /auth/me returned 200 but data is undefined - possible backend issue');
            }
          }
        }
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 with refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              if (__DEV__) console.log('🔄 Retrying request with refreshed JWT');
              return this.client(originalRequest);
            }
          } catch (refreshError: any) {
            if (__DEV__) {
              console.error('JWT refresh failed:', {
                message: refreshError?.message || refreshError,
                status: refreshError?.response?.status,
                data: refreshError?.response?.data,
                errorCode: refreshError?.response?.data?.errorCode
              });
            }
            
            // Clear tokens on refresh failure
            await this.clearAuthTokens();
            
            // If the error is "User no longer exists" or similar, we should not retry
            const errorCode = refreshError?.response?.data?.errorCode;
            const isUserNotFound = errorCode === 'APP-401-051' || 
                                 refreshError?.response?.data?.message?.includes('User no longer exists');
            
            if (isUserNotFound) {
              if (__DEV__) console.log('🚪 User no longer exists - forcing logout');
              // Don't retry the original request, just fail
              return Promise.reject(this.handleError(error));
            }
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

  // Token helpers
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
    
    if (__DEV__) {
      console.log('🔐 Tokens stored successfully', {
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length
      });
    }
  }

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  private async clearAuthTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      if (__DEV__) console.error('Error clearing auth tokens:', error);
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshTokenPromise) return this.refreshTokenPromise;

    this.refreshTokenPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const refreshToken = await this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await this.client.post<ApiResponse<{ token?: string; accessToken?: string; refreshToken?: string }>>(
          ENDPOINTS.AUTH.REFRESH_TOKEN,
          { refreshToken }
        );

        const data = response.data;
        const newAccessToken = data.data?.accessToken || data.data?.token;
        const newRefreshToken = data.data?.refreshToken || refreshToken;

        if (!newAccessToken) throw new Error('Refresh endpoint did not return access token');

        await this.setAuthTokens(newAccessToken, newRefreshToken);

        if (__DEV__) {
          console.log('✅ Token refreshed successfully');
        }

        resolve(newAccessToken);

        // Notify callback AFTER resolving to ensure token is available
        if (this.onTokenRefreshCallback) {
          try {
            // Use setTimeout to ensure the token is fully stored before callback
            setTimeout(() => {
              this.onTokenRefreshCallback!();
            }, 100);
          } catch (callbackError) {
            if (__DEV__) console.warn('Token refresh callback error:', callbackError);
          }
        }
      } catch (err: any) {
        if (__DEV__) {
          console.error('❌ Token refresh failed:', {
            message: err?.message || err,
            status: err?.response?.status,
            data: err?.response?.data,
            errorCode: err?.response?.data?.errorCode
          });
        }
        
        await this.clearAuthTokens();
        
        // Check if this is a "user no longer exists" error
        const errorCode = err?.response?.data?.errorCode;
        const isUserNotFound = errorCode === 'APP-401-051' || 
                             err?.response?.data?.message?.includes('User no longer exists');
        
        if (isUserNotFound && this.onTokenRefreshCallback) {
          if (__DEV__) console.log('🚪 User deleted - notifying auth context to logout');
          // Notify the auth context that the user should be logged out
          setTimeout(() => {
            if (this.onTokenRefreshCallback) {
              this.onTokenRefreshCallback();
            }
          }, 100);
        }
        
        reject(err);
      } finally {
        this.refreshTokenPromise = null;
      }
    });

    return this.refreshTokenPromise;
  }

  private handleError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return error.response.data;
    }

    if ((error as any).code === 'ECONNABORTED') {
      return {
        success: false,
        status: 'timeout',
        message: 'Request timeout. Please check your internet connection.',
        statusCode: 408,
      } as ApiError;
    }

    if ((error as any).code === 'ERR_NETWORK') {
      return {
        success: false,
        status: 'network_error',
        message: 'Network error. Please check your internet connection.',
        statusCode: 0,
      } as ApiError;
    }

    return {
      success: false,
      status: 'unknown_error',
      message: (error as any).message || 'An unexpected error occurred.',
      statusCode: error.response?.status || 500,
    } as ApiError;
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

  // Simple auth helpers for app usage
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Verify if current token is valid by making a test request
  async verifyCurrentToken(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      if (!token) return false;

      // Make a simple request to verify token
      const response = await this.get('/auth/verify-token');
      return response.success === true || response.status === 'success';
    } catch (error) {
      if (__DEV__) console.log('Token verification failed:', error);
      return false;
    }
  }

  // Set callback for token refresh events
  setTokenRefreshCallback(callback: (() => void) | null): void {
    this.onTokenRefreshCallback = callback;
  }

  // Logout and clear tokens
  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (token) {
        await this.post(ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      if (__DEV__) console.warn('Logout API call failed:', error);
    } finally {
      await this.clearAuthTokens();
    }
  }
}

// Create singleton instance
const httpClient = new HttpClient();
export default httpClient;
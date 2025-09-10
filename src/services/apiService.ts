import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, DEBUG_MODE } from '../config/environment';
import { initNetworkMonitoring, isConnected } from '../utils/networkErrorHandler';
import Constants from 'expo-constants';

// Define response and error types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  type?: string;
  details?: Record<string, string[]> | any;
  originalError?: any;
}

class ApiService {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Initialize network monitoring
    initNetworkMonitoring();
    
    // Create axios instance with default config
    this.instance = axios.create({
      baseURL: ENV_CONFIG.API_BASE_URL,
      timeout: ENV_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Platform': Constants.platform?.ios ? 'ios' : 'android',
        'X-App-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Device-ID': Constants.deviceId || 'unknown',
        'X-Requested-With': 'XMLHttpRequest',
      },
      withCredentials: false, // Set to false for mobile apps
    });

    // Add request interceptor for auth token
    this.instance.interceptors.request.use(
      async (config) => {
        // Try to get token from storage if not already loaded
        if (!this.authToken) {
          try {
            const token = await AsyncStorage.getItem('authToken');
            if (token) {
              this.authToken = token;
            }
          } catch (error) {
            console.error('Error getting auth token from storage:', error);
          }
        }

        // Add auth token to headers if available
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const data = response.data;
        
        // Check if response has the expected structure
        if (data && typeof data === 'object') {
          // Handle backend auth response format: { status: 'success', token: '...', data: { user: ... } }
          if (data.status === 'success' && data.token) {
            return {
              success: true,
              data: {
                token: data.token,
                user: data.data?.user || data.user,
                refreshToken: data.refreshToken,
                expiresAt: data.expiresAt,
                ...data.data
              },
              message: data.message || 'Success',
              statusCode: response.status,
            };
          }
          
          // Return standardized response format
          return {
            success: data.success !== false && data.status !== 'error',
            data: data.data || data,
            message: data.message || 'Success',
            statusCode: response.status,
          };
        } else {
          // Handle unexpected response format
          console.warn('Unexpected API response format:', response.data);
          return {
            success: true,
            data: response.data,
            message: 'Success',
            statusCode: response.status,
          };
        }
      },
      async (error: AxiosError) => {
        // Import error handling utilities dynamically to avoid circular dependencies
        const { processApiError, ErrorType, handleAuthError } = await import('../utils/errorHandlingUtils');
        
        // Process the error to get standardized format
        const processedError = processApiError(error);
        
        // Handle authentication errors
        if (processedError.type === ErrorType.AUTHENTICATION) {
          await handleAuthError();
        }
        
        // Log error in development mode
        if (DEBUG_MODE) {
          console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method,
            status: processedError.status,
            type: processedError.type,
            message: processedError.message
          });
        }

        // Return standardized error format
        return Promise.reject({
          success: false,
          error: processedError,
          message: processedError.message,
          statusCode: processedError.status,
          type: processedError.type,
          details: processedError.details
        });
      }
    );
  }

  // Set auth token (called after login/registration)
  public setAuthToken(token: string): void {
    if (token && typeof token === 'string' && token.trim() !== '') {
      this.authToken = token;
      AsyncStorage.setItem('authToken', token).catch(error => {
        console.error('Error saving auth token to storage:', error);
      });
    } else {
      console.error('Error: Cannot save invalid token to storage:', token);
    }
  }

  // Clear auth token (called after logout)
  public clearAuthToken(): void {
    this.authToken = null;
    AsyncStorage.removeItem('authToken').catch(error => {
      console.error('Error removing auth token from storage:', error);
    });
  }

  // Generic request method with retry logic and improved error handling
  public async request<T>(config: AxiosRequestConfig, retries: number = 2): Promise<ApiResponse<T>> {
    try {
      // Check network connectivity before making request
      const connected = await isConnected();
      if (!connected) {
        const { handleNetworkError } = await import('../utils/networkErrorHandler');
        await handleNetworkError(new Error('No internet connection'));
        throw new Error('No internet connection');
      }
      
      // Add request timestamp for tracking
      const requestStartTime = Date.now();
      if (config.headers) {
        config.headers['X-Request-Time'] = requestStartTime.toString();
      }
      
      if (DEBUG_MODE) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          data: config.data,
          params: config.params,
          timestamp: new Date(requestStartTime).toISOString()
        });
      }
      
      const response = await this.instance.request<T, ApiResponse<T>>(config);
      
      // Log successful response in debug mode
      if (DEBUG_MODE) {
        const requestDuration = Date.now() - requestStartTime;
        console.log(`API Response (${requestDuration}ms): ${config.method?.toUpperCase()} ${config.url}`, {
          status: response.statusCode,
          success: response.success
        });
      }
      
      return response;
    } catch (error: any) {
      // Only retry for specific network errors, not authentication errors
      if (retries > 0 && this.shouldRetry(error) && !this.isAuthError(error)) {
        if (DEBUG_MODE) {
          console.log(`Retrying request, ${retries} attempts left: ${config.method?.toUpperCase()} ${config.url}`);
        }
        // Exponential backoff with jitter
        const baseDelay = 1000 * (3 - retries);
        const jitter = Math.random() * 500;
        await this.delay(baseDelay + jitter);
        return this.request<T>(config, retries - 1);
      }
      
      if (DEBUG_MODE) {
        console.error('API Request Failed:', {
          url: config.url,
          method: config.method,
          error: error.message || 'Unknown error'
        });
      }
      
      return Promise.reject(error);
    }
  }

  // Determine if request should be retried
  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    // Only retry for server errors, timeout, and rate limit (not client errors like 4xx)
    return status >= 500 || status === 408 || status === 429;
  }

  // Check if error is authentication related
  private isAuthError(error: any): boolean {
    if (!error.response) return false;
    const status = error.response.status;
    return status === 401 || status === 403;
  }

  // Delay utility for retry logic
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // GET request
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  // POST request
  public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  // PUT request
  public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  // PATCH request
  public async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  // DELETE request
  public async delete<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, params });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
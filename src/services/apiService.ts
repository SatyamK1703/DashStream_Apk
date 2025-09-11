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
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshWaiters: Array<(token?: string) => void> = [];

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

    // Eagerly load any stored tokens
    this.loadStoredTokens();

    // Add request interceptor for auth token
    this.instance.interceptors.request.use(
      async (config) => {
        // Try to get token from storage if not already loaded
        if (!this.authToken) {
          await this.loadStoredTokens();
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
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const url = originalRequest?.url || '';

        // Attempt token refresh on 401 (except auth endpoints)
        if (status === 401 && !url.includes('/auth/')) {
          try {
            const newToken = await this.handle401WithRefresh();
            if (newToken && originalRequest) {
              originalRequest._retry = true;
              originalRequest.headers = originalRequest.headers || {};
              (originalRequest.headers as any).Authorization = `Bearer ${newToken}`;
              return this.instance.request(originalRequest);
            }
          } catch (refreshErr) {
            // fall through to standard error handling
          }
        }

        // Import error handling utilities dynamically to avoid circular dependencies
        const { processApiError, ErrorType, handleAuthError } = await import('../utils/errorHandlingUtils');
        
        // Process the error to get standardized format
        const processedError = processApiError(error);
        
        // Handle authentication errors (if refresh failed)
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

  private async loadStoredTokens() {
    try {
      const [t1, t2, r1, r2] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('refresh_token'),
        AsyncStorage.getItem('refreshToken')
      ]);
      this.authToken = t1 || t2 || this.authToken;
      this.refreshToken = r1 || r2 || this.refreshToken;
    } catch (e) {
      console.error('Failed to load tokens from storage:', e);
    }
  }

  private async handle401WithRefresh(): Promise<string | null> {
    if (!this.refreshToken) {
      await this.loadStoredTokens();
    }
    if (!this.refreshToken) return null;

    if (this.isRefreshing) {
      // Queue until refresh completes
      return new Promise((resolve) => this.refreshWaiters.push(resolve));
    }

    this.isRefreshing = true;
    try {
      const resp = await this.instance.post('/auth/refresh-token', { refreshToken: this.refreshToken });
      const data = (resp.data?.data || resp.data) as any;
      const newToken: string | undefined = data?.token;
      const newRefresh: string | undefined = data?.refreshToken;
      if (!newToken) throw new Error('No token in refresh response');
      await this.setTokens(newToken, newRefresh);
      // Resolve queued waiters
      this.refreshWaiters.forEach((fn) => fn(newToken));
      this.refreshWaiters = [];
      return newToken;
    } catch (err) {
      // Fail queued waiters
      this.refreshWaiters.forEach((fn) => fn(undefined));
      this.refreshWaiters = [];
      // Clear tokens on refresh failure
      await this.clearAuthToken();
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }

  // Set tokens (called after login/registration or refresh)
  public async setTokens(token: string, refreshToken?: string): Promise<void> {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.error('Error: Cannot save invalid token to storage:', token);
      return;
    }
    this.authToken = token;
    if (refreshToken && typeof refreshToken === 'string' && refreshToken.trim() !== '') {
      this.refreshToken = refreshToken;
    }
    try {
      const ops: [string, string][] = [['auth_token', token], ['authToken', token]]; // write both keys for compatibility
      if (this.refreshToken) {
        ops.push(['refresh_token', this.refreshToken], ['refreshToken', this.refreshToken]);
      }
      await AsyncStorage.multiSet(ops);
    } catch (e) {
      console.error('Error saving tokens to storage:', e);
    }
  }

  // Backwards-compatible single-token setter
  public setAuthToken(token: string): void {
    this.setTokens(token).catch(() => {});
  }

  // Clear tokens (called after logout or refresh failure)
  public async clearAuthToken(): Promise<void> {
    this.authToken = null;
    this.refreshToken = null;
    try {
      await AsyncStorage.multiRemove(['auth_token','authToken','refresh_token','refreshToken']);
    } catch (e) {
      console.error('Error removing tokens from storage:', e);
    }
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
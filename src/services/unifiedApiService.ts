// Unified API Service - Production Ready
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';
import Constants from 'expo-constants';
import { API_CONFIG } from '../constants/apiConfig';
import { ENV_CONFIG, DEBUG_MODE } from '../config/environment';

// Enhanced Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode: number;
  timestamp?: string;
  requestId?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  type: 'network' | 'authentication' | 'validation' | 'server' | 'client' | 'timeout';
  code?: string;
  details?: Record<string, any>;
  originalError?: any;
  timestamp: string;
  requestId?: string;
  retryAfter?: number;
}

interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

interface TokenData {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  tokenType?: string;
}

class UnifiedApiService {
  private static instance: UnifiedApiService;
  private axiosInstance: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private requestQueue: QueuedRequest[] = [];
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (reason: any) => void;
  }> = [];
  private deviceInfo: any = null;
  private networkStatus = true;

  private constructor() {
    this.initializeDevice();
    this.createAxiosInstance();
    this.setupInterceptors();
    this.setupNetworkMonitoring();
    this.loadStoredTokens();
  }

  public static getInstance(): UnifiedApiService {
    if (!UnifiedApiService.instance) {
      UnifiedApiService.instance = new UnifiedApiService();
    }
    return UnifiedApiService.instance;
  }

  private async initializeDevice() {
    try {
      this.deviceInfo = {
        id: await DeviceInfo.getUniqueId(),
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        platform: DeviceInfo.getSystemName(),
        isEmulator: await DeviceInfo.isEmulator(),
      };
    } catch (error) {
      console.warn('Failed to get device info:', error);
      this.deviceInfo = {
        id: 'unknown',
        platform: 'unknown'
      };
    }
  }

  private createAxiosInstance() {
    this.axiosInstance = axios.create({
      baseURL: ENV_CONFIG.API_BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Platform': Constants.platform?.ios ? 'ios' : 'android',
        'X-App-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Device-ID': this.deviceInfo?.id || 'unknown',
        'X-Requested-With': 'XMLHttpRequest',
        'X-API-Version': 'v1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      withCredentials: false,
    });
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        // Add request ID and timestamp
        const requestId = this.generateRequestId();
        config.headers!['X-Request-ID'] = requestId;
        config.headers!['X-Request-Timestamp'] = Date.now().toString();

        // Add auth token if available
        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add device info to security-sensitive endpoints
        if (config.url?.includes('/auth/')) {
          config.headers!['X-Device-Info'] = btoa(JSON.stringify(this.deviceInfo));
        }

        if (DEBUG_MODE) {
          console.log(`🚀 API Request [${requestId}]:`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            hasAuth: !!config.headers?.Authorization,
            data: config.data ? 'present' : 'none'
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        const requestId = response.config.headers?.['X-Request-ID'];
        
        if (DEBUG_MODE) {
          console.log(`✅ API Response [${requestId}]:`, {
            status: response.status,
            url: response.config.url,
            success: response.data?.success !== false
          });
        }

        return this.standardizeResponse(response);
      },
      async (error: AxiosError) => {
        return this.handleResponseError(error);
      }
    );
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.networkStatus;
      this.networkStatus = !!state.isConnected;
      
      // Process queued requests when back online
      if (wasOffline && this.networkStatus && this.requestQueue.length > 0) {
        this.processRequestQueue();
      }
    });
  }

  private async loadStoredTokens() {
    try {
      const [authToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('refresh_token')
      ]);
      
      if (authToken) {
        this.authToken = authToken;
      }
      
      if (refreshToken) {
        this.refreshToken = refreshToken;
      }

      // Validate tokens if they exist
      if (this.authToken) {
        await this.validateToken();
      }
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
      await this.clearTokens();
    }
  }

  private async validateToken(): Promise<boolean> {
    if (!this.authToken) return false;

    try {
      const response = await this.axiosInstance.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN);
      return response.data?.success === true;
    } catch (error) {
      // Token is invalid, try to refresh
      if (this.refreshToken) {
        return await this.refreshTokens();
      }
      
      await this.clearTokens();
      return false;
    }
  }

  private standardizeResponse(response: AxiosResponse): ApiResponse {
    const data = response.data;
    const requestId = response.config.headers?.['X-Request-ID'];
    
    // Handle different backend response formats
    if (data && typeof data === 'object') {
      // Backend auth response: { status: 'success', data: { user, token }, message }
      if (data.status === 'success' && data.data) {
        return {
          success: true,
          data: data.data,
          message: data.message || 'Success',
          statusCode: response.status,
          timestamp: new Date().toISOString(),
          requestId,
          pagination: data.meta?.pagination
        };
      }
      
      // Standard API response
      return {
        success: data.success !== false && data.status !== 'error',
        data: data.data || data,
        message: data.message || 'Success',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        requestId,
        pagination: data.pagination || data.meta?.pagination
      };
    }

    return {
      success: true,
      data: data,
      message: 'Success',
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      requestId
    };
  }

  private async handleResponseError(error: AxiosError): Promise<never> {
    const requestId = error.config?.headers?.['X-Request-ID'];
    
    if (DEBUG_MODE) {
      console.error(`❌ API Error [${requestId}]:`, {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message
      });
    }

    const apiError: ApiError = {
      message: 'An error occurred',
      statusCode: error.response?.status || 0,
      type: this.categorizeError(error),
      timestamp: new Date().toISOString(),
      requestId
    };

    // Handle network errors
    if (!error.response) {
      apiError.message = this.networkStatus ? 'Request failed' : 'No internet connection';
      apiError.type = 'network';
      
      // Queue for retry if offline
      if (!this.networkStatus && error.config) {
        await this.queueRequest(error.config);
      }
    }
    // Handle server responses
    else {
      const data = error.response.data as any;
      apiError.message = data?.message || data?.error?.message || error.message;
      apiError.code = data?.code || data?.errorCode;
      apiError.details = data?.details || data?.errors;
      
      // Handle rate limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        apiError.retryAfter = retryAfter ? parseInt(retryAfter) * 1000 : 60000;
      }
    }

    // Handle authentication errors
    if (apiError.statusCode === 401 && !error.config?.url?.includes('/auth/')) {
      return this.handleAuthError(error.config!);
    }

    return Promise.reject(apiError);
  }

  private categorizeError(error: AxiosError): ApiError['type'] {
    if (!error.response) return 'network';
    
    const status = error.response.status;
    if (status === 401 || status === 403) return 'authentication';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500) return 'server';
    if (status === 422) return 'validation';
    
    return 'client';
  }

  private async handleAuthError(originalConfig: AxiosRequestConfig): Promise<never> {
    if (this.isRefreshing) {
      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        this.failedQueue.push({ resolve, reject });
      });
    }

    if (!this.refreshToken) {
      await this.clearTokens();
      return Promise.reject({
        message: 'Authentication required',
        statusCode: 401,
        type: 'authentication'
      });
    }

    this.isRefreshing = true;

    try {
      const refreshed = await this.refreshTokens();
      
      if (refreshed) {
        // Retry original request
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${this.authToken}`;
        }
        
        // Process failed queue
        this.processFailedQueue(null);
        
        return this.axiosInstance.request(originalConfig);
      } else {
        const error = {
          message: 'Session expired',
          statusCode: 401,
          type: 'authentication' as const
        };
        this.processFailedQueue(error);
        return Promise.reject(error);
      }
    } catch (error) {
      const authError = {
        message: 'Authentication failed',
        statusCode: 401,
        type: 'authentication' as const
      };
      this.processFailedQueue(authError);
      return Promise.reject(authError);
    } finally {
      this.isRefreshing = false;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await this.axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken: this.refreshToken
      });

      if (response.data?.success && response.data?.data) {
        const { token, refreshToken, user, expiresAt } = response.data.data;
        
        await this.setTokens({
          token,
          refreshToken,
          expiresAt
        });
        
        console.log('✅ Tokens refreshed successfully');
        return true;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.clearTokens();
      return false;
    }
  }

  private processFailedQueue(error: ApiError | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(null);
      }
    });
    
    this.failedQueue = [];
  }

  private async queueRequest(config: AxiosRequestConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id: this.generateRequestId(),
        config,
        timestamp: Date.now(),
        retryCount: 0,
        maxRetries: API_CONFIG.MAX_RETRIES,
        resolve,
        reject
      };

      this.requestQueue.push(queuedRequest);
    });
  }

  private async processRequestQueue() {
    if (!this.networkStatus) return;

    const now = Date.now();
    const validRequests = this.requestQueue.filter(req => 
      now - req.timestamp < 300000 && req.retryCount < req.maxRetries
    );

    this.requestQueue = [];

    for (const queuedRequest of validRequests) {
      try {
        queuedRequest.retryCount++;
        const response = await this.axiosInstance.request(queuedRequest.config);
        queuedRequest.resolve(response);
      } catch (error) {
        if (queuedRequest.retryCount < queuedRequest.maxRetries) {
          this.requestQueue.push(queuedRequest);
        } else {
          queuedRequest.reject(error);
        }
      }
    }
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public Methods

  public async setTokens(tokenData: TokenData): Promise<void> {
    if (!tokenData.token) {
      throw new Error('Invalid token data');
    }

    this.authToken = tokenData.token;
    if (tokenData.refreshToken) {
      this.refreshToken = tokenData.refreshToken;
    }

    try {
      const promises = [
        AsyncStorage.setItem('auth_token', tokenData.token)
      ];

      if (tokenData.refreshToken) {
        promises.push(AsyncStorage.setItem('refresh_token', tokenData.refreshToken));
      }

      if (tokenData.expiresAt) {
        promises.push(AsyncStorage.setItem('token_expires_at', tokenData.expiresAt));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  }

  public async clearTokens(): Promise<void> {
    this.authToken = null;
    this.refreshToken = null;

    try {
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'token_expires_at',
        'user_data'
      ]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  public getAuthToken(): string | null {
    return this.authToken;
  }

  public isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // HTTP Methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.axiosInstance.get(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.axiosInstance.post(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.axiosInstance.put(url, data, config);
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.axiosInstance.patch(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.axiosInstance.delete(url, config);
  }
}

// Export singleton instance
export default UnifiedApiService.getInstance();
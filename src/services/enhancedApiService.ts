// Enhanced API Service with improved security and error handling
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, DEBUG_MODE } from '../config/environment';
import Constants from 'expo-constants';
import DeviceInfo from 'react-native-device-info';
import NetInfo from '@react-native-community/netinfo';

// Enhanced response and error types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
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
  type: 'network' | 'authentication' | 'validation' | 'server' | 'client';
  code?: string;
  details?: Record<string, any>;
  originalError?: any;
  timestamp: string;
  requestId?: string;
  retryAfter?: number;
}

// Request queue for offline support
interface QueuedRequest {
  id: string;
  config: AxiosRequestConfig;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

class EnhancedApiService {
  private instance: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private requestQueue: QueuedRequest[] = [];
  private isRefreshing = false;
  private deviceId: string | null = null;
  private deviceFingerprint: string | null = null;

  constructor() {
    this.initializeDevice();
    this.createAxiosInstance();
    this.setupInterceptors();
    this.monitorNetworkStatus();
  }

  private async initializeDevice() {
    try {
      this.deviceId = await DeviceInfo.getUniqueId();
      this.deviceFingerprint = await this.generateDeviceFingerprint();
    } catch (error) {
      console.warn('Failed to initialize device info:', error);
    }
  }

  private async generateDeviceFingerprint(): Promise<string> {
    try {
      const [
        brand,
        model,
        systemVersion,
        buildNumber,
        deviceType
      ] = await Promise.all([
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getDeviceType()
      ]);

      const fingerprint = `${brand}-${model}-${systemVersion}-${buildNumber}-${deviceType}`;
      return btoa(fingerprint).substring(0, 32); // Base64 encode and limit length
    } catch (error) {
      console.warn('Failed to generate device fingerprint:', error);
      return 'unknown-device';
    }
  }

  private createAxiosInstance() {
    this.instance = axios.create({
      baseURL: ENV_CONFIG.API_BASE_URL,
      timeout: ENV_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Client-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Platform': Constants.platform?.ios ? 'ios' : 'android',
        'X-App-Version': Constants.expoConfig?.version || '1.0.0',
        'X-Device-ID': this.deviceId || 'unknown',
        'X-Device-Fingerprint': this.deviceFingerprint || 'unknown',
        'X-Requested-With': 'XMLHttpRequest',
        'X-API-Version': 'v1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      withCredentials: false, // For mobile apps
    });
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      async (config) => {
        // Add timestamp and request ID
        const requestId = this.generateRequestId();
        config.headers!['X-Request-ID'] = requestId;
        config.headers!['X-Request-Timestamp'] = Date.now().toString();

        // Add authentication if available
        if (!this.authToken) {
          await this.loadStoredTokens();
        }

        if (this.authToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Add device security headers
        config.headers!['X-Device-Security'] = await this.getDeviceSecurityInfo();

        if (DEBUG_MODE) {
          console.log(`🚀 API Request [${requestId}]:`, {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: Object.keys(config.headers || {}),
            hasAuth: !!config.headers?.Authorization
          });
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        const requestId = response.config.headers?.['X-Request-ID'];
        
        if (DEBUG_MODE) {
          console.log(`✅ API Response [${requestId}]:`, {
            status: response.status,
            url: response.config.url,
            duration: this.calculateRequestDuration(response.config.headers?.['X-Request-Timestamp'])
          });
        }

        return this.standardizeResponse(response);
      },
      async (error: AxiosError) => {
        const requestId = error.config?.headers?.['X-Request-ID'];
        
        if (DEBUG_MODE) {
          console.error(`❌ API Error [${requestId}]:`, {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message
          });
        }

        return this.handleError(error);
      }
    );
  }

  private async monitorNetworkStatus() {
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.requestQueue.length > 0) {
        this.processRequestQueue();
      }
    });
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateRequestDuration(startTimestamp?: string): string {
    if (!startTimestamp) return 'unknown';
    const duration = Date.now() - parseInt(startTimestamp);
    return `${duration}ms`;
  }

  private async getDeviceSecurityInfo(): Promise<string> {
    try {
      const securityInfo = {
        isEmulator: await DeviceInfo.isEmulator(),
        hasGms: await DeviceInfo.hasGms(),
        hasHms: await DeviceInfo.hasHms(),
        hasNotch: DeviceInfo.hasNotch(),
      };
      return btoa(JSON.stringify(securityInfo));
    } catch (error) {
      return 'unknown';
    }
  }

  private standardizeResponse(response: AxiosResponse): ApiResponse {
    const data = response.data;
    
    // Handle different response formats
    if (data && typeof data === 'object') {
      return {
        success: data.success !== false,
        data: data.data || data.result || data,
        message: data.message || 'Success',
        statusCode: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.config.headers?.['X-Request-ID'],
        pagination: data.pagination || data.meta?.pagination
      };
    }

    return {
      success: true,
      data: data,
      message: 'Success',
      statusCode: response.status,
      timestamp: new Date().toISOString(),
      requestId: response.config.headers?.['X-Request-ID']
    };
  }

  private async handleError(error: AxiosError): Promise<never> {
    const apiError: ApiError = {
      message: 'An error occurred',
      statusCode: error.response?.status || 0,
      type: this.categorizeError(error),
      timestamp: new Date().toISOString(),
      requestId: error.config?.headers?.['X-Request-ID']
    };

    // Network errors
    if (!error.response) {
      apiError.message = 'Network connection failed';
      apiError.type = 'network';
      apiError.statusCode = 0;
    }
    // Server responses
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
      await this.handleAuthenticationError();
    }

    // Queue request for retry if it's a network error
    if (apiError.type === 'network' && error.config) {
      await this.queueRequestForRetry(error.config);
    }

    return Promise.reject(apiError);
  }

  private categorizeError(error: AxiosError): ApiError['type'] {
    if (!error.response) return 'network';
    
    const status = error.response.status;
    if (status === 401 || status === 403) return 'authentication';
    if (status >= 400 && status < 500) return 'client';
    if (status >= 500) return 'server';
    if (status >= 422) return 'validation';
    
    return 'client';
  }

  private async loadStoredTokens() {
    try {
      const [authToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('refreshToken')
      ]);
      
      this.authToken = authToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
    }
  }

  private async handleAuthenticationError() {
    if (this.isRefreshing || !this.refreshToken) {
      await this.clearTokens();
      return;
    }

    this.isRefreshing = true;
    
    try {
      const response = await this.instance.post('/auth/refresh', {
        refreshToken: this.refreshToken
      });

      if (response.data?.data?.token) {
        await this.setAuthToken(response.data.data.token, response.data.data.refreshToken);
      } else {
        await this.clearTokens();
      }
    } catch (error) {
      await this.clearTokens();
    } finally {
      this.isRefreshing = false;
    }
  }

  private async queueRequestForRetry(config: AxiosRequestConfig) {
    const queuedRequest: QueuedRequest = {
      id: this.generateRequestId(),
      config,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    this.requestQueue.push(queuedRequest);
  }

  private async processRequestQueue() {
    const now = Date.now();
    const validRequests = this.requestQueue.filter(req => 
      now - req.timestamp < 300000 && req.retryCount < req.maxRetries
    );

    this.requestQueue = [];

    for (const queuedRequest of validRequests) {
      try {
        queuedRequest.retryCount++;
        await this.instance.request(queuedRequest.config);
      } catch (error) {
        if (queuedRequest.retryCount < queuedRequest.maxRetries) {
          this.requestQueue.push(queuedRequest);
        }
      }
    }
  }

  // Public methods
  public async setAuthToken(token: string, refreshToken?: string): Promise<void> {
    this.authToken = token;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }

    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ...(refreshToken ? [['refreshToken', refreshToken]] : [])
      ]);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  public async clearTokens(): Promise<void> {
    this.authToken = null;
    this.refreshToken = null;

    try {
      await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'userData']);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  public async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Check network status
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      throw {
        message: 'No internet connection',
        statusCode: 0,
        type: 'network',
        timestamp: new Date().toISOString()
      } as ApiError;
    }

    return this.instance.request<T, ApiResponse<T>>(config);
  }

  // HTTP methods
  public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', url, params });
  }

  public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', url, data });
  }

  public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', url, data });
  }

  public async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', url, data });
  }

  public async delete<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', url, params });
  }

  // Health check
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Get connection status
  public async getConnectionStatus() {
    const networkState = await NetInfo.fetch();
    const backendHealth = await this.healthCheck();
    
    return {
      isNetworkConnected: networkState.isConnected,
      networkType: networkState.type,
      isBackendReachable: backendHealth,
      queuedRequests: this.requestQueue.length,
      hasAuthToken: !!this.authToken,
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
const enhancedApiService = new EnhancedApiService();
export default enhancedApiService;
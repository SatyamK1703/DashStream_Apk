import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { config, APP_CONFIG, API_ENDPOINTS } from '../config/config';

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

// SecureStore keys must be alphanumeric, '.', '-', or '_'. Avoid ':' and '@'
const SECURE_KEYS = {
  ACCESS_TOKEN: 'dashstream_access_token',
  REFRESH_TOKEN: 'dashstream_refresh_token',
};

class HttpClient {
  private client: AxiosInstance;
  private refreshTokenPromise: Promise<string> | null = null;
  private onTokenRefreshCallback: (() => void) | null = null;
  // Simple in-memory rate-limit guard (unix ms timestamp until which requests should be blocked)
  private rateLimitUntil: number | null = null;

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
            // Dev-only: decode JWT and log claims to help debug permission issues
            if (__DEV__) {
              try {
                const parts = accessToken.split('.');
                if (parts.length === 3) {
                  let payload: any = null;
                  try {
                    // Try to use atob when available
                    if (typeof (global as any).atob === 'function') {
                      payload = JSON.parse((global as any).atob(parts[1]));
                    } else if ((global as any).Buffer) {
                      payload = JSON.parse((global as any).Buffer.from(parts[1], 'base64').toString('utf8'));
                    } else {
                      // Last resort: attempt decoding via decodeURIComponent
                      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
                      const decoded = decodeURIComponent(Array.prototype.map.call(atob(b64), (c: any) => '%'+('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                      payload = JSON.parse(decoded);
                    }
                  } catch {
                    payload = null;
                  }

                  if (payload) {
                    console.log('🧾 JWT claims (dev):', {
                      sub: payload.sub,
                      role: payload.role || payload.roles || payload.scopes,
                      exp: payload.exp,
                      iat: payload.iat,
                      rawPayload: payload,
                    });
                  }
                }
              } catch {
                console.warn('Failed to decode JWT (dev)');
              }
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
            hasAuth: !!config.headers?.Authorization,
            // Show small token preview for debugging
            tokenPreview: config.headers?.Authorization ? String(config.headers?.Authorization).substring(0, 40) + '...' : null
          });

          // If this is a notifications preferences request, also print full headers to help diagnose 403
          if (config.url?.includes('/notifications/preferences')) {
            console.log('🔐 Notification request headers (dev):', config.headers);
            // Emit a cURL suggestion the dev can run externally (shows method, headers, and URL)
            try {
              const method = (config.method || 'get').toUpperCase();
              const headerStrings = Object.entries(config.headers || {}).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
              const curl = `curl -X ${method} ${headerStrings} "${this.client.defaults.baseURL}${config.url}"`;
              console.log('🧰 cURL to reproduce (dev):', curl);
              } catch {
                // ignore
              }
          }
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

        // If server responded with 429, set a client-side rate-limit window
        if (error.response?.status === 429) {
          try {
            const retryAfter = Number(error.response.headers?.['retry-after']);
            // Some servers return ratelimit-reset or ratelimit-reset in seconds
            const rateReset = Number(error.response.headers?.['ratelimit-reset']);
            const now = Date.now();
            let until = now + 60 * 1000; // default 60s

            if (!isNaN(retryAfter) && retryAfter > 0) {
              // retry-after may be seconds
              const seconds = retryAfter > 1000 ? retryAfter / 1000 : retryAfter;
              until = now + seconds * 1000;
            } else if (!isNaN(rateReset) && rateReset > 0) {
              // ratelimit-reset may be unix epoch seconds
              const candidate = rateReset > 1e12 ? rateReset : rateReset * 1000;
              if (candidate > now) until = candidate;
            }

            this.rateLimitUntil = until;

            if (__DEV__) {
              console.warn('🚦 Received 429 Too Many Requests. Pausing requests until', new Date(until).toISOString());
            }
          } catch (e) {
            if (__DEV__) console.warn('Failed to parse 429 headers', e);
          }
        }

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

          // If this is the notifications preferences request, log response headers and a reproducer cURL
          try {
            if (error.config?.url?.includes('/notifications/preferences')) {
              console.log('🔴 Notification preferences error details (dev):', {
                requestUrl: `${this.client.defaults.baseURL}${error.config?.url}`,
                requestHeaders: error.config?.headers,
                responseStatus: error.response?.status,
                responseData: error.response?.data,
                responseHeaders: error.response?.headers,
              });

              // Build a cURL that includes request headers and prints response headers (-i)
              const method = (error.config?.method || 'get').toUpperCase();
              const headerStrings = Object.entries(error.config?.headers || {}).map(([k, v]) => `-H "${k}: ${v}"`).join(' ');
              const curl = `curl -i -X ${method} ${headerStrings} "${this.client.defaults.baseURL}${error.config?.url}"`;
              console.log('🧰 cURL to reproduce (dev):', curl);
            }
          } catch {
            // swallow
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // Helper to check and wait if client is currently rate-limited
  private async guardRateLimit(): Promise<void> {
    if (!this.rateLimitUntil) return;
    const now = Date.now();
    if (now >= this.rateLimitUntil) {
      this.rateLimitUntil = null;
      return;
    }

    const waitMs = this.rateLimitUntil - now;
    if (__DEV__) console.log(`Waiting for ${waitMs}ms due to client-side rate limit`);
    await new Promise((res) => setTimeout(res, waitMs));
    this.rateLimitUntil = null;
  }

  // Token helpers
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    // Persist tokens in both AsyncStorage (used by httpClient) and the
    // app's secure TokenManager to ensure tokens survive reloads across
    // different storage implementations.
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
    } catch (err) {
      if (__DEV__) console.warn('AsyncStorage setAuthTokens failed:', err);
    }

    try {
      await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (err) {
      if (__DEV__) console.warn('SecureStore.setItemAsync failed:', err);
    }

    if (__DEV__) {
      console.log('🔐 Tokens stored (async + secure)');
    }
  }

  async getAccessToken(): Promise<string | null> {
    // Prefer secure storage token if available
    try {
      const secure = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
      if (secure) return secure;
    } catch (err) {
      if (__DEV__) console.warn('SecureStore.getItemAsync failed:', err);
    }

    return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      const secure = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
      if (secure) return secure;
    } catch (err) {
      if (__DEV__) console.warn('SecureStore.getItemAsync failed:', err);
    }

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
      if (__DEV__) console.error('Error clearing auth tokens (asyncStorage):', error);
    }
    // Also attempt to clear secure tokens
    try {
  await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    } catch (err) {
      if (__DEV__) console.warn('SecureStore.deleteItemAsync failed:', err);
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
          API_ENDPOINTS.AUTH.REFRESH_TOKEN,
          { refreshToken }
        );

        const data = response.data;
        const newAccessToken = data.data?.accessToken || data.data?.token;
        const newRefreshToken = data.data?.refreshToken || refreshToken;

        if (!newAccessToken) throw new Error('Refresh endpoint did not return access token');

        await this.setAuthTokens(newAccessToken, newRefreshToken);

        resolve(newAccessToken);

        // Notify callback AFTER resolving to ensure token is available
        if (this.onTokenRefreshCallback) {
          try {
            // Use setTimeout to ensure the token is fully stored before callback
            setTimeout(() => {
              this.onTokenRefreshCallback!();
            }, 100);
          } catch (callbackError) {
            console.error('Error executing onTokenRefreshCallback:', callbackError);
          }
        }
      } catch (err: any) {
        
        await this.clearAuthTokens();
        
        // Check if this is a "user no longer exists" error
        const errorCode = err?.response?.data?.errorCode;
        const isUserNotFound = errorCode === 'APP-401-051' || 
                             err?.response?.data?.message?.includes('User no longer exists');
        
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
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.get called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.get: missing url');
    }

    // If client is rate-limited, wait before sending
    await this.guardRateLimit();
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.post called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.post: missing url');
    }

    await this.guardRateLimit();
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.put called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.put: missing url');
    }

    await this.guardRateLimit();
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.patch called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.patch: missing url');
    }

    await this.guardRateLimit();
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.delete called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.delete: missing url');
    }

    await this.guardRateLimit();
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Upload file with progress
  async uploadFile<T = any>(
    url: string,
    formData: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    if (!url) {
      if (__DEV__) {
        console.error('httpClient.uploadFile called with invalid url:', url, { stack: new Error().stack });
      }
      throw new Error('httpClient.uploadFile: missing url');
    }

    await this.guardRateLimit();

    const maxRetries = 3;
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= maxRetries) {
      try {
        const response = await this.client.post<ApiResponse<T>>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress,
        });
        return response.data;
      } catch (err: any) {
        lastError = err;

        // If 429, let interceptor set rateLimitUntil and break loop
        if (err?.response?.status === 429) {
          if (__DEV__) console.warn('Upload received 429, aborting retries');
          break;
        }

        // For network errors or 5xx, retry with exponential backoff
        const status = err?.response?.status;
        if (!status || (status >= 500 && status < 600)) {
          attempt += 1;
          const backoff = Math.min(1000 * Math.pow(2, attempt), 10000);
          const jitter = Math.floor(Math.random() * 300);
          const wait = backoff + jitter;
          if (__DEV__) console.log(`Retrying upload (attempt ${attempt}) after ${wait}ms`);
          await new Promise((res) => setTimeout(res, wait));
          continue;
        }

        // For other errors, do not retry
        break;
      }
    }

    throw lastError || new Error('uploadFile failed');
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
        await this.post(API_ENDPOINTS.AUTH.LOGOUT);
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
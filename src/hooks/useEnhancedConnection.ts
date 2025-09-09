// Enhanced Connection Hook for React Native Components
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import enhancedApiService, { ApiResponse, ApiError } from '../services/enhancedApiService';
import { connectionHealthMonitor, ConnectionStatus } from '../services/connectionHealthMonitor';
import enhancedAuthService, { AuthState } from '../services/enhancedAuthService';

// Request state interface
interface RequestState<T = any> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Request options
interface RequestOptions {
  immediate?: boolean;
  retry?: boolean;
  showErrorAlert?: boolean;
  cacheKey?: string;
  cacheTimeout?: number;
}

// Hook return type
interface UseEnhancedConnectionReturn<T = any> {
  // Connection status
  connectionStatus: ConnectionStatus | null;
  isOnline: boolean;
  isBackendReachable: boolean;
  connectionQuality: string;
  
  // Auth state
  authState: AuthState | null;
  isAuthenticated: boolean;
  user: any;
  
  // Request state
  requestState: RequestState<T>;
  
  // Methods
  execute: (url: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH', data?: any, options?: RequestOptions) => Promise<ApiResponse<T>>;
  retry: () => void;
  clearError: () => void;
  forceRefresh: () => Promise<void>;
  
  // Auth methods
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  
  // Utility methods
  showConnectionStatus: () => void;
  isHealthy: () => boolean;
  canMakeRequests: () => boolean;
}

// Simple in-memory cache
const requestCache = new Map<string, { data: any; timestamp: number; }>();
const DEFAULT_CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

export function useEnhancedConnection<T = any>(initialOptions?: RequestOptions): UseEnhancedConnectionReturn<T> {
  // State
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [requestState, setRequestState] = useState<RequestState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false
  });

  // Refs for storing latest request for retry
  const lastRequestRef = useRef<{
    url: string;
    method: string;
    data: any;
    options: RequestOptions;
  } | null>(null);

  // Initialize listeners
  useEffect(() => {
    // Connection health listener
    const unsubscribeConnection = connectionHealthMonitor.addListener((status, event) => {
      setConnectionStatus(status);
      
      // Handle specific connection events
      if (event) {
        handleConnectionEvent(event);
      }
    });

    // Auth state listener  
    const unsubscribeAuth = enhancedAuthService.addListener((state) => {
      setAuthState(state);
    });

    return () => {
      unsubscribeConnection();
      unsubscribeAuth();
    };
  }, []);

  // Handle connection events
  const handleConnectionEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'offline':
        console.log('🔴 Connection lost');
        break;
      case 'online':
        console.log('🟢 Connection restored');
        break;
      case 'backend_unreachable':
        console.log('🟡 Backend unavailable');
        break;
      case 'backend_restored':
        console.log('✅ Backend restored');
        break;
    }
  }, []);

  // Cache utilities
  const getCachedData = useCallback((key: string, timeout: number = DEFAULT_CACHE_TIMEOUT) => {
    const cached = requestCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < timeout) {
      return cached.data;
    }
    return null;
  }, []);

  const setCachedData = useCallback((key: string, data: any) => {
    requestCache.set(key, { data, timestamp: Date.now() });
  }, []);

  // Main execute function
  const execute = useCallback(async (
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    data?: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const {
      immediate = true,
      retry = true,
      showErrorAlert = false,
      cacheKey,
      cacheTimeout = DEFAULT_CACHE_TIMEOUT
    } = { ...initialOptions, ...options };

    // Store request for potential retry
    lastRequestRef.current = { url, method, data, options };

    // Check cache first for GET requests
    if (method === 'GET' && cacheKey) {
      const cachedData = getCachedData(cacheKey, cacheTimeout);
      if (cachedData) {
        setRequestState({
          data: cachedData,
          loading: false,
          error: null,
          success: true
        });
        return {
          success: true,
          data: cachedData,
          message: 'Cached data',
          statusCode: 200
        };
      }
    }

    // Check if we can make requests
    if (!connectionHealthMonitor.canMakeRequests() && immediate) {
      const error: ApiError = {
        message: 'No internet connection',
        statusCode: 0,
        type: 'network',
        timestamp: new Date().toISOString()
      };

      setRequestState({
        data: null,
        loading: false,
        error,
        success: false
      });

      if (showErrorAlert) {
        Alert.alert('Connection Error', error.message);
      }

      throw error;
    }

    // Set loading state
    setRequestState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      let response: ApiResponse<T>;

      // Make the API call
      switch (method) {
        case 'GET':
          response = await enhancedApiService.get<T>(url, data);
          break;
        case 'POST':
          response = await enhancedApiService.post<T>(url, data);
          break;
        case 'PUT':
          response = await enhancedApiService.put<T>(url, data);
          break;
        case 'PATCH':
          response = await enhancedApiService.patch<T>(url, data);
          break;
        case 'DELETE':
          response = await enhancedApiService.delete<T>(url, data);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      // Cache successful GET responses
      if (response.success && method === 'GET' && cacheKey) {
        setCachedData(cacheKey, response.data);
      }

      // Update state
      setRequestState({
        data: response.data || null,
        loading: false,
        error: null,
        success: response.success
      });

      return response;

    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'Request failed',
        statusCode: error.statusCode || 500,
        type: error.type || 'client',
        timestamp: new Date().toISOString(),
        code: error.code,
        details: error.details
      };

      setRequestState({
        data: null,
        loading: false,
        error: apiError,
        success: false
      });

      // Show error alert if requested
      if (showErrorAlert) {
        showErrorAlert && handleErrorAlert(apiError);
      }

      throw apiError;
    }
  }, [initialOptions, getCachedData, setCachedData]);

  // Error alert handler
  const handleErrorAlert = useCallback((error: ApiError) => {
    let title = 'Error';
    let message = error.message;

    switch (error.type) {
      case 'network':
        title = 'Connection Error';
        message = 'Please check your internet connection and try again.';
        break;
      case 'authentication':
        title = 'Authentication Error';
        message = 'Please login again to continue.';
        break;
      case 'validation':
        title = 'Validation Error';
        break;
      case 'server':
        title = 'Server Error';
        message = 'Server is temporarily unavailable. Please try again later.';
        break;
    }

    Alert.alert(title, message, [
      { text: 'OK', style: 'default' },
      ...(error.type === 'network' ? [{ text: 'Retry', onPress: retry }] : [])
    ]);
  }, []);

  // Retry last request
  const retry = useCallback(async () => {
    if (!lastRequestRef.current) {
      console.warn('No request to retry');
      return;
    }

    const { url, method, data, options } = lastRequestRef.current;
    await execute(url, method as any, data, options);
  }, [execute]);

  // Clear error state
  const clearError = useCallback(() => {
    setRequestState(prev => ({
      ...prev,
      error: null
    }));
  }, []);

  // Force refresh connection status
  const forceRefresh = useCallback(async () => {
    await connectionHealthMonitor.forceHealthCheck();
  }, []);

  // Auth methods
  const sendOtp = useCallback(async (phone: string) => {
    return await enhancedAuthService.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string) => {
    return await enhancedAuthService.verifyOtp(phone, otp);
  }, []);

  const logout = useCallback(async () => {
    await enhancedAuthService.logout();
  }, []);

  // Utility methods
  const showConnectionStatus = useCallback(() => {
    connectionHealthMonitor.showConnectionAlert();
  }, []);

  const isHealthy = useCallback(() => {
    return connectionHealthMonitor.isHealthy();
  }, []);

  const canMakeRequests = useCallback(() => {
    return connectionHealthMonitor.canMakeRequests();
  }, []);

  // Derived state
  const isOnline = connectionStatus?.isOnline || false;
  const isBackendReachable = connectionStatus?.isBackendReachable || false;
  const connectionQuality = connectionStatus?.connectionQuality || 'offline';
  const isAuthenticated = authState?.isAuthenticated || false;
  const user = authState?.user || null;

  return {
    // Connection status
    connectionStatus,
    isOnline,
    isBackendReachable,
    connectionQuality,
    
    // Auth state
    authState,
    isAuthenticated,
    user,
    
    // Request state
    requestState,
    
    // Methods
    execute,
    retry,
    clearError,
    forceRefresh,
    
    // Auth methods
    sendOtp,
    verifyOtp,
    logout,
    
    // Utility methods
    showConnectionStatus,
    isHealthy,
    canMakeRequests
  };
}

// Specialized hooks for common use cases
export function useApiRequest<T = any>(url: string, options?: RequestOptions) {
  const { execute, requestState, retry, clearError } = useEnhancedConnection<T>(options);
  
  useEffect(() => {
    if (options?.immediate !== false) {
      execute(url, 'GET');
    }
  }, [url, execute, options?.immediate]);

  return {
    ...requestState,
    refetch: () => execute(url, 'GET'),
    retry,
    clearError
  };
}

export function useAuthRequest() {
  const { 
    authState, 
    isAuthenticated, 
    user, 
    sendOtp, 
    verifyOtp, 
    logout 
  } = useEnhancedConnection();

  return {
    authState,
    isAuthenticated,
    user,
    sendOtp,
    verifyOtp,
    logout
  };
}

export function useConnectionStatus() {
  const { 
    connectionStatus, 
    isOnline, 
    isBackendReachable, 
    connectionQuality,
    showConnectionStatus,
    isHealthy,
    canMakeRequests,
    forceRefresh
  } = useEnhancedConnection();

  return {
    connectionStatus,
    isOnline,
    isBackendReachable,
    connectionQuality,
    showConnectionStatus,
    isHealthy,
    canMakeRequests,
    forceRefresh
  };
}

export default useEnhancedConnection;
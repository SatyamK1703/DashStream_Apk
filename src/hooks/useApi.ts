import { useState, useCallback, useRef } from 'react';
import { ApiResponse } from '../services/httpClient';
import { handleApiError, retryOperation } from '../utils/errorHandler';
import { useAuth } from '../store';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}
interface UsePaginatedApiResult<T> {
  data: T[];
  loading: boolean;
  error: any;
  pagination: PaginatedState;
  loadMore: (params?: any) => Promise<{ items: T[]; total: number } | undefined>;
  refresh: (params?: any) => Promise<{ items: T[]; total: number } | undefined>;
  reset: () => void;
}
interface UseApiOptions {
  showErrorAlert?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useApi = <T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) => {
  const {
    showErrorAlert = true,
    retries = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const { logout } = useAuth();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isExecutingRef = useRef(false);
  const cachedDataRef = useRef<T | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      if (isExecutingRef.current) return cachedDataRef.current; // prevent concurrent duplicate calls
      isExecutingRef.current = true;
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const operation = () => apiCall(...args);
        const response = retries > 0 
          ? await retryOperation(operation, retries, retryDelay)
          : await operation();

        const isSuccess = (response as any)?.success === true || (response as any)?.status === 'success';
        if (isSuccess) {
          const payload = (response as any)?.data ?? (response as any);
          cachedDataRef.current = payload;
          setState({
            data: payload,
            loading: false,
            error: null,
          });

          if (onSuccess) {
            onSuccess(payload);
          }

          return payload;
        } else {
          throw response;
        }
      } catch (error: any) {
        const appError = handleApiError(
          error,
          apiCall.name,
          showErrorAlert
        );

        if (__DEV__) {
          console.log('useApi - Error caught:', {
            originalError: error,
            appError,
            appErrorMessage: appError.message,
            statusCode: appError.statusCode,
            apiCallName: apiCall.name
          });
        }

        cachedDataRef.current = null;
        setState({
          data: null,
          loading: false,
          error: appError.message,
        });

        // Auto-logout on authentication errors
        if (appError.statusCode === 401) {
          await logout();
        }

        if (onError) {
          onError(appError);
        }

        throw appError;
      } finally {
        isExecutingRef.current = false;
      }
    },
    [apiCall, retries, retryDelay, showErrorAlert, onSuccess, onError, logout]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};

// Specialized hook for paginated data


export const usePaginatedApi = <T = any>(
  apiCall: (params: any) => Promise<any>,
  options: UseApiOptions = {},
  normalize?: (resp: any) => { items: T[]; total: number }
): UsePaginatedApiResult<T> => {
  const [pagination, setPagination] = useState<PaginatedState>({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  const [allData, setAllData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isLoadingPageRef = useRef(false);

  const defaultNormalizer = (resp: any) => {
    if (!resp) return { items: [], total: 0 };
    
    // First check if response itself is an array
    if (Array.isArray(resp)) {
      return { items: resp, total: resp.length };
    }
    
    // Try to get payload from resp.data or use resp directly
    const payload = resp.data ?? resp;
    
    // Handle array payload
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length };
    }
    
    // Handle paginated response with various property names
    // Check both root level and nested data level
    let items = 
      payload.items ?? 
      payload.services ?? 
      payload.results ?? 
      payload.bookings ?? 
      payload.notifications ?? 
      payload.offers ?? 
      resp.bookings ??  // Check root level too
      resp.services ?? 
      resp.items ?? 
      [];
      
    // Fix for backend API response format - if bookings is directly in the response
    if (resp.bookings && Array.isArray(resp.bookings)) {
      items = resp.bookings;
    }
    
    // Fix for backend API response format - if bookings is in the response data
    if (resp.data && resp.data.bookings && Array.isArray(resp.data.bookings)) {
      items = resp.data.bookings;
    }
    
    const total = 
      payload.total ?? 
      payload.totalCount ?? 
      resp.totalCount ?? 
      resp.data?.totalCount ?? 
      items.length;
    
    if (__DEV__) {
      console.log('defaultNormalizer - Debug:', {
        hasRespData: !!resp.data,
        hasPayloadBookings: !!payload.bookings,
        hasRespBookings: !!resp.bookings,
        hasDataBookings: !!(resp.data && resp.data.bookings),
        itemsLength: items?.length,
        itemsIsArray: Array.isArray(items),
        total,
        payloadKeys: Object.keys(payload || {}),
        respKeys: Object.keys(resp || {})
      });
    }
    
    return { items, total };
  };

  const normalizeResponse = normalize ?? defaultNormalizer;

  const loadMore = useCallback(
    async (params: any = {}) => {
      if (isLoadingPageRef.current || !pagination.hasMore) {
        if (__DEV__) {
          console.log('usePaginatedApi - loadMore skipped:', {
            isLoading: isLoadingPageRef.current,
            hasMore: pagination.hasMore
          });
        }
        return;
      }
      isLoadingPageRef.current = true;
      setIsLoading(true);

      try {
        const rawResponse = await apiCall({
          ...params,
          page: pagination.page,
          limit: pagination.limit,
        });

        // if (__DEV__) {
        //   console.log('usePaginatedApi - Raw Response:', JSON.stringify(rawResponse, null, 2));
        // }

        const normalized = normalizeResponse(rawResponse);
        const newItems = normalized.items;
        const total = normalized.total;

        if (__DEV__) {
          console.log('usePaginatedApi - Normalized:', {
            itemsCount: newItems?.length,
            total,
            page: pagination.page,
            firstItem: newItems?.[0],
            isArray: Array.isArray(newItems),
            responseFormat: rawResponse && rawResponse.bookings ? 'Direct bookings property' : 
                           rawResponse && rawResponse.data && rawResponse.data.bookings ? 'Nested data.bookings property' : 
                           'Other format'
          });
        }

        // Ensure we're working with arrays
        const safeNewItems = Array.isArray(newItems) ? newItems : [];
        
        setAllData(prev => {
          // For first page, replace data
          if (pagination.page === 1) {
            return safeNewItems;
          }
          // For subsequent pages, append data
          return [...prev, ...safeNewItems];
        });
        
        setPagination(prev => ({
          ...prev,
          page: prev.page + 1,
          total,
          hasMore: prev.page * prev.limit < total,
        }));

        isLoadingPageRef.current = false;
        setIsLoading(false);
        return { items: newItems, total };
      } catch (error) {
        console.error('usePaginatedApi - loadMore error:', error);
        isLoadingPageRef.current = false;
        setIsLoading(false);
        throw error;
      }
    },
    [apiCall, normalizeResponse, pagination.page, pagination.limit, pagination.hasMore]
  );

  const refresh = useCallback(
    async (params: any = {}) => {
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
      setAllData([]);
      while (isLoadingPageRef.current) await new Promise(r => setTimeout(r, 50));
      return loadMore(params);
    },
    [loadMore]
  );

  const reset = useCallback(() => {
    setAllData([]);
    setPagination({ page: 1, limit: 10, total: 0, hasMore: true });
  }, []);

  return {
    data: allData,
    loading: isLoading,
    error: null,
    pagination,
    loadMore,
    refresh,
    reset,
  };
};
// Hook for real-time updates
export const useRealtimeApi = <T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  intervalMs: number = 30000,
  options: UseApiOptions = {}
) => {
  const baseApi = useApi(apiCall, { ...options, showErrorAlert: false });
  const [isRealtime, setIsRealtime] = useState(false);

  const startRealtime = useCallback(
    async (...args: any[]) => {
      setIsRealtime(true);

      // Initial load
      await baseApi.execute(...args);

      // Set up polling
      const interval = setInterval(async () => {
        try {
          await baseApi.execute(...args);
        } catch (error) {
          // Silent retry for realtime updates
          console.warn('Realtime update failed:', error);
        }
      }, intervalMs);

      return interval;
    },
    [baseApi, intervalMs]
  );

  const stopRealtime = useCallback((interval: NodeJS.Timeout) => {
    setIsRealtime(false);
    clearInterval(interval);
  }, []);

  return {
    ...baseApi,
    isRealtime,
    startRealtime,
    stopRealtime,
  };
};

export default useApi;
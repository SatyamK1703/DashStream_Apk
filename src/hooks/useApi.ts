import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiResponse, api } from '../services/httpClient';
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
  loadMore: (params?: any) => Promise<void>;
  refresh: (params?: any) => Promise<void>;
  reset: () => void;
}
interface PaginatedState {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

interface UseApiOptions {
  showErrorAlert?: boolean;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  cacheDuration?: number; // New: duration in milliseconds to cache the response
}

const apiCache = new Map<string, { data: any; timestamp: number }>();

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
    cacheDuration = 0, // Default to no caching
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
      const apiCallName = apiCall.name || 'anonymousApiCall';
      const cacheKey = `${apiCallName}-${JSON.stringify(args)}`;

      // Check cache first
      if (cacheDuration > 0) {
        const cached = apiCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheDuration) {
          if (__DEV__) {
            console.log(`Cache hit for ${cacheKey}`);
          }
          setState({
            data: cached.data,
            loading: false,
            error: null,
          });
          if (onSuccess) {
            onSuccess(cached.data);
          }
          return cached.data;
        }
      }

      if (isExecutingRef.current) return cachedDataRef.current; // prevent concurrent duplicate calls
      isExecutingRef.current = true;
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const operation = () => apiCall(...args);
        const response =
          retries > 0 ? await retryOperation(operation, retries, retryDelay) : await operation();

        const isSuccess =
          (response as any)?.success === true || (response as any)?.status === 'success';
        if (isSuccess) {
          const payload = (response as any)?.data ?? (response as any);
          cachedDataRef.current = payload;
          setState({
            data: payload,
            loading: false,
            error: null,
          });

          // Store in cache
          if (cacheDuration > 0) {
            apiCache.set(cacheKey, { data: payload, timestamp: Date.now() });
            if (__DEV__) {
              console.log(`Cache set for ${cacheKey}`);
            }
          }

          if (onSuccess) {
            onSuccess(payload);
          }

          return payload;
        } else {
          throw response;
        }
      } catch (error: any) {
        const appError = handleApiError(error, apiCall.name, showErrorAlert);

        if (__DEV__) {
          console.log('useApi - Error caught:', {
            originalError: error,
            appError,
            appErrorMessage: appError.message,
            statusCode: appError.statusCode,
            apiCallName: apiCall.name,
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
    [apiCall, retries, retryDelay, showErrorAlert, onSuccess, onError, logout, cacheDuration]
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
      payload.professionals ??
      payload.users ??
      payload.notifications ??
      payload.offers ??
      resp.bookings ?? // Check root level too
      resp.professionals ??
      resp.users ??
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

    // Fix for professionals
    if (resp.data && resp.data.professionals && Array.isArray(resp.data.professionals)) {
      items = resp.data.professionals;
    }

    // Fix for users/customers
    if (resp.data && resp.data.users && Array.isArray(resp.data.users)) {
      items = resp.data.users;
    }

    // Get total from pagination object or calculate from items
    const total =
      payload.pagination?.total ??
      resp.data?.pagination?.total ??
      payload.total ??
      payload.totalCount ??
      resp.totalCount ??
      resp.data?.totalCount ??
      items.length;

    if (__DEV__) {
      console.log('defaultNormalizer - Debug:', {
        hasRespData: !!resp.data,
        hasPayloadBookings: !!payload.bookings,
        hasPayloadProfessionals: !!payload.professionals,
        hasPayloadUsers: !!payload.users,
        hasRespBookings: !!resp.bookings,
        hasDataBookings: !!(resp.data && resp.data.bookings),
        hasDataProfessionals: !!(resp.data && resp.data.professionals),
        hasDataUsers: !!(resp.data && resp.data.users),
        itemsLength: items?.length,
        itemsIsArray: Array.isArray(items),
        total,
        payloadKeys: Object.keys(payload || {}),
        respKeys: Object.keys(resp || {}),
      });
    }

    return { items, total };
  };

  const normalizeResponse = normalize ?? defaultNormalizer;

  const loadMore = useCallback(
    async (params: any = {}): Promise<void> => {
      // Always read latest pagination state through functional update
      setPagination((prevPagination: PaginatedState) => {
        if (isLoadingPageRef.current || !prevPagination.hasMore) {
          if (__DEV__) {
            console.log('usePaginatedApi - loadMore skipped:', {
              isLoading: isLoadingPageRef.current,
              hasMore: prevPagination.hasMore,
            });
          }
          return prevPagination;
        }

        isLoadingPageRef.current = true;
        setIsLoading(true);

        apiCall({
          ...params,
          page: prevPagination.page,
          limit: prevPagination.limit,
        })
          .then((rawResponse) => {
            const { items: newItems, total } = normalizeResponse(rawResponse);
            setAllData((prev: T[]) => {
              const combined = prevPagination.page === 1 ? newItems : [...prev, ...newItems];
              const uniqueItems = Array.from(
                new Map(combined.map((item: any) => [item._id, item])).values()
              );
              return uniqueItems as T[];
            });

            setPagination((p: PaginatedState) => ({
              ...p,
              page: p.page + 1,
              total,
              hasMore: p.page * p.limit < total,
            }));

            isLoadingPageRef.current = false;
            setIsLoading(false);
          })
          .catch((err) => {
            console.error('usePaginatedApi - loadMore error:', err);
            isLoadingPageRef.current = false;
            setIsLoading(false);
          });

        return prevPagination;
      });
    },
    [apiCall, normalizeResponse]
  );

  const refresh = useCallback(
    async (params: any = {}): Promise<void> => {
      setPagination((p: PaginatedState) => ({ ...p, page: 1, hasMore: true }));
      setAllData([]);
      while (isLoadingPageRef.current) await new Promise((r) => setTimeout(r, 50));
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

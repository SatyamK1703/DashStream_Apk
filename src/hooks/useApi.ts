import { useState, useCallback, useRef } from 'react';
import { ApiResponse } from '../services/httpClient';
import { handleApiError, retryOperation } from '../utils/errorHandler';
import { useAuth } from '../context/AuthContext';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
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
  apiCall: (params: any) => Promise<ApiResponse<T> | ApiResponse<T[]> | any>,
  options: UseApiOptions = {}
) => {
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
  });

  const [allData, setAllData] = useState<T[]>([]);
  const isLoadingPageRef = useRef(false);
  const baseApi = useApi(apiCall, options);

  const normalizePaginated = (resp: any) => {
    // Common shapes we expect:
    // - Direct array => items
    // - { items, total }
    // - { results, total }
    // - { data: { items|results|... } }
    if (!resp) return { items: [], total: 0 };

    // Direct array
    if (Array.isArray(resp)) return { items: resp, total: resp.length };

    // If the payload wraps actual payload in `data`, unwrap it
    const payload = resp.data ?? resp;

    // Prefer common keys in order
    const items = payload.items ?? payload.results ?? payload.services ?? payload.bookings ?? payload.notifications;
    if (Array.isArray(items)) {
      const total = payload.total ?? payload.totalCount ?? (items.length);
      return { items, total };
    }

    // If payload itself is an array (defensive)
    if (Array.isArray(payload)) return { items: payload, total: payload.length };

    return { items: [], total: 0 };
  };

  const loadMore = useCallback(
    async (params: any = {}) => {
      if (!pagination.hasMore && pagination.page > 1) return;

      if (__DEV__) {
        console.log('usePaginatedApi - loadMore called:', {
          params,
          pagination,
          currentData: allData
        });
      }

      const rawResponse = await baseApi.execute({
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      const response = normalizePaginated(rawResponse);

      if (__DEV__) {
        console.log('usePaginatedApi - loadMore response:', {
          response,
          responseType: typeof response,
          isArray: Array.isArray(response),
          responseLength: Array.isArray(response) ? response.length : 'N/A'
        });
      }

      if (response) {
        const newData = Array.isArray(response.items) ? response.items : response.items || [];

        const updatedData = pagination.page === 1 ? newData : [...allData, ...newData];
        
        if (__DEV__) {
          console.log('usePaginatedApi - Setting data:', {
            previousLength: allData.length,
            newDataLength: newData.length,
            totalLength: updatedData.length,
            isFirstPage: pagination.page === 1
          });
        }
        
        setAllData(updatedData);

        setPagination(prev => ({
          ...prev,
          page: prev.page + 1,
          hasMore: newData.length === prev.limit,
          total: newData.length < prev.limit 
            ? (prev.page - 1) * prev.limit + newData.length
            : prev.total,
        }));
      }

      isLoadingPageRef.current = false;
      return response;
    },
    [baseApi, pagination, allData]
  );

  const refresh = useCallback(
    async (params: any = {}) => {
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
      setAllData([]);
      // ensure we don't collide with an ongoing load
      while ((isLoadingPageRef as any).current) {
        await new Promise(r => setTimeout(r, 50));
      }
      return loadMore(params);
    },
    [loadMore]
  );

  const reset = useCallback(() => {
    baseApi.reset();
    setAllData([]);
    setPagination({
      page: 1,
      limit: 10,
      total: 0,
      hasMore: true,
    });
  }, [baseApi]);

  const result = {
    data: allData,
    loading: baseApi.loading,
    error: baseApi.error,
    pagination,
    loadMore,
    refresh,
    reset,
  };
  
  if (__DEV__) {
    console.log('usePaginatedApi - Returning:', {
      allData,
      dataLength: allData?.length,
      loading: baseApi.loading,
      error: baseApi.error,
      pagination
    });
  }
  
  return result;
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
import { useState, useCallback, useRef } from 'react';
import { ApiResponse, ApiError } from '../services/httpClient';
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

  const execute = useCallback(
    async (...args: any[]) => {
      if (isExecutingRef.current) return state.data; // prevent concurrent duplicate calls
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
  apiCall: (params: any) => Promise<ApiResponse<T[]>>,
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
    // Support various backend shapes
    // 1) Array
    if (Array.isArray(resp)) return { items: resp, total: resp.length };
    // 2) Generic {items,total}
    if (resp?.items) return { items: resp.items, total: resp.total ?? resp.items.length };
    // 3) Bookings API: { bookings, totalCount, totalPages, currentPage, results }
    if (resp?.bookings) return { items: resp.bookings, total: resp.totalCount ?? resp.bookings.length };
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

      const response = await baseApi.execute({
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (__DEV__) {
        console.log('usePaginatedApi - loadMore response:', {
          response,
          responseType: typeof response,
          isArray: Array.isArray(response),
          responseLength: Array.isArray(response) ? response.length : 'N/A'
        });
      }

      if (response) {
        const newData = Array.isArray(response) ? response : [];
        
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
    [baseApi.execute, pagination, allData]
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
  }, [baseApi.reset]);

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
    [baseApi.execute, intervalMs]
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
import { useState, useCallback } from 'react';
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

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const operation = () => apiCall(...args);
        const response = retries > 0 
          ? await retryOperation(operation, retries, retryDelay)
          : await operation();

        const isSuccess = (response as any)?.success === true || (response as any)?.status === 'success';
        if (isSuccess) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });

          if (onSuccess) {
            onSuccess(response.data);
          }

          return response.data;
        } else {
          throw response;
        }
      } catch (error: any) {
        const appError = handleApiError(
          error,
          apiCall.name,
          showErrorAlert
        );

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
  const baseApi = useApi(apiCall, options);

  const loadMore = useCallback(
    async (params: any = {}) => {
      if (!pagination.hasMore && pagination.page > 1) return;

      const response = await baseApi.execute({
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response) {
        const newData = Array.isArray(response) ? response : [];
        
        setAllData(prev => 
          pagination.page === 1 ? newData : [...prev, ...newData]
        );

        setPagination(prev => ({
          ...prev,
          page: prev.page + 1,
          hasMore: newData.length === prev.limit,
          total: newData.length < prev.limit 
            ? (prev.page - 1) * prev.limit + newData.length
            : prev.total,
        }));
      }

      return response;
    },
    [baseApi, pagination]
  );

  const refresh = useCallback(
    async (params: any = {}) => {
      setPagination(prev => ({ ...prev, page: 1, hasMore: true }));
      setAllData([]);
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

  return {
    data: allData,
    loading: baseApi.loading,
    error: baseApi.error,
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
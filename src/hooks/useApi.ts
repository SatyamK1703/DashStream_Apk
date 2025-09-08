import { useState, useCallback } from 'react';
import apiService, { ApiResponse, ApiError } from '../services/apiService';
import { handleApiError } from '../utils/errorHandlingUtils';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
}

interface ApiHook<T> extends ApiState<T> {
  execute: (...args: any[]) => Promise<ApiResponse<T> | null>;
  reset: () => void;
}

/**
 * Hook for making API calls with built-in loading, error, and success states
 * @param apiMethod Function that makes the API call
 * @param initialData Initial data (optional)
 * @param errorTitle Custom error title for notifications (optional)
 */
const useApi = <T>(
  apiMethod: (...args: any[]) => Promise<ApiResponse<T>>,
  initialData: T | null = null,
  errorTitle?: string
): ApiHook<T> => {
  // State for API call
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  // Execute API call
  const execute = useCallback(
    async (...args: any[]): Promise<ApiResponse<T> | null> => {
      try {
        // Set loading state
        setState(prevState => ({ ...prevState, isLoading: true, error: null }));

        // Make API call
        const response = await apiMethod(...args);

        // Set success state
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });

        return response;
      } catch (error) {
        // Handle error
        const processedError = await handleApiError(error, errorTitle);

        // Set error state
        setState({
          data: initialData,
          isLoading: false,
          error: processedError,
        });

        return null;
      }
    },
    [apiMethod, initialData, errorTitle]
  );

  return {
    ...state,
    execute,
    reset,
  };
};

export default useApi;
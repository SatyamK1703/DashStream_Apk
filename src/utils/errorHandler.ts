import { Alert } from 'react-native';

export interface ApiError {
  status?: number;
  statusCode?: number;
  message: string;
  code?: string;
  details?: any;
}

export const parseApiError = (error: any): ApiError => {
  // If this already looks like our ApiError shape, return it as-is
  if (error && typeof error === 'object' && (
    typeof error.status !== 'undefined' || typeof error.statusCode !== 'undefined'
  ) && error.message) {
    return {
      status: error.status ?? error.statusCode,
      statusCode: error.statusCode ?? error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    };
  }

  // Network error (no response)
  if (error && (error.code === 'NETWORK_ERROR' || !error.response)) {
    return {
      status: 0,
      message: 'Network error. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Server response error
  if (error && error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          status,
          message: data?.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST',
          details: data?.details,
        };
      
      case 401:
        return {
          status,
          message: 'Authentication required. Please login again.',
          code: 'UNAUTHORIZED',
        };
      
      case 403:
        return {
          status,
          message: data?.message || 'Access denied.',
          code: 'FORBIDDEN',
        };
      
      case 404:
        return {
          status,
          message: data?.message || 'Resource not found.',
          code: 'NOT_FOUND',
        };
      
      case 422:
        return {
          status,
          message: data?.message || 'Validation error.',
          code: 'VALIDATION_ERROR',
          details: data?.errors,
        };
      
      case 429:
        return {
          status,
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMITED',
        };
      
      case 500:
        return {
          status,
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR',
        };
      
      case 503:
        return {
          status,
          message: 'Service temporarily unavailable. Please try again later.',
          code: 'SERVICE_UNAVAILABLE',
        };
      
      default:
        return {
          status,
          message: data?.message || 'Something went wrong. Please try again.',
          code: 'UNKNOWN_ERROR',
          details: data,
        };
    }
  }

  // Generic error
  return {
    message: error.message || 'An unexpected error occurred.',
    code: 'GENERIC_ERROR',
  };
};

export const showErrorAlert = (
  error: any,
  title: string = 'Error',
  options?: {
    onRetry?: () => void;
    customMessage?: string;
  }
) => {
  const apiError = parseApiError(error);
  const message = options?.customMessage || apiError.message;

  const buttons = [
    { text: 'OK', style: 'default' as const },
  ];

  if (options?.onRetry) {
    buttons.unshift({ text: 'Retry', onPress: options.onRetry });
  }

  Alert.alert(title, message, buttons);
};

export const getErrorMessage = (error: any): string => {
  const apiError = parseApiError(error);
  return apiError.message;
};

export const isNetworkError = (error: any): boolean => {
  const apiError = parseApiError(error);
  return apiError.code === 'NETWORK_ERROR';
};

export const isAuthError = (error: any): boolean => {
  const apiError = parseApiError(error);
  return apiError.status === 401;
};

export const isValidationError = (error: any): boolean => {
  const apiError = parseApiError(error);
  return apiError.code === 'VALIDATION_ERROR';
};

// Generic error boundary handler for React components
export const handleAsyncError = async (
  asyncFunction: () => Promise<any>,
  options?: {
    showAlert?: boolean;
    alertTitle?: string;
    onError?: (error: ApiError) => void;
    onRetry?: () => void;
    customErrorMessage?: string;
  }
): Promise<{ data: any; error: ApiError | null }> => {
  try {
    const data = await asyncFunction();
    return { data, error: null };
  } catch (error) {
    const apiError = parseApiError(error);
    
    if (options?.onError) {
      options.onError(apiError);
    }

    if (options?.showAlert !== false) {
      showErrorAlert(error, options?.alertTitle, {
        onRetry: options?.onRetry,
        customMessage: options?.customErrorMessage,
      });
    }

    return { data: null, error: apiError };
  }
};

// Validation error helpers
export const getValidationErrors = (error: any): Record<string, string[]> => {
  const apiError = parseApiError(error);
  if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
    return apiError.details;
  }
  return {};
};

export const getFieldError = (error: any, fieldName: string): string | null => {
  const validationErrors = getValidationErrors(error);
  const fieldErrors = validationErrors[fieldName];
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
};

// Handle API errors for useApi hook
export const handleApiError = (
  error: any,
  operationName?: string,
  showAlert: boolean = true
): ApiError => {
  const apiError = parseApiError(error);
  
  if (__DEV__) {
    console.error(`API Error in ${operationName || 'Unknown Operation'}:`, {
      status: apiError.status,
      message: apiError.message,
      code: apiError.code,
      details: apiError.details,
    });
  }

  if (showAlert && apiError.code !== 'UNAUTHORIZED') {
    showErrorAlert(error, 'Error');
  }

  return {
    ...apiError,
    statusCode: apiError.status || 500,
  };
};

// Retry operation with exponential backoff
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication errors or client errors (4xx)
      const apiError = parseApiError(error);
      if (apiError.status && apiError.status >= 400 && apiError.status < 500) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * delay; // Add 10% jitter
      const totalDelay = delay + jitter;

      if (__DEV__) {
        console.warn(`Retry attempt ${attempt + 1}/${maxRetries} in ${Math.round(totalDelay)}ms`);
      }

      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }

  throw lastError;
};
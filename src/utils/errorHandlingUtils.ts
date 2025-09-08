import { AxiosError } from 'axios';
import { showErrorNotification } from './notificationUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  SERVER = 'SERVER',
  NOT_FOUND = 'NOT_FOUND',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// Error response structure
export interface ErrorResponse {
  type: ErrorType;
  status: number;
  message: string;
  details?: any;
  originalError?: any;
}

/**
 * Determine error type based on status code and error details
 */
export const getErrorType = (status: number, error: any): ErrorType => {
  // Network errors
  if (!status || error?.message?.includes('Network Error')) {
    return ErrorType.NETWORK;
  }

  // Timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return ErrorType.TIMEOUT;
  }

  // Status-based categorization
  switch (status) {
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 422:
      return ErrorType.VALIDATION;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER;
    default:
      return status >= 400 && status < 500 
        ? ErrorType.VALIDATION 
        : ErrorType.UNKNOWN;
  }
};

/**
 * Format error message based on error type and details
 */
export const formatErrorMessage = (error: ErrorResponse): string => {
  const { type, message, details } = error;

  // Return custom message if provided
  if (message && message !== 'Unknown error') {
    return message;
  }

  // Default messages based on error type
  switch (type) {
    case ErrorType.NETWORK:
      return 'Network connection error. Please check your internet connection and try again.';
    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please log in again.';
    case ErrorType.AUTHORIZATION:
      return 'You don\'t have permission to perform this action.';
    case ErrorType.VALIDATION:
      if (details && typeof details === 'object') {
        // Format validation errors
        const errorMessages = Object.values(details).flat();
        return errorMessages.length > 0 
          ? errorMessages.join('\n') 
          : 'Please check your input and try again.';
      }
      return 'Please check your input and try again.';
    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';
    case ErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorType.SERVER:
      return 'Server error. Our team has been notified and is working on it.';
    default:
      return 'Something went wrong. Please try again later.';
  }
};

/**
 * Process API error and return standardized error response
 */
export const processApiError = (error: any): ErrorResponse => {
  // Default error response
  const defaultError: ErrorResponse = {
    type: ErrorType.UNKNOWN,
    status: 0,
    message: 'Unknown error',
    originalError: error
  };

  // Handle Axios errors
  if (error?.isAxiosError) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status || 0;
    const responseData = axiosError.response?.data as any;

    return {
      type: getErrorType(status, axiosError),
      status,
      message: responseData?.message || responseData?.error || axiosError.message,
      details: responseData?.errors || responseData?.details,
      originalError: axiosError
    };
  }

  // Handle network errors
  if (error instanceof Error && error.message.includes('Network')) {
    return {
      type: ErrorType.NETWORK,
      status: 0,
      message: 'Network connection error',
      originalError: error
    };
  }

  // Return default for other errors
  return defaultError;
};

/**
 * Handle authentication errors (401)
 */
export const handleAuthError = async (): Promise<void> => {
  // Clear auth token
  await AsyncStorage.removeItem('authToken');
  
  // Show notification
  await showErrorNotification(
    'Session Expired',
    'Your session has expired. Please log in again.'
  );

  // Additional logic can be added here (e.g., redirect to login)
};

/**
 * Handle and display API errors with appropriate notifications
 */
export const handleApiError = async (error: any, customTitle?: string): Promise<ErrorResponse> => {
  // Process the error
  const processedError = processApiError(error);
  const errorMessage = formatErrorMessage(processedError);
  
  // Handle specific error types
  if (processedError.type === ErrorType.AUTHENTICATION) {
    await handleAuthError();
    return processedError;
  }

  // Show notification for other errors
  const title = customTitle || getErrorNotificationTitle(processedError.type);
  await showErrorNotification(title, errorMessage, processedError.originalError);
  
  return processedError;
};

/**
 * Get appropriate notification title based on error type
 */
const getErrorNotificationTitle = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Connection Error';
    case ErrorType.VALIDATION:
      return 'Validation Error';
    case ErrorType.SERVER:
      return 'Server Error';
    case ErrorType.NOT_FOUND:
      return 'Not Found';
    case ErrorType.TIMEOUT:
      return 'Request Timeout';
    default:
      return 'Error';
  }
};

/**
 * Check if device is online
 */
export const isOnline = async (): Promise<boolean> => {
  try {
    // For web platform
    if (Platform.OS === 'web' && navigator?.onLine !== undefined) {
      return navigator.onLine;
    }
    
    // For native platforms, we would typically use NetInfo
    // This is a simplified version - in a real app, import and use NetInfo
    return true;
  } catch (error) {
    console.error('Error checking online status:', error);
    return true; // Assume online if check fails
  }
};
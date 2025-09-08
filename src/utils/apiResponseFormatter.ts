// src/utils/apiResponseFormatter.ts


interface StandardResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any[];
  statusCode?: number;
}

export const formatSuccessResponse = <T>(data: T, message?: string): StandardResponse<T> => {
  return {
    success: true,
    data,
    message: message || 'Operation successful',
    statusCode: 200
  };
};


export const formatErrorResponse = (error: any, statusCode: number = 400): StandardResponse<null> => {
  // Handle different error formats
  if (typeof error === 'string') {
    return {
      success: false,
      message: error,
      statusCode
    };
  }
  
  // Handle axios error responses
  if (error.response?.data) {
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      error: error.response.data.error,
      errors: error.response.data.errors,
      statusCode: error.response.status || statusCode
    };
  }
  
  // Handle network errors
  if (error.isNetworkError) {
    return {
      success: false,
      message: error.message || 'Network error',
      statusCode: 0
    };
  }
  
  // Handle auth errors
  if (error.isAuthError) {
    return {
      success: false,
      message: error.message || 'Authentication error',
      statusCode: 401
    };
  }
  
  // Handle server errors
  if (error.isServerError) {
    return {
      success: false,
      message: error.message || 'Server error',
      statusCode: error.statusCode || 500
    };
  }
  
  // Default error format
  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    statusCode: statusCode
  };
};


export const parseApiResponse = <T>(response: any): StandardResponse<T> => {
  // If response is already in standard format
  if (response && typeof response.success === 'boolean') {
    return response as StandardResponse<T>;
  }
  
  // If response has data property (common backend pattern)
  if (response && response.data) {
    return formatSuccessResponse(response.data);
  }
  
  // If response is just data
  return formatSuccessResponse(response);
};
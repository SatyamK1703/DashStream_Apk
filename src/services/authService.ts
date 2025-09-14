import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import {
  User,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '../types/api';

class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOtp(data: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> {
    try {
      return await httpClient.post(ENDPOINTS.AUTH.SEND_OTP, data);
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and authenticate user
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> {
    try {
      const response = await httpClient.post<VerifyOtpResponse>(ENDPOINTS.AUTH.VERIFY_OTP, data);
      
      // Store tokens after successful verification
      const isSuccess = response.success === true || response.status === 'success';
      if (isSuccess && response.data) {
        // Backend returns "token" instead of "accessToken"
        const accessToken = response.data.accessToken || response.data.token;
        const refreshToken = response.data.refreshToken;
        
        if (__DEV__) {
          console.log('🔍 Token verification debug:', {
            responseSuccess: response.success,
            responseStatus: response.status,
            hasData: !!response.data,
            accessToken: accessToken ? 'Present' : 'Missing',
            refreshToken: refreshToken ? 'Present' : 'Missing',
            tokenLength: accessToken ? accessToken.length : 0,
            refreshTokenLength: refreshToken ? refreshToken.length : 0
          });
        }
        
        if (accessToken && refreshToken) {
          try {
            // Store tokens and wait for completion
            await httpClient.setAuthTokens(accessToken, refreshToken);
            
            // Add a small delay to ensure AsyncStorage write completes
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Verify tokens were actually stored
            const isAuthenticated = await httpClient.isAuthenticated();
            if (__DEV__) {
              console.log('✅ Tokens stored and verified:', { 
                isAuthenticated,
                accessTokenPreview: accessToken.substring(0, 20) + '...',
                refreshTokenPreview: refreshToken.substring(0, 20) + '...'
              });
            }
            
            if (!isAuthenticated) {
              throw new Error('Token verification failed after storage');
            }
          } catch (storageError) {
            console.error('❌ Token storage failed:', storageError);
            throw new Error('Failed to store authentication tokens');
          }
        } else {
          const errorMsg = `Missing tokens in response: accessToken=${!!accessToken}, refreshToken=${!!refreshToken}`;
          console.error('❌', errorMsg);
          throw new Error(errorMsg);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    try {
      return await httpClient.post(ENDPOINTS.AUTH.REFRESH_TOKEN);
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Get current user data
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      return await httpClient.get(ENDPOINTS.AUTH.ME);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Verify if current token is valid
   */
  async verifyToken(): Promise<ApiResponse<{ userId: string; role: string; tokenValid: boolean }>> {
    try {
      return await httpClient.get(ENDPOINTS.AUTH.VERIFY_TOKEN);
    } catch (error) {
      console.error('Verify token error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await httpClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if the API call fails, we should clear local tokens
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return await httpClient.isAuthenticated();
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import {
  User,
  VerifyOtpResponse,
} from '../types/api';

class AuthService {
  /**
   * Verify Firebase ID token with the backend
   */
  async verifyFirebaseToken(idToken: string): Promise<ApiResponse<VerifyOtpResponse>> {
    try {
      const response = await httpClient.post<VerifyOtpResponse>(
        API_ENDPOINTS.AUTH.VERIFY_PHONE,
        { idToken },
      );

      const isSuccess = response.success === true || response.status === 'success';
      if (isSuccess && response.data) {
        const accessToken = response.data.accessToken || response.data.token;
        const refreshToken = response.data.refreshToken;

        if (accessToken && refreshToken) {
          await httpClient.setAuthTokens(accessToken, refreshToken);
        } else {
          throw new Error('Missing tokens in backend response');
        }
      }

      return response;
    } catch (error) {
      console.error('Verify Firebase token error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<ApiResponse<{ accessToken: string; refreshToken?: string }>> {
    try {
      return await httpClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
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
      return await httpClient.get(API_ENDPOINTS.AUTH.ME);
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
      return await httpClient.get(API_ENDPOINTS.AUTH.VERIFY_TOKEN);
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
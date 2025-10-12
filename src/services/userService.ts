import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';
import {
  User,
  Professional,
  UpdateProfileRequest,
} from '../types/api';

class UserService {
  /**
   * Get current user profile
   */
  async getUserProfile(): Promise<ApiResponse<User>> {
    try {
      // Use auth/me endpoint to fetch current authenticated user's profile
      return await httpClient.get(API_ENDPOINTS.AUTH.ME);
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.USERS.PROFILE, data);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Update profile image
   */
  async updateProfileImage(imageFile: FormData): Promise<ApiResponse<User>> {
    try {
      // Allow callers to pass a FormData and optional progress via the httpClient.uploadFile signature
      // If callers need upload progress, they can call this method with a FormData that includes
      // the file and use httpClient.uploadFile directly with an onUploadProgress handler.
      return await httpClient.uploadFile(API_ENDPOINTS.USERS.PROFILE_IMAGE, imageFile as any);
    } catch (error) {
      console.error('Update profile image error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<ApiResponse<void>> {
    try {
      return await httpClient.delete(API_ENDPOINTS.USERS.DELETE_ACCOUNT);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  }
  /**
   * Get all professionals
   */
  async getProfessionals(params?: {
    location?: { latitude: number; longitude: number; radius?: number };
    specializations?: string[];
    minRating?: number;
    sortBy?: 'rating' | 'distance' | 'experience';
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Professional[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.USERS.PROFESSIONALS, { params });
    } catch (error) {
      console.error('Get professionals error:', error);
      throw error;
    }
  }

  /**
   * Get professional details by ID
   */
  async getProfessionalDetails(professionalId: string): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.get(API_ENDPOINTS.USERS.PROFESSIONAL_DETAILS(professionalId));
    } catch (error) {
      console.error('Get professional details error:', error);
      throw error;
    }
  }

  // Professional-only API_ENDPOINTS
  /**
   * Update professional profile
   */
  async updateProfessionalProfile(data: {
    specializations?: string[];
    experience?: number;
    serviceAreas?: any[];
    pricing?: any[];
    bio?: string;
  }): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.patch('/users/professional-profile', data);
    } catch (error) {
      console.error('Update professional profile error:', error);
      throw error;
    }
  }

  /**
   * Toggle professional availability
   */
  async toggleAvailability(): Promise<ApiResponse<{ isAvailable: boolean }>> {
    try {
      return await httpClient.patch('/users/toggle-availability');
    } catch (error) {
      console.error('Toggle availability error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
export default userService;
import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';

// Professional-specific types based on backend controller
export interface ProfessionalJob {
  id: string;
  customerName: string;
  customerImage: string;
  date: string;
  time: string;
  address: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  paymentStatus: string;
  serviceName: string;
  createdAt: string;
}

export interface JobDetails {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    image: string;
  };
  service: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
  }>;
  scheduledDate: string;
  scheduledTime: string;
  address: {
    name: string;
    street: string;
    city: string;
    landmark: string;
    pincode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: string;
  paymentStatus: string;
  totalAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfessionalProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: {
    url: string;
  };
  rating: number;
  totalRatings: number;
  isAvailable: boolean;
  status: string;
}

export interface DashboardStats {
  jobCounts: {
    pending: number;
    confirmed: number;
    assigned: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
    rejected: number;
    total: number;
  };
  earnings: {
    total: number;
    currency: string;
  };
  todayJobs: Array<{
    id: string;
    time: string;
    status: string;
    address: string;
  }>;
}

export interface UpdateJobStatusData {
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
}

export interface UpdateProfileData {
  specialization?: string;
  experience?: number;
  isAvailable?: boolean;
  status?: string;
}

class ProfessionalService {
  /**
   * Get professional jobs/bookings
   */
  async getJobs(): Promise<ApiResponse<ProfessionalJob[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.PROFESSIONALS.JOBS);
    } catch (error) {
      if (__DEV__) console.error('Get professional jobs error:', error);
      throw error;
    }
  }

  /**
   * Get job details by ID
   */
  async getJobDetails(jobId: string): Promise<ApiResponse<JobDetails>> {
    try {
      return await httpClient.get(API_ENDPOINTS.PROFESSIONALS.JOB_BY_ID(jobId));
    } catch (error) {
      if (__DEV__) console.error('Get job details error:', error);
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, data: UpdateJobStatusData): Promise<ApiResponse<{ id: string; status: string }>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.PROFESSIONALS.UPDATE_JOB_STATUS(jobId), data);
    } catch (error) {
      if (__DEV__) console.error('Update job status error:', error);
      throw error;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      return await httpClient.get(API_ENDPOINTS.PROFESSIONALS.DASHBOARD);
    } catch (error) {
      if (__DEV__) console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Get professional profile
   */
  async getProfile(): Promise<ApiResponse<ProfessionalProfile>> {
    try {
      return await httpClient.get(API_ENDPOINTS.PROFESSIONALS.PROFILE);
    } catch (error) {
      if (__DEV__) console.error('Get professional profile error:', error);
      throw error;
    }
  }

  /**
   * Update professional profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<{
    name: string;
    isAvailable: boolean;
    status: string;
  }>> {
    try {
      return await httpClient.patch(API_ENDPOINTS.PROFESSIONALS.PROFILE, data);
    } catch (error) {
      if (__DEV__) console.error('Update professional profile error:', error);
      throw error;
    }
  }

  /**
   * Helper methods for job status updates
   */
  async acceptJob(jobId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.updateJobStatus(jobId, { status: 'confirmed' });
  }

  async startJob(jobId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.updateJobStatus(jobId, { status: 'in-progress' });
  }

  async completeJob(jobId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.updateJobStatus(jobId, { status: 'completed' });
  }

  async cancelJob(jobId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.updateJobStatus(jobId, { status: 'cancelled' });
  }

  async rejectJob(jobId: string): Promise<ApiResponse<{ id: string; status: string }>> {
    return this.updateJobStatus(jobId, { status: 'rejected' });
  }

  /**
   * Toggle availability status
   */
  async toggleAvailability(): Promise<ApiResponse<{
    name: string;
    isAvailable: boolean;
    status: string;
  }>> {
    try {
      // Get current profile first to toggle availability
      const profileResponse = await this.getProfile();
      const currentAvailability = profileResponse.data.isAvailable;
      
      return await this.updateProfile({ isAvailable: !currentAvailability });
    } catch (error) {
      if (__DEV__) console.error('Toggle availability error:', error);
      throw error;
    }
  }

  /**
   * Set availability status
   */
  async setAvailability(isAvailable: boolean): Promise<ApiResponse<{
    name: string;
    isAvailable: boolean;
    status: string;
  }>> {
    return this.updateProfile({ isAvailable });
  }

  /**
   * Update professional status
   */
  async updateStatus(status: string): Promise<ApiResponse<{
    name: string;
    isAvailable: boolean;
    status: string;
  }>> {
    return this.updateProfile({ status });
  }
}

// Export singleton instance
export const professionalService = new ProfessionalService();
export default professionalService;
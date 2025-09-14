import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { Booking, Professional } from '../types/api';

// Professional-specific types
export interface ProfessionalJob extends Booking {
  distance?: string;
  estimatedArrival?: string;
  customerImage?: string;
  customerRating?: number;
  specialInstructions?: string;
}

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
  pendingPayout: number;
  lastPayout?: {
    amount: number;
    date: string;
    transactionId: string;
  };
  totalEarnings: number;
}

export interface PerformanceMetrics {
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  completionRate: number;
  onTimeRate: number;
  customerSatisfaction: number;
  averageJobTime: number;
  repeatCustomers: number;
}

export interface ProfessionalAvailability {
  isAvailable: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: string[];
  serviceAreas: string[];
  maxJobsPerDay: number;
}

export interface JobFilters {
  status?: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

class ProfessionalService {
  /**
   * Get professional profile
   */
  async getProfile(): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.get(ENDPOINTS.PROFESSIONALS.PROFILE);
    } catch (error) {
      // Log error in development only
      if (__DEV__) console.error('Get professional profile error:', error);
      throw error;
    }
  }

  /**
   * Get professional dashboard stats
   */
  async getDashboardStats(): Promise<ApiResponse<any>> {
    try {
      return await httpClient.get(ENDPOINTS.PROFESSIONALS.DASHBOARD);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  }

  /**
   * Update professional profile
   */
  async updateProfile(data: {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    specializations?: string[];
    experience?: number;
    serviceAreas?: any[];
    pricing?: any[];
  }): Promise<ApiResponse<Professional>> {
    try {
      return await httpClient.patch(ENDPOINTS.PROFESSIONALS.PROFILE, data);
    } catch (error) {
      console.error('Update professional profile error:', error);
      throw error;
    }
  }

  /**
   * Toggle availability status
   */
  async toggleAvailability(): Promise<ApiResponse<{ isAvailable: boolean }>> {
    try {
      return await httpClient.patch(ENDPOINTS.PROFESSIONALS.AVAILABILITY);
    } catch (error) {
      console.error('Toggle availability error:', error);
      throw error;
    }
  }

  /**
   * Update availability settings
   */
  async updateAvailability(data: Partial<ProfessionalAvailability>): Promise<ApiResponse<ProfessionalAvailability>> {
    try {
      return await httpClient.put(ENDPOINTS.PROFESSIONALS.AVAILABILITY, data);
    } catch (error) {
      console.error('Update availability error:', error);
      throw error;
    }
  }

  /**
   * Get professional jobs/bookings
   */
  async getJobs(filters?: JobFilters): Promise<ApiResponse<ProfessionalJob[]>> {
    try {
      return await httpClient.get(ENDPOINTS.PROFESSIONALS.JOBS, { params: filters });
    } catch (error) {
      console.error('Get jobs error:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(jobId: string): Promise<ApiResponse<ProfessionalJob>> {
    try {
      return await httpClient.get(`${ENDPOINTS.PROFESSIONALS.JOBS}/${jobId}`);
    } catch (error) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  }

  /**
   * Accept job
   */
  async acceptJob(jobId: string, data?: { estimatedArrival?: string; notes?: string }): Promise<ApiResponse<ProfessionalJob>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.PROFESSIONALS.JOBS}/${jobId}/accept`, data);
    } catch (error) {
      console.error('Accept job error:', error);
      throw error;
    }
  }

  /**
   * Start job
   */
  async startJob(jobId: string, data?: { startLocation?: { lat: number; lng: number }; notes?: string }): Promise<ApiResponse<ProfessionalJob>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.PROFESSIONALS.JOBS}/${jobId}/start`, data);
    } catch (error) {
      console.error('Start job error:', error);
      throw error;
    }
  }

  /**
   * Complete job
   */
  async completeJob(jobId: string, data: {
    completionNotes?: string;
    beforeImages?: string[];
    afterImages?: string[];
    actualDuration?: number;
    completionLocation?: { lat: number; lng: number };
  }): Promise<ApiResponse<ProfessionalJob>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.PROFESSIONALS.JOBS}/${jobId}/complete`, data);
    } catch (error) {
      console.error('Complete job error:', error);
      throw error;
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(jobId: string, data: { reason: string; notes?: string }): Promise<ApiResponse<ProfessionalJob>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.PROFESSIONALS.JOBS}/${jobId}/cancel`, data);
    } catch (error) {
      console.error('Cancel job error:', error);
      throw error;
    }
  }

  /**
   * Get earnings summary
   */
  async getEarnings(filters?: {
    period?: 'today' | 'week' | 'month' | 'year';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<EarningsSummary>> {
    try {
      return await httpClient.get(ENDPOINTS.PROFESSIONALS.EARNINGS, { params: filters });
    } catch (error) {
      console.error('Get earnings error:', error);
      throw error;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(filters?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<PerformanceMetrics>> {
    try {
      return await httpClient.get(`${ENDPOINTS.PROFESSIONALS.EARNINGS}/performance`, { params: filters });
    } catch (error) {
      console.error('Get performance metrics error:', error);
      throw error;
    }
  }

  /**
   * Update job location/status (for tracking)
   */
  async updateJobLocation(jobId: string, data: {
    location: { lat: number; lng: number };
    status?: string;
    estimatedArrival?: string;
  }): Promise<ApiResponse<void>> {
    try {
      return await httpClient.patch(`${ENDPOINTS.PROFESSIONALS.JOB_BY_ID(jobId)}/location`, data);
    } catch (error) {
      console.error('Update job location error:', error);
      throw error;
    }
  }

  /**
   * Submit verification documents
   */
  async submitVerification(data: {
    identityDocument: string; // base64 or file path
    addressProof: string;
    professionalCertificates?: string[];
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
    };
  }): Promise<ApiResponse<{ verificationId: string; status: string }>> {
    try {
      return await httpClient.post(ENDPOINTS.PROFESSIONALS.VERIFICATION, data);
    } catch (error) {
      console.error('Submit verification error:', error);
      throw error;
    }
  }

  /**
   * Get verification status
   */
  async getVerificationStatus(): Promise<ApiResponse<{
    status: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    documents: any[];
  }>> {
    try {
      return await httpClient.get(`${ENDPOINTS.PROFESSIONALS.VERIFICATION}/status`);
    } catch (error) {
      console.error('Get verification status error:', error);
      throw error;
    }
  }

  /**
   * Update service pricing
   */
  async updatePricing(data: {
    serviceId: string;
    price: number;
    isAvailable: boolean;
  }[]): Promise<ApiResponse<void>> {
    try {
      return await httpClient.put(`${ENDPOINTS.PROFESSIONALS.PROFILE}/pricing`, { pricing: data });
    } catch (error) {
      console.error('Update pricing error:', error);
      throw error;
    }
  }

  /**
   * Get nearby jobs (for job marketplace)
   */
  async getNearbyJobs(data: {
    location: { lat: number; lng: number };
    radius?: number; // in km
    serviceTypes?: string[];
  }): Promise<ApiResponse<ProfessionalJob[]>> {
    try {
      return await httpClient.post(`${ENDPOINTS.PROFESSIONALS.JOBS}/nearby`, data);
    } catch (error) {
      console.error('Get nearby jobs error:', error);
      throw error;
    }
  }

  /**
   * Request payout
   */
  async requestPayout(data: {
    amount: number;
    bankAccountId: string;
  }): Promise<ApiResponse<{ payoutId: string; status: string; estimatedDate: string }>> {
    try {
      return await httpClient.post(`${ENDPOINTS.PROFESSIONALS.EARNINGS}/payout`, data);
    } catch (error) {
      console.error('Request payout error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const professionalService = new ProfessionalService();
export default professionalService;
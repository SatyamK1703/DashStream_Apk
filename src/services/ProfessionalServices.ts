// src/services/ProfessionalServices.ts
import dataService from './dataService';
import { ApiResponse } from './apiService';
import { Booking } from '../types/BookingType';
import { Professional } from '../types/UserType';

// Professional Job interface (extends Booking)
export interface ProfessionalJob {
  _id: string;
  customer: {
    _id: string;
    name: string;
    phone: string;
    profileImage?: string;
  };
  service: {
    _id: string;
    title: string;
    price: number;
    duration: number;
    image?: string;
    description?: string;
    category?: string;
    vehicleType?: string;
  };
  vehicle: {
    type: '2 Wheeler' | '4 Wheeler';
    brand?: string;
    model?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    coordinates?: [number, number];
  };
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';
  totalAmount: number;
  estimatedDuration: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'upi';
  notes?: string;
  date?: string; // For compatibility with dashboard
  time?: string; // For compatibility with dashboard
  createdAt: string;
  updatedAt: string;
}

// Professional Earnings interface
export interface ProfessionalEarnings {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  pendingPayout: number;
  lastPayout?: {
    amount: number;
    date: string;
  };
}

// Professional Stats interface
export interface ProfessionalStats {
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageRating: number;
  onTimeRate: number;
  completionRate: number;
}

// Dashboard Data interface
export interface ProfessionalDashboardData {
  todaysJobs: ProfessionalJob[];
  upcomingJobs: ProfessionalJob[];
  earnings: ProfessionalEarnings;
  stats: ProfessionalStats;
}

/**
 * Professional Service - Provides professional-related API operations
 * Acts as a wrapper around dataService for professional-specific operations
 */
class ProfessionalServiceClass {
  
  /**
   * Get complete dashboard data for professional
   */
  async getDashboardData(): Promise<ProfessionalDashboardData> {
    try {
      // Fetch all required data in parallel
      const [jobsResponse, statsResponse, profileResponse] = await Promise.all([
        dataService.getProfessionalJobs({ limit: 50 }), // Get more jobs to filter
        dataService.getProfessionalDashboardStats(),
        dataService.getProfessionalProfile()
      ]);

      // Transform jobs data
      const jobs = (jobsResponse.data?.jobs || []).map((booking: Booking): ProfessionalJob => ({
        _id: booking._id,
        customer: {
          _id: booking.customer._id,
          name: booking.customer.name,
          phone: booking.customer.phone,
          profileImage: booking.customer.profileImage
        },
        service: {
          _id: booking.service._id,
          title: booking.service.title,
          price: booking.service.price,
          duration: booking.service.duration,
          image: booking.service.image,
          description: booking.service.description,
          category: booking.service.category,
          vehicleType: booking.service.vehicleType
        },
        vehicle: booking.vehicle,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        location: booking.location,
        status: booking.status,
        totalAmount: booking.totalAmount,
        estimatedDuration: booking.estimatedDuration,
        paymentStatus: booking.paymentStatus,
        paymentMethod: booking.paymentMethod,
        notes: booking.notes,
        date: this.formatDateForDisplay(booking.scheduledDate),
        time: booking.scheduledTime,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }));

      // Filter jobs by date
      const today = new Date().toISOString().split('T')[0];
      const todaysJobs = jobs.filter(job => 
        job.scheduledDate.split('T')[0] === today &&
        ['confirmed', 'assigned', 'in-progress'].includes(job.status)
      );

      const upcomingJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        const currentDate = new Date();
        return jobDate >= currentDate && ['confirmed', 'assigned'].includes(job.status);
      }).slice(0, 10); // Limit to 10 upcoming jobs

      // Transform stats data
      const statsData = statsResponse.data || {};
      const profileData = profileResponse.data as Professional;

      const stats: ProfessionalStats = {
        totalJobs: profileData?.totalJobs || statsData.totalJobs || 0,
        completedJobs: statsData.completedJobs || 0,
        cancelledJobs: statsData.cancelledJobs || 0,
        averageRating: profileData?.averageRating || statsData.averageRating || 0,
        onTimeRate: statsData.onTimeRate || 95, // Default value
        completionRate: statsData.completionRate || this.calculateCompletionRate(statsData.totalJobs, statsData.completedJobs)
      };

      // Transform earnings data
      const earnings: ProfessionalEarnings = {
        today: statsData.todayEarnings || 0,
        thisWeek: statsData.weekEarnings || 0,
        thisMonth: statsData.monthEarnings || 0,
        total: profileData?.totalEarnings || statsData.totalEarnings || 0,
        pendingPayout: statsData.pendingPayout || 0,
        lastPayout: statsData.lastPayout ? {
          amount: statsData.lastPayout.amount || 0,
          date: statsData.lastPayout.date || new Date().toISOString()
        } : undefined
      };

      return {
        todaysJobs,
        upcomingJobs,
        earnings,
        stats
      };
    } catch (error) {
      console.error('Error in getDashboardData:', error);
      
      // Return empty data structure on error
      return {
        todaysJobs: [],
        upcomingJobs: [],
        earnings: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          total: 0,
          pendingPayout: 0
        },
        stats: {
          totalJobs: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          averageRating: 0,
          onTimeRate: 0,
          completionRate: 0
        }
      };
    }
  }

  /**
   * Get professional jobs with filtering
   */
  async getJobs(params?: { 
    status?: string; 
    page?: number; 
    limit?: number;
  }): Promise<ApiResponse<{ jobs: ProfessionalJob[]; total: number; page: number; limit: number }>> {
    try {
      const response = await dataService.getProfessionalJobs(params);
      
      if (response.success && response.data) {
        const jobs = (response.data.jobs || []).map((booking: Booking): ProfessionalJob => ({
          _id: booking._id,
          customer: {
            _id: booking.customer._id,
            name: booking.customer.name,
            phone: booking.customer.phone,
            profileImage: booking.customer.profileImage
          },
          service: {
            _id: booking.service._id,
            title: booking.service.title,
            price: booking.service.price,
            duration: booking.service.duration,
            image: booking.service.image,
            description: booking.service.description,
            category: booking.service.category,
            vehicleType: booking.service.vehicleType
          },
          vehicle: booking.vehicle,
          scheduledDate: booking.scheduledDate,
          scheduledTime: booking.scheduledTime,
          location: booking.location,
          status: booking.status,
          totalAmount: booking.totalAmount,
          estimatedDuration: booking.estimatedDuration,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          notes: booking.notes,
          date: this.formatDateForDisplay(booking.scheduledDate),
          time: booking.scheduledTime,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt
        }));

        return {
          success: true,
          data: {
            jobs,
            total: response.data.total || jobs.length,
            page: response.data.page || 1,
            limit: response.data.limit || jobs.length
          },
          message: 'Jobs retrieved successfully'
        };
      }

      return {
        success: false,
        data: { jobs: [], total: 0, page: 1, limit: 10 },
        message: 'Failed to retrieve jobs'
      };
    } catch (error) {
      console.error('Error in getJobs:', error);
      throw error;
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(jobId: string, status: string, message?: string): Promise<ApiResponse<any>> {
    try {
      return await dataService.updateJobStatus(jobId, status, message);
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      throw error;
    }
  }

  /**
   * Get professional profile
   */
  async getProfile(): Promise<ApiResponse<Professional>> {
    try {
      return await dataService.getProfessionalProfile();
    } catch (error) {
      console.error('Error in getProfile:', error);
      throw error;
    }
  }

  /**
   * Update professional profile
   */
  async updateProfile(profileData: Partial<Professional>): Promise<ApiResponse<Professional>> {
    try {
      return await dataService.updateProfessionalProfile(profileData);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  /**
   * Get professional earnings
   */
  async getEarnings(): Promise<ApiResponse<ProfessionalEarnings>> {
    try {
      const response = await dataService.getProfessionalDashboardStats();
      
      if (response.success && response.data) {
        const statsData = response.data;
        const earnings: ProfessionalEarnings = {
          today: statsData.todayEarnings || 0,
          thisWeek: statsData.weekEarnings || 0,
          thisMonth: statsData.monthEarnings || 0,
          total: statsData.totalEarnings || 0,
          pendingPayout: statsData.pendingPayout || 0,
          lastPayout: statsData.lastPayout ? {
            amount: statsData.lastPayout.amount || 0,
            date: statsData.lastPayout.date || new Date().toISOString()
          } : undefined
        };

        return {
          success: true,
          data: earnings,
          message: 'Earnings retrieved successfully'
        };
      }

      return {
        success: false,
        data: {
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
          total: 0,
          pendingPayout: 0
        },
        message: 'Failed to retrieve earnings'
      };
    } catch (error) {
      console.error('Error in getEarnings:', error);
      throw error;
    }
  }

  /**
   * Get professional stats
   */
  async getStats(): Promise<ApiResponse<ProfessionalStats>> {
    try {
      const [statsResponse, profileResponse] = await Promise.all([
        dataService.getProfessionalDashboardStats(),
        dataService.getProfessionalProfile()
      ]);

      const statsData = statsResponse.data || {};
      const profileData = profileResponse.data as Professional;

      const stats: ProfessionalStats = {
        totalJobs: profileData?.totalJobs || statsData.totalJobs || 0,
        completedJobs: statsData.completedJobs || 0,
        cancelledJobs: statsData.cancelledJobs || 0,
        averageRating: profileData?.averageRating || statsData.averageRating || 0,
        onTimeRate: statsData.onTimeRate || 95,
        completionRate: statsData.completionRate || this.calculateCompletionRate(statsData.totalJobs, statsData.completedJobs)
      };

      return {
        success: true,
        data: stats,
        message: 'Stats retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getStats:', error);
      return {
        success: false,
        data: {
          totalJobs: 0,
          completedJobs: 0,
          cancelledJobs: 0,
          averageRating: 0,
          onTimeRate: 0,
          completionRate: 0
        },
        message: 'Failed to retrieve stats'
      };
    }
  }

  /**
   * Update professional availability status
   */
  async updateStatus(status: string): Promise<ApiResponse<any>> {
    try {
      return await dataService.updateProfessionalStatus(status);
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  /**
   * Update professional location
   */
  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  }): Promise<ApiResponse<any>> {
    try {
      return await dataService.updateProfessionalLocation(locationData);
    } catch (error) {
      console.error('Error in updateLocation:', error);
      throw error;
    }
  }

  /**
   * Helper method to format date for display
   */
  private formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Helper method to calculate completion rate
   */
  private calculateCompletionRate(totalJobs: number, completedJobs: number): number {
    if (!totalJobs || totalJobs === 0) return 0;
    return Math.round((completedJobs / totalJobs) * 100);
  }

  /**
   * Get today's jobs
   */
  async getTodaysJobs(): Promise<ApiResponse<{ jobs: ProfessionalJob[] }>> {
    try {
      const dashboardData = await this.getDashboardData();
      return {
        success: true,
        data: { jobs: dashboardData.todaysJobs },
        message: 'Today\'s jobs retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getTodaysJobs:', error);
      return {
        success: false,
        data: { jobs: [] },
        message: 'Failed to retrieve today\'s jobs'
      };
    }
  }

  /**
   * Get upcoming jobs
   */
  async getUpcomingJobs(): Promise<ApiResponse<{ jobs: ProfessionalJob[] }>> {
    try {
      const dashboardData = await this.getDashboardData();
      return {
        success: true,
        data: { jobs: dashboardData.upcomingJobs },
        message: 'Upcoming jobs retrieved successfully'
      };
    } catch (error) {
      console.error('Error in getUpcomingJobs:', error);
      return {
        success: false,
        data: { jobs: [] },
        message: 'Failed to retrieve upcoming jobs'
      };
    }
  }
}

// Create and export a singleton instance
export const ProfessionalService = new ProfessionalServiceClass();
export default ProfessionalService;
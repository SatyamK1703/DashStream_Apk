import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';
import { 
  professionalService, 
  ProfessionalJob, 
  JobDetails, 
  ProfessionalProfile, 
  DashboardStats, 
  UpdateJobStatusData, 
  UpdateProfileData 
} from '../services/professionalService';

// Hook for professional profile
export const useProfessionalProfile = () => {
  return useApi(
    () => professionalService.getProfile(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for professional jobs
export const useProfessionalJobs = () => {
  const apiCall = useCallback(() => professionalService.getJobs(), []);
  return useApi(
    apiCall,
    {
      showErrorAlert: false,
    }
  );
};

// Hook for single job details
export const useProfessionalJob = (jobId: string | null) => {
  const api = useApi(
    () => professionalService.getJobDetails(jobId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (jobId) {
      api.execute();
    }
  }, [jobId, api]);

  return api;
};

// Hook for dashboard stats
export const useProfessionalDashboard = () => {
  return useApi(
    () => professionalService.getDashboardStats(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for professional profile actions
export const useProfessionalProfileActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.updateProfile(data);
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      const errorMessage = error.message || 'Failed to update profile';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.toggleAvailability();
      return response.data;
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      const errorMessage = error.message || 'Failed to toggle availability';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const setAvailability = async (isAvailable: boolean) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.setAvailability(isAvailable);
      return response.data;
    } catch (error: any) {
      console.error('Set availability error:', error);
      const errorMessage = error.message || 'Failed to set availability';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.updateStatus(status);
      return response.data;
    } catch (error: any) {
      console.error('Update status error:', error);
      const errorMessage = error.message || 'Failed to update status';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    toggleAvailability,
    setAvailability,
    updateStatus,
    isLoading,
    error,
  };
};

// Hook for job actions
export const useProfessionalJobActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateJobStatus = async (jobId: string, status: UpdateJobStatusData['status']) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.updateJobStatus(jobId, { status });
      return response.data;
    } catch (error: any) {
      console.error('Update job status error:', error);
      const errorMessage = error.message || 'Failed to update job status';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptJob = async (jobId: string) => {
    return updateJobStatus(jobId, 'confirmed');
  };

  const startJob = async (jobId: string) => {
    return updateJobStatus(jobId, 'in-progress');
  };

  const completeJob = async (jobId: string) => {
    return updateJobStatus(jobId, 'completed');
  };

  const cancelJob = async (jobId: string) => {
    return updateJobStatus(jobId, 'cancelled');
  };

  const rejectJob = async (jobId: string) => {
    return updateJobStatus(jobId, 'rejected');
  };

  return {
    updateJobStatus,
    acceptJob,
    startJob,
    completeJob,
    cancelJob,
    rejectJob,
    isLoading,
    error,
  };
};

// Hook for combined dashboard data
export const useProfessionalDashboardData = () => {
  const profileApi = useProfessionalProfile();
  const dashboardApi = useProfessionalDashboard();
  const jobsApi = useProfessionalJobs();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        profileApi.execute(),
        dashboardApi.execute(),
        jobsApi.execute(),
      ]);
    } catch (error: any) {
      console.error('Dashboard refresh error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [profileApi, dashboardApi, jobsApi]);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return {
    profile: profileApi.data,
    dashboardStats: dashboardApi.data,
    jobs: jobsApi.data,
    isLoading: isLoading || profileApi.isLoading || dashboardApi.isLoading || jobsApi.isLoading,
    error: error || profileApi.error || dashboardApi.error || jobsApi.error,
    refreshDashboard,
  };
};

// Individual data hooks for specific screens
export const useProfessionalJobsScreen = () => {
  const jobsApi = useProfessionalJobs();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredJobs = jobsApi.data?.filter(job => 
    selectedStatus === 'all' || job.status === selectedStatus
  ) || [];

  return {
    jobs: filteredJobs,
    allJobs: jobsApi.data || [],
    selectedStatus,
    setSelectedStatus,
    isLoading: jobsApi.isLoading,
    error: jobsApi.error,
    refresh: jobsApi.execute,
  };
};

export const useProfessionalEarningsScreen = () => {
  const dashboardApi = useProfessionalDashboard();
  
  return {
    earnings: dashboardApi.data?.earnings || { total: 0, currency: 'INR' },
    isLoading: dashboardApi.isLoading,
    error: dashboardApi.error,
    refresh: dashboardApi.execute,
  };
};

export const useProfessionalDashboardScreen = () => {
  const profileApi = useProfessionalProfile();
  const dashboardApi = useProfessionalDashboard();

  const refreshAll = async () => {
    await Promise.all([
      profileApi.execute(),
      dashboardApi.execute(),
    ]);
  };

  return {
    profile: profileApi.data,
    stats: dashboardApi.data,
    isLoading: profileApi.isLoading || dashboardApi.isLoading,
    error: profileApi.error || dashboardApi.error,
    refresh: refreshAll,
  };
};
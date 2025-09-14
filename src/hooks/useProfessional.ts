import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { professionalService, JobFilters } from '../services/professionalService';

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
export const useProfessionalJobs = (filters?: JobFilters) => {
  return usePaginatedApi(
    (params) => professionalService.getJobs({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for single job details
export const useProfessionalJob = (jobId: string | null) => {
  const api = useApi(
    () => professionalService.getJobById(jobId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (jobId) {
      api.execute();
    }
  }, [jobId]);

  return api;
};

// Hook for earnings data
export const useProfessionalEarnings = (filters?: {
  period?: 'today' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useApi(
    () => professionalService.getEarnings(filters),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for performance metrics
export const useProfessionalPerformance = (filters?: {
  period?: 'week' | 'month' | 'quarter' | 'year';
  dateFrom?: string;
  dateTo?: string;
}) => {
  return useApi(
    () => professionalService.getPerformanceMetrics(filters),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for verification status
export const useProfessionalVerification = () => {
  return useApi(
    () => professionalService.getVerificationStatus(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for nearby jobs
export const useNearbyJobs = () => {
  const [nearbyJobs, setNearbyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNearbyJobs = async (data: {
    location: { lat: number; lng: number };
    radius?: number;
    serviceTypes?: string[];
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.getNearbyJobs(data);
      setNearbyJobs(response.data || []);
    } catch (error: any) {
      console.error('Fetch nearby jobs error:', error);
      const errorMessage = error.message || 'Failed to fetch nearby jobs';
      setError(errorMessage);
      setNearbyJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nearbyJobs,
    fetchNearbyJobs,
    isLoading,
    error,
  };
};

// Hook for profile actions
export const useProfessionalProfileActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: {
    name?: string;
    email?: string;
    phone?: string;
    bio?: string;
    specializations?: string[];
    experience?: number;
    serviceAreas?: any[];
    pricing?: any[];
  }) => {
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

  const updateAvailability = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.updateAvailability(data);
      return response.data;
    } catch (error: any) {
      console.error('Update availability error:', error);
      const errorMessage = error.message || 'Failed to update availability';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePricing = async (data: {
    serviceId: string;
    price: number;
    isAvailable: boolean;
  }[]) => {
    try {
      setIsLoading(true);
      setError(null);
      await professionalService.updatePricing(data);
    } catch (error: any) {
      console.error('Update pricing error:', error);
      const errorMessage = error.message || 'Failed to update pricing';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateProfile,
    toggleAvailability,
    updateAvailability,
    updatePricing,
    isLoading,
    error,
  };
};

// Hook for job actions
export const useProfessionalJobActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acceptJob = async (jobId: string, data?: { estimatedArrival?: string; notes?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.acceptJob(jobId, data);
      return response.data;
    } catch (error: any) {
      console.error('Accept job error:', error);
      const errorMessage = error.message || 'Failed to accept job';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const startJob = async (jobId: string, data?: { startLocation?: { lat: number; lng: number }; notes?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.startJob(jobId, data);
      return response.data;
    } catch (error: any) {
      console.error('Start job error:', error);
      const errorMessage = error.message || 'Failed to start job';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeJob = async (jobId: string, data: {
    completionNotes?: string;
    beforeImages?: string[];
    afterImages?: string[];
    actualDuration?: number;
    completionLocation?: { lat: number; lng: number };
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.completeJob(jobId, data);
      return response.data;
    } catch (error: any) {
      console.error('Complete job error:', error);
      const errorMessage = error.message || 'Failed to complete job';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelJob = async (jobId: string, data: { reason: string; notes?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.cancelJob(jobId, data);
      return response.data;
    } catch (error: any) {
      console.error('Cancel job error:', error);
      const errorMessage = error.message || 'Failed to cancel job';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateJobLocation = async (jobId: string, data: {
    location: { lat: number; lng: number };
    status?: string;
    estimatedArrival?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      await professionalService.updateJobLocation(jobId, data);
    } catch (error: any) {
      console.error('Update job location error:', error);
      const errorMessage = error.message || 'Failed to update job location';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    acceptJob,
    startJob,
    completeJob,
    cancelJob,
    updateJobLocation,
    isLoading,
    error,
  };
};

// Hook for verification actions
export const useProfessionalVerificationActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVerification = async (data: {
    identityDocument: string;
    addressProof: string;
    professionalCertificates?: string[];
    bankDetails?: {
      accountNumber: string;
      ifscCode: string;
      accountHolderName: string;
    };
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.submitVerification(data);
      return response.data;
    } catch (error: any) {
      console.error('Submit verification error:', error);
      const errorMessage = error.message || 'Failed to submit verification';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitVerification,
    isLoading,
    error,
  };
};

// Hook for payout actions
export const useProfessionalPayoutActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPayout = async (data: {
    amount: number;
    bankAccountId: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await professionalService.requestPayout(data);
      return response.data;
    } catch (error: any) {
      console.error('Request payout error:', error);
      const errorMessage = error.message || 'Failed to request payout';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestPayout,
    isLoading,
    error,
  };
};

// Hook for dashboard data (combines multiple API calls)
export const useProfessionalDashboard = () => {
  const profileApi = useProfessionalProfile();
  const earningsApi = useProfessionalEarnings({ period: 'today' });
  const performanceApi = useProfessionalPerformance({ period: 'month' });
  const jobsApi = useProfessionalJobs({ status: 'pending', limit: 5 });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await Promise.all([
        profileApi.execute(),
        earningsApi.execute(),
        performanceApi.execute(),
        jobsApi.execute(),
      ]);
    } catch (error: any) {
      console.error('Dashboard refresh error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  return {
    profile: profileApi.data,
    earnings: earningsApi.data,
    performance: performanceApi.data,
    upcomingJobs: jobsApi.data,
    isLoading: isLoading || profileApi.isLoading || earningsApi.isLoading || performanceApi.isLoading || jobsApi.isLoading,
    error: error || profileApi.error || earningsApi.error || performanceApi.error || jobsApi.error,
    refreshDashboard,
  };
};
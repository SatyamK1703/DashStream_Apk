import { useState, useEffect, useCallback, useMemo } from 'react';
import { quickFixService } from '../services/quickFixService';
import { useApi, usePaginatedApi } from './useApi';
import { adminService } from '../services/adminService';
import { serviceService } from '../services/serviceService';
import { Service, AdminFilters } from '../types/api';

interface UseAdminServicesOptions {
  filters?: AdminFilters;
}
export const useAdminServices = ({ filters }: UseAdminServicesOptions = {}) => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const stableFilters = useMemo(() => filters, [JSON.stringify(filters)]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await adminService.getServices(stableFilters);

      // Handle both shapes: response.data.services OR response.services
      const rawServices =
        (response.data?.services && response.data.services.length > 0
          ? response.data.services
          : response.services) || [];

      // Map raw services -> frontend-friendly shape
      const services = rawServices.map((s: any) => ({
        id: s._id?.toString() || s.id,
        title: s.title,
        description: s.description,
        longDescription: s.longDescription || '',
        price: s.price,
        discountPrice: s.discountPrice ?? null,
        category: s.category || 'other',
        image: s.image || '',
        banner: s.banner || '',
        vehicleType: s.vehicleType || 'Both',
        duration: s.duration || '60',
        isActive: s.isActive ?? true,
        isPopular: s.isPopular ?? false,
        rating: s.rating ?? 5,
        numReviews: s.numReviews ?? 0,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        features: s.features || [],
        tags: s.tags || [],
        availableAreas: s.avaliableAreas || [],
      }));

      setData(services);
    } catch (err) {
      console.error('❌ fetchServices error:', err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [stableFilters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    data,
    loading,
    error,
    refresh: fetchServices,
  };
};

export const useCreateService = () => {
  return useApi(
    (serviceData: {
      title: string; // Backend expects 'title' not 'name'
      description: string;
      longDescription?: string;
      price: number;
      discountPrice?: number;
      category: string;
      duration: string; // Backend expects string not number
      features: string[];
      tags: string[];
      isActive: boolean;
      isPopular?: boolean;
      image: string; // Required field
      banner: string; // Required field
      vehicleType?: string;
    }) => adminService.createService(serviceData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for updating an existing service
export const useUpdateService = () => {
  return useApi(
    ({ serviceId, serviceData }: { serviceId: string; serviceData: Partial<Service> }) =>
      adminService.updateService(serviceId, serviceData),
    {
      showErrorAlert: true,
    }
  );
};

// Hook for deleting a service
export const useDeleteService = () => {
  return useApi((serviceId: string) => adminService.deleteService(serviceId), {
    showErrorAlert: true,
  });
};

// Hook for toggling service status (activate/deactivate)
export const useToggleServiceStatus = () => {
  return useApi(
    ({ serviceId, isActive }: { serviceId: string; isActive: boolean }) =>
      adminService.updateService(serviceId, { isActive }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for admin dashboard stats (alias for useAdminDashboard)
export const useAdminStats = () => {
  return useApi(() => adminService.getStats(), {
    showErrorAlert: false,
  });
};

// Hook for admin dashboard - main dashboard data
export const useAdminDashboard = () => {
  const baseApi = useApi(() => adminService.getDashboard(), {
    showErrorAlert: false,
  });

  // Transform the response to match the expected format
  const transformedData = baseApi.data
    ? {
        totalRevenue: baseApi.data.stats?.revenue || 0,
        totalBookings: baseApi.data.stats?.bookings || 0,
        activeCustomers: baseApi.data.stats?.users || 0,
        activeProfessionals: baseApi.data.stats?.professionals || 0,
        revenueChange: 0, // Backend doesn't provide this yet
        bookingsChange: 0, // Backend doesn't provide this yet
        customersChange: 0, // Backend doesn't provide this yet
        professionalsChange: 0, // Backend doesn't provide this yet
        chartData: baseApi.data.chartData || {
          revenue: { daily: null, weekly: null, monthly: null },
          bookings: { daily: null, weekly: null, monthly: null },
        },
        recentBookings: baseApi.data.recentBookings || [],
        topProfessionals: baseApi.data.topProfessionals || [],
      }
    : null;

  return {
    ...baseApi,
    data: transformedData,
  };
};

// Hook for admin bookings with optional filters
export const useAdminBookings = (filters?: {
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  return usePaginatedApi((params) => adminService.getBookings({ ...filters, ...params }), {
    showErrorAlert: false,
  });
};

// Hook for admin professionals with optional filters
export const useAdminProfessionals = (filters?: {
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const { data, ...rest } = usePaginatedApi(
    (params) => adminService.getProfessionals({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );

  // Normalize the profileImage to ensure it's always a string
  const normalizedData = data?.map((professional: any) => {
    let profileImage = professional.profileImage;
    if (typeof profileImage === 'object' && profileImage !== null && 'uri' in profileImage) {
      profileImage = profileImage.uri;
    } else if (typeof profileImage !== 'string') {
      profileImage = ''; // Ensure it's an empty string if not a valid string or object with uri
    }
    return {
      ...professional,
      profileImage: profileImage,
    };
  });

  return {
    data: normalizedData,
    ...rest,
  };
};

// Hook for admin booking actions (update status, assign professional, etc.)
export const useAdminBookingActions = () => {
  const updateBookingStatus = useApi(
    ({ bookingId, status }: { bookingId: string; status: string }) =>
      adminService.updateBookingStatus(bookingId, status),
    {
      showErrorAlert: true,
    }
  );

  const getAvailableProfessionals = useApi(
    (bookingId: string) => adminService.getAvailableProfessionals(bookingId),
    {
      showErrorAlert: false, // Don't show error alert for this one
    }
  );

  const assignProfessional = useApi(
    ({ bookingId, professionalId }: { bookingId: string; professionalId: string }) =>
      adminService.assignProfessional(bookingId, professionalId),
    {
      showErrorAlert: true,
    }
  );

  const cancelBooking = useApi(
    ({ bookingId, reason }: { bookingId: string; reason?: string }) =>
      adminService.cancelBooking(bookingId, reason),
    {
      showErrorAlert: true,
    }
  );

  return {
    updateBookingStatus: updateBookingStatus.execute,
    getAvailableProfessionals: getAvailableProfessionals.execute,
    assignProfessional: assignProfessional.execute,
    cancelBooking: cancelBooking.execute,
    isLoading:
      updateBookingStatus.loading ||
      assignProfessional.loading ||
      cancelBooking.loading ||
      getAvailableProfessionals.loading,
    error: updateBookingStatus.error || assignProfessional.error || cancelBooking.error,
  };
};

// Hook for admin professional actions (verification, etc.)
export const useAdminProfessionalActions = () => {
  const updateVerificationStatus = useApi(
    ({
      professionalId,
      isVerified,
      verificationNotes,
    }: {
      professionalId: string;
      isVerified: boolean;
      verificationNotes?: string;
    }) =>
      adminService.updateProfessionalVerification(professionalId, {
        isVerified,
        verificationNotes,
      }),
    {
      showErrorAlert: true,
    }
  );

  return {
    updateVerificationStatus: updateVerificationStatus.execute,
    isLoading: updateVerificationStatus.loading,
    error: updateVerificationStatus.error,
  };
};

// Hook for admin customers with optional filters
export const useAdminCustomers = (filters?: {
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return usePaginatedApi((params) => adminService.getCustomers({ ...filters, ...params }), {
    showErrorAlert: false,
  });
};

export const useQuickFixes = () => {
  return useApi(() => quickFixService.getQuickFixes(), {
    showErrorAlert: false,
  });
};

export const useAdmin = () => {
  return {
    useAdminServices,
    useCreateService,
    useUpdateService,
    useDeleteService,
    useToggleServiceStatus,
    useAdminStats,
    useAdminDashboard,
    useAdminBookings,
    useAdminProfessionals,
    useAdminBookingActions,
    useAdminProfessionalActions,
    useAdminCustomers,
    useQuickFixes,
  };
};

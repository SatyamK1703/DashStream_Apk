import { useState, useEffect } from 'react';
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

  const fetchServices = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await adminService.getServices(filters);
   

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
      availableAreas: s.avaliableAreas || []
    }));

    setData(services);
  } catch (err) {
    console.error("❌ fetchServices error:", err);
    setError(err);
    setData([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchServices();
},[JSON.stringify(filters)]);

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
  return useApi(
    (serviceId: string) => adminService.deleteService(serviceId),
    {
      showErrorAlert: true,
    }
  );
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

// Hook for getting service categories
export const useServiceCategories = () => {
  return useApi(
    () => serviceService.getServiceCategories(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for admin dashboard stats (alias for useAdminDashboard)
export const useAdminStats = () => {
  return useApi(
    () => adminService.getStats(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for admin dashboard - main dashboard data
export const useAdminDashboard = () => {
  return useApi(
    () => adminService.getDashboard(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for admin bookings with optional filters
export const useAdminBookings = (filters?: { limit?: number; status?: string; search?: string }) => {
  return usePaginatedApi(
    (params) => adminService.getBookings({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for admin professionals with optional filters
export const useAdminProfessionals = (filters?: { limit?: number; status?: string; search?: string }) => {
  return usePaginatedApi(
    (params) => adminService.getProfessionals({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
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
    assignProfessional: assignProfessional.execute,
    cancelBooking: cancelBooking.execute,
    isLoading: updateBookingStatus.loading || assignProfessional.loading || cancelBooking.loading,
    error: updateBookingStatus.error || assignProfessional.error || cancelBooking.error,
  };
};

// Hook for admin professional actions (verification, etc.)
export const useAdminProfessionalActions = () => {
  const updateVerificationStatus = useApi(
    ({ professionalId, isVerified, verificationNotes }: { 
      professionalId: string; 
      isVerified: boolean; 
      verificationNotes?: string; 
    }) =>
      adminService.updateProfessionalVerification(professionalId, { isVerified, verificationNotes }),
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
export const useAdminCustomers = (filters?: { limit?: number; status?: string; search?: string }) => {
  return usePaginatedApi(
    (params) => adminService.getCustomers({ ...filters, ...params }),
    {
      showErrorAlert: false,
    }
  );
};
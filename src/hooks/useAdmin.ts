import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { adminService } from '../services/adminService';
import { serviceService } from '../services/serviceService';
import { Service, AdminFilters } from '../types/api';

// Hook for fetching admin services with pagination
// export const useAdminServices = (filters?: AdminFilters) => {
//   const [initialized, setInitialized] = useState(false);
  
//   const baseHook = usePaginatedApi(
//     async (params) => {
//       const response = await adminService.getServices({ ...filters, ...params });
//       if (__DEV__) {
//         console.log('useAdminServices - API Response:', {
//           response,
//           dataType: typeof response.data,
//           isArray: Array.isArray(response.data),
//           services: response.data?.services,
//           servicesLength: response.data?.services?.length
//         });
//       }
      
//       // Extract services array from response data
//       return response.data?.services || [];
//     },
//     {
//       showErrorAlert: false,
//     }
//   );

//   // Auto-load data on mount
//   useEffect(() => {
//     if (!initialized && baseHook.refresh) {
//       if (__DEV__) {
//         console.log('useAdminServices - Auto-loading data on mount');
//       }
//       baseHook.refresh();
//       setInitialized(true);
//     } else if (__DEV__) {
//       console.log('useAdminServices - Skipping auto-load:', {
//         initialized,
//         hasRefresh: !!baseHook.refresh
//       });
//     }
//   }, [baseHook.refresh, initialized]);

//   // Return enhanced hook with proper data handling
//   const result = {
//     ...baseHook,
//     data: baseHook.data || [], // Ensure data is always an array
//     refresh: baseHook.refresh || baseHook.loadMore, // Ensure refresh function is available
//   };
  
//   if (__DEV__) {
//     console.log('useAdminServices - Returning to component:', {
//       data: result.data,
//       dataLength: result.data?.length,
//       loading: result.loading,
//       error: result.error,
//       hasRefresh: !!result.refresh
//     });
//   }
  
//   return result;
// };
export const useAdminServices = (filters?: AdminFilters) => {
  const [initialized, setInitialized] = useState(false);
  
  const baseHook = usePaginatedApi(
    async (params) => {
      const response = await adminService.getServices({ ...filters, ...params });

      if (__DEV__) {
        console.log('useAdminServices - API Response:', {
          response,
          dataType: typeof response.data,
          isArray: Array.isArray(response.data),
          services: response.data?.services,
          servicesLength: response.data?.services?.length
        });
      }

      // ✅ Normalize services
      const services = (response.data?.services || []).map((s: any) => ({
        id: s._id, // map MongoDB _id → id
        title: s.title,
        description: s.description,
        longDescription: s.longDescription,
        price: s.price,
        discountPrice: s.discountPrice,
        category: typeof s.category === 'object' ? s.category.name : s.category, // ensure string
        image: s.image,
        banner: s.banner,
        duration: s.duration,
        isActive: s.isActive,
        isPopular: s.isPopular,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        features: s.features || [],
        tags: s.tags || []
      }));

      return services;
    },
    {
      showErrorAlert: false,
    }
  );

  // Auto-load data on mount
  useEffect(() => {
    if (!initialized && baseHook.refresh) {
      if (__DEV__) console.log('useAdminServices - Auto-loading data on mount');
      baseHook.refresh();
      setInitialized(true);
    }
  }, [baseHook.refresh, initialized]);

  return {
    ...baseHook,
    data: baseHook.data || [], // always return array
    refresh: baseHook.refresh || baseHook.loadMore,
  };
};
// Hook for creating a new service
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
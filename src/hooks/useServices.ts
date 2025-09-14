import { useState, useEffect } from 'react';
import { useApi, usePaginatedApi } from './useApi';
import { serviceService } from '../services';
import { Service, ServiceCategory, SearchParams } from '../types/api';

// Hook for fetching popular services
export const usePopularServices = (limit?: number) => {
  return useApi(
    () => serviceService.getPopularServices(limit),
    {
      showErrorAlert: false, // Handle errors in component
    }
  );
};

// Hook for fetching top services
export const useTopServices = (limit?: number) => {
  return useApi(
    () => serviceService.getTopServices(limit),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for fetching service categories
export const useServiceCategories = () => {
  return useApi(
    () => serviceService.getServiceCategories(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for fetching services with pagination
export const useServices = (searchParams?: SearchParams) => {
  return usePaginatedApi(
    (params) => serviceService.getAllServices({ ...searchParams, ...params }),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for searching services
export const useServiceSearch = () => {
  const [searchResults, setSearchResults] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    data,
    loading,
    error,
    execute: performSearch,
  } = useApi(
    (params: SearchParams) => serviceService.searchServices(params),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setSearchResults(data || []);
      },
    }
  );

  const search = async (query: string, filters?: Partial<SearchParams>) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    return performSearch({
      query: query.trim(),
      ...filters,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    results: searchResults,
    loading,
    error,
    searchQuery,
    search,
    clearSearch,
  };
};

// Hook for fetching single service details
export const useServiceDetails = (serviceId: string | null) => {
  const api = useApi(
    () => serviceService.getServiceById(serviceId!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (serviceId) {
      api.execute();
    }
  }, [serviceId]);

  return api;
};

// Hook for services by category
export const useServicesByCategory = (category: string, searchParams?: SearchParams) => {
  return usePaginatedApi(
    (params) => serviceService.getServicesByCategory(category, { ...searchParams, ...params }),
    {
      showErrorAlert: false,
    }
  );
};
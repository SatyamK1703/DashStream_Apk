// src/contexts/ServiceContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import dataService from '../services/dataService';

// Define service type
type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: string;
  isAvailable: boolean;
};

// Define service context state
type ServiceContextType = {
  services: Service[];
  categories: string[];
  isLoading: boolean;
  fetchServices: (filters?: any) => Promise<void>;
  getServiceDetails: (serviceId: string) => Promise<Service | null>;
};

// Create context with default values
const ServiceContext = createContext<ServiceContextType>({
  services: [],
  categories: [],
  isLoading: false,
  fetchServices: async () => {},
  getServiceDetails: async () => null,
});

// Service provider component
export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with empty array instead of undefined
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Guard against undefined services when extracting categories
  const categories = Array.isArray(services) 
    ? [...new Set(services.map(service => service.category))]
    : [];
  
  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Fetch services from data service
  const fetchServices = async (filters?: any) => {
    setIsLoading(true);
    try {
      const response = await dataService.getAllServices(filters);
      setServices(response.data?.services || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]); // Ensure array even on error
    } finally {
      setIsLoading(false);
    }
  };


  const getServiceDetails = async (serviceId: string): Promise<Service | null> => {
    try {
      // First check if we already have the service in state
      const cachedService = services.find(service => service._id === serviceId);
      if (cachedService) return cachedService;
      
      // If not, fetch from data service
      const response = await dataService.getServiceById(serviceId);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching service details:', error);
      return null;
    }
  };
  
  // Update the value object with proper type checking
  const value: ServiceContextType = {
    services: Array.isArray(services) ? services : [],
    categories,
    isLoading,
    fetchServices,
    getServiceDetails,
  };
  
  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

// Custom hook to use service context
export const useServices = () => useContext(ServiceContext);

export default ServiceContext;
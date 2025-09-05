// src/contexts/ServiceContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

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
  // Add other service properties as needed
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
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Extract unique categories from services
  const categories = [...new Set(services.map(service => service.category))];
  
  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);
  
  // Fetch services from API
  const fetchServices = async (filters?: any) => {
    setIsLoading(true);
    try {
      const result = await api.getServices(filters);
      if (result.success && result.services) {
        setServices(result.services);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get service details
  const getServiceDetails = async (serviceId: string): Promise<Service | null> => {
    try {
      // First check if we already have the service in state
      const cachedService = services.find(service => service.id === serviceId);
      if (cachedService) return cachedService;
      
      // If not, fetch from API
      const result = await api.getServiceDetails(serviceId);
      if (result.success && result.service) {
        return result.service;
      }
      return null;
    } catch (error) {
      console.error('Error fetching service details:', error);
      return null;
    }
  };
  
  // Provide service context value
  const value = {
    services,
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
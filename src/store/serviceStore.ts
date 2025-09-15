// src/store/serviceStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Service } from '../types/ServiceType';
import dataService from '../services/dataService';

interface ServiceState {
  // State
  services: Service[];
  categories: string[];
  popularServices: Service[];
  featuredServices: Service[];
  isLoading: boolean;
  error: string | null;
  
  // Filters and search
  searchQuery: string;
  selectedCategory: string | null;
  priceRange: { min: number; max: number };
  sortBy: 'name' | 'price' | 'rating' | 'popularity';
  sortOrder: 'asc' | 'desc';
  
  // Selected service details
  selectedService: Service | null;
  relatedServices: Service[];
  
  // Cart/booking state
  cart: Array<{
    service: Service;
    quantity: number;
    selectedOptions?: any[];
    totalPrice: number;
  }>;
  cartTotal: number;
  
  // Actions
  fetchServices: (filters?: any) => Promise<void>;
  fetchServiceById: (id: string) => Promise<Service | null>;
  fetchPopularServices: (limit?: number) => Promise<void>;
  fetchFeaturedServices: (limit?: number) => Promise<void>;
  
  // Search and filter
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setPriceRange: (range: { min: number; max: number }) => void;
  setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'popularity') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  applyFilters: () => Service[];
  searchServices: (query: string) => Service[];
  
  // Service details
  setSelectedService: (service: Service | null) => void;
  fetchRelatedServices: (serviceId: string) => Promise<void>;
  
  // Cart management
  addToCart: (service: Service, quantity?: number, options?: any[]) => void;
  removeFromCart: (serviceId: string) => void;
  updateCartItem: (serviceId: string, quantity: number) => void;
  clearCart: () => void;
  calculateCartTotal: () => void;
  
  // Admin functions (if user is admin)
  createService: (serviceData: Partial<Service>) => Promise<{ success: boolean; service?: Service; error?: string }>;
  updateService: (id: string, updates: Partial<Service>) => Promise<{ success: boolean; error?: string }>;
  deleteService: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utilities
  clearError: () => void;
  getServicesByCategory: (category: string) => Service[];
  getServicesByPriceRange: (min: number, max: number) => Service[];
}

export const useServiceStore = create<ServiceState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    services: [],
    categories: [],
    popularServices: [],
    featuredServices: [],
    isLoading: false,
    error: null,
    
    // Filters
    searchQuery: '',
    selectedCategory: null,
    priceRange: { min: 0, max: 10000 },
    sortBy: 'name',
    sortOrder: 'asc',
    
    // Selected service
    selectedService: null,
    relatedServices: [],
    
    // Cart
    cart: [],
    cartTotal: 0,

    // Actions
    fetchServices: async (filters = {}) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await dataService.getServices(filters);
        
        if (response.success && response.data) {
          const services = response.data;
          
          // Extract unique categories
          const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
          
          set({ 
            services,
            categories,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.error || 'Failed to fetch services',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching services:', error);
        set({ 
          error: error.message || 'Failed to fetch services',
          isLoading: false 
        });
      }
    },

    fetchServiceById: async (id: string) => {
      const { services } = get();
      
      // Check cache first
      const cachedService = services.find(s => s.id === id);
      if (cachedService) return cachedService;

      try {
        const response = await dataService.getServiceById(id);
        
        if (response.success && response.data) {
          // Add to services if not already present
          const updatedServices = [...services];
          if (!updatedServices.find(s => s.id === id)) {
            updatedServices.push(response.data);
            set({ services: updatedServices });
          }
          
          return response.data;
        }
        return null;
      } catch (error: any) {
        console.error('Error fetching service by ID:', error);
        set({ error: error.message || 'Failed to fetch service' });
        return null;
      }
    },

    fetchPopularServices: async (limit = 10) => {
      try {
        const response = await dataService.getPopularServices(limit);
        
        if (response.success && response.data) {
          set({ popularServices: response.data });
        }
      } catch (error: any) {
        console.error('Error fetching popular services:', error);
        set({ error: error.message || 'Failed to fetch popular services' });
      }
    },

    fetchFeaturedServices: async (limit = 10) => {
      try {
        const { services } = get();
        // For now, filter featured from existing services
        const featured = services.filter(s => s.isFeatured).slice(0, limit);
        set({ featuredServices: featured });
      } catch (error: any) {
        console.error('Error fetching featured services:', error);
        set({ error: error.message || 'Failed to fetch featured services' });
      }
    },

    // Search and filter actions
    setSearchQuery: (searchQuery: string) => set({ searchQuery }),
    
    setSelectedCategory: (selectedCategory: string | null) => set({ selectedCategory }),
    
    setPriceRange: (priceRange: { min: number; max: number }) => set({ priceRange }),
    
    setSortBy: (sortBy: 'name' | 'price' | 'rating' | 'popularity') => set({ sortBy }),
    
    setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),

    applyFilters: () => {
      const { 
        services, 
        searchQuery, 
        selectedCategory, 
        priceRange, 
        sortBy, 
        sortOrder 
      } = get();
      
      let filtered = [...services];
      
      // Apply search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.category?.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (selectedCategory) {
        filtered = filtered.filter(service => service.category === selectedCategory);
      }
      
      // Apply price range filter
      filtered = filtered.filter(service => 
        service.price >= priceRange.min && service.price <= priceRange.max
      );
      
      // Apply sorting
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'rating':
            aValue = a.rating || 0;
            bValue = b.rating || 0;
            break;
          case 'popularity':
            aValue = a.bookingCount || 0;
            bValue = b.bookingCount || 0;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      return filtered;
    },

    searchServices: (query: string) => {
      const { services } = get();
      const lowercaseQuery = query.toLowerCase();
      
      return services.filter(service =>
        service.name.toLowerCase().includes(lowercaseQuery) ||
        service.description?.toLowerCase().includes(lowercaseQuery) ||
        service.category?.toLowerCase().includes(lowercaseQuery)
      );
    },

    // Service details
    setSelectedService: (selectedService: Service | null) => {
      set({ selectedService });
      
      if (selectedService) {
        get().fetchRelatedServices(selectedService.id);
      }
    },

    fetchRelatedServices: async (serviceId: string) => {
      try {
        const { services } = get();
        const currentService = services.find(s => s.id === serviceId);
        
        if (currentService) {
          // Find related services by category
          const related = services
            .filter(s => 
              s.id !== serviceId && 
              s.category === currentService.category
            )
            .slice(0, 5);
          
          set({ relatedServices: related });
        }
      } catch (error: any) {
        console.error('Error fetching related services:', error);
        set({ error: error.message || 'Failed to fetch related services' });
      }
    },

    // Cart management
    addToCart: (service: Service, quantity = 1, options = []) => {
      const { cart } = get();
      
      const existingItem = cart.find(item => item.service.id === service.id);
      
      if (existingItem) {
        // Update existing item
        const updatedCart = cart.map(item =>
          item.service.id === service.id
            ? { 
                ...item, 
                quantity: item.quantity + quantity,
                totalPrice: (item.quantity + quantity) * service.price 
              }
            : item
        );
        set({ cart: updatedCart });
      } else {
        // Add new item
        const newItem = {
          service,
          quantity,
          selectedOptions: options,
          totalPrice: quantity * service.price,
        };
        set({ cart: [...cart, newItem] });
      }
      
      get().calculateCartTotal();
    },

    removeFromCart: (serviceId: string) => {
      const { cart } = get();
      const updatedCart = cart.filter(item => item.service.id !== serviceId);
      set({ cart: updatedCart });
      get().calculateCartTotal();
    },

    updateCartItem: (serviceId: string, quantity: number) => {
      const { cart } = get();
      
      if (quantity <= 0) {
        get().removeFromCart(serviceId);
        return;
      }
      
      const updatedCart = cart.map(item =>
        item.service.id === serviceId
          ? { 
              ...item, 
              quantity,
              totalPrice: quantity * item.service.price 
            }
          : item
      );
      
      set({ cart: updatedCart });
      get().calculateCartTotal();
    },

    clearCart: () => {
      set({ cart: [], cartTotal: 0 });
    },

    calculateCartTotal: () => {
      const { cart } = get();
      const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
      set({ cartTotal: total });
    },

    // Admin functions
    createService: async (serviceData: Partial<Service>) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await dataService.createService(serviceData);
        
        if (response.success && response.data) {
          const { services } = get();
          set({ 
            services: [response.data, ...services],
            isLoading: false 
          });
          return { success: true, service: response.data };
        } else {
          const error = response.error || 'Failed to create service';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create service';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    updateService: async (id: string, updates: Partial<Service>) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await dataService.updateService(id, updates);
        
        if (response.success) {
          const { services } = get();
          const updatedServices = services.map(service =>
            service.id === id ? { ...service, ...updates } : service
          );
          set({ 
            services: updatedServices,
            isLoading: false 
          });
          return { success: true };
        } else {
          const error = response.error || 'Failed to update service';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update service';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    deleteService: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        const response = await dataService.deleteService(id);
        
        if (response.success) {
          const { services } = get();
          const updatedServices = services.filter(service => service.id !== id);
          set({ 
            services: updatedServices,
            isLoading: false 
          });
          return { success: true };
        } else {
          const error = response.error || 'Failed to delete service';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to delete service';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    // Utilities
    clearError: () => set({ error: null }),

    getServicesByCategory: (category: string) => {
      const { services } = get();
      return services.filter(service => service.category === category);
    },

    getServicesByPriceRange: (min: number, max: number) => {
      const { services } = get();
      return services.filter(service => service.price >= min && service.price <= max);
    },
  }))
);
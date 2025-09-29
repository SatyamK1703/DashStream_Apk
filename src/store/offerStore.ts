// src/store/offerStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { offerService } from '../services';
import { Offer } from '../types/api';

interface OfferState {
  // State
  offers: Offer[];
  activeOffers: Offer[];
  featuredOffers: Offer[];
  isLoading: boolean;
  error: string | null;
  
  // Selected offer
  selectedOffer: Offer | null;
  appliedOffer: Offer | null;
  
  // Actions
  fetchOffers: () => Promise<void>;
  fetchActiveOffers: () => Promise<void>;
  fetchFeaturedOffers: () => Promise<void>;
  getOfferById: (id: string) => Promise<Offer | null>;
  validateOfferCode: (code: string, serviceId?: string, orderAmount?: number) => Promise<{ isValid: boolean; offer?: Offer; error?: string; discount?: number }>;
  applyOffer: (offer: Offer) => void;
  removeAppliedOffer: () => void;
  
  // Admin functions
  createOffer: (offerData: Partial<Offer>) => Promise<{ success: boolean; offer?: Offer; error?: string }>;
  updateOffer: (id: string, updates: Partial<Offer>) => Promise<{ success: boolean; error?: string }>;
  deleteOffer: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utilities
  clearError: () => void;
  getOffersByCategory: (category: string) => Offer[];
  getValidOffers: (serviceId?: string, orderAmount?: number) => Offer[];
  calculateDiscount: (offer: Offer, orderAmount: number) => number;
}

export const useOfferStore = create<OfferState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    offers: [],
    activeOffers: [],
    featuredOffers: [],
    isLoading: false,
    error: null,
    selectedOffer: null,
    appliedOffer: null,

    // Actions
    fetchOffers: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await offerService.getOffers();
        
        if (response.success && response.data) {
          const offers = response.data;
          const now = new Date();
          
          const activeOffers = offers.filter(offer => 
            offer.isActive && 
            new Date(offer.validFrom) <= now && 
            new Date(offer.validUntil) >= now
          );
          
          const featuredOffers = activeOffers.filter(offer => offer.isFeatured);
          
          set({ 
            offers,
            activeOffers,
            featuredOffers,
            isLoading: false 
          });
        } else {
          set({ 
            error: response.message || 'Failed to fetch offers',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching offers:', error);
        set({ 
          error: error.message || 'Failed to fetch offers',
          isLoading: false 
        });
      }
    },

    fetchActiveOffers: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await offerService.getActiveOffers();
        
        if (response.success && response.data) {
          set({ activeOffers: response.data, isLoading: false });
        } else {
          set({ 
            error: response.message || 'Failed to fetch active offers',
            isLoading: false 
          });
        }
      } catch (error: any) {
        console.error('Error fetching active offers:', error);
        set({ 
          error: error.message || 'Failed to fetch active offers',
          isLoading: false 
        });
      }
    },

    fetchFeaturedOffers: async () => {
      try {
        const response = await offerService.getFeaturedOffers();
        
        if (response.success && response.data) {
          set({ featuredOffers: response.data });
        }
      } catch (error: any) {
        console.error('Error fetching featured offers:', error);
        set({ error: error.message || 'Failed to fetch featured offers' });
      }
    },

    getOfferById: async (id: string) => {
      const { offers } = get();
      const cachedOffer = offers.find(offer => offer._id === id);
      if (cachedOffer) return cachedOffer;

      try {
        const response = await offerService.getOfferById(id);
        
        if (response.success && response.data) {
          // Add to offers cache if not present
          const { offers } = get();
          if (!offers.find(o => o._id === id)) {
            set({ offers: [...offers, response.data] });
          }
          
          return response.data;
        }
        return null;
      } catch (error: any) {
        console.error('Error fetching offer by ID:', error);
        set({ error: error.message || 'Failed to fetch offer' });
        return null;
      }
    },

    validateOfferCode: async (code: string, serviceId?: string, orderAmount?: number) => {
      try {
        const response = await offerService.validateOfferCode(code, serviceId, orderAmount);
        
        if (response.success && response.data) {
          const { offer, discount } = response.data;
          return {
            isValid: true,
            offer,
            discount
          };
        } else {
          return {
            isValid: false,
            error: response.message || 'Invalid offer code'
          };
        }
      } catch (error: any) {
        console.error('Error validating offer code:', error);
        return {
          isValid: false,
          error: error.message || 'Failed to validate offer code'
        };
      }
    },

    applyOffer: (offer: Offer) => {
      set({ appliedOffer: offer });
    },

    removeAppliedOffer: () => {
      set({ appliedOffer: null });
    },

    // Admin functions
    createOffer: async (offerData: Partial<Offer>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await offerService.createOffer(offerData);
        
        if (response.success && response.data) {
          const { offers } = get();
          set({ 
            offers: [response.data, ...offers],
            isLoading: false 
          });
          
          // Refresh active and featured offers
          get().fetchActiveOffers();
          get().fetchFeaturedOffers();
          
          return { success: true, offer: response.data };
        } else {
          const error = response.message || 'Failed to create offer';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to create offer';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    updateOffer: async (id: string, updates: Partial<Offer>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await offerService.updateOffer(id, updates);
        
        if (response.success) {
          const { offers, activeOffers, featuredOffers } = get();
          
          const updatedOffers = offers.map(offer =>
            offer._id === id ? { ...offer, ...updates } : offer
          );
          
          const updatedActiveOffers = activeOffers.map(offer =>
            offer._id === id ? { ...offer, ...updates } : offer
          );
          
          const updatedFeaturedOffers = featuredOffers.map(offer =>
            offer._id === id ? { ...offer, ...updates } : offer
          );
          
          set({ 
            offers: updatedOffers,
            activeOffers: updatedActiveOffers,
            featuredOffers: updatedFeaturedOffers,
            isLoading: false 
          });
          
          return { success: true };
        } else {
          const error = response.message || 'Failed to update offer';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to update offer';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    deleteOffer: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        const response = await offerService.deleteOffer(id);
        
        if (response.success) {
          const { offers, activeOffers, featuredOffers } = get();
          
          set({ 
            offers: offers.filter(offer => offer._id !== id),
            activeOffers: activeOffers.filter(offer => offer._id !== id),
            featuredOffers: featuredOffers.filter(offer => offer._id !== id),
            isLoading: false 
          });
          
          return { success: true };
        } else {
          const error = response.message || 'Failed to delete offer';
          set({ error, isLoading: false });
          return { success: false, error };
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to delete offer';
        set({ error: errorMsg, isLoading: false });
        return { success: false, error: errorMsg };
      }
    },

    // Utilities
    clearError: () => set({ error: null }),

    getOffersByCategory: (category: string) => {
      const { activeOffers } = get();
      return activeOffers.filter(offer => 
        offer.applicableServices.includes(category) ||
        offer.applicableServices.length === 0 // All categories
      );
    },

    getValidOffers: (serviceId?: string, orderAmount?: number) => {
      const { activeOffers } = get();
      const now = new Date();
      
      return activeOffers.filter(offer => {
        // Check if offer is still valid
        const isValidTime = new Date(offer.validFrom) <= now && new Date(offer.validUntil) >= now;
        if (!isValidTime) return false;
        
        // Check service applicability
        if (serviceId && offer.applicableServices.length > 0) {
          if (!offer.applicableServices.includes(serviceId)) return false;
        }
        
        // Check minimum order amount
        if (orderAmount && offer.minimumOrderValue) {
          if (orderAmount < offer.minimumOrderValue) return false;
        }
        
        return true;
      });
    },

    calculateDiscount: (offer: Offer, orderAmount: number) => {
      if (offer.discountType === 'percentage') {
        const discount = (orderAmount * offer.discountValue) / 100;
        return offer.maxDiscountAmount ? Math.min(discount, offer.maxDiscountAmount) : discount;
      } else {
        return Math.min(offer.discountValue, orderAmount);
      }
    },
  }))
);
// src/store/testimonialStore.ts
import { create } from 'zustand';
import { subscribeWithSelector, devtools, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/httpClient';

export interface Testimonial {
  _id: string;
  name: string;
  instagramUrl: string;
  thumbnail: {
    public_id?: string;
    url: string;
  };
}

interface TestimonialState {
  // State
  testimonials: Testimonial[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  // Actions
  fetchTestimonials: () => Promise<void>;
  clearError: () => void;
}

export const useTestimonialStore = create<TestimonialState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        testimonials: [],
        isLoading: false,
        error: null,
        lastFetched: null,

        // Actions
        fetchTestimonials: async () => {
          const now = Date.now();
          const { lastFetched } = get();

          // Cache for 5 minutes
          if (lastFetched && now - lastFetched < 5 * 60 * 1000) {
            console.log('Using cached testimonials');
            return;
          }

          set({ isLoading: true, error: null });
          try {
            console.log('Fetching testimonials from store...');
            const response = await apiClient.get('/testimonials');
            console.log('Fetched testimonials response:', response);
            const fetchedTestimonials = Array.isArray(response.data) ? response.data : [];
            set({
              testimonials: fetchedTestimonials,
              isLoading: false,
              lastFetched: now
            });
          } catch (err: any) {
            console.error('Error fetching testimonials:', err);
            set({
              error: err.message || 'Failed to load testimonials',
              isLoading: false
            });
          }
        },

        // Utilities
        clearError: () => set({ error: null }),
      })),
      {
        name: 'testimonial-storage',
        getStorage: () => AsyncStorage,
        partialize: (state) => ({
          testimonials: state.testimonials,
          lastFetched: state.lastFetched,
        }),
      }
    ),
    { name: 'Testimonial' }
  )
);
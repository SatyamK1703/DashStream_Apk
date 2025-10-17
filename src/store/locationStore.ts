// src/store/locationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector, devtools } from 'zustand/middleware';
import * as Location from 'expo-location';
import { locationService } from '../services';
import { LocationData, Geofence, LocationPermission, TrackingSettings } from '../types/location';

interface LocationState {
  // State
  currentLocation: LocationData | null;
  locationHistory: LocationData[];
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Permissions
  hasLocationPermission: boolean;
  permissionStatus: string | null;
  
  // Geofences
  geofences: Geofence[];
  
  // Tracking settings
  trackingSettings: TrackingSettings;
  
  // Professional status
  professionalStatus: 'available' | 'busy' | 'offline';
  
  // Actions
  requestLocationPermission: () => Promise<boolean>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  updateCurrentLocation: () => Promise<void>;
  updateStatus: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  getLocationHistory: (limit?: number) => Promise<LocationData[]>;
  
  // Geofence management
  addGeofence: (geofence: Omit<Geofence, 'id'>) => Promise<string>;
  removeGeofence: (geofenceId: string) => Promise<boolean>;
  checkGeofenceStatus: () => Promise<void>;
  
  // Settings
  updateTrackingSettings: (options: Partial<TrackingSettings>) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  calculateDistance: (location1: LocationData, location2: LocationData) => number;
  isWithinRadius: (center: LocationData, point: LocationData, radius: number) => boolean;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      currentLocation: null,
      locationHistory: [],
      isTracking: false,
      isLoading: false,
      error: null,
      hasLocationPermission: false,
      permissionStatus: null,
      geofences: [],
      trackingSettings: {
        updateInterval: 10000,
        significantChangeThreshold: 50,
        batteryOptimizationEnabled: true,
      },
      professionalStatus: 'offline',

      // Actions
      requestLocationPermission: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { status } = await Location.requestForegroundPermissionsAsync();
          const hasPermission = status === 'granted';
          
          set({ 
            hasLocationPermission: hasPermission,
            permissionStatus: status,
            isLoading: false 
          });
          
          return hasPermission;
        } catch (error: any) {
          console.error('Error requesting location permission:', error);
          set({ 
            error: error.message || 'Failed to request location permission',
            isLoading: false 
          });
          return false;
        }
      },

      startTracking: async () => {
        try {
          const { hasLocationPermission } = get();
          
          if (!hasLocationPermission) {
            const granted = await get().requestLocationPermission();
            if (!granted) {
              throw new Error('Location permission not granted');
            }
          }

          set({ isTracking: true, error: null });
          await get().updateCurrentLocation();
          
          return true;
        } catch (error: any) {
          console.error('Error starting location tracking:', error);
          set({ 
            error: error.message || 'Failed to start location tracking',
            isTracking: false 
          });
          return false;
        }
      },

      stopTracking: async () => {
        try {
          set({ isTracking: false });
        } catch (error: any) {
          console.error('Error stopping location tracking:', error);
          set({ error: error.message || 'Failed to stop location tracking' });
        }
      },

      updateCurrentLocation: async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            altitude: location.coords.altitude || undefined,
            altitudeAccuracy: location.coords.altitudeAccuracy || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
            timestamp: location.timestamp,
          };

          const { locationHistory } = get();
          const updatedHistory = [locationData, ...locationHistory].slice(0, 100);

          set({ 
            currentLocation: locationData,
            locationHistory: updatedHistory,
            error: null 
          });

          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = require('./authStore');
          const { isAuthenticated, user } = useAuthStore.getState();
          if (isAuthenticated && user?.role === 'professional') {
            try {
              await locationService.updateLocation(locationData);
            } catch (serverError) {
              console.warn('Failed to update location on server:', serverError);
            }
          }
        } catch (error: any) {
          console.error('Error updating current location:', error);
          set({ error: error.message || 'Failed to update location' });
        }
      },

      updateStatus: async (status: 'available' | 'busy' | 'offline') => {
        try {
          set({ isLoading: true, error: null });

          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = require('./authStore');
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
            await locationService.updateStatus(status);
          }
          
          set({ professionalStatus: status, isLoading: false });
        } catch (error: any) {
          console.error('Error updating status:', error);
          set({ 
            error: error.message || 'Failed to update status',
            isLoading: false 
          });
        }
      },

      getLocationHistory: async (limit = 50) => {
        try {
          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = require('./authStore');
          const { isAuthenticated } = useAuthStore.getState();
          if (!isAuthenticated) {
            return [];
          }

          const response = await locationService.getLocationHistory(limit);
          
          if (response.success && response.data) {
            set({ locationHistory: response.data });
            return response.data;
          }
          return [];
        } catch (error: any) {
          console.error('Error fetching location history:', error);
          set({ error: error.message || 'Failed to fetch location history' });
          return [];
        }
      },

      addGeofence: async (geofence: Omit<Geofence, 'id'>) => {
        try {
          const response = await locationService.createGeofence(geofence);
          
          if (response.success && response.data) {
            const { geofences } = get();
            set({ geofences: [...geofences, response.data] });
            return response.data.id;
          }
          throw new Error(response.message || 'Failed to create geofence');
        } catch (error: any) {
          console.error('Error adding geofence:', error);
          set({ error: error.message || 'Failed to add geofence' });
          throw error;
        }
      },

      removeGeofence: async (geofenceId: string) => {
        try {
          const response = await locationService.deleteGeofence(geofenceId);
          
          if (response.success) {
            const { geofences } = get();
            set({ geofences: geofences.filter(g => g.id !== geofenceId) });
            return true;
          }
          return false;
        } catch (error: any) {
          console.error('Error removing geofence:', error);
          set({ error: error.message || 'Failed to remove geofence' });
          return false;
        }
      },

      checkGeofenceStatus: async () => {
        try {
          const { currentLocation, geofences } = get();
          if (!currentLocation || geofences.length === 0) return;

          for (const geofence of geofences) {
            const distance = get().calculateDistance(currentLocation, {
              latitude: geofence.center.latitude,
              longitude: geofence.center.longitude,
              timestamp: Date.now(),
            });
            
            if (distance <= geofence.radius && geofence.isActive) {
              console.log(`Entered geofence: ${geofence.name}`);
            }
          }
        } catch (error: any) {
          console.error('Error checking geofence status:', error);
        }
      },

      updateTrackingSettings: async (options: Partial<TrackingSettings>) => {
        try {
          const { trackingSettings } = get();
          const newSettings = { ...trackingSettings, ...options };
          
          set({ trackingSettings: newSettings });

          // Import auth store dynamically to avoid circular dependency
          const { useAuthStore } = require('./authStore');
          const { isAuthenticated } = useAuthStore.getState();
          if (isAuthenticated) {
            await locationService.updateSettings(newSettings);
          }
        } catch (error: any) {
          console.error('Error updating tracking settings:', error);
          set({ error: error.message || 'Failed to update settings' });
        }
      },

      clearError: () => set({ error: null }),

      calculateDistance: (location1: LocationData, location2: LocationData): number => {
        const R = 6371e3;
        const φ1 = location1.latitude * Math.PI/180;
        const φ2 = location2.latitude * Math.PI/180;
        const Δφ = (location2.latitude - location1.latitude) * Math.PI/180;
        const Δλ = (location2.longitude - location1.longitude) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c;
      },

      isWithinRadius: (center: LocationData, point: LocationData, radius: number): boolean => {
        const distance = get().calculateDistance(center, point);
        return distance <= radius;
      },
    })),
    { name: 'Location' }
  )
);
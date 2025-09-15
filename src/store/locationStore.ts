// src/store/locationStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as Location from 'expo-location';
import { LocationApiService, LocationData, Geofence } from '../services/dataService';
import { useAuthStore } from './authStore';

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
  trackingSettings: {
    updateInterval: number;
    significantChangeThreshold: number;
    batteryOptimizationEnabled: boolean;
  };
  
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
  updateTrackingSettings: (options: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
  }) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearLocationHistory: () => void;
}

export const useLocationStore = create<LocationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentLocation: null,
    locationHistory: [],
    isTracking: false,
    isLoading: true,
    error: null,
    hasLocationPermission: false,
    permissionStatus: null,
    geofences: [],
    trackingSettings: {
      updateInterval: 30000, // 30 seconds
      significantChangeThreshold: 10, // 10 meters
      batteryOptimizationEnabled: true,
    },

    // Actions
    requestLocationPermission: async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const hasPermission = status === 'granted';
        
        set({ 
          hasLocationPermission: hasPermission,
          permissionStatus: status,
          error: hasPermission ? null : 'Location permission denied'
        });
        
        return hasPermission;
      } catch (error: any) {
        console.error('Error requesting location permission:', error);
        set({ 
          error: error.message || 'Failed to request location permission',
          hasLocationPermission: false 
        });
        return false;
      }
    },

    startTracking: async () => {
      const { hasLocationPermission, requestLocationPermission } = get();
      
      // Check permission first
      if (!hasLocationPermission) {
        const granted = await requestLocationPermission();
        if (!granted) return false;
      }

      set({ isLoading: true, error: null });
      
      try {
        // Check if location services are enabled
        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          set({ 
            error: 'Location services are disabled',
            isLoading: false 
          });
          return false;
        }

        // Start location tracking
        const { user } = useAuthStore.getState();
        if (user) {
          const response = await LocationApiService.startTracking(user.id);
          if (response.success) {
            set({ 
              isTracking: true,
              isLoading: false 
            });
            
            // Get initial location
            await get().updateCurrentLocation();
            return true;
          } else {
            set({ 
              error: response.error || 'Failed to start tracking',
              isLoading: false 
            });
            return false;
          }
        }
        
        set({ 
          error: 'User not authenticated',
          isLoading: false 
        });
        return false;
      } catch (error: any) {
        console.error('Error starting location tracking:', error);
        set({ 
          error: error.message || 'Failed to start tracking',
          isLoading: false 
        });
        return false;
      }
    },

    stopTracking: async () => {
      set({ isLoading: true });
      
      try {
        const { user } = useAuthStore.getState();
        if (user) {
          await LocationApiService.stopTracking(user.id);
        }
        
        set({ 
          isTracking: false,
          isLoading: false 
        });
      } catch (error: any) {
        console.error('Error stopping location tracking:', error);
        set({ 
          error: error.message || 'Failed to stop tracking',
          isLoading: false 
        });
      }
    },

    updateCurrentLocation: async () => {
      const { hasLocationPermission } = get();
      if (!hasLocationPermission) return;

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          altitude: location.coords.altitude,
          accuracy: location.coords.accuracy,
          timestamp: new Date().toISOString(),
          speed: location.coords.speed,
          heading: location.coords.heading,
        };
        
        const { user } = useAuthStore.getState();
        if (user) {
          // Update location on server
          await LocationApiService.updateLocation(user.id, locationData);
          
          const { locationHistory } = get();
          set({ 
            currentLocation: locationData,
            locationHistory: [locationData, ...locationHistory.slice(0, 99)], // Keep last 100 locations
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error updating current location:', error);
        set({ error: error.message || 'Failed to update location' });
      }
    },

    updateStatus: async (status: 'available' | 'busy' | 'offline') => {
      try {
        const { user } = useAuthStore.getState();
        if (user) {
          const response = await LocationApiService.updateStatus(user.id, status);
          if (!response.success) {
            set({ error: response.error || 'Failed to update status' });
          }
        }
      } catch (error: any) {
        console.error('Error updating status:', error);
        set({ error: error.message || 'Failed to update status' });
      }
    },

    getLocationHistory: async (limit = 50) => {
      try {
        const { user } = useAuthStore.getState();
        if (user) {
          const response = await LocationApiService.getLocationHistory(user.id, limit);
          if (response.success && response.data) {
            set({ locationHistory: response.data });
            return response.data;
          }
        }
        return [];
      } catch (error: any) {
        console.error('Error fetching location history:', error);
        set({ error: error.message || 'Failed to fetch location history' });
        return [];
      }
    },

    // Geofence management
    addGeofence: async (geofence: Omit<Geofence, 'id'>) => {
      try {
        const response = await LocationApiService.addGeofence(geofence);
        if (response.success && response.data) {
          const { geofences } = get();
          set({ geofences: [...geofences, response.data] });
          return response.data.id;
        }
        throw new Error(response.error || 'Failed to add geofence');
      } catch (error: any) {
        console.error('Error adding geofence:', error);
        set({ error: error.message || 'Failed to add geofence' });
        throw error;
      }
    },

    removeGeofence: async (geofenceId: string) => {
      try {
        const response = await LocationApiService.removeGeofence(geofenceId);
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
      const { currentLocation, geofences } = get();
      if (!currentLocation || geofences.length === 0) return;

      // Simple geofence checking logic
      geofences.forEach(geofence => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          geofence.latitude,
          geofence.longitude
        );
        
        if (distance <= geofence.radius) {
          // Inside geofence - trigger event if needed
          console.log(`Entered geofence: ${geofence.name}`);
        }
      });
    },

    updateTrackingSettings: async (options) => {
      const { trackingSettings } = get();
      const newSettings = { ...trackingSettings, ...options };
      
      set({ trackingSettings: newSettings });
      
      // Apply settings to tracking service if active
      const { isTracking } = get();
      if (isTracking) {
        try {
          await LocationApiService.updateTrackingSettings(newSettings);
        } catch (error: any) {
          console.error('Error updating tracking settings:', error);
          set({ error: error.message || 'Failed to update tracking settings' });
        }
      }
    },

    // Utilities
    clearError: () => set({ error: null }),

    clearLocationHistory: () => set({ locationHistory: [] }),
  }))
);

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
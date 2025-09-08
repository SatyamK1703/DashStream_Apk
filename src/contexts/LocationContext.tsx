// src/contexts/LocationContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { LocationApiService, LocationData, Geofence } from '../services/dataService';
import { useAuth } from './AuthContext';
import * as Location from 'expo-location';

// Define location context state
type LocationContextType = {
  currentLocation: LocationData | null;
  locationHistory: LocationData[];
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  startTracking: () => Promise<boolean>;
  stopTracking: () => Promise<void>;
  updateStatus: (status: 'available' | 'busy' | 'offline') => Promise<void>;
  getLocationHistory: (limit?: number) => Promise<LocationData[]>;
  addGeofence: (geofence: Omit<Geofence, 'id'>) => Promise<string>;
  removeGeofence: (geofenceId: string) => Promise<boolean>;
  updateTrackingSettings: (options: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
  }) => Promise<void>;
};

// Create context with default values
const LocationContext = createContext<LocationContextType>({
  currentLocation: null,
  locationHistory: [],
  isTracking: false,
  isLoading: true,
  error: null,
  startTracking: async () => false,
  stopTracking: async () => {},
  updateStatus: async () => {},
  getLocationHistory: async () => [],
  addGeofence: async () => '',
  removeGeofence: async () => false,
  updateTrackingSettings: async () => {},
});

// Location provider component
export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [locationService, setLocationService] = useState<LocationApiService | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize location service when user is available
  useEffect(() => {
   const initializeLocationService = async () => {
  try {
    setIsLoading(true);
    setError(null);

    // Check if user is authenticated and is a professional
    if (!user || user.role !== 'professional') {
      setIsLoading(false);
      return;
    }

    // Create location service
    const service = new LocationApiService(user.id);
    
    // Initialize service
    await service.initialize();
    
    // Service is initialized if no errors were thrown
    setLocationService(service);
    
    // Get current location
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
        status: 'available',
      };
      
      setCurrentLocation(locationData);
    }
    
    // Get location history
    const history = await service.getLocationHistory();
    setLocationHistory(history);

  } catch (error: any) {
    console.error('Error initializing location service:', error);
    setError(error.message || 'Failed to initialize location service');
  } finally {
    setIsLoading(false);
  }
};


    initializeLocationService();

    // Cleanup function
    return () => {
      if (locationService && isTracking) {
        locationService.stopTracking();
      }
    };
  }, [user]);

  // Start tracking location
  const startTracking = async (): Promise<boolean> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return false;
      }

      const success = await locationService.startTracking();
      
      if (success) {
        setIsTracking(true);
      } else {
        setError('Failed to start location tracking');
      }
      
      return success;
    } catch (error: any) {
      console.error('Error starting location tracking:', error);
      setError(error.message || 'Failed to start location tracking');
      return false;
    }
  };

  // Stop tracking location
  const stopTracking = async (): Promise<void> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return;
      }

      await locationService.stopTracking();
      setIsTracking(false);
    } catch (error: any) {
      console.error('Error stopping location tracking:', error);
      setError(error.message || 'Failed to stop location tracking');
    }
  };

  // Update user status
  const updateStatus = async (status: 'available' | 'busy' | 'offline'): Promise<void> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return;
      }

      await locationService.updateStatus(status);
      
      // Update current location status
      if (currentLocation) {
        setCurrentLocation({ ...currentLocation, status });
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update status');
    }
  };

  // Get location history
  const getLocationHistory = async (limit?: number): Promise<LocationData[]> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return [];
      }

      const history = await locationService.getLocationHistory(limit);
      setLocationHistory(history);
      return history;
    } catch (error: any) {
      console.error('Error getting location history:', error);
      setError(error.message || 'Failed to get location history');
      return [];
    }
  };

  // Add a geofence
  const addGeofence = async (geofence: Omit<Geofence, 'id'>): Promise<string> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return '';
      }

      // Add the geofence using the service
      await locationService.addGeofence(geofence);
      
      // Return a placeholder ID (actual ID is managed by the API service)
      return `geofence_${Date.now()}`;
    } catch (error: any) {
      console.error('Error adding geofence:', error);
      setError(error.message || 'Failed to add geofence');
      return '';
    }
  };

  // Remove a geofence
  const removeGeofence = async (geofenceId: string): Promise<boolean> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return false;
      }

      return await locationService.removeGeofence(geofenceId);
    } catch (error: any) {
      console.error('Error removing geofence:', error);
      setError(error.message || 'Failed to remove geofence');
      return false;
    }
  };

  // Update tracking settings
  const updateTrackingSettings = async (options: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
  }): Promise<void> => {
    try {
      if (!locationService) {
        setError('Location service not initialized');
        return;
      }

      await locationService.updateTrackingSettings(options);
    } catch (error: any) {
      console.error('Error configuring tracking:', error);
      setError(error.message || 'Failed to configure tracking');
    }
  };

  // Provide location context value
  const value = {
    currentLocation,
    locationHistory,
    isTracking,
    isLoading,
    error,
    startTracking,
    stopTracking,
    updateStatus,
    getLocationHistory,
    addGeofence,
    removeGeofence,
    updateTrackingSettings,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

// Custom hook to use location context
export const useLocation = () => useContext(LocationContext);

export default LocationContext;
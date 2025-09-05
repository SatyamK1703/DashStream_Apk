// src/services/LocationService.ts
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import * as locationApi from './locationApi';

// Define location data type
export type LocationData = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
  status?: 'available' | 'busy' | 'offline';
  batteryLevel?: number;
};

// Define geofence type
export type Geofence = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  notifyOnEntry: boolean;
  notifyOnExit: boolean;
};

// Class to handle location tracking and storage
export class LocationService {
  private userId: string;
  private userRole: string;
  private locationWatchId: Location.LocationSubscription | null = null;
  private geofences: Geofence[] = [];
  private lastLocation: LocationData | null = null;
  private updateInterval: number = 10000; // 10 seconds default
  private significantChangeThreshold: number = 10; // 10 meters default
  private isTracking: boolean = false;
  private batteryOptimizationEnabled: boolean = true;
  private maxHistoryItems: number = 100; // Default max history items

  constructor(userId: string, userRole: string) {
    this.userId = userId;
    this.userRole = userRole;
  }

  // Initialize location tracking
  async initialize(): Promise<boolean> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return false;
      }

      // Load saved geofences
      await this.loadGeofences();

      // Load configuration
      await this.loadConfiguration();

      return true;
    } catch (error) {
      console.error('Error initializing location service:', error);
      return false;
    }
  }

  // Start tracking location
  async startTracking(): Promise<boolean> {
    try {
      if (this.isTracking) {
        return true; // Already tracking
      }

      // Request background location permissions for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('Background location permission not granted, falling back to foreground only');
      }

      // Update tracking status on the server
      await this.setTrackingEnabled(true);

      // Start watching location with appropriate accuracy and interval
      this.locationWatchId = await Location.watchPositionAsync(
        {
          accuracy: this.batteryOptimizationEnabled ? 
            Location.Accuracy.Balanced : 
            Location.Accuracy.High,
          distanceInterval: this.significantChangeThreshold,
          timeInterval: this.updateInterval,
        },
        this.handleLocationUpdate.bind(this)
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  // Stop tracking location
  async stopTracking(): Promise<boolean> {
    try {
      if (!this.isTracking) {
        return true; // Already stopped
      }

      // Remove the location watch
      if (this.locationWatchId) {
        this.locationWatchId.remove();
        this.locationWatchId = null;
      }

      // Update status to offline
      await this.updateStatus('offline');
      
      // Update tracking status on the server
      await this.setTrackingEnabled(false);

      this.isTracking = false;
      return true;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return false;
    }
  }

  // Handle location updates
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
        status: this.lastLocation?.status || 'available',
      };

      // Check if this is a significant change worth storing
      if (!this.lastLocation || this.isSignificantChange(this.lastLocation, newLocation)) {
        // Store the location
        await this.storeLocation(newLocation);
        
        // Check geofences
        await this.checkGeofences(newLocation);
        
        // Update last location
        this.lastLocation = newLocation;
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  // Store location to API
  private async storeLocation(location: LocationData): Promise<void> {
    try {
      // Send location update to the server
      await locationApi.updateLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
      });
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  // Update user status
  async updateStatus(status: 'available' | 'busy' | 'offline'): Promise<boolean> {
    try {
      // Update status on the server
      const result = await locationApi.updateStatus(status);
      
      if (result.success) {
        // Update local status
        if (this.lastLocation) {
          this.lastLocation.status = status;
        }
        return true;
      } else {
        console.error('Error updating status:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }

  // Check if location change is significant enough to store
  private isSignificantChange(oldLocation: LocationData, newLocation: LocationData): boolean {
    // Calculate distance between points
    const distance = this.calculateDistance(
      oldLocation.latitude,
      oldLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );
    
    // Check if distance exceeds threshold
    return distance > this.significantChangeThreshold;
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Add a geofence
  async addGeofence(geofence: Omit<Geofence, 'id'>): Promise<Geofence | null> {
    try {
      // Generate a unique ID for the geofence
      const id = Date.now().toString();
      const newGeofence: Geofence = { ...geofence, id };
      
      // Add to local cache
      this.geofences.push(newGeofence);
      
      // Save to storage
      await this.saveGeofences();
      
      return newGeofence;
    } catch (error) {
      console.error('Error adding geofence:', error);
      return null;
    }
  }

  // Remove a geofence
  async removeGeofence(geofenceId: string): Promise<boolean> {
    try {
      // Remove from local cache
      this.geofences = this.geofences.filter(g => g.id !== geofenceId);
      
      // Save to storage
      await this.saveGeofences();
      
      return true;
    } catch (error) {
      console.error('Error removing geofence:', error);
      return false;
    }
  }

  // Get all geofences
  getGeofences(): Geofence[] {
    return [...this.geofences];
  }

  // Save geofences to storage
  private async saveGeofences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${APP_CONFIG.STORAGE_KEYS.USER_DATA}_geofences_${this.userId}`,
        JSON.stringify(this.geofences)
      );
    } catch (error) {
      console.error('Error saving geofences:', error);
    }
  }

  // Load geofences from storage
  private async loadGeofences(): Promise<void> {
    try {
      const geofencesJson = await AsyncStorage.getItem(
        `${APP_CONFIG.STORAGE_KEYS.USER_DATA}_geofences_${this.userId}`
      );
      
      if (geofencesJson) {
        this.geofences = JSON.parse(geofencesJson);
      }
    } catch (error) {
      console.error('Error loading geofences:', error);
    }
  }

  // Check if a location is inside any geofences
  private async checkGeofences(location: LocationData): Promise<void> {
    try {
      for (const geofence of this.geofences) {
        const distance = this.calculateDistance(
          location.latitude,
          location.longitude,
          geofence.latitude,
          geofence.longitude
        );
        
        const isInside = distance <= geofence.radius;
        const wasInside = this.isLocationInGeofence(this.lastLocation, geofence);
        
        // Check for entry
        if (isInside && !wasInside && geofence.notifyOnEntry) {
          console.log(`Entered geofence: ${geofence.name}`);
          // TODO: Send notification for geofence entry
        }
        
        // Check for exit
        if (!isInside && wasInside && geofence.notifyOnExit) {
          console.log(`Exited geofence: ${geofence.name}`);
          // TODO: Send notification for geofence exit
        }
      }
    } catch (error) {
      console.error('Error checking geofences:', error);
    }
  }

  // Check if a location is inside a specific geofence
  private isLocationInGeofence(location: LocationData | null, geofence: Geofence): boolean {
    if (!location) return false;
    
    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      geofence.latitude,
      geofence.longitude
    );
    
    return distance <= geofence.radius;
  }

  // Get location history
  async getLocationHistory(limit: number = this.maxHistoryItems): Promise<LocationData[]> {
    try {
      const result = await locationApi.getProfessionalLocationHistory(this.userId, limit);
      
      if (result.success && result.data && Array.isArray(result.data.data)) {
        return result.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  // Configure tracking settings
  async configureTracking(settings: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
    maxHistoryItems?: number;
  }): Promise<boolean> {
    try {
      // Update local settings
      if (settings.updateInterval !== undefined) {
        this.updateInterval = settings.updateInterval;
      }
      
      if (settings.significantChangeThreshold !== undefined) {
        this.significantChangeThreshold = settings.significantChangeThreshold;
      }
      
      if (settings.batteryOptimizationEnabled !== undefined) {
        this.batteryOptimizationEnabled = settings.batteryOptimizationEnabled;
      }
      
      if (settings.maxHistoryItems !== undefined) {
        this.maxHistoryItems = settings.maxHistoryItems;
      }
      
      // Save configuration
      await this.saveConfiguration();
      
      // Update settings on the server
      const result = await locationApi.updateTrackingSettings({
        updateInterval: this.updateInterval,
        significantChangeThreshold: this.significantChangeThreshold,
        batteryOptimizationEnabled: this.batteryOptimizationEnabled,
        maxHistoryItems: this.maxHistoryItems
      });
      
      // Restart tracking if active
      if (this.isTracking) {
        await this.stopTracking();
        await this.startTracking();
      }
      
      return result.success;
    } catch (error) {
      console.error('Error configuring tracking:', error);
      return false;
    }
  }

  // Save configuration to storage
  private async saveConfiguration(): Promise<void> {
    try {
      const config = {
        updateInterval: this.updateInterval,
        significantChangeThreshold: this.significantChangeThreshold,
        batteryOptimizationEnabled: this.batteryOptimizationEnabled,
        maxHistoryItems: this.maxHistoryItems
      };
      
      await AsyncStorage.setItem(
        `${APP_CONFIG.STORAGE_KEYS.USER_DATA}_location_config_${this.userId}`,
        JSON.stringify(config)
      );
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  // Load configuration from storage
  private async loadConfiguration(): Promise<void> {
    try {
      const configJson = await AsyncStorage.getItem(
        `${APP_CONFIG.STORAGE_KEYS.USER_DATA}_location_config_${this.userId}`
      );
      
      if (configJson) {
        const config = JSON.parse(configJson);
        
        if (config.updateInterval !== undefined) {
          this.updateInterval = config.updateInterval;
        }
        
        if (config.significantChangeThreshold !== undefined) {
          this.significantChangeThreshold = config.significantChangeThreshold;
        }
        
        if (config.batteryOptimizationEnabled !== undefined) {
          this.batteryOptimizationEnabled = config.batteryOptimizationEnabled;
        }
        
        if (config.maxHistoryItems !== undefined) {
          this.maxHistoryItems = config.maxHistoryItems;
        }
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  }

  // Enable or disable tracking
  private async setTrackingEnabled(enabled: boolean): Promise<void> {
    try {
      await locationApi.setTrackingEnabled(enabled);
    } catch (error) {
      console.error('Error setting tracking enabled:', error);
    }
  }
}

// Hook to use location service
export const useLocationService = (userId: string, userRole: string) => {
  // Only create the service for professional users
  if (userRole === 'professional' && userId) {
    return new LocationService(userId, userRole);
  }
  
  return null;
};
import * as Location from 'expo-location';
import { Platform } from 'react-native';
import apiService from './apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_PERMISSION_KEY = '@dashstream:location_permission';
const LAST_LOCATION_KEY = '@dashstream:last_location';
const LOCATION_SETTINGS_KEY = '@dashstream:location_settings';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface LocationSettings {
  enableTracking: boolean;
  updateInterval: number; // in milliseconds
  significantChangeThreshold: number; // in meters
  batteryOptimizationEnabled: boolean;
  maxHistoryItems: number;
}

export interface ProfessionalLocation {
  id: string;
  professionalId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  speed?: number;
  heading?: number;
  status: 'available' | 'busy' | 'offline';
  lastUpdated: string;
  batteryLevel?: number;
  networkType?: string;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private settings: LocationSettings = {
    enableTracking: true,
    updateInterval: 30000, // 30 seconds
    significantChangeThreshold: 100, // 100 meters
    batteryOptimizationEnabled: true,
    maxHistoryItems: 100,
  };
  private lastLocation: LocationData | null = null;
  private isTracking = false;

  constructor() {
    this.loadSettings();
    this.loadLastLocation();
  }

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return false;
      }

      // Request background permissions for professional users
      if (Platform.OS === 'ios') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied');
        }
      }

      await AsyncStorage.setItem(LOCATION_PERMISSION_KEY, 'granted');
      return true;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        speed: location.coords.speed || undefined,
        heading: location.coords.heading || undefined,
        timestamp: location.timestamp,
      };

      this.lastLocation = locationData;
      await this.saveLastLocation();
      
      return locationData;
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Start location tracking
   */
  async startTracking(): Promise<void> {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return;
    }

    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Location permission denied');
        }
      }

      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: this.settings.updateInterval,
          distanceInterval: this.settings.significantChangeThreshold,
        },
        (location) => {
          this.handleLocationUpdate(location);
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  /**
   * Stop location tracking
   */
  async stopTracking(): Promise<void> {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  /**
   * Handle location update
   */
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
      timestamp: location.timestamp,
    };

    // Check if location has changed significantly
    if (this.hasLocationChanged(locationData)) {
      this.lastLocation = locationData;
      await this.saveLastLocation();
      await this.updateProfessionalLocation(locationData);
    }
  }

  /**
   * Check if location has changed significantly
   */
  private hasLocationChanged(newLocation: LocationData): boolean {
    if (!this.lastLocation) return true;

    const distance = this.calculateDistance(
      this.lastLocation.latitude,
      this.lastLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance >= this.settings.significantChangeThreshold;
  }

  /**
   * Calculate distance between two coordinates
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Update professional location on backend
   */
  async updateProfessionalLocation(locationData: LocationData): Promise<void> {
    try {
      await apiService.post('/location/update', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        speed: locationData.speed,
        heading: locationData.heading,
        timestamp: locationData.timestamp,
      });
    } catch (error) {
      console.error('Error updating professional location:', error);
    }
  }

  /**
   * Update professional status
   */
  async updateProfessionalStatus(status: 'available' | 'busy' | 'offline'): Promise<void> {
    try {
      await apiService.post('/location/status', { status });
    } catch (error) {
      console.error('Error updating professional status:', error);
    }
  }

  /**
   * Set tracking enabled/disabled
   */
  async setTrackingEnabled(enabled: boolean): Promise<void> {
    try {
      await apiService.post('/location/tracking', { enabled });
      this.settings.enableTracking = enabled;
      await this.saveSettings();

      if (enabled) {
        await this.startTracking();
      } else {
        await this.stopTracking();
      }
    } catch (error) {
      console.error('Error setting tracking enabled:', error);
    }
  }

  /**
   * Update tracking settings
   */
  async updateTrackingSettings(newSettings: Partial<LocationSettings>): Promise<void> {
    try {
      await apiService.post('/location/settings', newSettings);
      this.settings = { ...this.settings, ...newSettings };
      await this.saveSettings();

      // Restart tracking with new settings if currently tracking
      if (this.isTracking) {
        await this.stopTracking();
        await this.startTracking();
      }
    } catch (error) {
      console.error('Error updating tracking settings:', error);
    }
  }

  /**
   * Get professional location
   */
  async getProfessionalLocation(professionalId: string): Promise<ProfessionalLocation | null> {
    try {
      const response = await apiService.get(`/location/professional/${professionalId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting professional location:', error);
      return null;
    }
  }

  /**
   * Get professional location history
   */
  async getProfessionalLocationHistory(professionalId: string, limit?: number): Promise<LocationData[]> {
    try {
      const response = await apiService.get(`/location/professional/${professionalId}/history`, { limit });
      return response.data || [];
    } catch (error) {
      console.error('Error getting professional location history:', error);
      return [];
    }
  }

  /**
   * Find nearby professionals
   */
  async findNearbyProfessionals(params: {
    latitude: number;
    longitude: number;
    maxDistance?: number;
    status?: string;
  }): Promise<ProfessionalLocation[]> {
    try {
      const response = await apiService.get('/location/nearby', params);
      return response.data || [];
    } catch (error) {
      console.error('Error finding nearby professionals:', error);
      return [];
    }
  }

  /**
   * Subscribe to location updates for a professional
   */
  async subscribeToLocationUpdates(professionalId: string): Promise<void> {
    try {
      await apiService.post(`/location/subscribe/${professionalId}`);
    } catch (error) {
      console.error('Error subscribing to location updates:', error);
    }
  }

  /**
   * Unsubscribe from location updates for a professional
   */
  async unsubscribeFromLocationUpdates(professionalId: string): Promise<void> {
    try {
      await apiService.post(`/location/unsubscribe/${professionalId}`);
    } catch (error) {
      console.error('Error unsubscribing from location updates:', error);
    }
  }

  /**
   * Get location settings
   */
  getSettings(): LocationSettings {
    return { ...this.settings };
  }

  /**
   * Get last known location
   */
  getLastLocation(): LocationData | null {
    return this.lastLocation ? { ...this.lastLocation } : null;
  }

  /**
   * Check if tracking is active
   */
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  /**
   * Save settings to local storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving location settings:', error);
    }
  }

  /**
   * Load settings from local storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(LOCATION_SETTINGS_KEY);
      if (settingsJson) {
        this.settings = { ...this.settings, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  }

  /**
   * Save last location to local storage
   */
  private async saveLastLocation(): Promise<void> {
    if (this.lastLocation) {
      try {
        await AsyncStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(this.lastLocation));
      } catch (error) {
        console.error('Error saving last location:', error);
      }
    }
  }

  /**
   * Load last location from local storage
   */
  private async loadLastLocation(): Promise<void> {
    try {
      const locationJson = await AsyncStorage.getItem(LAST_LOCATION_KEY);
      if (locationJson) {
        this.lastLocation = JSON.parse(locationJson);
      }
    } catch (error) {
      console.error('Error loading last location:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopTracking();
  }
}

// Create and export a singleton instance
const locationService = new LocationService();
export default locationService;

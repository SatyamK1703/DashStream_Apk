// src/services/LocationApiService.ts
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as locationApi from './locationApi';
import { API_CONFIG } from '../constants/config';

// Types
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: number;
  status?: 'available' | 'busy' | 'offline';
}

export interface Geofence {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  name: string;
  notifyOnEntry?: boolean;
  notifyOnExit?: boolean;
}

export interface TrackingSettings {
  updateInterval: number; // milliseconds
  significantChangeThreshold: number; // meters
  batteryOptimizationEnabled: boolean;
  maxHistoryItems: number;
}

export class LocationApiService {
  private locationSubscription: Location.LocationSubscription | null = null;
  private lastLocation: LocationData | null = null;
  private geofences: Geofence[] = [];
  private trackingSettings: TrackingSettings = {
    updateInterval: 10000, // 10 seconds
    significantChangeThreshold: 10, // 10 meters
    batteryOptimizationEnabled: true,
    maxHistoryItems: 100
  };
  private isTracking: boolean = false;
  private userId: string | null = null;
  
  constructor(userId: string | null = null) {
    this.userId = userId;
    this.initialize();
  }
  
  async initialize(): Promise<void> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }
      
      // Load geofences from storage
      await this.loadGeofences();
      
      // Load tracking settings
      await this.loadTrackingSettings();
      
      console.log('LocationApiService initialized successfully');
    } catch (error) {
      console.error('Error initializing LocationApiService:', error);
    }
  }
  
  async loadGeofences(): Promise<void> {
    try {
      const geofencesJson = await AsyncStorage.getItem('geofences');
      
      if (geofencesJson) {
        this.geofences = JSON.parse(geofencesJson);
      }
    } catch (error) {
      console.error('Error loading geofences:', error);
    }
  }
  
  async saveGeofences(): Promise<void> {
    try {
      await AsyncStorage.setItem('geofences', JSON.stringify(this.geofences));
    } catch (error) {
      console.error('Error saving geofences:', error);
    }
  }
  
  async loadTrackingSettings(): Promise<void> {
    try {
      // Try to load from API first
      if (this.userId) {
        const response = await locationApi.getProfessionalLocation(this.userId);
        
        if (response.success && response.data?.trackingSettings) {
          this.trackingSettings = response.data.trackingSettings;
          return;
        }
      }
      
      // Fall back to local storage
      const settingsJson = await AsyncStorage.getItem('trackingSettings');
      
      if (settingsJson) {
        this.trackingSettings = JSON.parse(settingsJson);
      }
    } catch (error) {
      console.error('Error loading tracking settings:', error);
    }
  }
  
  async saveTrackingSettings(): Promise<void> {
    try {
      // Save to API
      await locationApi.updateTrackingSettings(this.trackingSettings);
      
      // Also save locally
      await AsyncStorage.setItem('trackingSettings', JSON.stringify(this.trackingSettings));
    } catch (error) {
      console.error('Error saving tracking settings:', error);
    }
  }
  
  async startTracking(): Promise<boolean> {
    try {
      if (this.isTracking) {
        return true; // Already tracking
      }
      
      // Enable tracking on the server
      await locationApi.setTrackingEnabled(true);
      
      // Start location updates
      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: this.trackingSettings.batteryOptimizationEnabled ? 10 : 0, // meters
          timeInterval: this.trackingSettings.updateInterval // milliseconds
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
  
  async stopTracking(): Promise<boolean> {
    try {
      // Remove the subscription
      if (this.locationSubscription) {
        this.locationSubscription.remove();
        this.locationSubscription = null;
      }
      
      // Disable tracking on the server
      await locationApi.setTrackingEnabled(false);
      
      this.isTracking = false;
      return true;
    } catch (error) {
      console.error('Error stopping location tracking:', error);
      return false;
    }
  }
  
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp
      };
      
      // Check if the location has changed significantly
      if (this.lastLocation && this.isSignificantChange(this.lastLocation, newLocation)) {
        // Update location on the server
        await locationApi.updateLocation(newLocation);
        
        // Check for geofence events
        this.checkGeofences(newLocation);
        
        // Update last location
        this.lastLocation = newLocation;
      } else if (!this.lastLocation) {
        // First location update
        await locationApi.updateLocation(newLocation);
        this.lastLocation = newLocation;
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }
  
  private isSignificantChange(oldLocation: LocationData, newLocation: LocationData): boolean {
    // Calculate distance between old and new locations
    const distance = this.calculateDistance(
      oldLocation.latitude,
      oldLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );
    
    return distance >= this.trackingSettings.significantChangeThreshold;
  }
  
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  
  private checkGeofences(location: LocationData): void {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );
      
      const isInside = distance <= geofence.radius;
      const wasInside = this.isInsideGeofence(this.lastLocation, geofence);
      
      // Check for entry
      if (isInside && !wasInside && geofence.notifyOnEntry) {
        this.handleGeofenceEntry(geofence);
      }
      
      // Check for exit
      if (!isInside && wasInside && geofence.notifyOnExit) {
        this.handleGeofenceExit(geofence);
      }
    }
  }
  
  private isInsideGeofence(location: LocationData | null, geofence: Geofence): boolean {
    if (!location) return false;
    
    const distance = this.calculateDistance(
      location.latitude,
      location.longitude,
      geofence.latitude,
      geofence.longitude
    );
    
    return distance <= geofence.radius;
  }
  
  private handleGeofenceEntry(geofence: Geofence): void {
    console.log(`Entered geofence: ${geofence.name}`);
    // Implement notification or callback logic here
  }
  
  private handleGeofenceExit(geofence: Geofence): void {
    console.log(`Exited geofence: ${geofence.name}`);
    // Implement notification or callback logic here
  }
  
  async addGeofence(geofence: Geofence): Promise<void> {
    this.geofences.push(geofence);
    await this.saveGeofences();
  }
  
  async removeGeofence(geofenceId: string): Promise<void> {
    this.geofences = this.geofences.filter(g => g.id !== geofenceId);
    await this.saveGeofences();
  }
  
  getGeofences(): Geofence[] {
    return [...this.geofences];
  }
  
  async updateStatus(status: 'available' | 'busy' | 'offline'): Promise<boolean> {
    try {
      const response = await locationApi.updateStatus(status);
      return response.success;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  }
  
  async getLocationHistory(limit: number = 50): Promise<LocationData[]> {
    try {
      if (!this.userId) {
        throw new Error('User ID not set');
      }
      
      const response = await locationApi.getProfessionalLocationHistory(this.userId, limit);
      
      if (response.success && response.data?.data) {
        return response.data.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }
  
  async updateTrackingSettings(settings: Partial<TrackingSettings>): Promise<boolean> {
    try {
      // Update local settings
      this.trackingSettings = {
        ...this.trackingSettings,
        ...settings
      };
      
      // Save settings
      await this.saveTrackingSettings();
      
      // If tracking is active, restart it to apply new settings
      if (this.isTracking) {
        await this.stopTracking();
        await this.startTracking();
      }
      
      return true;
    } catch (error) {
      console.error('Error updating tracking settings:', error);
      return false;
    }
  }
  
  getTrackingSettings(): TrackingSettings {
    return { ...this.trackingSettings };
  }
  
  isTrackingActive(): boolean {
    return this.isTracking;
  }
}
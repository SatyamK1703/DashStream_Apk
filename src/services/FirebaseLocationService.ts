// src/services/FirebaseLocationService.ts
import { database } from '../config/firebase';
import { ref, set, onValue, push, get, query, orderByChild, limitToLast } from 'firebase/database';
import * as Location from 'expo-location';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { useAuth } from '../contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';

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
export class FirebaseLocationService {
  private userId: string;
  private userRole: string;
  private locationWatchId: Location.LocationSubscription | null = null;
  private geofences: Geofence[] = [];
  private lastLocation: LocationData | null = null;
  private updateInterval: number = 10000; // 10 seconds default
  private significantChangeThreshold: number = 10; // 10 meters default
  private isTracking: boolean = false;
  private batteryOptimizationEnabled: boolean = true;

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

      // Configure location tracking
      await Location.setGoogleApiKey('YOUR_GOOGLE_API_KEY'); // Replace with actual API key

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
  async stopTracking(): Promise<void> {
    if (this.locationWatchId) {
      await this.locationWatchId.remove();
      this.locationWatchId = null;
    }
    this.isTracking = false;
    
    // Update status to offline
    await this.updateStatus('offline');
  }

  // Handle location update
  private async handleLocationUpdate(location: Location.LocationObject): Promise<void> {
    try {
      // Create location data object
      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
        status: 'available', // Default status
      };

      // Check if this is a significant change from last location
      if (this.lastLocation && this.isSignificantChange(this.lastLocation, locationData)) {
        // Store current location
        await this.storeLocation(locationData);
        
        // Check geofences
        await this.checkGeofences(locationData);
        
        // Update last location
        this.lastLocation = locationData;
      } else if (!this.lastLocation) {
        // First location update
        await this.storeLocation(locationData);
        this.lastLocation = locationData;
      }
    } catch (error) {
      console.error('Error handling location update:', error);
    }
  }

  // Store location in Firebase
  private async storeLocation(locationData: LocationData): Promise<void> {
    try {
      // Store current location
      const currentLocationRef = ref(database, `locations/${this.userId}/current`);
      await set(currentLocationRef, locationData);

      // Add to location history
      const historyRef = ref(database, `locations/${this.userId}/history`);
      await push(historyRef, locationData);

      console.log('Location stored successfully');
    } catch (error) {
      console.error('Error storing location:', error);
    }
  }

  // Update user status
  async updateStatus(status: 'available' | 'busy' | 'offline'): Promise<void> {
    try {
      if (this.lastLocation) {
        const updatedLocation = { ...this.lastLocation, status };
        await this.storeLocation(updatedLocation);
        this.lastLocation = updatedLocation;
      } else {
        // If no location yet, get current location and update
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
          status,
        };
        
        await this.storeLocation(locationData);
        this.lastLocation = locationData;
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  }

  // Check if location change is significant
  private isSignificantChange(lastLocation: LocationData, newLocation: LocationData): boolean {
    // Calculate distance between points
    const distance = this.calculateDistance(
      lastLocation.latitude,
      lastLocation.longitude,
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
  async addGeofence(geofence: Omit<Geofence, 'id'>): Promise<string> {
    try {
      // Generate ID for the geofence
      const geofenceRef = ref(database, `geofences/${this.userId}`);
      const newGeofenceRef = push(geofenceRef);
      const geofenceId = newGeofenceRef.key as string;
      
      const newGeofence: Geofence = {
        ...geofence,
        id: geofenceId,
      };
      
      // Save to Firebase
      await set(newGeofenceRef, newGeofence);
      
      // Add to local cache
      this.geofences.push(newGeofence);
      
      return geofenceId;
    } catch (error) {
      console.error('Error adding geofence:', error);
      throw error;
    }
  }

  // Remove a geofence
  async removeGeofence(geofenceId: string): Promise<boolean> {
    try {
      // Remove from Firebase
      const geofenceRef = ref(database, `geofences/${this.userId}/${geofenceId}`);
      await set(geofenceRef, null);
      
      // Remove from local cache
      this.geofences = this.geofences.filter(g => g.id !== geofenceId);
      
      return true;
    } catch (error) {
      console.error('Error removing geofence:', error);
      return false;
    }
  }

  // Load geofences from Firebase
  private async loadGeofences(): Promise<void> {
    try {
      const geofencesRef = ref(database, `geofences/${this.userId}`);
      const snapshot = await get(geofencesRef);
      
      if (snapshot.exists()) {
        const geofencesData = snapshot.val();
        this.geofences = Object.values(geofencesData);
      }
    } catch (error) {
      console.error('Error loading geofences:', error);
    }
  }

  // Check if location is within any geofences
  private async checkGeofences(location: LocationData): Promise<void> {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(
        location.latitude,
        location.longitude,
        geofence.latitude,
        geofence.longitude
      );
      
      const isInside = distance <= geofence.radius;
      
      // Check if we need to send entry notification
      if (isInside && geofence.notifyOnEntry) {
        // TODO: Send notification for entering geofence
        console.log(`Entered geofence: ${geofence.name}`);
      }
      
      // Check if we need to send exit notification
      if (!isInside && geofence.notifyOnExit) {
        // TODO: Send notification for exiting geofence
        console.log(`Exited geofence: ${geofence.name}`);
      }
    }
  }

  // Get location history
  async getLocationHistory(limit: number = 50): Promise<LocationData[]> {
    try {
      const historyRef = query(
        ref(database, `locations/${this.userId}/history`),
        orderByChild('timestamp'),
        limitToLast(limit)
      );
      
      const snapshot = await get(historyRef);
      
      if (snapshot.exists()) {
        const historyData = snapshot.val();
        return Object.values(historyData);
      }
      
      return [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  // Configure tracking settings
  async configureTracking(options: {
    updateInterval?: number;
    significantChangeThreshold?: number;
    batteryOptimizationEnabled?: boolean;
  }): Promise<void> {
    // Update settings
    if (options.updateInterval !== undefined) {
      this.updateInterval = options.updateInterval;
    }
    
    if (options.significantChangeThreshold !== undefined) {
      this.significantChangeThreshold = options.significantChangeThreshold;
    }
    
    if (options.batteryOptimizationEnabled !== undefined) {
      this.batteryOptimizationEnabled = options.batteryOptimizationEnabled;
    }
    
    // Save configuration
    await this.saveConfiguration();
    
    // Restart tracking with new settings if currently tracking
    if (this.isTracking) {
      await this.stopTracking();
      await this.startTracking();
    }
  }

  // Save configuration to AsyncStorage
  private async saveConfiguration(): Promise<void> {
    try {
      const config = {
        updateInterval: this.updateInterval,
        significantChangeThreshold: this.significantChangeThreshold,
        batteryOptimizationEnabled: this.batteryOptimizationEnabled,
      };
      
      await AsyncStorage.setItem(
        `${APP_CONFIG.STORAGE_KEYS.FIREBASE_USER_LINK}:locationConfig`,
        JSON.stringify(config)
      );
    } catch (error) {
      console.error('Error saving location configuration:', error);
    }
  }

  // Load configuration from AsyncStorage
  private async loadConfiguration(): Promise<void> {
    try {
      const configString = await AsyncStorage.getItem(
        `${APP_CONFIG.STORAGE_KEYS.FIREBASE_USER_LINK}:locationConfig`
      );
      
      if (configString) {
        const config = JSON.parse(configString);
        
        if (config.updateInterval) {
          this.updateInterval = config.updateInterval;
        }
        
        if (config.significantChangeThreshold) {
          this.significantChangeThreshold = config.significantChangeThreshold;
        }
        
        if (config.batteryOptimizationEnabled !== undefined) {
          this.batteryOptimizationEnabled = config.batteryOptimizationEnabled;
        }
      }
    } catch (error) {
      console.error('Error loading location configuration:', error);
    }
  }
}

// Hook to use the location service
export const useLocationService = () => {
  const { user } = useAuth();
  const { firebaseUser } = useFirebaseAuth();
  
  if (!user || !firebaseUser || user.role !== 'professional') {
    throw new Error('Location service can only be used by authenticated professional users');
  }
  
  return new FirebaseLocationService(user.id, user.role);
};
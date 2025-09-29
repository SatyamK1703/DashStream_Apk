// src/types/location.ts
export interface LocationData {
  id?: string;
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationPermission {
  granted: boolean;
  status: 'granted' | 'denied' | 'undetermined';
  canAskAgain: boolean;
}

export interface TrackingSettings {
  updateInterval: number; // in milliseconds
  significantChangeThreshold: number; // in meters
  batteryOptimizationEnabled: boolean;
}

export interface LocationService {
  isTracking: boolean;
  lastKnownLocation: LocationData | null;
  status: 'available' | 'busy' | 'offline';
}
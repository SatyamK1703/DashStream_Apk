// src/services/locationApi.ts
import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';
import { LocationData, Geofence } from './LocationService';

// Update professional location
export const updateLocation = async (locationData: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
}) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.LOCATION.UPDATE, locationData);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error updating location:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update location.' 
    };
  }
};

// Update professional status
export const updateStatus = async (status: 'available' | 'busy' | 'offline') => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.LOCATION.STATUS, { status });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error updating status:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update status.' 
    };
  }
};

// Enable or disable tracking
export const setTrackingEnabled = async (enabled: boolean) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.LOCATION.TRACKING, { enabled });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error setting tracking status:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to set tracking status.' 
    };
  }
};

// Update tracking settings
export const updateTrackingSettings = async (settings: {
  updateInterval?: number;
  significantChangeThreshold?: number;
  batteryOptimizationEnabled?: boolean;
  maxHistoryItems?: number;
}) => {
  try {
    const response = await apiService.post(API_CONFIG.ENDPOINTS.LOCATION.SETTINGS, settings);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error updating tracking settings:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to update tracking settings.' 
    };
  }
};

// Get professional's current location
export const getProfessionalLocation = async (professionalId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.LOCATION.PROFESSIONAL.replace(':id', professionalId);
    const response = await apiService.get(url);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error getting professional location:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get professional location.' 
    };
  }
};

// Get professional's location history
export const getProfessionalLocationHistory = async (professionalId: string, limit: number = 50) => {
  try {
    const url = API_CONFIG.ENDPOINTS.LOCATION.HISTORY.replace(':id', professionalId);
    const response = await apiService.get(`${url}?limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error getting location history:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get location history.' 
    };
  }
};

// Find nearby professionals
export const findNearbyProfessionals = async (params: {
  latitude: number;
  longitude: number;
  maxDistance?: number;
  status?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    
    if (params.maxDistance) {
      queryParams.append('maxDistance', params.maxDistance.toString());
    }
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    const url = `${API_CONFIG.ENDPOINTS.LOCATION.NEARBY}?${queryParams.toString()}`;
    const response = await apiService.get(url);
    
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error finding nearby professionals:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to find nearby professionals.' 
    };
  }
};

// Subscribe to location updates
export const subscribeToLocationUpdates = async (professionalId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.LOCATION.SUBSCRIBE.replace(':professionalId', professionalId);
    const response = await apiService.post(url);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error subscribing to location updates:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to subscribe to location updates.' 
    };
  }
};

// Unsubscribe from location updates
export const unsubscribeFromLocationUpdates = async (professionalId: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.LOCATION.UNSUBSCRIBE.replace(':professionalId', professionalId);
    const response = await apiService.post(url);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Error unsubscribing from location updates:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to unsubscribe from location updates.' 
    };
  }
};
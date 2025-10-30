import httpClient, { ApiResponse } from './httpClient';
import { API_ENDPOINTS } from '../config/config';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface Place {
  placeId: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
  types: string[];
}

interface GeocodeResult {
  address: string;
  coordinates: LocationCoordinates;
  components: {
    streetNumber?: string;
    route?: string;
    locality?: string;
    administrativeAreaLevel2?: string;
    administrativeAreaLevel1?: string;
    country?: string;
    postalCode?: string;
  };
}

class LocationService {
  /**
   * Search places by query
   */
  async searchPlaces(data: {
    query: string;
    location?: LocationCoordinates;
    radius?: number; // in meters
    limit?: number;
  }): Promise<ApiResponse<Place[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.LOCATION.SEARCH, { params: data });
    } catch (error) {
      console.error('Search places error:', error);
      throw error;
    }
  }

  /**
   * Get nearby places
   */
  async getNearbyPlaces(data: {
    location: LocationCoordinates;
    radius?: number; // in meters, default 5000
    type?: 'restaurant' | 'gas_station' | 'hospital' | 'school' | 'bank';
    limit?: number;
  }): Promise<ApiResponse<Place[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.LOCATION.NEARBY, { params: data });
    } catch (error) {
      console.error('Get nearby places error:', error);
      throw error;
    }
  }

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(address: string): Promise<ApiResponse<GeocodeResult[]>> {
    try {
      return await httpClient.get(API_ENDPOINTS.LOCATION.GEOCODE, { 
        params: { address } 
      });
    } catch (error) {
      console.error('Geocode address error:', error);
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(location: LocationCoordinates): Promise<ApiResponse<GeocodeResult>> {
    try {
      return await httpClient.get(API_ENDPOINTS.LOCATION.REVERSE_GEOCODE, { params: location });
    } catch (error) {
      console.error('Reverse geocode error:', error);
      throw error;
    }
  }

  /**
   * Calculate distance and duration between two points
   */
  async calculateRoute(data: {
    origin: LocationCoordinates;
    destination: LocationCoordinates;
    mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
    avoidTolls?: boolean;
    avoidHighways?: boolean;
  }): Promise<ApiResponse<{
    distance: {
      text: string;
      value: number; // in meters
    };
    duration: {
      text: string;
      value: number; // in seconds
    };
    polyline: string;
    steps: {
      instruction: string;
      distance: { text: string; value: number };
      duration: { text: string; value: number };
      startLocation: LocationCoordinates;
      endLocation: LocationCoordinates;
    }[];
  }>> {
    try {
      return await httpClient.post('/locations/calculate-route', data);
    } catch (error) {
      console.error('Calculate route error:', error);
      throw error;
    }
  }

  /**
   * Get service areas (for professionals)
   */
  async getServiceAreas(location: LocationCoordinates): Promise<ApiResponse<{
    city: string;
    area: string;
    pincode: string;
    coordinates: LocationCoordinates;
    serviceAvailable: boolean;
    estimatedTime: string;
  }[]>> {
    try {
      return await httpClient.get('/locations/service-areas', { 
        params: location 
      });
    } catch (error) {
      console.error('Get service areas error:', error);
      throw error;
    }
  }

  /**
   * Check if location is within service area
   */
  async isLocationServiceable(location: LocationCoordinates): Promise<ApiResponse<{
    serviceable: boolean;
    city: string;
    area: string;
    estimatedTime?: string;
    nearestServiceCenter?: LocationCoordinates;
  }>> {
    try {
      return await httpClient.post('/locations/check-serviceable', location);
    } catch (error) {
      console.error('Check location serviceable error:', error);
      throw error;
    }
  }

  /**
   * Get popular locations in a city
   */
  async getPopularLocations(city: string): Promise<ApiResponse<{
    name: string;
    address: string;
    coordinates: LocationCoordinates;
    type: 'residential' | 'commercial' | 'landmark';
    bookingsCount: number;
  }[]>> {
    try {
      return await httpClient.get('/locations/popular', { 
        params: { city } 
      });
    } catch (error) {
      console.error('Get popular locations error:', error);
      throw error;
    }
  }

  /**
   * Save frequently used location
   */
  async saveFavoriteLocation(data: {
    name: string;
    address: string;
    coordinates: LocationCoordinates;
    type: 'home' | 'work' | 'other';
  }): Promise<ApiResponse<{ id: string; saved: boolean }>> {
    try {
      return await httpClient.post('/locations/favorites', data);
    } catch (error) {
      console.error('Save favorite location error:', error);
      throw error;
    }
  }

  /**
   * Get user's favorite locations
   */
  async getFavoriteLocations(): Promise<ApiResponse<{
    id: string;
    name: string;
    address: string;
    coordinates: LocationCoordinates;
    type: 'home' | 'work' | 'other';
    usageCount: number;
    createdAt: string;
  }[]>> {
    try {
      return await httpClient.get('/locations/favorites');
    } catch (error) {
      console.error('Get favorite locations error:', error);
      throw error;
    }
  }

  async updateLocation(location: LocationCoordinates): Promise<ApiResponse<any>> {
    console.warn('updateLocation is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: {} });
  }

  async updateStatus(status: string): Promise<ApiResponse<any>> {
    console.warn('updateStatus is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: {} });
  }

  async getLocationHistory(limit: number): Promise<ApiResponse<any>> {
    console.warn('getLocationHistory is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: [] });
  }

  async createGeofence(geofence: any): Promise<ApiResponse<any>> {
    console.warn('createGeofence is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: {} });
  }

  async deleteGeofence(geofenceId: string): Promise<ApiResponse<any>> {
    console.warn('deleteGeofence is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: {} });
  }

  async updateSettings(settings: any): Promise<ApiResponse<any>> {
    console.warn('updateSettings is not implemented yet');
    return Promise.resolve({ success: true, status: 'success', message: '', data: {} });
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;
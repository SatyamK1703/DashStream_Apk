import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { locationService } from '../services';

interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

// Hook for searching places
export const useSearchPlaces = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const api = useApi(
    (data: {
      query: string;
      location?: LocationCoordinates;
      radius?: number;
      limit?: number;
    }) => locationService.searchPlaces(data),
    {
      showErrorAlert: false,
      onSuccess: (data) => {
        setSearchResults(data || []);
      },
    }
  );

  const search = async (query: string, options?: {
    location?: LocationCoordinates;
    radius?: number;
    limit?: number;
  }) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    return api.execute({
      query: query.trim(),
      ...options,
    });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    results: searchResults,
    loading: api.loading,
    error: api.error,
    searchQuery,
    search,
    clearSearch,
  };
};

// Hook for nearby places
export const useNearbyPlaces = () => {
  return useApi(
    (data: {
      location: LocationCoordinates;
      radius?: number;
      type?: string;
      limit?: number;
    }) => locationService.getNearbyPlaces(data),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for geocoding
export const useGeocode = () => {
  return useApi(
    (address: string) => locationService.geocodeAddress(address),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for reverse geocoding
export const useReverseGeocode = () => {
  return useApi(
    (location: LocationCoordinates) => locationService.reverseGeocode(location),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for route calculation
export const useCalculateRoute = () => {
  return useApi(
    (data: {
      origin: LocationCoordinates;
      destination: LocationCoordinates;
      mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
      avoidTolls?: boolean;
      avoidHighways?: boolean;
    }) => locationService.calculateRoute(data),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for checking if location is serviceable
export const useLocationServiceable = () => {
  return useApi(
    (location: LocationCoordinates) => locationService.isLocationServiceable(location),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for popular locations
export const usePopularLocations = (city: string | null) => {
  const api = useApi(
    () => locationService.getPopularLocations(city!),
    {
      showErrorAlert: false,
    }
  );

  useEffect(() => {
    if (city) {
      api.execute();
    }
  }, [city]);

  return api;
};

// Hook for favorite locations
export const useFavoriteLocations = () => {
  return useApi(
    () => locationService.getFavoriteLocations(),
    {
      showErrorAlert: false,
    }
  );
};

// Hook for saving favorite location
export const useSaveFavoriteLocation = () => {
  return useApi(
    (data: {
      name: string;
      address: string;
      coordinates: LocationCoordinates;
      type: 'home' | 'work' | 'other';
    }) => locationService.saveFavoriteLocation(data),
    {
      showErrorAlert: true,
    }
  );
};
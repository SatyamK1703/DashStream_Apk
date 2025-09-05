// __tests__/screens/customer/LocationPickerScreen.test.tsx
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import LocationPickerScreen from '../../../src/screens/customer/LocationPickerScreen';
import * as Location from 'expo-location';

// Mock navigation
const mockGoBack = jest.fn();
const mockSetParams = jest.fn();
const mockNavigation: any = {
  goBack: mockGoBack,
  setParams: mockSetParams,
};

const mockRoute: any = {
  params: {
    onLocationSelect: jest.fn(),
    initialLocation: null,
  },
};

// Mock Location module
jest.mock('expo-location');
(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
  },
  timestamp: Date.now(),
});

(Location.geocodeAsync as jest.Mock).mockResolvedValue([
  {
    latitude: 40.7128,
    longitude: -74.0060,
  },
]);

(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

// Mock MapView component
jest.mock('react-native-maps', () => {
  const { View } = require('react-native');
  const MockMapView = (props: any) => {
    return <View testID="map-view" {...props} />;
  };
  const MockMarker = (props: any) => {
    return <View testID="map-marker" {...props} />;
  };
  
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
  };
});

describe('LocationPickerScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default location', async () => {
    const { getByTestId, getByText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for initial location to be set
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Map and marker should be visible
    expect(getByTestId('map-marker')).toBeTruthy();
    
    // UI elements should be visible
    expect(getByText('Search Location')).toBeTruthy();
    expect(getByText('Confirm Location')).toBeTruthy();
    expect(getByText('Current Location')).toBeTruthy();
  });

  it('uses initial location when provided', async () => {
    const initialLocation = {
      latitude: 34.0522,
      longitude: -118.2437,
    };
    
    const routeWithInitialLocation = {
      ...mockRoute,
      params: {
        ...mockRoute.params,
        initialLocation,
      },
    };
    
    const { getByTestId } = render(
      <LocationPickerScreen navigation={mockNavigation} route={routeWithInitialLocation} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Initial location should be used instead of getting current position
    expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
  });

  it('searches for location when search is submitted', async () => {
    const { getByTestId, getByPlaceholderText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Enter search query
    const searchInput = getByPlaceholderText('Search for a location...');
    await act(async () => {
      fireEvent.changeText(searchInput, 'New York');
    });
    
    // Submit search
    await act(async () => {
      fireEvent(searchInput, 'submitEditing');
    });
    
    // Geocode should be called
    expect(Location.geocodeAsync).toHaveBeenCalledWith('New York');
  });

  it('handles search errors gracefully', async () => {
    // Mock geocode to fail
    (Location.geocodeAsync as jest.Mock).mockRejectedValueOnce(new Error('Geocode error'));
    
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Enter search query
    const searchInput = getByPlaceholderText('Search for a location...');
    await act(async () => {
      fireEvent.changeText(searchInput, 'Invalid Location');
    });
    
    // Submit search
    await act(async () => {
      fireEvent(searchInput, 'submitEditing');
    });
    
    // Error message should be shown
    expect(getByText('Location not found. Please try again.')).toBeTruthy();
  });

  it('handles empty search results gracefully', async () => {
    // Mock geocode to return empty array
    (Location.geocodeAsync as jest.Mock).mockResolvedValueOnce([]);
    
    const { getByTestId, getByPlaceholderText, getByText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Enter search query
    const searchInput = getByPlaceholderText('Search for a location...');
    await act(async () => {
      fireEvent.changeText(searchInput, 'Non-existent Location');
    });
    
    // Submit search
    await act(async () => {
      fireEvent(searchInput, 'submitEditing');
    });
    
    // Error message should be shown
    expect(getByText('Location not found. Please try again.')).toBeTruthy();
  });

  it('gets current location when current location button is pressed', async () => {
    const { getByTestId } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Press current location button
    const currentLocationButton = getByTestId('current-location-button');
    await act(async () => {
      fireEvent.press(currentLocationButton);
    });
    
    // getCurrentPositionAsync should be called again
    expect(Location.getCurrentPositionAsync).toHaveBeenCalledTimes(2);
  });

  it('handles current location errors gracefully', async () => {
    // Mock getCurrentPositionAsync to fail on second call
    (Location.getCurrentPositionAsync as jest.Mock)
      .mockResolvedValueOnce({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
        timestamp: Date.now(),
      })
      .mockRejectedValueOnce(new Error('Location error'));
    
    const { getByTestId, getByText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Press current location button
    const currentLocationButton = getByTestId('current-location-button');
    await act(async () => {
      fireEvent.press(currentLocationButton);
    });
    
    // Error message should be shown
    expect(getByText('Could not get current location. Please try again.')).toBeTruthy();
  });

  it('confirms location when confirm button is pressed', async () => {
    const { getByTestId, getByText } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Press confirm button
    const confirmButton = getByText('Confirm Location');
    await act(async () => {
      fireEvent.press(confirmButton);
    });
    
    // onLocationSelect should be called with the selected location
    expect(mockRoute.params.onLocationSelect).toHaveBeenCalled();
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('updates marker position when map region changes', async () => {
    const { getByTestId } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Simulate map region change
    const mapView = getByTestId('map-view');
    await act(async () => {
      fireEvent(mapView, 'onRegionChangeComplete', {
        latitude: 51.5074,
        longitude: -0.1278,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    });
    
    // Marker position should be updated
    const marker = getByTestId('map-marker');
    expect(marker.props.coordinate).toEqual({
      latitude: 51.5074,
      longitude: -0.1278,
    });
  });

  it('handles invalid coordinates gracefully', async () => {
    const { getByTestId } = render(
      <LocationPickerScreen navigation={mockNavigation} route={mockRoute} />
    );
    
    // Wait for map to be visible
    await waitFor(() => {
      expect(getByTestId('map-view')).toBeTruthy();
    });
    
    // Simulate map region change with invalid coordinates
    const mapView = getByTestId('map-view');
    await act(async () => {
      fireEvent(mapView, 'onRegionChangeComplete', {
        latitude: NaN,
        longitude: -0.1278,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    });
    
    // Should not crash and marker should maintain previous valid position
    expect(getByTestId('map-marker')).toBeTruthy();
  });
});
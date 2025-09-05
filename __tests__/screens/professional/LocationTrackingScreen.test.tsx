// __tests__/screens/professional/LocationTrackingScreen.test.tsx
import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import LocationTrackingScreen from '../../../src/screens/professional/LocationTrackingScreen';
import { LocationContext } from '../../../src/contexts/LocationContext';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation: any = {
  navigate: mockNavigate,
};

// Mock location context values
const mockStartTracking = jest.fn().mockResolvedValue(true);
const mockStopTracking = jest.fn().mockResolvedValue(true);
const mockUpdateUserStatus = jest.fn().mockResolvedValue(true);
const mockRefreshLocationHistory = jest.fn().mockResolvedValue(true);
const mockConfigureTracking = jest.fn().mockResolvedValue(true);

const mockLocationContext = {
  currentLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
    timestamp: Date.now(),
    accuracy: 10,
    speed: 0,
    altitude: 0,
    heading: 0,
  },
  locationHistory: [
    {
      latitude: 37.7749,
      longitude: -122.4194,
      timestamp: Date.now() - 60000,
      accuracy: 10,
      speed: 0,
      altitude: 0,
      heading: 0,
    },
    {
      latitude: 37.7750,
      longitude: -122.4195,
      timestamp: Date.now(),
      accuracy: 10,
      speed: 0,
      altitude: 0,
      heading: 0,
    },
  ],
  isTracking: false,
  userStatus: 'available',
  error: null,
  startTracking: mockStartTracking,
  stopTracking: mockStopTracking,
  updateUserStatus: mockUpdateUserStatus,
  refreshLocationHistory: mockRefreshLocationHistory,
  addGeofence: jest.fn(),
  removeGeofence: jest.fn(),
  configureTracking: mockConfigureTracking,
};

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

describe('LocationTrackingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithContext = (contextValue = mockLocationContext) => {
    return render(
      <LocationContext.Provider value={contextValue}>
        <LocationTrackingScreen navigation={mockNavigation} />
      </LocationContext.Provider>
    );
  };

  it('renders correctly with location data', () => {
    const { getByTestId, getByText } = renderWithContext();
    
    // Map should be rendered
    expect(getByTestId('map-view')).toBeTruthy();
    
    // Status controls should be visible
    expect(getByText('Available')).toBeTruthy();
    expect(getByText('Busy')).toBeTruthy();
    expect(getByText('Offline')).toBeTruthy();
    
    // Tracking toggle should be visible
    expect(getByText('Location Tracking')).toBeTruthy();
  });

  it('toggles tracking when switch is pressed', async () => {
    const { getByTestId } = renderWithContext();
    
    // Find the tracking toggle switch
    const trackingSwitch = getByTestId('tracking-switch');
    
    // Toggle tracking on
    await act(async () => {
      fireEvent(trackingSwitch, 'valueChange', true);
    });
    
    expect(mockStartTracking).toHaveBeenCalled();
    
    // Toggle tracking off
    await act(async () => {
      fireEvent(trackingSwitch, 'valueChange', false);
    });
    
    expect(mockStopTracking).toHaveBeenCalled();
  });

  it('updates user status when status button is pressed', async () => {
    const { getByText } = renderWithContext();
    
    // Press the Busy status button
    await act(async () => {
      fireEvent.press(getByText('Busy'));
    });
    
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('busy');
    
    // Press the Offline status button
    await act(async () => {
      fireEvent.press(getByText('Offline'));
    });
    
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('offline');
    
    // Press the Available status button
    await act(async () => {
      fireEvent.press(getByText('Available'));
    });
    
    expect(mockUpdateUserStatus).toHaveBeenCalledWith('available');
  });

  it('saves tracking configuration when save button is pressed', async () => {
    const { getByText, getByTestId } = renderWithContext();
    
    // Open the configuration panel
    await act(async () => {
      fireEvent.press(getByText('Configuration'));
    });
    
    // Change update interval slider
    await act(async () => {
      fireEvent(getByTestId('update-interval-slider'), 'valueChange', 30);
    });
    
    // Change movement threshold slider
    await act(async () => {
      fireEvent(getByTestId('movement-threshold-slider'), 'valueChange', 25);
    });
    
    // Toggle battery optimization
    await act(async () => {
      fireEvent(getByTestId('battery-optimization-switch'), 'valueChange', true);
    });
    
    // Press save button
    await act(async () => {
      fireEvent.press(getByText('Save Configuration'));
    });
    
    expect(mockConfigureTracking).toHaveBeenCalledWith({
      updateInterval: 30000, // 30 seconds in ms
      significantChangeThreshold: 25,
      batteryOptimizationEnabled: true,
    });
  });

  it('refreshes location history when refresh button is pressed', async () => {
    const { getByTestId } = renderWithContext();
    
    // Press the refresh button
    await act(async () => {
      fireEvent.press(getByTestId('refresh-history-button'));
    });
    
    expect(mockRefreshLocationHistory).toHaveBeenCalled();
  });

  it('displays error message when there is an error', () => {
    const contextWithError = {
      ...mockLocationContext,
      error: 'Test error message',
    };
    
    const { getByText } = renderWithContext(contextWithError);
    
    expect(getByText('Error: Test error message')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('retries initialization when retry button is pressed', async () => {
    const contextWithError = {
      ...mockLocationContext,
      error: 'Test error message',
    };
    
    const { getByText } = renderWithContext(contextWithError);
    
    // Press the retry button
    await act(async () => {
      fireEvent.press(getByText('Retry'));
    });
    
    expect(mockRefreshLocationHistory).toHaveBeenCalled();
  });

  it('displays location history items correctly', () => {
    const { getAllByTestId } = renderWithContext();
    
    // Should have two history items
    const historyItems = getAllByTestId('history-item');
    expect(historyItems).toHaveLength(2);
  });

  it('handles empty location history gracefully', () => {
    const contextWithNoHistory = {
      ...mockLocationContext,
      locationHistory: [],
    };
    
    const { getByText } = renderWithContext(contextWithNoHistory);
    
    expect(getByText('No location history available')).toBeTruthy();
  });
});
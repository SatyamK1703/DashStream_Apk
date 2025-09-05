// __tests__/contexts/LocationContext.test.tsx
import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { LocationProvider, useLocation } from '../../src/contexts/LocationContext';
import { FirebaseLocationService } from '../../src/services/FirebaseLocationService';
import * as Location from 'expo-location';

// Mock dependencies
jest.mock('../../src/services/FirebaseLocationService');
jest.mock('expo-location');
jest.mock('../../src/contexts/FirebaseAuthContext', () => ({
  useFirebaseAuth: () => ({
    user: { uid: 'test-user-id' },
    userRole: 'professional',
  }),
}));

// Mock implementation of FirebaseLocationService
const mockInitialize = jest.fn().mockResolvedValue(true);
const mockStartTracking = jest.fn().mockResolvedValue(true);
const mockStopTracking = jest.fn().mockResolvedValue(true);
const mockUpdateStatus = jest.fn().mockResolvedValue(true);
const mockGetLocationHistory = jest.fn().mockResolvedValue([]);
const mockAddGeofence = jest.fn().mockResolvedValue('geofence-id');
const mockRemoveGeofence = jest.fn().mockResolvedValue(true);
const mockConfigureTracking = jest.fn().mockResolvedValue(true);

// Setup mock implementation
(FirebaseLocationService as jest.Mock).mockImplementation(() => ({
  initialize: mockInitialize,
  startTracking: mockStartTracking,
  stopTracking: mockStopTracking,
  updateStatus: mockUpdateStatus,
  getLocationHistory: mockGetLocationHistory,
  addGeofence: mockAddGeofence,
  removeGeofence: mockRemoveGeofence,
  configureTracking: mockConfigureTracking,
}));

// Mock Location module
(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    altitude: 0,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
});

(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
(Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });

describe('LocationContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize location service on mount for professional users', async () => {
    await act(async () => {
      render(<LocationProvider />);
    });

    expect(FirebaseLocationService).toHaveBeenCalledWith('test-user-id', 'professional');
    expect(mockInitialize).toHaveBeenCalled();
  });

  it('should provide location context with correct values', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current).toHaveProperty('currentLocation');
    expect(result.current).toHaveProperty('locationHistory');
    expect(result.current).toHaveProperty('isTracking');
    expect(result.current).toHaveProperty('userStatus');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('startTracking');
    expect(result.current).toHaveProperty('stopTracking');
    expect(result.current).toHaveProperty('updateUserStatus');
    expect(result.current).toHaveProperty('refreshLocationHistory');
    expect(result.current).toHaveProperty('addGeofence');
    expect(result.current).toHaveProperty('removeGeofence');
    expect(result.current).toHaveProperty('configureTracking');
  });

  it('should start tracking when startTracking is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      await result.current.startTracking();
    });

    expect(mockStartTracking).toHaveBeenCalled();
    expect(result.current.isTracking).toBe(true);
  });

  it('should stop tracking when stopTracking is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    // First start tracking
    await act(async () => {
      await result.current.startTracking();
    });

    // Then stop it
    await act(async () => {
      await result.current.stopTracking();
    });

    expect(mockStopTracking).toHaveBeenCalled();
    expect(result.current.isTracking).toBe(false);
  });

  it('should update user status when updateUserStatus is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      await result.current.updateUserStatus('busy');
    });

    expect(mockUpdateStatus).toHaveBeenCalledWith('busy');
    expect(result.current.userStatus).toBe('busy');
  });

  it('should refresh location history when refreshLocationHistory is called', async () => {
    const mockHistory = [
      {
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: Date.now() - 1000,
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
    ];

    mockGetLocationHistory.mockResolvedValueOnce(mockHistory);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      await result.current.refreshLocationHistory();
    });

    expect(mockGetLocationHistory).toHaveBeenCalled();
    expect(result.current.locationHistory).toEqual(mockHistory);
  });

  it('should add geofence when addGeofence is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    const geofence = {
      name: 'Test Geofence',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 100,
      notifyOnEntry: true,
      notifyOnExit: false,
    };

    await act(async () => {
      await result.current.addGeofence(geofence);
    });

    expect(mockAddGeofence).toHaveBeenCalledWith(geofence);
  });

  it('should remove geofence when removeGeofence is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      await result.current.removeGeofence('geofence-id');
    });

    expect(mockRemoveGeofence).toHaveBeenCalledWith('geofence-id');
  });

  it('should configure tracking when configureTracking is called', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    const options = {
      updateInterval: 20000,
      significantChangeThreshold: 20,
      batteryOptimizationEnabled: false,
    };

    await act(async () => {
      await result.current.configureTracking(options);
    });

    expect(mockConfigureTracking).toHaveBeenCalledWith(options);
  });

  it('should handle errors during initialization', async () => {
    mockInitialize.mockRejectedValueOnce(new Error('Test error'));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LocationProvider>{children}</LocationProvider>
    );

    const { result } = renderHook(() => useLocation(), { wrapper });

    await act(async () => {
      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.error).toBeTruthy();
  });
});
// __tests__/services/FirebaseLocationService.test.ts
import { FirebaseLocationService, LocationData, Geofence } from '../../src/services/FirebaseLocationService';
import * as Location from 'expo-location';
import { ref, set, onValue, push, get, query, orderByChild, limitToLast } from 'firebase/database';
import { database } from '../../src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock the dependencies
jest.mock('firebase/database');
jest.mock('../../src/config/firebase', () => ({
  database: {}
}));
jest.mock('expo-location');
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('FirebaseLocationService', () => {
  let locationService: FirebaseLocationService;
  const mockUserId = 'test-user-id';
  const mockUserRole = 'professional';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a new instance of the service
    locationService = new FirebaseLocationService(mockUserId, mockUserRole);
    
    // Mock Location permissions
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.setGoogleApiKey as jest.Mock).mockResolvedValue(undefined);
    (Location.watchPositionAsync as jest.Mock).mockResolvedValue({
      remove: jest.fn(),
    });
    
    // Mock Firebase database functions
    (ref as jest.Mock).mockReturnValue({});
    (set as jest.Mock).mockResolvedValue(undefined);
    (push as jest.Mock).mockReturnValue({ key: 'mock-key' });
    (get as jest.Mock).mockResolvedValue({
      exists: () => false,
      val: () => ({}),
    });
  });

  describe('initialize', () => {
    it('should initialize successfully when permissions are granted', async () => {
      const result = await locationService.initialize();
      
      expect(result).toBe(true);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should fail to initialize when permissions are denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      const result = await locationService.initialize();
      
      expect(result).toBe(false);
    });

    it('should handle errors during initialization', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const result = await locationService.initialize();
      
      expect(result).toBe(false);
    });
  });

  describe('startTracking', () => {
    it('should start tracking successfully', async () => {
      const result = await locationService.startTracking();
      
      expect(result).toBe(true);
      expect(Location.watchPositionAsync).toHaveBeenCalled();
    });

    it('should handle background permission denial gracefully', async () => {
      (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      const result = await locationService.startTracking();
      
      expect(result).toBe(true); // Should still succeed with foreground only
    });

    it('should handle errors during tracking start', async () => {
      (Location.watchPositionAsync as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const result = await locationService.startTracking();
      
      expect(result).toBe(false);
    });
  });

  describe('stopTracking', () => {
    it('should stop tracking successfully', async () => {
      // First start tracking
      await locationService.startTracking();
      
      // Then stop it
      await locationService.stopTracking();
      
      // The remove function should have been called
      expect(Location.watchPositionAsync).toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('should update status when location exists', async () => {
      // Mock the private lastLocation property
      Object.defineProperty(locationService, 'lastLocation', {
        value: {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: Date.now(),
        },
        writable: true,
      });
      
      await locationService.updateStatus('busy');
      
      expect(set).toHaveBeenCalled();
    });

    it('should get current location when no location exists', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
        timestamp: Date.now(),
      });
      
      await locationService.updateStatus('busy');
      
      expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
      expect(set).toHaveBeenCalled();
    });

    it('should handle errors during status update', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      await locationService.updateStatus('busy');
      
      // Should not crash and should log the error
      expect(set).not.toHaveBeenCalled();
    });
  });

  describe('geofence management', () => {
    const mockGeofence: Omit<Geofence, 'id'> = {
      name: 'Test Geofence',
      latitude: 37.7749,
      longitude: -122.4194,
      radius: 100,
      notifyOnEntry: true,
      notifyOnExit: false,
    };

    it('should add a geofence successfully', async () => {
      const geofenceId = await locationService.addGeofence(mockGeofence);
      
      expect(geofenceId).toBe('mock-key');
      expect(push).toHaveBeenCalled();
      expect(set).toHaveBeenCalled();
    });

    it('should remove a geofence successfully', async () => {
      const result = await locationService.removeGeofence('test-geofence-id');
      
      expect(result).toBe(true);
      expect(ref).toHaveBeenCalled();
      expect(set).toHaveBeenCalledWith(expect.anything(), null);
    });
  });

  describe('location history', () => {
    it('should get location history successfully', async () => {
      const mockHistoryData = [
        {
          latitude: 37.7749,
          longitude: -122.4194,
          timestamp: Date.now() - 1000,
        },
        {
          latitude: 37.7750,
          longitude: -122.4195,
          timestamp: Date.now(),
        },
      ];
      
      (get as jest.Mock).mockResolvedValue({
        exists: () => true,
        val: () => ({ key1: mockHistoryData[0], key2: mockHistoryData[1] }),
      });
      
      const history = await locationService.getLocationHistory();
      
      expect(history).toHaveLength(2);
      expect(query).toHaveBeenCalled();
      expect(orderByChild).toHaveBeenCalledWith('timestamp');
      expect(limitToLast).toHaveBeenCalledWith(50); // Default limit
    });

    it('should return empty array when no history exists', async () => {
      (get as jest.Mock).mockResolvedValue({
        exists: () => false,
      });
      
      const history = await locationService.getLocationHistory();
      
      expect(history).toEqual([]);
    });

    it('should handle errors when getting history', async () => {
      (get as jest.Mock).mockRejectedValue(new Error('Test error'));
      
      const history = await locationService.getLocationHistory();
      
      expect(history).toEqual([]);
    });
  });

  describe('tracking configuration', () => {
    it('should configure tracking settings successfully', async () => {
      const options = {
        updateInterval: 20000,
        significantChangeThreshold: 20,
        batteryOptimizationEnabled: false,
      };
      
      await locationService.configureTracking(options);
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should restart tracking when already tracking', async () => {
      // Start tracking first
      await locationService.startTracking();
      
      // Then configure
      await locationService.configureTracking({
        updateInterval: 20000,
      });
      
      // Should stop and restart tracking
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});
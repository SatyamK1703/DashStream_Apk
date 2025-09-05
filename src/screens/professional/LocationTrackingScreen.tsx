// src/screens/professional/LocationTrackingScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { LocationData } from '../../services/LocationApiService';

const LocationTrackingScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const {
    currentLocation,
    locationHistory,
    isTracking,
    isLoading,
    error,
    startTracking,
    stopTracking,
    updateStatus,
    getLocationHistory,
    configureTracking,
  } = useLocation();

  // Local state
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('available');
  const [updateInterval, setUpdateInterval] = useState<number>(10000); // 10 seconds
  const [significantChangeThreshold, setSignificantChangeThreshold] = useState<number>(10); // 10 meters
  const [batteryOptimizationEnabled, setBatteryOptimizationEnabled] = useState<boolean>(true);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyLimit, setHistoryLimit] = useState<number>(50);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Check if user is a professional
  useEffect(() => {
    if (user && user.role !== 'professional') {
      Alert.alert(
        'Access Restricted',
        'Location tracking is only available for professional users.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [user, navigation]);

  // Handle tracking toggle
  const handleTrackingToggle = async () => {
    try {
      if (isTracking) {
        await stopTracking();
      } else {
        const success = await startTracking();
        if (success) {
          Alert.alert(
            'Location Tracking Started',
            'Your location is now being tracked. You can change your status or stop tracking at any time.'
          );
        }
      }
    } catch (error) {
      console.error('Error toggling tracking:', error);
      Alert.alert('Error', 'Failed to toggle location tracking. Please try again.');
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    try {
      setStatus(newStatus);
      await updateStatus(newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  // Handle configuration save
  const handleSaveConfiguration = async () => {
    try {
      await configureTracking({
        updateInterval,
        significantChangeThreshold,
        batteryOptimizationEnabled,
      });
      
      Alert.alert('Success', 'Tracking configuration saved successfully.');
    } catch (error) {
      console.error('Error saving configuration:', error);
      Alert.alert('Error', 'Failed to save configuration. Please try again.');
    }
  };

  // Refresh location history
  const refreshLocationHistory = async () => {
    try {
      setRefreshing(true);
      await getLocationHistory(historyLimit);
    } catch (error) {
      console.error('Error refreshing location history:', error);
      Alert.alert('Error', 'Failed to refresh location history. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Render map with current location
  const renderMap = () => {
    if (!currentLocation) {
      return (
        <View style={styles.mapPlaceholder}>
          <Text style={styles.placeholderText}>No location data available</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Current Location"
            description={`Status: ${status}`}
          />
          <Circle
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            radius={currentLocation.accuracy || 50}
            fillColor="rgba(0, 150, 255, 0.2)"
            strokeColor="rgba(0, 150, 255, 0.5)"
          />
        </MapView>
        <View style={styles.mapOverlay}>
          <View style={[styles.statusIndicator, getStatusColor(status)]} />
          <Text style={styles.statusText}>{getStatusText(status)}</Text>
        </View>
      </View>
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return { backgroundColor: '#4CAF50' }; // Green
      case 'busy':
        return { backgroundColor: '#FFC107' }; // Yellow
      case 'offline':
        return { backgroundColor: '#F44336' }; // Red
      default:
        return { backgroundColor: '#9E9E9E' }; // Grey
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  // Render location history
  const renderLocationHistory = () => {
    if (locationHistory.length === 0) {
      return (
        <View style={styles.historyEmptyContainer}>
          <Text style={styles.historyEmptyText}>No location history available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.historyContainer}>
        {locationHistory.map((location: LocationData, index: number) => (
          <View key={index} style={styles.historyItem}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTimestamp}>{formatTimestamp(location.timestamp)}</Text>
              <View style={[styles.historyStatusIndicator, getStatusColor(location.status || 'unknown')]} />
            </View>
            <Text style={styles.historyCoordinates}>
              Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
            </Text>
            {location.speed !== null && location.speed !== undefined && (
              <Text style={styles.historyDetail}>Speed: {(location.speed * 3.6).toFixed(1)} km/h</Text>
            )}
            {location.accuracy !== null && location.accuracy !== undefined && (
              <Text style={styles.historyDetail}>Accuracy: {location.accuracy.toFixed(1)} m</Text>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading location service...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.replace('LocationTrackingScreen')}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Tracking</Text>
      </View>

      {renderMap()}

      <ScrollView style={styles.content}>
        {/* Tracking Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Controls</Text>
          <View style={styles.trackingControl}>
            <Text style={styles.trackingLabel}>Enable Location Tracking</Text>
            <Switch
              value={isTracking}
              onValueChange={handleTrackingToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isTracking ? '#0066CC' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>

          {/* Status Controls */}
          {isTracking && (
            <View style={styles.statusControls}>
              <Text style={styles.statusLabel}>Set Your Status:</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'available' && styles.statusButtonActive]}
                  onPress={() => handleStatusChange('available')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={styles.statusButtonText}>Available</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'busy' && styles.statusButtonActive]}
                  onPress={() => handleStatusChange('busy')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#FFC107' }]} />
                  <Text style={styles.statusButtonText}>Busy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, status === 'offline' && styles.statusButtonActive]}
                  onPress={() => handleStatusChange('offline')}
                >
                  <View style={[styles.statusDot, { backgroundColor: '#F44336' }]} />
                  <Text style={styles.statusButtonText}>Offline</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Configuration</Text>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Update Interval: {updateInterval / 1000} seconds</Text>
            <Slider
              style={styles.slider}
              minimumValue={5000}
              maximumValue={60000}
              step={5000}
              value={updateInterval}
              onValueChange={setUpdateInterval}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#CCCCCC"
              thumbTintColor="#0066CC"
            />
          </View>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>
              Movement Threshold: {significantChangeThreshold} meters
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={5}
              maximumValue={100}
              step={5}
              value={significantChangeThreshold}
              onValueChange={setSignificantChangeThreshold}
              minimumTrackTintColor="#0066CC"
              maximumTrackTintColor="#CCCCCC"
              thumbTintColor="#0066CC"
            />
          </View>
          
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>Battery Optimization</Text>
            <Switch
              value={batteryOptimizationEnabled}
              onValueChange={setBatteryOptimizationEnabled}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={batteryOptimizationEnabled ? '#0066CC' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveConfiguration}>
            <Text style={styles.saveButtonText}>Save Configuration</Text>
          </TouchableOpacity>
        </View>

        {/* Location History */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.historyHeader}
            onPress={() => setShowHistory(!showHistory)}
          >
            <Text style={styles.sectionTitle}>Location History</Text>
            <Ionicons
              name={showHistory ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#333"
            />
          </TouchableOpacity>
          
          {showHistory && (
            <View>
              <View style={styles.historyControls}>
                <Text style={styles.historyLabel}>Show last {historyLimit} locations</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={10}
                  maximumValue={100}
                  step={10}
                  value={historyLimit}
                  onValueChange={setHistoryLimit}
                  minimumTrackTintColor="#0066CC"
                  maximumTrackTintColor="#CCCCCC"
                  thumbTintColor="#0066CC"
                />
                <TouchableOpacity
                  style={styles.refreshButton}
                  onPress={refreshLocationHistory}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.refreshButtonText}>Refresh History</Text>
                  )}
                </TouchableOpacity>
              </View>
              
              {renderLocationHistory()}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    height: 250,
    width: '100%',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  trackingControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackingLabel: {
    fontSize: 16,
    color: '#333',
  },
  statusControls: {
    marginTop: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
  },
  statusButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#0066CC',
    borderWidth: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusButtonText: {
    fontSize: 14,
    color: '#333',
  },
  configItem: {
    marginBottom: 16,
  },
  configLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  saveButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyControls: {
    marginBottom: 16,
  },
  historyLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  refreshButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyContainer: {
    maxHeight: 300,
  },
  historyEmptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  historyEmptyText: {
    fontSize: 16,
    color: '#666',
  },
  historyItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTimestamp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyCoordinates: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  historyDetail: {
    fontSize: 14,
    color: '#666',
  },
});

export default LocationTrackingScreen;
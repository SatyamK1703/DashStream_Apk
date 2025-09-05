import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_CONFIG } from '../../constants/config';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
  status?: string;
}

interface ProfessionalData {
  _id: string;
  name: string;
  phone: string;
  status: string;
  location?: LocationData;
}

const ProfessionalLocationScreen = () => {
  const { authState } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef<MapView | null>(null);
  
  // Get professional ID from route params
  const { professionalId, professionalName } = route.params as { 
    professionalId: string;
    professionalName: string;
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [professional, setProfessional] = useState<ProfessionalData | null>(null);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
    } catch (err) {
      console.error('Error getting user location:', err);
      setError('Failed to get your location');
    }
  };

  // Fetch professional's location
  const fetchProfessionalLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${API_CONFIG.BASE_URL}/location/professional/${professionalId}`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.data.success && response.data.data) {
        // Extract location data from response
        const locationData = response.data.data.current || {};
        
        // Create professional object with properly formatted location
        setProfessional({
          _id: professionalId,
          name: professionalName,
          phone: response.data.data.phone || '',
          status: response.data.data.status || 'offline',
          location: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy || 0,
            timestamp: locationData.timestamp || new Date().toISOString()
          },
        });

        // Center map on professional's location if available
        if (locationData.latitude && locationData.longitude && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        setError('Professional location data not available');
      }
    } catch (err: any) {
      console.error('Error fetching professional location:', err);
      setError(err.response?.data?.message || 'Failed to fetch professional location');
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to location updates
  const subscribeToLocationUpdates = async () => {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/location/subscribe/${professionalId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.data.success) {
        setSubscribed(true);
        Alert.alert('Subscribed', 'You will now receive real-time location updates');
        
        // Set up refresh interval
        const interval = setInterval(fetchProfessionalLocation, 10000); // Refresh every 10 seconds
        setRefreshInterval(interval);
      }
    } catch (err: any) {
      console.error('Error subscribing to location updates:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to subscribe to location updates');
    }
  };

  // Unsubscribe from location updates
  const unsubscribeFromLocationUpdates = async () => {
    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/location/unsubscribe/${professionalId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.data.success) {
        setSubscribed(false);
        Alert.alert('Unsubscribed', 'You will no longer receive real-time location updates');
        
        // Clear refresh interval
        if (refreshInterval) {
          clearInterval(refreshInterval);
          setRefreshInterval(null);
        }
      }
    } catch (err: any) {
      console.error('Error unsubscribing from location updates:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to unsubscribe from location updates');
    }
  };

  // Initialize component
  useEffect(() => {
    getUserLocation();
    fetchProfessionalLocation();

    // Clean up on unmount
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      
      // Attempt to unsubscribe when leaving the screen
      if (subscribed) {
        unsubscribeFromLocationUpdates();
      }
    };
  }, [professionalId]);

  // Render map with professional's location
  const renderMap = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading location data...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchProfessionalLocation}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: professional?.location?.latitude || 37.78825,
          longitude: professional?.location?.longitude || -122.4324,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {professional?.location && (
          <Marker
            coordinate={{
              latitude: professional.location.latitude,
              longitude: professional.location.longitude,
            }}
            title={professional.name}
            description={`Status: ${professional.status}`}
            pinColor={professional.status === 'available' ? 'green' : professional.status === 'busy' ? 'orange' : 'red'}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.markerDot, { backgroundColor: professional.status === 'available' ? 'green' : professional.status === 'busy' ? 'orange' : 'red' }]} />
              <View style={styles.markerPulse} />
            </View>
          </Marker>
        )}

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}
      </MapView>
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}
      
      {professional && (
        <View style={styles.infoContainer}>
          <Text style={styles.professionalName}>{professional.name}</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: professional.status === 'available' ? 'green' : professional.status === 'busy' ? 'orange' : 'red' }]} />
            <Text style={styles.statusText}>{professional.status.charAt(0).toUpperCase() + professional.status.slice(1)}</Text>
          </View>
          
          {professional.location?.timestamp && (
            <Text style={styles.lastUpdateText}>
              Last updated: {new Date(professional.location.timestamp).toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={fetchProfessionalLocation}
        >
          <Ionicons name="refresh" size={24} color="white" />
          <Text style={styles.buttonText}>Refresh</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.subscribeButton, subscribed ? styles.unsubscribeButton : {}]} 
          onPress={subscribed ? unsubscribeFromLocationUpdates : subscribeToLocationUpdates}
        >
          <Ionicons name={subscribed ? "notifications-off" : "notifications"} size={24} color="white" />
          <Text style={styles.buttonText}>{subscribed ? 'Unsubscribe' : 'Subscribe'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0066CC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  unsubscribeButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'white',
  },
  markerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.2)',
  },
});

export default ProfessionalLocationScreen;
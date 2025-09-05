import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';

// Mock types for self-contained component
type ProStackParamList = {
  RouteTracking: { jobId: string };
  JobDetails: { jobId: string };
};

type RouteTrackingScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type RouteTrackingScreenRouteProp = RouteProp<ProStackParamList, 'RouteTracking'>;

interface JobLocation {
  id: string;
  customerName: string;
  customerImage: string;
  customerPhone: string;
  address: string;
  location: { latitude: number; longitude: number };
  services: string[];
  totalAmount: number;
}

const RouteTrackingScreen = () => {
  const navigation = useNavigation<RouteTrackingScreenNavigationProp>();
  const route = useRoute<RouteTrackingScreenRouteProp>();
  const { jobId } = route.params;
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState('...');
  const [duration, setDuration] = useState('...');

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        Alert.alert('Location Error', 'Unable to get your current location.');
      }
    };

    const fetchJobDetails = () => {
      const mockJob: JobLocation = {
        id: 'JOB123456', customerName: 'Priya Sharma', customerImage: 'https://randomuser.me/api/portraits/women/44.jpg', customerPhone: '+91 9876543210', address: '123 Main St, Koramangala, Bangalore', location: { latitude: 12.9352, longitude: 77.6245 }, services: ['Premium Wash', 'Interior Cleaning'], totalAmount: 998,
      };
      setTimeout(() => {
        setJob(mockJob);
        setLoading(false);
      }, 1000);
    };

    requestLocationPermission();
    fetchJobDetails();
  }, [jobId, navigation]);

  const fitMapToMarkers = () => {
    if (mapRef.current && currentLocation && job) {
      mapRef.current.fitToCoordinates([currentLocation, job.location], {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  const handleCallCustomer = () => {
    if (job?.customerPhone) {
      Linking.openURL(`tel:${job.customerPhone}`);
    }
  };

  const handleOpenExternalNavigation = () => {
    if (job) {
      const url = Platform.select({
        ios: `maps:0,0?q=${job.location.latitude},${job.location.longitude}`,
        android: `geo:0,0?q=${job.location.latitude},${job.location.longitude}(${job.customerName})`,
      });
      if(url) Linking.openURL(url);
    }
  };

  if (loading || !currentLocation || !job) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {loading ? 'Loading job details...' : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...currentLocation, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={fitMapToMarkers}
      >
        <Marker coordinate={job.location} title={job.customerName}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={20} color={colors.white} />
          </View>
        </Marker>
        <MapViewDirections
          origin={currentLocation}
          destination={job.location}
          apikey={"YOUR_GOOGLE_MAPS_API_KEY"} // Replace with your key
          strokeWidth={4}
          strokeColor={colors.primary}
          onReady={result => {
            setDistance(`${result.distance.toFixed(1)} km`);
            setDuration(`${Math.ceil(result.duration)} min`);
          }}
        />
      </MapView>

      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={fitMapToMarkers}>
          <Ionicons name="locate" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.navigateButton} onPress={handleOpenExternalNavigation}>
        <Ionicons name="navigate" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <View style={styles.customerInfo}>
          <Image source={{ uri: job.customerImage }} style={styles.customerImage} />
          <View style={styles.customerTextContainer}>
            <Text style={styles.customerName}>{job.customerName}</Text>
            <Text style={styles.customerAddress} numberOfLines={1}>{job.address}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
            <Ionicons name="call" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.etaInfo}>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Distance</Text><Text style={styles.etaValue}>{distance}</Text></View>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Duration</Text><Text style={styles.etaValue}>{duration}</Text></View>
          <View style={styles.etaItem}><Text style={styles.etaLabel}>Amount</Text><Text style={styles.etaValue}>₹{job.totalAmount}</Text></View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('JobDetails', { jobId })}>
          <Text style={styles.primaryButtonText}>I've Arrived / View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray300: '#D1D5DB',
  gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937', red500: '#EF4444',
  blue50: '#EFF6FF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  loadingText: { color: colors.gray600, marginTop: 16 },
  headerControls: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 60, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  controlButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5 },
  navigateButton: { position: 'absolute', bottom: 320, right: 16, backgroundColor: colors.white, padding: 12, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  markerContainer: { backgroundColor: colors.red500, padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.white },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 16, paddingTop: 8, paddingBottom: Platform.OS === 'android' ? 16 : 32, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 10 },
  handle: { width: 64, height: 4, backgroundColor: colors.gray300, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  customerImage: { width: 48, height: 48, borderRadius: 24 },
  customerTextContainer: { flex: 1, marginLeft: 12 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  customerAddress: { color: colors.gray500, fontSize: 14 },
  callButton: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  etaInfo: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.blue50, padding: 12, borderRadius: 12, marginBottom: 16 },
  etaItem: { alignItems: 'center' },
  etaLabel: { color: colors.gray500, fontSize: 12 },
  etaValue: { color: colors.gray800, fontWeight: 'bold' },
  primaryButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default RouteTrackingScreen;


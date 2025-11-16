import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
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
import { useProfessionalJob } from '../../hooks/useProfessional';
import { JobDetails } from '../../services/professionalService';
import CustomAlert from '../../utils/CustomAlert';

type ProStackParamList = {
  RouteTracking: { jobId: string };
  JobDetails: { jobId: string };
};

type RouteTrackingScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type RouteTrackingScreenRouteProp = RouteProp<ProStackParamList, 'RouteTracking'>;

const RouteTrackingScreen = () => {
  const navigation = useNavigation<RouteTrackingScreenNavigationProp>();
  const route = useRoute<RouteTrackingScreenRouteProp>();
  const { jobId } = route.params;
  const mapRef = useRef<MapView>(null);

  const { data: job, isLoading: jobLoading, error: jobError } = useProfessionalJob(jobId);

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState('...');
  const [duration, setDuration] = useState('...');

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        CustomAlert.alert('Permission Denied', 'Location permission is required.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } catch (error) {
        CustomAlert.alert('Location Error', 'Unable to get your current location.');
      }
    };

    requestLocationPermission();
  }, [navigation]);

  const destination = job?.address?.coordinates ? { latitude: job.address.coordinates.lat, longitude: job.address.coordinates.lng } : null;
  const addressString = job?.address ? `${job.address.street}, ${job.address.city}` : '';

  const fitMapToMarkers = () => {
    if (mapRef.current && currentLocation && destination) {
      mapRef.current.fitToCoordinates([currentLocation, destination], {
        edgePadding: { top: 100, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  const handleCallCustomer = () => {
    if (job?.customer?.phone) {
      Linking.openURL(`tel:${job.customer.phone}`);
    }
  };

  const handleOpenExternalNavigation = () => {
    if (job && destination) {
      const url = Platform.select({
        ios: `maps:0,0?q=${destination.latitude},${destination.longitude}`,
        android: `geo:0,0?q=${destination.latitude},${destination.longitude}(${job.customer.name})`,
      });
      if(url) Linking.openURL(url);
    }
  };

  if (jobLoading || !currentLocation) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>
          {jobLoading ? 'Loading job details...' : 'Getting your location...'}
        </Text>
      </View>
    );
  }

  if (jobError || !job || !destination) {
    return (
        <View style={styles.centeredScreen}>
            <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
            <Text style={{fontSize: 18, fontWeight: 'bold', marginTop: 16}}>Error Loading Job</Text>
            <Text style={{color: '#6B7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 20}}>{jobError || 'Could not load job details. Please try again.'}</Text>
            <TouchableOpacity style={{marginTop: 24, backgroundColor: "#2563EB", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8}} onPress={() => navigation.goBack()}>
                <Text style={{color: 'white', fontWeight: 'bold'}}>Go Back</Text>
            </TouchableOpacity>
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
        <Marker coordinate={destination} title={job.customer.name}>
          <View style={styles.markerContainer}>
            <Ionicons name="location" size={20} color={"#FFFFFF"} />
          </View>
        </Marker>
        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={"YOUR_GOOGLE_MAPS_API_KEY"} // Replace with your key
          strokeWidth={4}
          strokeColor={"#2563EB"}
          onReady={result => {
            setDistance(`${result.distance.toFixed(1)} km`);
            setDuration(`${Math.ceil(result.duration)} min`);
          }}
        />
      </MapView>

      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.controlButton} onPress={() => navigation.goBack()}>
          <View style={styles.controlButtonInner}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={fitMapToMarkers}>
          <View style={styles.controlButtonInner}>
            <Ionicons name="locate" size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.navigateButton} onPress={handleOpenExternalNavigation}>
        <View style={styles.navigateButtonInner}>
          <Ionicons name="navigate" size={24} color={colors.white} />
        </View>
      </TouchableOpacity>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <View style={styles.customerInfo}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={24} color={colors.gray400} />
          </View>
          <View style={styles.customerTextContainer}>
            <Text style={styles.customerName}>{job.customer.name}</Text>
            <Text style={styles.customerAddress} numberOfLines={1}>{addressString}</Text>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}>
            <Ionicons name="call" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.etaInfo}>
          <View style={styles.etaItem}>
            <Ionicons name="map" size={16} color={colors.gray500} />
            <View style={styles.etaTextContainer}>
              <Text style={styles.etaLabel}>Distance</Text>
              <Text style={styles.etaValue}>{distance}</Text>
            </View>
          </View>
          <View style={styles.etaItem}>
            <Ionicons name="time" size={16} color={colors.gray500} />
            <View style={styles.etaTextContainer}>
              <Text style={styles.etaLabel}>Duration</Text>
              <Text style={styles.etaValue}>{duration}</Text>
            </View>
          </View>
          <View style={styles.etaItem}>
            <Ionicons name="cash" size={16} color={colors.gray500} />
            <View style={styles.etaTextContainer}>
              <Text style={styles.etaLabel}>Amount</Text>
              <Text style={styles.etaValue}>₹{job.totalAmount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenExternalNavigation}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('JobDetails', { jobId })}>
            <Text style={styles.primaryButtonText}>View Details</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
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
   controlButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
   controlButtonInner: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white, borderRadius: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
   navigateButton: { position: 'absolute', bottom: 320, right: 16 },
   navigateButtonInner: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  markerContainer: { backgroundColor: colors.red500, padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.white },
   bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 8, paddingBottom: Platform.OS === 'android' ? 20 : 32, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 10 },
   handle: { width: 64, height: 4, backgroundColor: colors.gray300, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
   customerInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
   customerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
   customerTextContainer: { flex: 1, marginLeft: 16 },
   customerName: { fontSize: 18, fontWeight: '600', color: colors.gray800 },
   customerAddress: { color: colors.gray500, fontSize: 14, marginTop: 2 },
   callButton: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
   etaInfo: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: colors.gray50, padding: 16, borderRadius: 16, marginBottom: 20 },
   etaItem: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
   etaTextContainer: { marginLeft: 8, alignItems: 'center' },
   etaLabel: { color: colors.gray500, fontSize: 12, textAlign: 'center' },
   etaValue: { color: colors.gray800, fontWeight: '600', fontSize: 16, textAlign: 'center' },
   actionButtons: { flexDirection: 'row', gap: 12 },
   secondaryButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: colors.gray100, borderWidth: 1, borderColor: colors.gray200 },
   secondaryButtonText: { color: colors.primary, fontWeight: '600', fontSize: 16, marginLeft: 8 },
   primaryButton: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: colors.primary },
   primaryButtonText: { color: colors.white, fontWeight: '600', fontSize: 16, marginRight: 8 },
});

export default RouteTrackingScreen;
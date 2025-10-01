import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingDetails, useBookingTracking } from '../../hooks';

type TrackBookingScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type TrackBookingScreenRouteProp = RouteProp<CustomerStackParamList, 'TrackBooking'>;

// Booking status mapping
const BOOKING_STATUSES = {
  CONFIRMED: 'confirmed',
  PROFESSIONAL_ASSIGNED: 'professional_assigned', 
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
} as const;

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

const TrackBookingScreen = () => {
  const navigation = useNavigation<TrackBookingScreenNavigationProp>();
  const route = useRoute<TrackBookingScreenRouteProp>();
  const { bookingId } = route.params;

  // Fetch booking details and tracking data
  const { data: booking, loading: bookingLoading, error: bookingError } = useBookingDetails(bookingId);
  const { data: tracking, loading: trackingLoading, trackingData } = useBookingTracking(bookingId);

  // Get data from booking and tracking
  const bookingData = booking?.data;
  const trackingInfo = trackingData || tracking?.data;
  
  // Default coordinates (Mumbai) - fallback
  const defaultLocation = {
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Get customer location from booking address or use default
  const customerLocation = bookingData?.address?.coordinates ? {
    latitude: bookingData.address.coordinates.latitude,
    longitude: bookingData.address.coordinates.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : defaultLocation;

  // Get professional location from tracking data or use default
  const professionalLocation = trackingInfo?.professionalLocation ? {
    latitude: trackingInfo.professionalLocation.latitude,
    longitude: trackingInfo.professionalLocation.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  } : {
    latitude: customerLocation.latitude + 0.01,
    longitude: customerLocation.longitude + 0.01,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Get professional data from booking
  const professional = bookingData?.professional || {
    id: 'unassigned',
    name: 'Professional not assigned yet',
    rating: 0,
    image: null,
    phone: '',
  };

  // Get current status and estimated arrival
  const currentStatus = bookingData?.status || BOOKING_STATUSES.CONFIRMED;
  const estimatedArrival = trackingInfo?.estimatedArrival || '15 mins';

  const getStatusText = () => {
    switch (currentStatus) {
      case BOOKING_STATUSES.CONFIRMED:
        return 'Booking Confirmed';
      case BOOKING_STATUSES.PROFESSIONAL_ASSIGNED:
        return 'Professional Assigned';
      case BOOKING_STATUSES.ON_THE_WAY:
        return 'Professional On The Way';
      case BOOKING_STATUSES.ARRIVED:
        return 'Professional Arrived';
      case BOOKING_STATUSES.IN_PROGRESS:
        return 'Service In Progress';
      case BOOKING_STATUSES.COMPLETED:
        return 'Service Completed';
      default:
        return 'Tracking Booking';
    }
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case BOOKING_STATUSES.CONFIRMED:
        return 'checkmark-circle-outline';
      case BOOKING_STATUSES.PROFESSIONAL_ASSIGNED:
        return 'person-outline';
      case BOOKING_STATUSES.ON_THE_WAY:
        return 'car-outline';
      case BOOKING_STATUSES.ARRIVED:
        return 'location-outline';
      case BOOKING_STATUSES.IN_PROGRESS:
        return 'construct-outline';
      case BOOKING_STATUSES.COMPLETED:
        return 'checkmark-done-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const handleCallProfessional = () => {
    if (professional.phone) {
      Alert.alert('Call', `Calling ${professional.name} at ${professional.phone}`);
    } else {
      Alert.alert('Call', 'Professional phone number not available');
    }
  };

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking', 
      `Are you sure you want to cancel booking ${bookingId}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => {
          // Implement actual cancel booking logic
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
        }}
      ]
    );
  };

  // Show loading state
  if (bookingLoading || trackingLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loaderText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state  
  if (bookingError || !bookingData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.loaderContainer, { justifyContent: 'center' }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={[styles.loaderText, { color: '#ef4444', marginTop: 16 }]}>
            {bookingError ? 'Failed to load booking details' : 'Booking not found'}
          </Text>
          <TouchableOpacity 
            style={[styles.primaryBtn, { marginTop: 24 }]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOnWayOrAssigned =
    currentStatus === BOOKING_STATUSES.ON_THE_WAY ||
    currentStatus === BOOKING_STATUSES.PROFESSIONAL_ASSIGNED;

  const timelineDotColor = (active: boolean) => ({
    backgroundColor: active ? '#2563eb' : '#d1d5db',
  });

  const timelineTextColor = (inactive: boolean) => ({
    color: inactive ? '#9ca3af' : '#1f2937',
    fontWeight: '600' as const,
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{getStatusText()}</Text>
          <Text style={styles.headerSub}>Booking ID: {bookingId}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.flex} showsVerticalScrollIndicator={false}>
        {/* Map View */}
        <View style={styles.mapWrap}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={customerLocation}
            showsUserLocation
          >
            <Marker coordinate={customerLocation} title="Your Location">
              <View style={[styles.markerPill, styles.markerBlue]}>
                <Ionicons name="home" size={16} color="#fff" />
              </View>
            </Marker>

            {isOnWayOrAssigned && (
              <Marker coordinate={professionalLocation} title={`${professional.name}'s Location`}>
                <View style={[styles.markerPill, styles.markerGreen]}>
                  <Ionicons name="car" size={16} color="#fff" />
                </View>
              </Marker>
            )}

            {isOnWayOrAssigned && (
              <MapViewDirections
                origin={professionalLocation}
                destination={customerLocation}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={3}
                strokeColor="#2563eb"
              />
            )}
          </MapView>
        </View>

        {/* Status Tracker */}
        <View style={styles.pad}>
          <View style={styles.statusRow}>
            <View style={styles.statusIconWrap}>
              <Ionicons name={getStatusIcon() as any} size={20} color="#fff" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.statusTitle}>{getStatusText()}</Text>
              {currentStatus === BOOKING_STATUSES.ON_THE_WAY && (
                <Text style={styles.statusMeta}>Arriving in approximately {estimatedArrival}</Text>
              )}
            </View>
          </View>

          {/* Status Timeline */}
          <View style={styles.timelineWrap}>
            {/* Confirmed */}
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, timelineDotColor(true)]}>
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text style={timelineTextColor(false)}>Booking Confirmed</Text>
                <Text style={styles.timelineTime}>10:30 AM</Text>
              </View>
            </View>

            {/* Professional Assigned */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  timelineDotColor(currentStatus !== BOOKING_STATUSES.CONFIRMED),
                ]}
              >
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text
                  style={timelineTextColor(currentStatus === BOOKING_STATUSES.CONFIRMED)}
                >
                  Professional Assigned
                </Text>
                <Text style={styles.timelineTime}>10:35 AM</Text>
              </View>
            </View>

            {/* On the Way */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  timelineDotColor(
                    currentStatus === BOOKING_STATUSES.ON_THE_WAY ||
                      currentStatus === BOOKING_STATUSES.ARRIVED ||
                      currentStatus === BOOKING_STATUSES.IN_PROGRESS ||
                      currentStatus === BOOKING_STATUSES.COMPLETED
                  ),
                ]}
              >
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text
                  style={timelineTextColor(
                    currentStatus === BOOKING_STATUSES.CONFIRMED ||
                      currentStatus === BOOKING_STATUSES.PROFESSIONAL_ASSIGNED
                  )}
                >
                  On The Way
                </Text>
                <Text style={styles.timelineTime}>10:40 AM</Text>
              </View>
            </View>

            {/* Arrived */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  timelineDotColor(
                    currentStatus === BOOKING_STATUSES.ARRIVED ||
                      currentStatus === BOOKING_STATUSES.IN_PROGRESS ||
                      currentStatus === BOOKING_STATUSES.COMPLETED
                  ),
                ]}
              >
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text
                  style={timelineTextColor(
                    currentStatus === BOOKING_STATUSES.CONFIRMED ||
                      currentStatus === BOOKING_STATUSES.PROFESSIONAL_ASSIGNED ||
                      currentStatus === BOOKING_STATUSES.ON_THE_WAY
                  )}
                >
                  Arrived at Location
                </Text>
                <Text style={styles.timelineTime}>--:-- --</Text>
              </View>
            </View>

            {/* In Progress */}
            <View style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  timelineDotColor(
                    currentStatus === BOOKING_STATUSES.IN_PROGRESS ||
                      currentStatus === BOOKING_STATUSES.COMPLETED
                  ),
                ]}
              >
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text
                  style={timelineTextColor(
                    currentStatus === BOOKING_STATUSES.CONFIRMED ||
                      currentStatus === BOOKING_STATUSES.PROFESSIONAL_ASSIGNED ||
                      currentStatus === BOOKING_STATUSES.ON_THE_WAY ||
                      currentStatus === BOOKING_STATUSES.ARRIVED
                  )}
                >
                  Service In Progress
                </Text>
                <Text style={styles.timelineTime}>--:-- --</Text>
              </View>
            </View>

            {/* Completed */}
            <View style={[styles.timelineItem, { marginBottom: 0 }]}>
              <View
                style={[
                  styles.timelineDot,
                  timelineDotColor(currentStatus === BOOKING_STATUSES.COMPLETED),
                ]}
              >
                <View style={styles.timelineInnerDot} />
              </View>
              <View style={styles.timelineTextWrap}>
                <Text style={timelineTextColor(currentStatus !== BOOKING_STATUSES.COMPLETED)}>
                  Service Completed
                </Text>
                <Text style={styles.timelineTime}>--:-- --</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Professional Details */}
        <View style={[styles.pad, styles.dividerTop]}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          <View style={styles.proCard}>
            {professional.profileImage?.url ? (
              <Image 
                source={{ uri: professional.profileImage.url }} 
                style={styles.proAvatar} 
                resizeMode="cover"
                onError={() => {
                  // If image fails to load, show placeholder
                }}
              />
            ) : (
              <View style={[styles.proAvatar, styles.proAvatarPlaceholder]}>
                <Ionicons name="person" size={32} color="#666" />
              </View>
            )}
            <View style={styles.proInfo}>
              <Text style={styles.proName}>{professional.name}</Text>
              <View style={styles.proMetaRow}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.proRating}>{professional.rating || 'N/A'}</Text>
                {professional.totalRatings ? (
                  <Text style={styles.proBookings}>({professional.totalRatings}+ ratings)</Text>
                ) : null}
              </View>
            </View>
            {professional.phone && (
              <TouchableOpacity style={styles.callBtn} onPress={handleCallProfessional}>
                <Ionicons name="call" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.pad, styles.dividerTop]}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Date & Time</Text>
              <Text style={styles.semibold}>
                {new Date(bookingData.scheduledDate).toLocaleDateString()}, {bookingData.scheduledTime}
              </Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Service</Text>
              <Text style={styles.semibold}>{bookingData.service.name}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Total Amount</Text>
              <Text style={styles.semibold}>₹{bookingData.totalAmount}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Payment Status</Text>
              <Text style={[styles.semibold, { 
                color: bookingData.paymentStatus === 'paid' ? '#16a34a' : '#f59e0b' 
              }]}>
                {bookingData.paymentStatus.charAt(0).toUpperCase() + bookingData.paymentStatus.slice(1)}
              </Text>
            </View>
            {bookingData.address && (
              <View style={styles.rowBetween}>
                <Text style={styles.muted}>Service Address</Text>
                <Text style={[styles.semibold, { flex: 1, textAlign: 'right' }]}>
                  {`${bookingData.address.addressLine1}, ${bookingData.address.city}`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      {currentStatus !== BOOKING_STATUSES.COMPLETED && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelBooking}>
            <Text style={styles.cancelText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default TrackBookingScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },

  // Loader
  loaderContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loaderText: { 
    marginTop: 12, 
    color: '#4b5563' 
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  headerIconBtn: { 
    padding: 4 
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1f2937',
    textAlign: 'center'
  },
  headerSub: { 
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2
  },
  headerRight: {
    width: 40
  },

  // Map
  mapWrap: { width: '100%', height: 256 },
  map: { width: '100%', height: '100%' },
  markerPill: { padding: 8, borderRadius: 999, borderWidth: 2, borderColor: '#fff' },
  markerBlue: { backgroundColor: '#3b82f6' },
  markerGreen: { backgroundColor: '#22c55e' },

  // Common paddings
  pad: { padding: 16 },

  // Status Row
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  statusIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusMeta: { color: '#6b7280' },

  // Timeline
  timelineWrap: { marginLeft: 20, paddingLeft: 20, borderLeftWidth: 2, borderLeftColor: '#e5e7eb' },
  timelineItem: { marginBottom: 24, position: 'relative' },
  timelineDot: {
    position: 'absolute',
    left: -29,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineInnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  timelineTextWrap: { marginLeft: 16 },
  timelineTime: { color: '#6b7280', fontSize: 12, marginTop: 2 },

  // Professional
  dividerTop: { borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16,
  },
  proAvatar: { width: 64, height: 64, borderRadius: 32 },
  proAvatarPlaceholder: { 
    backgroundColor: '#f3f4f6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  proInfo: { flex: 1, marginLeft: 12 },
  proName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  proMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  proRating: { marginLeft: 4, color: '#111827' },
  proBookings: { marginLeft: 4, color: '#6b7280' },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Details Card
  detailsCard: { backgroundColor: '#f9fafb', borderRadius: 16, padding: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  muted: { color: '#6b7280' },
  semibold: { color: '#111827', fontWeight: '600' },

  // Footer
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb', backgroundColor: '#fff' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#ef4444', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
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

type TrackBookingScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type TrackBookingScreenRouteProp = RouteProp<CustomerStackParamList, 'TrackBooking'>;

// Mock data for tracking
const BOOKING_STATUSES = {
  CONFIRMED: 'confirmed',
  PROFESSIONAL_ASSIGNED: 'professional_assigned',
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // replace in real app

const TrackBookingScreen = () => {
  const navigation = useNavigation<TrackBookingScreenNavigationProp>();
  const route = useRoute<TrackBookingScreenRouteProp>();
  const { bookingId } = route.params;

  const [currentStatus, setCurrentStatus] = useState<typeof BOOKING_STATUSES[keyof typeof BOOKING_STATUSES]>(
    BOOKING_STATUSES.PROFESSIONAL_ASSIGNED
  );
  const [estimatedArrival, setEstimatedArrival] = useState('15 mins');
  const [isLoading, setIsLoading] = useState(true);

  // Mock coordinates
  const customerLocation = {
    latitude: 19.076,
    longitude: 72.8777,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const professionalLocation = {
    latitude: 19.065,
    longitude: 72.835,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  // Mock professional data
  const professional = {
    id: 'pro123',
    name: 'Rahul Sharma',
    rating: 4.8,
    image: require('../../assets/images/image.png'),
    phone: '+91 9876543210',
  };

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIsLoading(false), 1500);

    const statusTimer = setTimeout(() => {
      setCurrentStatus(BOOKING_STATUSES.ON_THE_WAY);

      const arrivalTimer = setTimeout(() => {
        setEstimatedArrival('10 mins');

        const finalArrivalTimer = setTimeout(() => {
          setEstimatedArrival('5 mins');
        }, 10000);

        return () => clearTimeout(finalArrivalTimer);
      }, 8000);

      return () => clearTimeout(arrivalTimer);
    }, 5000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(statusTimer);
    };
  }, []);

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
    Alert.alert('Call', `Calling ${professional.name} at ${professional.phone}`);
  };

  const handleCancelBooking = () => {
    Alert.alert('Cancel Booking', 'This would cancel your booking in a real app');
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loaderText}>Loading booking details...</Text>
      </View>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{getStatusText()}</Text>
          <Text style={styles.headerSub}>Booking ID: {bookingId}</Text>
        </View>
      </View>

      <ScrollView style={styles.flex}>
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
            <Image source={professional.image} style={styles.proAvatar} resizeMode="cover" />
            <View style={styles.proInfo}>
              <Text style={styles.proName}>{professional.name}</Text>
              <View style={styles.proMetaRow}>
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text style={styles.proRating}>{professional.rating}</Text>
                <Text style={styles.proBookings}>(120+ bookings)</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallProfessional}>
              <Ionicons name="call" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.pad, styles.dividerTop]}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Date & Time</Text>
              <Text style={styles.semibold}>Today, 11:00 AM</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Services</Text>
              <Text style={styles.semibold}>Basic Wash, Premium Wash</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Total Amount</Text>
              <Text style={styles.semibold}>₹1,397</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Payment Method</Text>
              <Text style={styles.semibold}>Credit Card</Text>
            </View>
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
    </View>
  );
};

export default TrackBookingScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },

  // Loader
  loaderContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, color: '#4b5563' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#2563eb',
  },
  headerIconBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.85)' },

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
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  cancelBtn: {
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { color: '#ef4444', fontWeight: '600' },
});

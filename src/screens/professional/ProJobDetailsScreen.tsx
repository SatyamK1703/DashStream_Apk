import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

// Mock types for self-contained component
type ProStackParamList = {
  JobDetails: { jobId: string };
  RouteTracking: { jobId: string };
};

type ProJobDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;
type ProJobDetailsScreenRouteProp = RouteProp<ProStackParamList, 'JobDetails'>;

interface JobDetail {
  id: string;
  customerName: string;
  customerImage: string;
  customerPhone: string;
  date: string;
  time: string;
  address: string;
  location: { latitude: number; longitude: number; };
  professionalLocation?: { latitude: number; longitude: number; };
  services: { name: string; price: number; description?: string; }[];
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  specialInstructions?: string;
  vehicleDetails?: { type: 'car' | 'motorcycle' | 'bicycle'; brand: string; model: string; color: string; licensePlate?: string; };
}

const ProJobDetailsScreen = () => {
  const navigation = useNavigation<ProJobDetailsScreenNavigationProp>();
  const route = useRoute<ProJobDetailsScreenRouteProp>();
  const { jobId } = route.params;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobDetail | null>(null);

  useEffect(() => {
    const mockJob: JobDetail = {
      id: 'JOB123456', customerName: 'Priya Sharma', customerImage: 'https://randomuser.me/api/portraits/women/44.jpg', customerPhone: '+91 9876543210', date: 'Today', time: '11:30 AM', address: '123 Main St, Koramangala, Bangalore', location: { latitude: 12.9352, longitude: 77.6245 }, professionalLocation: { latitude: 12.9252, longitude: 77.6145 }, services: [{ name: 'Premium Wash', price: 599, description: 'Exterior wash, wax, tire shine' }, { name: 'Interior Cleaning', price: 399, description: 'Vacuum, dashboard polish' }], totalAmount: 998, status: 'upcoming', paymentStatus: 'paid', specialInstructions: 'Be careful with the side mirrors.', vehicleDetails: { type: 'car', brand: 'Honda', model: 'City', color: 'Silver', licensePlate: 'KA 01 AB 1234' }
    };
    setTimeout(() => {
      setJob(mockJob);
      setLoading(false);
    }, 1000);
  }, [jobId]);

  const handleCallCustomer = () => {
    if (job?.customerPhone) {
      const url = `tel:${job.customerPhone}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) Linking.openURL(url);
      });
    }
  };

  const handleNavigate = () => {
    if (job?.location) {
      const url = Platform.select({
        ios: `maps:0,0?q=${job.location.latitude},${job.location.longitude}`,
        android: `geo:0,0?q=${job.location.latitude},${job.location.longitude}(${job.customerName})`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const updateJobStatus = (newStatus: JobDetail['status']) => {
    Alert.alert(
      `${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)} Job`,
      `Are you sure you want to ${newStatus} this job?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            if (job) setJob({ ...job, status: newStatus });
            if (newStatus === 'ongoing') navigation.navigate('RouteTracking', { jobId });
          },
        },
      ]
    );
  };

  if (loading) {
    return <View style={styles.centeredScreen}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!job) {
    return (
      <View style={styles.centeredScreen}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.red500} />
        <Text style={styles.errorTitle}>Job Not Found</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const statusInfo = {
    upcoming: { label: 'Upcoming', bg: colors.blue100, text: colors.blue800 },
    ongoing: { label: 'Ongoing', bg: colors.amber100, text: colors.amber800 },
    completed: { label: 'Completed', bg: colors.green100, text: colors.green800 },
    cancelled: { label: 'Cancelled', bg: colors.red100, text: colors.red800 },
  }[job.status];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
          <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={{ ...job.location, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
            {job.professionalLocation && <Marker coordinate={job.professionalLocation} title="Your Location"><View style={styles.markerContainer}><Ionicons name="car" size={16} color={colors.white} /></View></Marker>}
            <Marker coordinate={job.location} title={job.customerName}><View style={[styles.markerContainer, {backgroundColor: colors.red500}]}><Ionicons name="location" size={16} color={colors.white} /></View></Marker>
            {job.professionalLocation && <MapViewDirections origin={job.professionalLocation} destination={job.location} apikey={"YOUR_GOOGLE_MAPS_API_KEY"} strokeWidth={3} strokeColor={colors.primary} />}
          </MapView>
          <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}><Ionicons name="navigate" size={24} color={colors.primary} /></TouchableOpacity>
        </View>

        <View style={styles.contentPadding}>
          <View style={styles.card}>
            <View style={styles.customerHeader}>
              <Image source={{ uri: job.customerImage }} style={styles.customerImage} />
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{job.customerName}</Text>
                <Text style={styles.customerPhone}>{job.customerPhone}</Text>
              </View>
              <TouchableOpacity style={styles.callButton} onPress={handleCallCustomer}><Ionicons name="call" size={16} color={colors.white} /><Text style={styles.callButtonText}>Call</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            {/* Job Details Rows */}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Services</Text>
            {job.services.map((service, index) => (
              <View key={index} style={[styles.serviceItem, index === job.services.length - 1 && styles.lastServiceItem]}>
                <View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.description && <Text style={styles.serviceDescription}>{service.description}</Text>}
                </View>
                <Text style={styles.servicePrice}>₹{service.price}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{job.totalAmount}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {job.status === 'upcoming' && <TouchableOpacity style={styles.primaryButton} onPress={() => updateJobStatus('ongoing')}><Text style={styles.primaryButtonText}>Start Job</Text></TouchableOpacity>}
        {job.status === 'ongoing' && <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.green600 }]} onPress={() => updateJobStatus('completed')}><Text style={styles.primaryButtonText}>Mark as Completed</Text></TouchableOpacity>}
        {(job.status === 'completed' || job.status === 'cancelled') && <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}><Text style={styles.primaryButtonText}>Back to Jobs</Text></TouchableOpacity>}
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray500: '#6B7280', gray800: '#1F2937',
  red100: '#FEE2E2', red500: '#EF4444', red800: '#991B1B', blue100: '#DBEAFE', blue800: '#1E40AF',
  green100: '#D1FAE5', green600: '#16A34A', green800: '#065F46', amber100: '#FEF3C7', amber800: '#92400E',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: colors.gray800, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 18, fontWeight: 'bold', marginLeft: 16 },
  statusBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 12, fontWeight: '500' },
  mapContainer: { height: 200, width: '100%' },
  map: { flex: 1 },
  markerContainer: { backgroundColor: colors.primary, padding: 8, borderRadius: 999, borderWidth: 2, borderColor: colors.white },
  navigateButton: { position: 'absolute', bottom: 16, right: 16, backgroundColor: colors.white, padding: 12, borderRadius: 999, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  contentPadding: { padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  customerHeader: { flexDirection: 'row', alignItems: 'center' },
  customerImage: { width: 64, height: 64, borderRadius: 32 },
  customerInfo: { flex: 1, marginLeft: 16 },
  customerName: { fontSize: 18, fontWeight: 'bold', color: colors.gray800 },
  customerPhone: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  callButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999 },
  callButtonText: { color: colors.white, fontWeight: '500', marginLeft: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray800, marginBottom: 12 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  lastServiceItem: { borderBottomWidth: 0 },
  serviceName: { fontSize: 16, color: colors.gray800, fontWeight: '500' },
  serviceDescription: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.gray100, paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: colors.primary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.gray100, backgroundColor: colors.white },
  primaryButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  primaryButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default ProJobDetailsScreen;

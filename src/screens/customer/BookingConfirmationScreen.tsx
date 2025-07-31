import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image ,StyleSheet} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type BookingConfirmationScreenRouteProp = RouteProp<CustomerStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen = () => {
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const route = useRoute<BookingConfirmationScreenRouteProp>();
  
  const { bookingId, date, timeSlot, address } = route.params;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleTrackOrder = () => {
    navigation.navigate('TrackBooking', { bookingId });
  };

  const handleViewAllBookings = () => {
    navigation.navigate('CustomerTabs', { screen: 'Bookings' });
  };

  return (
        <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.successContainer}>
          <View style={styles.successOuterCircle}>
            <View style={styles.successInnerCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successText}>
            Your booking has been confirmed. A professional will be assigned shortly.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Booking Details</Text>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="receipt-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.label}>Booking ID</Text>
                <Text style={styles.value}>{bookingId}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{formatDate(date)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="time-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.label}>Time Slot</Text>
                <Text style={styles.value}>{timeSlot}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={20} color="#2563eb" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Service Address</Text>
                <Text style={styles.value}>{address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Services Booked</Text>

            <View style={styles.serviceRow}>
              <Image source={require('../../assets/images/image.png')} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Basic Wash</Text>
                <Text style={styles.serviceSubtitle}>1 x ₹499</Text>
              </View>
              <Text style={styles.value}>₹499</Text>
            </View>

            <View style={styles.serviceRow}>
              <Image source={require('../../assets/images/image.png')} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle}>Premium Wash</Text>
                <Text style={styles.serviceSubtitle}>1 x ₹999</Text>
              </View>
              <Text style={styles.value}>₹999</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Subtotal</Text>
              <Text style={styles.value}>₹1,498</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Delivery Fee</Text>
              <Text style={styles.value}>₹49</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.discountLabel}>Discount</Text>
              <Text style={styles.discountValue}>-₹150</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={[styles.totalText, { color: '#2563eb' }]}>₹1,397</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>What's Next?</Text>

            {["Professional Assignment", "On the Way", "Service Completion"].map((title, idx) => (
              <View style={styles.nextStepRow} key={idx}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{title}</Text>
                  <Text style={styles.stepSubtitle}>
                    {idx === 0
                      ? "A skilled professional will be assigned to your booking shortly."
                      : idx === 1
                      ? "You'll be notified when the professional is on the way to your location."
                      : "After service completion, you can rate and review your experience."}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleTrackOrder}>
          <Text style={styles.primaryBtnText}>Track Booking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={handleViewAllBookings}>
          <Text style={styles.secondaryBtnText}>View All Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  ); 
};

export default BookingConfirmationScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollContainer: { flexGrow: 1 },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    backgroundColor: 'rgba(37,99,235,0.1)',
  },
  successOuterCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(37,99,235,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  successText: { color: '#4b5563', textAlign: 'center', paddingHorizontal: 24 },
  section: { padding: 24 },
  card: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  detailRow: { flexDirection: 'row', marginBottom: 12 },
  iconContainer: { width: 40, alignItems: 'center' },
  label: { color: '#6b7280', fontSize: 12 },
  value: { fontWeight: '600' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceImage: { width: 64, height: 64, borderRadius: 8 },
  serviceInfo: { flex: 1, marginLeft: 12 },
  serviceTitle: { fontWeight: '600' },
  serviceSubtitle: { color: '#6b7280' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  discountLabel: { color: '#16a34a' },
  discountValue: { fontWeight: '600', color: '#16a34a' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: { fontWeight: 'bold' },
  nextStepRow: { flexDirection: 'row', marginBottom: 12 },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: { fontWeight: 'bold', color: '#2563eb' },
  stepTitle: { fontWeight: '600' },
  stepSubtitle: { color: '#6b7280' },
  actionContainer: { padding: 16, borderTopWidth: 1, borderColor: '#e5e7eb' },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: 'white', fontWeight: '600' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#1f2937',
    fontWeight: '600',
  },
});

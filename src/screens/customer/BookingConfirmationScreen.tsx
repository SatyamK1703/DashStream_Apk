import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useBookingDetails } from '../../hooks';
import api from '../../services/httpClient';

type BookingConfirmationScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type BookingConfirmationScreenRouteProp = RouteProp<CustomerStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen = () => {
  const navigation = useNavigation<BookingConfirmationScreenNavigationProp>();
  const route = useRoute<BookingConfirmationScreenRouteProp>();

  const { bookingId } = route.params || {};
  const { data: bookingResponse, loading, error, execute } = useBookingDetails(bookingId || null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const booking = bookingResponse?.booking;

  useEffect(() => {
    if (bookingId && !bookingResponse) {
      execute();
    }
  }, [bookingId, bookingResponse]);

  // Debug logging
  useEffect(() => {
    if (__DEV__) {
      console.log('BookingConfirmationScreen - Data received:', {
        hasBookingResponse: !!bookingResponse,
        responseFormat: bookingResponse ? Object.keys(bookingResponse).join(',') : 'none',
        hasBooking: !!booking,
        bookingFormat: booking ? Object.keys(booking).join(',') : 'none',
        hasService: booking?.service ? 'yes' : 'no',
        hasServices: booking?.services ? 'yes' : 'no',
        servicesType: booking?.services ? (Array.isArray(booking.services) ? 'array' : typeof booking.services) : 'none',
        servicesLength: booking?.services && Array.isArray(booking.services) ? booking.services.length : 0,
        serviceKeys: booking?.service ? Object.keys(booking.service).join(',') : 'none',
        firstServiceKeys: booking?.services && Array.isArray(booking.services) && booking.services.length > 0
          ? Object.keys(booking.services[0]).join(',')
          : 'none',
        bookingId,
        loading,
        error: error ? error.toString() : null
      });
    }
  }, [bookingResponse, booking, bookingId, loading, error]);

  // Poll payment status if booking has a payment that's not yet captured
  useEffect(() => {
    if (!booking) return;

    const paymentId = booking.paymentId;

    if (!paymentId) {
      setPaymentStatus('pending');
      return;
    }

    // Check payment status
    const checkPaymentStatus = async () => {
      try {
        setCheckingPayment(true);
        const statusRes = await api.get(`/payments/${paymentId}`);
        const status = statusRes?.data?.payment?.status;
        setPaymentStatus(status || 'unknown');

        // If payment is still pending, poll again after 3 seconds
        if (status === 'created' || status === 'pending' || status === 'authorized') {
          setTimeout(checkPaymentStatus, 3000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setPaymentStatus('unknown');
      } finally {
        setCheckingPayment(false);
      }
    };

    checkPaymentStatus();
  }, [booking]);

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Date not available';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }

    return 'Invalid date';
  };

  const handleTrackOrder = () => {
    if (__DEV__) {
      console.log('Track Order - Data available:', {
        hasBooking: !!booking,
        bookingFormat: booking ? Object.keys(booking).join(',') : 'none',
        routeBookingId: bookingId,
        bookingIdFromObject: booking?.bookingId || booking?._id,
      });
    }

    if (booking) {
      // Use the booking ID from the loaded booking object, which could be either bookingId or _id
      const trackingId = booking.bookingId || booking._id;
      if (trackingId) {
        console.log('Navigating to TrackBooking with ID from booking object:', trackingId);
        navigation.navigate('TrackBooking', { bookingId: trackingId });
      } else {
        // Handle case where no valid booking ID is found
        console.error('No valid booking ID found for tracking in booking object');

        // Try to use the route parameter as fallback
        if (bookingId) {
          console.log('Falling back to route parameter bookingId:', bookingId);
          navigation.navigate('TrackBooking', { bookingId });
        } else {
          console.error('No bookingId available from any source');
          // Alert.alert('Error', 'Unable to track booking: No valid booking ID found');
        }
      }
    } else if (bookingId) {
      // Fallback to the route parameter if booking object is not available
      console.log('No booking object available, using route parameter bookingId:', bookingId);
      navigation.navigate('TrackBooking', { bookingId });
    } else {
      console.error('Cannot track booking: No booking ID available');
      // Alert.alert('Error', 'Unable to track booking: No booking information available');
    }
  };

  const handleViewAllBookings = () => {
    navigation.navigate('CustomerTabs', { screen: 'Bookings' });
  };

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[styles.value, { marginTop: 16 }]}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={[styles.successTitle, { color: '#ef4444', marginTop: 16 }]}>
            {error ? 'Failed to load booking' : 'Booking not found'}
          </Text>
          <Text style={[styles.successText, { marginTop: 8 }]}>
            {error ? 'Please check your connection and try again.' : 'The booking ID may be invalid.'}
          </Text>
          <Text style={[styles.successText, { fontSize: 14, marginTop: 8, marginBottom: 16 }]}>
            Booking ID: {bookingId || 'Not available'}
          </Text>

          {/* Add retry button */}
          {bookingId && (
            <TouchableOpacity
              style={[styles.primaryBtn, { marginBottom: 12 }]}
              onPress={() => execute()}
            >
              <Text style={styles.primaryBtnText}>Retry</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryBtn]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Handle different service data structures
  const services = booking.services || (booking.service ? [booking.service] : []);
  const address = booking.location && booking.location.address;

  // Calculate subtotal from services array
  const subtotal = services.reduce((acc, service) => {
    const price = service?.basePrice || service?.price || service?.serviceId?.price || 0;
    const quantity = service?.quantity || 1;
    return acc + (price * quantity);
  }, 0);

  return (
    <SafeAreaView style={styles.safeArea}>
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

            {/* Payment Status Indicator */}
            {paymentStatus && (
              <View style={[
                styles.paymentStatusBadge,
                paymentStatus === 'captured' && styles.paymentStatusSuccess,
                paymentStatus === 'failed' && styles.paymentStatusFailed,
                (paymentStatus === 'created' || paymentStatus === 'pending' || paymentStatus === 'authorized') && styles.paymentStatusPending,
                paymentStatus === 'cod_pending' && styles.paymentStatusCOD
              ]}>
                {checkingPayment && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                <Ionicons
                  name={
                    paymentStatus === 'captured' ? 'checkmark-circle' :
                      paymentStatus === 'failed' ? 'close-circle' :
                        paymentStatus === 'cod_pending' ? 'cash' :
                          'time'
                  }
                  size={16}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
                <Text style={styles.paymentStatusText}>
                  {paymentStatus === 'captured' ? 'Payment Successful' :
                    paymentStatus === 'failed' ? 'Payment Failed' :
                      paymentStatus === 'cod_pending' ? "Cash on Delivery" :

                        paymentStatus === 'authorized' ? 'Payment Authorized' :
                          'Payment Processing...'}
                </Text>
              </View>
            )}
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
                  <Text style={styles.value}>{booking.bookingId || booking._id}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.label}>Date</Text>
                  <Text style={styles.value}>{formatDate(booking.scheduledDate)}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="time-outline" size={20} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.label}>Time Slot</Text>
                  <Text style={styles.value}>{booking.scheduledTime || 'Time not available'}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location-outline" size={20} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Service Address</Text>
                  <Text style={styles.value}>
                    {address ?
                      (address.address ?
                        `${address.address}${address.city ? `, ${address.city}` : ''}${address.pincode ? ` ${address.pincode}` : ''}`
                        : 'Address details not available')
                      : 'Address not available'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Services Booked</Text>
              {services.map((service, index) => (
                <ServiceBooked key={service._id || index} service={service} />
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Subtotal</Text>
                <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
              </View>
              {/* Example of other fees */}
              <View style={styles.summaryRow}>
                <Text style={styles.label}>Taxes & Fees</Text>
                <Text style={styles.value}>₹{(booking.totalAmount - subtotal).toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>Total Amount</Text>
                <Text style={[styles.totalText, { color: '#2563eb' }]}>
                  ₹{booking.totalAmount.toFixed(2)}
                </Text>
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
    </SafeAreaView>
  );
};

export default BookingConfirmationScreen;

const ServiceBooked = ({ service }) => {
  const serviceImages = service && service.images && service.images.length > 0;
  const price = service?.basePrice || service?.price || service?.serviceId?.price || 0;
  const quantity = service?.quantity || 1;

  return (
    <View style={styles.serviceRow}>
      {serviceImages ? (
        <Image
          source={{ uri: service.images[0].url }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.serviceImagePlaceholder}>
          <Ionicons name="car-outline" size={32} color="#666" />
        </View>
      )}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceTitle}>
          {service?.name || service?.title || service?.serviceId?.title || 'Service'}
        </Text>
        <Text style={styles.serviceSubtitle}>{quantity} x ₹{price.toFixed(2)}</Text>
      </View>
      <Text style={styles.value}>₹{(price * quantity).toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white'
  },
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  scrollContainer: {
    flexGrow: 1
  },
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
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8
  },
  successText: {
    color: '#4b5563',
    textAlign: 'center',
    paddingHorizontal: 24
  },
  section: {
    padding: 24
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  iconContainer: {
    width: 40,
    alignItems: 'center'
  },
  label: {
    color: '#6b7280',
    fontSize: 12
  },
  value: {
    fontWeight: '600'
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceImage: {
    width: 64,
    height: 64,
    borderRadius: 8
  },
  serviceImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12
  },
  serviceTitle: {
    fontWeight: '600'
  },
  serviceSubtitle: {
    color: '#6b7280'
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  discountLabel: {
    color: '#16a34a'
  },
  discountValue: {
    fontWeight: '600',
    color: '#16a34a'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontWeight: 'bold'
  },
  nextStepRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(37,99,235,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepBadgeText: {
    fontWeight: 'bold',
    color: '#2563eb'
  },
  stepTitle: {
    fontWeight: '600'
  },
  stepSubtitle: {
    color: '#6b7280'
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb'
  },
  primaryBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600'
  },
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
  paymentStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },
  paymentStatusSuccess: {
    backgroundColor: '#16a34a',
  },
  paymentStatusFailed: {
    backgroundColor: '#ef4444',
  },
  paymentStatusPending: {
    backgroundColor: '#f59e0b',
  },
  paymentStatusCOD: {
    backgroundColor: '#8b5cf6',
  },
  paymentStatusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});

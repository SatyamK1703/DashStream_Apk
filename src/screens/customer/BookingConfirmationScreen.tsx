import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBookingDetails } from '../../hooks';
import api from '../../services/httpClient';

const BookingConfirmationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId } = route.params || {};

  const { data, loading, error, execute } = useBookingDetails(bookingId || null);
  const booking = data?.booking;

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const paymentId = booking?.paymentId;
  const paymentMethod = booking?.paymentMethod;

  /* -------------------- Fetch booking if needed -------------------- */
  useEffect(() => {
    if (bookingId && !data) execute();
  }, [bookingId, data]);

  /* -------------------- Polling for payment status -------------------- */
  useEffect(() => {
    if (!booking) return;

    if (!paymentId) {
      setPaymentStatus(paymentMethod === 'cod' ? 'cod_pending' : 'pending');
      return;
    }

    let mounted = true;
    let timer;

    const check = async () => {
      if (!mounted) return;
      try {
        setCheckingPayment(true);
        const res = await api.get(`/payments/${paymentId}`);
        const status = res?.data?.payment?.status || 'unknown';

        if (!mounted) return;

        setPaymentStatus(status);
        if (['created', 'pending', 'authorized'].includes(status)) {
          timer = setTimeout(check, 3000);
        }
      } catch {
        if (mounted) setPaymentStatus('unknown');
      } finally {
        if (mounted) setCheckingPayment(false);
      }
    };

    check();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [paymentId]);

  /* -------------------- Loading State -------------------- */
  if (loading) {
    return (
      <Centered>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12 }}>Loading booking details...</Text>
      </Centered>
    );
  }

  /* -------------------- Error State -------------------- */
  if (error || !booking) {
    return (
      <Centered>
        <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>
          {error ? 'Failed to load booking' : 'Booking not found'}
        </Text>
        <Text style={styles.errorText}>
          {error ? 'Check your connection and retry.' : 'Invalid booking ID.'}
        </Text>

        {bookingId && <ButtonPrimary title="Retry" onPress={execute} style={{ marginTop: 20 }} />}

        <ButtonSecondary title="Go Back" onPress={() => navigation.goBack()} />
      </Centered>
    );
  }

  /* -------------------- Derived Data -------------------- */
  const services = booking.services || (booking.service ? [booking.service] : []);
  const address = booking.location?.address;

  const subtotal = services.reduce((sum, svc) => {
    const price = svc?.basePrice || svc?.price || svc?.serviceId?.price || 0;
    const qty = svc?.quantity || 1;
    return sum + price * qty;
  }, 0);

  /* -------------------- Navigation Handlers -------------------- */
  const handleTrackOrder = () => {
    const id = booking.bookingId || booking._id || bookingId;
    if (id) navigation.navigate('TrackBooking', { bookingId: id });
  };

  const handleViewAll = () => {
    navigation.navigate('CustomerTabs', { screen: 'Bookings' });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SuccessHeader paymentStatus={paymentStatus} checking={checkingPayment} />

        <Card title="Booking Details">
          <Detail
            icon="receipt-outline"
            label="Booking ID"
            value={booking.bookingId || booking._id}
          />
          <Detail icon="calendar-outline" label="Date" value={formatDate(booking.scheduledDate)} />
          <Detail icon="time-outline" label="Time Slot" value={booking.scheduledTime} />
          <Detail
            icon="location-outline"
            label="Service Address"
            value={
              address
                ? `${address.address}${address.city ? ', ' + address.city : ''} ${
                    address.pincode || ''
                  }`
                : 'Address not available'
            }
          />
        </Card>

        <Card title="Services Booked">
          {services.map((s, i) => (
            <ServiceItem key={s._id || i} service={s} />
          ))}
        </Card>

        <Card title="Payment Summary">
          <Row label="Subtotal" value={`₹${subtotal.toFixed(2)}`} />
          <Row label="Taxes & Fees" value={`₹${(booking.totalAmount - subtotal).toFixed(2)}`} />
          <Row
            label="Total Amount"
            value={`₹${booking.totalAmount.toFixed(2)}`}
            bold
            valueColor="#2563eb"
          />
        </Card>

        <NextSteps />
      </ScrollView>

      <View style={styles.actions}>
        <ButtonPrimary title="Track Booking" onPress={handleTrackOrder} />
        <ButtonSecondary title="View All Bookings" onPress={handleViewAll} />
      </View>
    </SafeAreaView>
  );
};

export default BookingConfirmationScreen;

/* ------------------------------------------------------------------ */
/* -------------------- SMALL COMPONENTS ----------------------------- */
/* ------------------------------------------------------------------ */

const Centered = ({ children }) => <SafeAreaView style={styles.centered}>{children}</SafeAreaView>;

const Card = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Detail = ({ icon, label, value }) => (
  <View style={styles.row}>
    <Ionicons name={icon} size={20} color="#2563eb" style={{ marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || 'Not available'}</Text>
    </View>
  </View>
);

const Row = ({ label, value, bold, valueColor }) => (
  <View style={styles.summaryRow}>
    <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
    <Text style={[styles.value, bold && styles.bold, valueColor && { color: valueColor }]}>
      {value}
    </Text>
  </View>
);

const ServiceItem = ({ service }) => {
  const price = service?.basePrice || service?.price || service?.serviceId?.price || 0;
  const qty = service?.quantity || 1;
  const img = service?.images?.[0]?.url;

  return (
    <View style={styles.serviceRow}>
      {img ? (
        <Image source={{ uri: img }} style={styles.serviceImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="construct-outline" size={28} color="#777" />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceName}>{service.name}</Text>
        <Text style={styles.servicePrice}>
          ₹{price} × {qty}
        </Text>
      </View>
    </View>
  );
};

const SuccessHeader = ({ paymentStatus, checking }) => (
  <View style={styles.successContainer}>
    <View style={styles.successOuter}>
      <View style={styles.successInner}>
        <Ionicons name="checkmark" size={40} color="#fff" />
      </View>
    </View>

    <Text style={styles.successTitle}>Booking Confirmed!</Text>
    <Text style={styles.successSub}>
      Your booking has been confirmed. A professional will be assigned shortly.
    </Text>

    {paymentStatus && (
      <View
        style={[
          styles.paymentBadge,
          paymentStatus === 'captured' && styles.paySuccess,
          paymentStatus === 'failed' && styles.payFailed,
          ['created', 'pending', 'authorized'].includes(paymentStatus) && styles.payPending,
          paymentStatus === 'cod_pending' && styles.payCOD,
        ]}>
        {checking && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />}

        <Ionicons
          name={
            paymentStatus === 'captured'
              ? 'checkmark-circle'
              : paymentStatus === 'failed'
                ? 'close-circle'
                : paymentStatus === 'cod_pending'
                  ? 'cash'
                  : 'time'
          }
          size={16}
          color="#fff"
          style={{ marginRight: 4 }}
        />

        <Text style={styles.paymentText}>
          {paymentStatus === 'captured'
            ? 'Payment Successful'
            : paymentStatus === 'failed'
              ? 'Payment Failed'
              : paymentStatus === 'cod_pending'
                ? 'Cash on Delivery'
                : paymentStatus === 'authorized'
                  ? 'Payment Authorized'
                  : 'Payment Processing...'}
        </Text>
      </View>
    )}
  </View>
);

const NextSteps = () => {
  const data = [
    {
      title: 'Professional Assignment',
      text: 'A skilled professional will be assigned shortly.',
    },
    {
      title: 'On the Way',
      text: 'You’ll be notified when they are en route.',
    },
    {
      title: 'Service Completion',
      text: 'After completion, you can rate your experience.',
    },
  ];

  return (
    <Card title="What's Next?">
      {data.map((item, i) => (
        <View key={i} style={styles.nextRow}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.stepTitle}>{item.title}</Text>
            <Text style={styles.stepText}>{item.text}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/* ---------------------------- STYLES ------------------------------- */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scroll: { padding: 16, paddingBottom: 120 },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    marginBottom: 18,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },

  /* Success Header */
  successContainer: { alignItems: 'center', marginBottom: 24 },
  successOuter: {
    backgroundColor: '#d1e9ff',
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  successInner: {
    backgroundColor: '#2563eb',
    width: 60,
    height: 60,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '700', marginTop: 16 },
  successSub: { color: '#555', textAlign: 'center', marginTop: 6, paddingHorizontal: 20 },

  /* Payment Badge */
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  paySuccess: { backgroundColor: '#22c55e' },
  payFailed: { backgroundColor: '#ef4444' },
  payPending: { backgroundColor: '#f59e0b' },
  payCOD: { backgroundColor: '#3b82f6' },
  paymentText: { color: '#fff', fontSize: 14 },

  /* Details */
  row: { flexDirection: 'row', marginBottom: 12 },
  label: { color: '#555', fontSize: 14 },
  value: { fontSize: 15, marginTop: 2 },
  bold: { fontWeight: '600' },

  /* Services */
  serviceRow: { flexDirection: 'row', marginBottom: 14 },
  serviceImage: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceName: { fontWeight: '600', marginBottom: 4 },
  servicePrice: { color: '#555' },

  /* Summary */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  /* Next Steps */
  nextRow: { flexDirection: 'row', marginBottom: 18 },
  stepCircle: {
    width: 30,
    height: 30,
    backgroundColor: '#2563eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNum: { color: '#fff', fontWeight: '600' },
  stepTitle: { fontWeight: '600', fontSize: 15 },
  stepText: { color: '#555', fontSize: 13, marginTop: 3 },

  /* Actions */
  actions: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },

  /* Errors */
  errorTitle: { fontSize: 20, fontWeight: '700', marginTop: 16 },
  errorText: { color: '#777', textAlign: 'center', marginTop: 6 },
});

/* -------------------- Buttons -------------------- */

const ButtonPrimary = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.primaryBtn, style]}>
    <Text style={styles.primaryText}>{title}</Text>
  </TouchableOpacity>
);

const ButtonSecondary = ({ title, onPress, style }) => (
  <TouchableOpacity onPress={onPress} style={[styles.secondaryBtn, style]}>
    <Text style={styles.secondaryText}>{title}</Text>
  </TouchableOpacity>
);

Object.assign(styles, {
  primaryBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: { color: '#fff', fontWeight: '600', fontSize: 16 },

  secondaryBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2563eb',
    alignItems: 'center',
  },
  secondaryText: { color: '#2563eb', fontWeight: '600', fontSize: 16 },
});

/* -------------------- Helpers -------------------- */

const formatDate = (date) => {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? 'Invalid date'
    : d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
};

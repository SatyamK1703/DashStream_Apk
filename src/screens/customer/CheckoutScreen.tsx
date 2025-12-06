import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useCart, useAddresses, useCheckout } from '../../store';
import { useCreateBooking } from '../../hooks/useBookings';
import { useCreateCODPayment } from '../../hooks/usePayments';
import { useServiceArea } from '../../hooks/useServiceArea';
import { useNotifyAreaRequest } from '../../hooks/useNotifications';
import api from '../../services/httpClient';
import * as WebBrowser from 'expo-web-browser';
import { scaleHeight, scaleWidth } from '../../utils/scaling';
import { Address } from '../../types/api';

/* -------------------------
   Types
   ------------------------- */
type CheckoutNavProp = NativeStackNavigationProp<CustomerStackParamList>;
type CheckoutRouteProp = RouteProp<CustomerStackParamList, 'Checkout'>;

interface PaymentMethod {
  id: string;
  type: string;
  name: string;
  description?: string;
  icon?: string;
  isDefault?: boolean;
  fees?: { percentage?: number; fixed?: number };
  codSettings?: { minAmount: number; maxAmount: number; collectBeforeService?: boolean };
}

/* -------------------------
   Small presentational components
   ------------------------- */

const IconButton: React.FC<{ onPress: () => void; children?: React.ReactNode; style?: any }> = ({
  onPress,
  children,
  style,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[{ padding: 8 }, style]}>
    {children}
  </TouchableOpacity>
);

/* AddressPicker component - small, self-contained */
const AddressPicker: React.FC<{
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (a: Address) => void;
  loading: boolean;
  error: any;
  onAddNew: () => void;
}> = ({ addresses, selectedAddress, onSelect, loading, error, onAddNew }) => {
  useEffect(() => {
    if (!selectedAddress && addresses?.length) {
      onSelect(addresses[0]);
    }
  }, [addresses, selectedAddress, onSelect]);

  if (loading) return <Text style={styles.grayText}>Loading addresses...</Text>;
  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load addresses</Text>
        <TouchableOpacity onPress={onAddNew} style={styles.addPaymentButton}>
          <Text style={styles.addPaymentText}>Retry / Add Address</Text>
        </TouchableOpacity>
      </View>
    );

  if (!addresses || addresses.length === 0) {
    return (
      <View style={styles.emptyPaymentContainer}>
        <Text style={styles.grayText}>No saved addresses</Text>
        <TouchableOpacity onPress={onAddNew} style={styles.addPaymentButton}>
          <Text style={styles.addPaymentText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      {addresses.map((addr) => {
        const isSelected = selectedAddress?._id === addr._id;
        const display = [addr.address, addr.landmark, addr.city].filter(Boolean).join(', ');
        return (
          <TouchableOpacity
            key={addr._id}
            style={[styles.addressBox, isSelected && styles.addressSelected]}
            onPress={() => onSelect(addr)}>
            <View style={styles.addressTopRow}>
              <Text style={styles.addressTitle} numberOfLines={1}>
                {addr.name || addr.type || 'Saved Address'}
              </Text>
              {addr.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {display || 'No details provided'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

/* DatePicker — horizontal date selection */
const DatePicker: React.FC<{
  dates: Date[];
  value: Date | null;
  onChange: (d: Date) => void;
}> = ({ dates, value, onChange }) => {
  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {dates.map((d, idx) => {
        const isSelected = value && d.toDateString() === value.toDateString();
        return (
          <TouchableOpacity
            key={idx}
            style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
            onPress={() => onChange(d)}>
            <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
              {formatDate(d)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

/* TimeSlot grid */
const TimeSlotGrid: React.FC<{
  slots: { id: string; time: string; available: boolean }[];
  value: string | null;
  onSelect: (id: string) => void;
}> = ({ slots, value, onSelect }) => {
  return (
    <View style={styles.timeSlotContainer}>
      {slots.map((s) => {
        const disabled = !s.available;
        const isSelected = value === s.id;
        return (
          <TouchableOpacity
            key={s.id}
            style={[
              styles.timeSlot,
              disabled && styles.timeSlotDisabled,
              isSelected && s.available && styles.timeSlotSelected,
            ]}
            onPress={() => s.available && onSelect(s.id)}
            disabled={disabled}>
            <Text
              style={[
                styles.timeSlotText,
                disabled && styles.textGray,
                isSelected && styles.textWhite,
              ]}>
              {s.time}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/* PaymentMethodList */
const PaymentMethodList: React.FC<{
  methods: PaymentMethod[];
  selectedId: string | null;
  onSelect: (m: PaymentMethod) => void;
  cartTotal: number;
}> = ({ methods, selectedId, onSelect, cartTotal }) => {
  return (
    <>
      {methods.map((m) => {
        const isSelected = selectedId === m.id;
        const isCOD = m.type === 'cod';
        const codSettings = m.codSettings;
        const isCODAvailable =
          !isCOD || !codSettings
            ? true
            : cartTotal >= codSettings.minAmount && cartTotal <= codSettings.maxAmount;

        return (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.paymentMethod,
              isSelected && styles.addressSelected,
              !isCODAvailable && styles.paymentMethodDisabled,
            ]}
            onPress={() => isCODAvailable && onSelect(m)}
            disabled={!isCODAvailable}
            activeOpacity={0.8}>
            <View style={styles.paymentIconBox}>
              <Ionicons
                name={(m.icon as any) || 'card-outline'}
                size={20}
                color={isCODAvailable ? '#2563eb' : '#9ca3af'}
              />
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={[styles.addressTitle, !isCODAvailable && styles.disabledText]}>
                {m.name}
              </Text>
              <Text style={[styles.addressSubtitle, !isCODAvailable && styles.disabledText]}>
                {m.description}
              </Text>

              {isCOD && codSettings && (
                <Text style={[styles.codInfo, !isCODAvailable && styles.codUnavailable]}>
                  {isCODAvailable
                    ? `Available for ₹${codSettings.minAmount}–₹${codSettings.maxAmount}`
                    : `Not available (₹${codSettings.minAmount}–₹${codSettings.maxAmount})`}
                </Text>
              )}

              {m.fees && m.fees.percentage ? (
                <Text style={styles.feeInfo}>+{m.fees.percentage}% processing fee</Text>
              ) : null}
            </View>

            {m.isDefault && <Text style={styles.defaultBadge}>Recommended</Text>}
            {!isCODAvailable && isCOD && <Text style={styles.unavailableBadge}>Not Available</Text>}
          </TouchableOpacity>
        );
      })}
    </>
  );
};

/* -------------------------
   Main Checkout Screen - refactored
   ------------------------- */

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation<CheckoutNavProp>();
  const route = useRoute<CheckoutRouteProp>();
  const { subtotal = 0, discount = 0, total = 0 } = route.params || {};

  // Stores & hooks
  const { items: cartItems, clear } = useCart();
  const {
    addresses,
    defaultAddress,
    isLoading: addressesLoading,
    error: addressesError,
    fetchAddresses,
  } = useAddresses();
  const {
    selectedAddress,
    selectedDate,
    selectedTimeSlot,
    specialInstructions,
    isLoading,
    setSelectedAddress,
    setSelectedDate,
    setSelectedTimeSlot,
    setSpecialInstructions,
    setLoading,
  } = useCheckout();

  const createBookingApi = useCreateBooking();
  const createCODPaymentApi = useCreateCODPayment();
  const { checkPincodeAvailability } = useServiceArea();
  const { execute: notifyAdmin } = useNotifyAreaRequest();

  /* Payment methods declared here so it's easy to change */
  const paymentMethods: PaymentMethod[] = useMemo(
    () => [
      {
        id: 'upi',
        type: 'razorpay',
        name: 'UPI / Online',
        description: 'Pay via UPI apps (GPay, PhonePe, Paytm) or cards.',
        icon: 'logo-google',
        isDefault: true,
        fees: { percentage: 0, fixed: 0 },
      },
      {
        id: 'cod',
        type: 'cod',
        name: 'Cash on Delivery',
        description: 'Pay cash after service completion.',
        icon: 'cash-outline',
        isDefault: false,
        codSettings: { minAmount: 50, maxAmount: 5000, collectBeforeService: false },
      },
    ],
    []
  );

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(paymentMethods[0]);
  const [localLoading, setLocalLoading] = useState(false);

  /* date generation */
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      // keep the time component zeroed for consistent comparisons
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, []);

  /* time slots */
  const [timeSlots, setTimeSlots] = useState<{ id: string; time: string; available: boolean }[]>(
    []
  );
  useEffect(() => {
    const slots: { id: string; time: string; available: boolean }[] = [];
    for (let h = 9; h <= 17; h++) {
      const label = `${h <= 12 ? h : h - 12}:00 ${h < 12 ? 'AM' : 'PM'}`;
      slots.push({ id: label, time: label, available: true });
    }
    setTimeSlots(slots);
  }, []);

  /* Initialize addresses */
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (!selectedAddress && addresses?.length) {
      setSelectedAddress(defaultAddress || addresses[0]);
    }
  }, [addresses, defaultAddress, selectedAddress, setSelectedAddress]);

  useEffect(() => {
    if (dates.length > 0 && (!selectedDate || !dates.some(d => d.toDateString() === selectedDate.toDateString()))) {
      setSelectedDate(dates[0]);
    }
  }, [dates, selectedDate, setSelectedDate]);

  /* react-navigation param sync when returning from AddressList */
  useFocusEffect(
    useCallback(() => {
      const selectedAddressId = (route.params as any)?.selectedAddressId;
      if (selectedAddressId && addresses?.length) {
        const found = addresses.find((a) => a._id === selectedAddressId);
        if (found) {
          setSelectedAddress(found);
          // clear param so it doesn't keep reapplying
          navigation.setParams({ selectedAddressId: undefined } as any);
        }
      }
    }, [route.params, addresses, navigation, setSelectedAddress])
  );

  /* helpers */
  const cartTotal = useMemo(() => {
    return cartItems?.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0) || 0;
  }, [cartItems]);

  const handleAddNewAddress = useCallback(() => {
    navigation.navigate('AddressList' as any, { currentAddressId: selectedAddress?._id || null });
  }, [navigation, selectedAddress]);

  /* Place order flow - cleaned & decomposed */
  const handlePlaceOrder = useCallback(async () => {
    // Frontend validations
    if (!selectedTimeSlot)
      return Alert.alert('Select Time', 'Please select a time slot for your service.');
    if (!selectedAddress) return Alert.alert('Select Address', 'Please select or add an address.');
    if (!selectedPayment) return Alert.alert('Select Payment', 'Please choose a payment method.');
    if (!cartItems || cartItems.length === 0)
      return Alert.alert('Empty Cart', 'Add services before placing order.');

    setLoading(true);
    setLocalLoading(true);

    try {
      // pincode availability
      const pincode = selectedAddress.pincode;
      if (!pincode) {
        Alert.alert('Address Missing Pincode', 'Selected address does not have a pincode.');
        return;
      }

      const availability = await checkPincodeAvailability(pincode);
      if (!availability?.isAvailable) {
        Alert.alert(
          'Service Unavailable',
          'Service not available in your area. We notified the team.'
        );
        await notifyAdmin(pincode);
        return;
      }

      const totalAmount = total || cartTotal + (subtotal || 0) - (discount || 0);

      // COD checks
      if (selectedPayment.type === 'cod') {
        const cs = selectedPayment.codSettings!;
        if (cs && totalAmount < cs.minAmount) {
          return Alert.alert('COD Not Available', `Minimum for COD: ₹${cs.minAmount}`);
        }
        if (cs && totalAmount > cs.maxAmount) {
          return Alert.alert('COD Not Available', `Maximum for COD: ₹${cs.maxAmount}`);
        }
      }

      // prepare booking payload
      const bookingPayload = {
        service: cartItems.map((i) => ({ serviceId: i.id, quantity: i.quantity || 1 })),
        scheduledDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
        scheduledTime: selectedTimeSlot,
        location: {
          address: {
            address: selectedAddress.address || '',
            name: selectedAddress.name || selectedAddress.type || 'Saved Address',
            city: selectedAddress.city || '',
            pincode: selectedAddress.pincode || '',
            landmark: selectedAddress.landmark || '',
            type: selectedAddress.type || '',
          },
        },
        price: subtotal || 0,
        totalAmount,
        notes: specialInstructions,
        additionalServices: [],
        paymentMethod: selectedPayment?.type || 'razorpay',
      };

      // create booking
      const bookingRes = await createBookingApi.execute(bookingPayload);
      const bookingId = bookingRes?.booking?._id || bookingRes?.data?.booking?._id;
      if (!bookingId) {
        console.error('Booking creation response', bookingRes);
        return Alert.alert('Error', 'Failed to create booking. Try again.');
      }

      // handle COD
      if (selectedPayment.type === 'cod') {
        try {
          await createCODPaymentApi.execute({
            bookingId,
            amount: totalAmount,
            notes: {
              paymentMethod: 'cod',
              scheduledDate: bookingPayload.scheduledDate,
              specialInstructions,
            },
          });

          Alert.alert('Booking Confirmed', 'Pay cash to the professional on service completion.', [
            {
              text: 'OK',
              onPress: () => {
                clear && clear();
                navigation.navigate('BookingConfirmation' as any, { bookingId });
              },
            },
          ]);
          return;
        } catch (codErr) {
          console.error('COD creation failed', codErr);
          // allow user to continue to confirmation
          Alert.alert(
            'COD Setup Failed',
            'Booking created. COD setup failed, but you can still pay at service.'
          );
          clear && clear();
          navigation.navigate('BookingConfirmation' as any, { bookingId });
          return;
        }
      }

      // online payment: create payment link
      let paymentLinkRes;
      try {
        paymentLinkRes = await api.post('/payments/create-payment-link', {
          bookingId,
          amount: totalAmount,
        });
      } catch (err: any) {
        // specific duplicate key handling (based on your backend error format)
        if (err?.errorCode === 'APP-500-407' && err?.message?.includes('duplicate key')) {
          console.log('Duplicate payment: retrying once');
          await new Promise((r) => setTimeout(r, 1000));
          paymentLinkRes = await api.post('/payments/create-payment-link', {
            bookingId,
            amount: totalAmount,
          });
        } else {
          throw err;
        }
      }

      const paymentLink =
        paymentLinkRes?.data?.payment_link || paymentLinkRes?.data?.data?.payment_link;
      const paymentId = paymentLinkRes?.data?.paymentId || paymentLinkRes?.data?.data?.paymentId;

      if (!paymentLink) {
        console.warn('No payment link returned', paymentLinkRes);
        Alert.alert('Payment Pending', 'Booking created. Please check bookings for status.');
        clear && clear();
        navigation.navigate('BookingConfirmation' as any, { bookingId });
        return;
      }

      // open browser with fallback
      let browserResult;
      try {
        browserResult = await WebBrowser.openBrowserAsync(paymentLink);
      } catch {
        try {
          await Linking.openURL(paymentLink);
          Alert.alert(
            'Payment Opened',
            'Complete payment in the browser. After that, check your bookings.'
          );
          clear && clear();
          navigation.navigate('CustomerTabs' as any, { screen: 'Bookings' });
          return;
        } catch {
          Alert.alert('Error', 'Could not open payment link.');
          return;
        }
      }

      // if user closed/dismissed, poll the payment status
      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        let status: 'success' | 'failed' | 'unknown' | null = null;
        let attempts = 0;
        const maxAttempts = 6;

        while (attempts < maxAttempts && !status) {
          await new Promise((r) => setTimeout(r, 2000));
          attempts++;
          try {
            const statusRes = await api.get(`/payments/${paymentId}`);
            const paymentState =
              statusRes?.data?.payment?.status || statusRes?.data?.data?.payment?.status;
            if (paymentState === 'captured' || paymentState === 'authorized') {
              status = 'success';
              break;
            } else if (paymentState === 'failed') {
              status = 'failed';
              break;
            }
          } catch (err) {
            console.error('Payment status check error', err);
          }
        }

        if (status === 'success') {
          Alert.alert('Payment Successful', 'Your booking is confirmed.', [
            {
              text: 'View Booking',
              onPress: () => {
                clear && clear();
                navigation.navigate('BookingConfirmation' as any, { bookingId });
              },
            },
          ]);
        } else if (status === 'failed') {
          Alert.alert('Payment Failed', 'Please try again or contact support.');
        } else {
          Alert.alert(
            'Payment Processing',
            'Your payment is being processed. Check bookings shortly.',
            [
              {
                text: 'View Bookings',
                onPress: () => {
                  clear && clear();
                  navigation.navigate('CustomerTabs' as any, { screen: 'Bookings' });
                },
              },
              {
                text: 'OK',
                onPress: () => {
                  clear && clear();
                  navigation.navigate('BookingConfirmation' as any, { bookingId });
                },
              },
            ]
          );
        }
      } else {
        clear && clear();
        navigation.navigate('BookingConfirmation' as any, { bookingId });
      }
    } catch (err: any) {
      console.error('Place order error:', err);
      if (err?.errorCode === 'APP-500-407' && err?.message?.includes('duplicate key')) {
        Alert.alert('Duplicate Order', 'A payment is already in progress for this booking.');
      } else if (err?.userFriendlyMessage) {
        Alert.alert('Error', err.userFriendlyMessage);
      } else {
        Alert.alert('Error', err?.message || 'Failed to place order. Try again.');
      }
    } finally {
      setLoading(false);
      setLocalLoading(false);
    }
  }, [
    cartItems,
    clear,
    checkPincodeAvailability,
    createBookingApi,
    createCODPaymentApi,
    discount,
    notifyAdmin,
    navigation,
    selectedAddress,
    selectedDate,
    selectedPayment,
    selectedTimeSlot,
    setLoading,
    specialInstructions,
    subtotal,
    total,
    cartTotal,
  ]);

  /* UI */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <IconButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </IconButton>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <ScrollView style={styles.flex1} contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Date */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Date</Text>
            </View>
            <DatePicker
              dates={dates}
              value={selectedDate}
              onChange={(d) => {
                setSelectedDate(d);
                setSelectedTimeSlot(null);
              }}
            />
          </View>

          {/* Time slots */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <TimeSlotGrid
              slots={timeSlots}
              value={selectedTimeSlot}
              onSelect={setSelectedTimeSlot}
            />
          </View>

          {/* Address */}
          <View style={styles.section}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionTitle}>Address</Text>
              <TouchableOpacity onPress={handleAddNewAddress}>
                <Text style={styles.linkText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            <AddressPicker
              addresses={addresses}
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
              loading={addressesLoading}
              error={addressesError}
              onAddNew={handleAddNewAddress}
            />
          </View>

          {/* Special instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions (optional)</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="e.g., Gate code, car model, or any accessibility notes"
              multiline
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
            />
          </View>

          {/* Payment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            <PaymentMethodList
              methods={paymentMethods}
              selectedId={selectedPayment?.id || null}
              onSelect={(m) => setSelectedPayment(m)}
              cartTotal={cartTotal}
            />
          </View>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.grayText}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{(subtotal || cartTotal).toFixed(2)}</Text>
            </View>
            {discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.greenText}>Discount</Text>
                <Text style={styles.greenText}>-₹{(discount || 0).toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalPrimary}>
                ₹{(total || cartTotal - (discount || 0)).toFixed(2)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.placeOrderButton, (isLoading || localLoading) && { opacity: 0.8 }]}
            onPress={handlePlaceOrder}
            disabled={isLoading || localLoading}
            activeOpacity={0.9}>
            {isLoading || localLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

/* -------------------------
   Styles
   ------------------------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { flex: 1, backgroundColor: '#fff' },
  flex1: { flex: 1, paddingHorizontal: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eef2f7',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginLeft: 8 },

  section: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111827' },

  // Dates
  dateOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    marginRight: 12,
  },
  dateOptionSelected: {
    backgroundColor: '#2563eb',
  },
  dateText: { textAlign: 'center', fontWeight: '600', color: '#111827' },
  dateTextSelected: { color: '#fff' },

  // Time slots
  timeSlotContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  timeSlot: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    margin: 6,
  },
  timeSlotSelected: { backgroundColor: '#2563eb' },
  timeSlotDisabled: { backgroundColor: '#f1f5f9' },
  timeSlotText: { textAlign: 'center', color: '#111827' },

  // Address
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: { color: '#2563eb', fontWeight: '600' },
  addressBox: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
    backgroundColor: '#fff',
  },
  addressSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  addressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addressTitle: { fontWeight: '700', color: '#111827' },
  addressText: { marginTop: 6, color: '#475569' },

  defaultBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: { fontSize: 12, color: '#475569' },

  instructionsInput: {
    borderWidth: 1,
    borderColor: '#eef2f7',
    borderRadius: 12,
    padding: 12,
    height: scaleHeight(110),
    color: '#111827',
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },

  // Payment
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eef2f7',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: { flex: 1, marginLeft: 4 },
  addressSubtitle: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
  },
  grayText: { color: '#6b7280' },
  greenText: { color: '#16a34a', fontWeight: '600' },
  summaryValue: { fontWeight: '700' },
  totalText: { fontSize: 16, fontWeight: '700' },
  totalPrimary: { fontSize: 16, fontWeight: '700', color: '#2563eb' },

  // Footer
  footer: { padding: 16, borderTopWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#fff' },
  placeOrderButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // Loading / error
  errorContainer: { padding: 12, backgroundColor: '#fef2f2', borderRadius: 12, marginBottom: 12 },
  errorText: { color: '#dc2626', fontSize: 14, marginBottom: 8 },
  retryButton: { alignSelf: 'flex-start' },

  // misc
  paymentMethodDisabled: { backgroundColor: '#f8fafc', opacity: 0.7 },
  disabledText: { color: '#9ca3af' },
  feeInfo: { fontSize: 11, color: '#f59e0b', marginTop: 6, fontWeight: '600' },
  codInfo: { fontSize: 11, color: '#16a34a', marginTop: 6, fontWeight: '600' },
  codUnavailable: { color: '#dc2626' },
  unavailableBadge: {
    backgroundColor: '#fff1f2',
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  grayTextSmall: { color: '#6b7280', fontSize: 12 },
  emptyPaymentContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  addPaymentButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  addPaymentText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { useCreateBooking } from '../../hooks/useBookings';
import { useCreatePaymentOrder, usePaymentMethods, useVerifyPayment } from '../../hooks/usePayments';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

interface AddressOption {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// ...existing types

// Debug utility for Razorpay module structure
const debugRazorpayModule = (mod: any) => {
  console.log('=== Razorpay Module Debug ===');
  console.log('Module:', mod);
  console.log('Module keys:', Object.keys(mod || {}));
  console.log('Has default:', !!mod?.default);
  console.log('Default keys:', mod?.default ? Object.keys(mod.default) : 'N/A');
  console.log('Direct open function:', typeof mod?.open);
  console.log('Default open function:', typeof mod?.default?.open);
  console.log('RazorpayCheckout property:', typeof mod?.RazorpayCheckout);
  console.log('=============================');
};


const CheckoutScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const navigation = useNavigation<CheckoutScreenNavigationProp>();

  const { items: cartItems, clear } = useCart();
  const createBookingApi = useCreateBooking();
  const createOrderApi = useCreatePaymentOrder();
  const verifyPaymentApi = useVerifyPayment();

  // Address management
  const [addresses, setAddresses] = useState<AddressOption[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressesLoading(true);
        // TODO: Replace with actual API call to load user addresses
        // const userAddresses = await userService.getAddresses();
        
        // For now, use fallback address
        const fallback = [{ id: 'default', title: 'Home', address: 'Default Address', isDefault: true }];
        setAddresses(fallback);
        if (fallback.length > 0) setSelectedAddress(fallback[0].id);
      } catch (error) {
        console.error('Failed to load addresses:', error);
        setAddresses([]);
      } finally {
        setAddressesLoading(false);
      }
    };
    
    loadAddresses();
  }, []);

  // Generate dates for the next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };
  // generate simple hourly time slots
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  useEffect(() => {
    const slots: TimeSlot[] = [];
    for (let h = 9; h <= 17; h++) {
      const label = `${h}:00 ${h < 12 ? 'AM' : h === 12 ? 'PM' : 'PM'}`;
      slots.push({ id: `${h}`, time: label, available: true });
    }
    setTimeSlots(slots);
  }, []);

  // Payment methods from API
  const paymentMethodsApi = usePaymentMethods();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  
  // Load payment methods on component mount
  useEffect(() => {
    console.log('Loading payment methods...');
    paymentMethodsApi.execute();
    
    // Add timeout to show fallback methods if API takes too long
    const timeout = setTimeout(() => {
      if (paymentMethodsApi.loading && (!paymentMethodsApi.data || paymentMethodsApi.data.length === 0)) {
        console.log('Payment methods API timeout, using fallback methods');
        const fallbackMethods = [
          {
            id: 'razorpay',
            name: 'Razorpay (All Methods)',
            details: 'Cards, UPI, Wallets, Net Banking',
            icon: 'card-outline',
            type: 'razorpay',
            isDefault: true
          }
        ];
        
        // Force update the API state
        paymentMethodsApi.data = fallbackMethods;
        paymentMethodsApi.loading = false;
        setSelectedPaymentMethod(fallbackMethods[0].id);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Set default payment method when data loads
  useEffect(() => {
    console.log('Payment methods API response:', {
      data: paymentMethodsApi.data,
      loading: paymentMethodsApi.loading,
      error: paymentMethodsApi.error
    });
    
    if (paymentMethodsApi.data && Array.isArray(paymentMethodsApi.data)) {
      const methods = paymentMethodsApi.data as any[];
      if (methods.length > 0 && !selectedPaymentMethod) {
        setSelectedPaymentMethod(methods[0].id);
      }
    }
    
    // If API fails, add fallback payment methods for development
    if (paymentMethodsApi.error && (!paymentMethodsApi.data || paymentMethodsApi.data.length === 0)) {
      console.log('Using fallback payment methods due to API error');
      const fallbackMethods = [
        {
          id: 'razorpay',
          name: 'Razorpay (All Methods)',
          details: 'Cards, UPI, Wallets, Net Banking',
          icon: 'card-outline',
          type: 'razorpay',
          isDefault: true
        },
        {
          id: 'upi',
          name: 'UPI',
          details: 'Pay using UPI',
          icon: 'phone-portrait-outline',
          type: 'upi',
          isDefault: false
        }
      ];
      
      // Simulate API response structure
      paymentMethodsApi.data = fallbackMethods;
      if (!selectedPaymentMethod) {
        setSelectedPaymentMethod(fallbackMethods[0].id);
      }
    }
  }, [paymentMethodsApi.data, paymentMethodsApi.loading, paymentMethodsApi.error, selectedPaymentMethod]);
  const handlePlaceOrder = async () => {
    if (!selectedTimeSlot) {
      Alert.alert('Select Time', 'Please select a time slot for your service.');
      return;
    }

    if (!selectedAddress) {
      Alert.alert('Select Address', 'Please select a service address to continue.');
      return;
    }

    if (!selectedPaymentMethod) {
      Alert.alert('Select Payment Method', 'Please select a payment method to continue.');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add services before placing an order.');
      return;
    }

    setIsLoading(true);
    try {
      // Create booking on backend
      const bookingPayload = {
        service: cartItems.map(i => i.id),
        scheduledDate: selectedDate.toISOString(),
        scheduledTime: selectedTimeSlot,
        location: {
          address: addresses.find(a => a.id === selectedAddress)?.address || 'Default Address',
          name: addresses.find(a => a.id === selectedAddress)?.title || 'Home',
          city: '',
          pincode: ''
        },
        price: cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
        totalAmount: cartItems.reduce((s, it) => s + it.price * it.quantity, 0),
        notes: specialInstructions,
        additionalServices: []
      };

      const bookingRes = await createBookingApi.execute(bookingPayload);
      const bookingId = bookingRes?.booking?._id || bookingRes?.data?.booking?._id || bookingRes?.data?._id || bookingRes?.data?.bookingId;

      if (!bookingId) {
        console.error('Failed to extract booking ID from response:', bookingRes);
        Alert.alert('Error', 'Failed to create booking. Please try again.');
        return;
      }

      console.log('✅ Booking created successfully with ID:', bookingId);

      // Create payment order (Razorpay)
      const amount = bookingPayload.totalAmount;
      const orderRes = await createOrderApi.execute({ 
        bookingId, 
        amount
      });

      console.log('💳 Payment order response:', orderRes);

      const order = orderRes?.order ?? orderRes?.data?.order ?? orderRes?.data?.order_id ?? orderRes?.data;
      const key = orderRes?.key ?? orderRes?.data?.key ?? orderRes?.data?.key_id;

      console.log('💳 Extracted order:', order);
      console.log('💳 Extracted key:', key);

      // If possible, dynamically import Razorpay SDK and open native checkout
      // TROUBLESHOOTING: If you get "Cannot read property 'open' of null" errors:
      // 1. Ensure react-native-razorpay is properly installed: npm install react-native-razorpay
      // 2. For Expo projects: Add to app.json plugins: ["react-native-razorpay"]
      // 3. For bare React Native: run 'cd ios && pod install' (iOS) or rebuild (Android)
      // 4. Clear Metro cache: npx react-native start --reset-cache
      if (!order || !key) {
        // Backend didn't return order/key as expected — proceed to confirmation and rely on server-side webhooks
        Alert.alert('Payment info missing', 'Could not start payment. Booking has been created and will be updated once payment is confirmed.');
        navigation.navigate('BookingConfirmation', { bookingId });
        // clear cart since booking was created and user is on confirmation
        clear && clear();
      } else {
        try {
          let RazorpayCheckout: any = null;
          try {
            // dynamic import - will fail if the library isn't installed
            const mod = await import('react-native-razorpay');
            debugRazorpayModule(mod);
            
            // Try multiple ways to get the RazorpayCheckout
            if (mod && typeof mod.default === 'object' && typeof mod.default.open === 'function') {
              RazorpayCheckout = mod.default;
            } else if (mod && typeof mod.open === 'function') {
              RazorpayCheckout = mod;
            } else if (mod && mod.RazorpayCheckout && typeof mod.RazorpayCheckout.open === 'function') {
              RazorpayCheckout = mod.RazorpayCheckout;
            } else if (mod && mod.default && typeof mod.default === 'function') {
              // Some libraries export the main function as default
              RazorpayCheckout = { open: mod.default };
            } else {
              console.warn('Razorpay module structure:', Object.keys(mod || {}));
              RazorpayCheckout = null;
            }
          } catch (importError) {
            console.error('Razorpay dynamic import error:', importError);
            
            // Fallback: try static import (this will only work if the library is properly linked)
            try {
              // eslint-disable-next-line @typescript-eslint/no-var-requires
              const RazorpayStatic = require('react-native-razorpay');
              if (RazorpayStatic && typeof RazorpayStatic.open === 'function') {
                RazorpayCheckout = RazorpayStatic;
              } else if (RazorpayStatic && RazorpayStatic.default && typeof RazorpayStatic.default.open === 'function') {
                RazorpayCheckout = RazorpayStatic.default;
              }
            } catch (staticImportError) {
              console.error('Razorpay static import also failed:', staticImportError);
            }
            
            RazorpayCheckout = RazorpayCheckout || null;
          }

          if (RazorpayCheckout && typeof RazorpayCheckout.open === 'function') {
            const options = {
              description: 'Payment for booking ' + bookingId,
              currency: order.currency || 'INR',
              key: key,
              amount: order.amount || Math.round(amount * 100), // in paise
              name: 'DashStream',
              order_id: order.id || order.order_id,
              prefill: {
                name: '',
                email: '',
                contact: ''
              },
              theme: { color: '#2563eb' }
            };

            console.log('Opening Razorpay checkout with options:', options);
            
            // Final safety check before calling open
            if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
              throw new Error('Razorpay checkout function is not available');
            }
            
            const paymentResult = await RazorpayCheckout.open(options);
            console.log('Razorpay payment result:', paymentResult);

            // paymentResult contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = paymentResult;

            // Verify payment on backend with retries (network or webhook race conditions possible)
            const verifyPayload = {
              orderId: razorpay_order_id || order.id,
              paymentId: razorpay_payment_id,
              signature: razorpay_signature,
              bookingId
            };

            const verifyWithRetry = async (attempts = 3, delayMs = 1000) => {
              for (let i = 0; i < attempts; i++) {
                try {
                  await verifyPaymentApi.execute(verifyPayload);
                  return true;
                } catch (e: any) {
                  console.warn(`verify attempt ${i + 1} failed`, e?.message || e);
                  if (i < attempts - 1) await new Promise(res => setTimeout(res, delayMs * (i + 1)));
                }
              }
              return false;
            };

            const verified = await verifyWithRetry();
            if (!verified) {
              Alert.alert('Payment verification pending', 'Payment succeeded but verification failed. We will update your booking once verification succeeds.');
            }

            // Navigate to confirmation after successful verification
            navigation.navigate('BookingConfirmation', { bookingId });
            // clear cart now that booking/payment succeeded
            clear && clear();
          } else {
            // SDK not available: fallback
            Alert.alert('Razorpay SDK not installed', 'Payment SDK is not available in this build. Complete payment flow via server/webhooks.');
            navigation.navigate('BookingConfirmation', { bookingId });
            clear && clear();
          }
        } catch (err: any) {
          console.error('Razorpay checkout error:', err);
          
          // Handle specific Razorpay errors
          let errorMessage = 'Payment was not completed.';
          
          if (err?.code === 'payment_cancelled') {
            errorMessage = 'Payment was cancelled by user.';
          } else if (err?.code === 'payment_failed') {
            errorMessage = 'Payment failed. Please try again.';
          } else if (err?.code === 'network_error') {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else if (err?.message?.includes('Cannot read property \'open\' of null')) {
            errorMessage = 'Payment system is not properly configured. Please try again or contact support.';
          } else if (err?.message) {
            errorMessage = err.message;
          }
          
          Alert.alert('Payment Error', errorMessage);
        }
      }
      
    } catch (error: any) {
      console.error('Place order error:', error);
      Alert.alert('Error', error?.message || 'Failed to place order.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNewAddress = () => {
    try {
      console.log('Add New Address button pressed');
      console.log('Navigation object:', navigation);
      console.log('Attempting to navigate to AddAddress screen');
      navigation.navigate('AddAddress');
      console.log('Navigation call completed');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to Add Address screen');
    }
  };
  
  const handleAddPaymentMethod = () => {
    try {
      console.log('Add New Payment Method button pressed');
      navigation.navigate('PaymentMethods');
      console.log('Navigated to PaymentMethods screen');
    } catch (error) {
      console.error('Payment methods navigation error:', error);
      Alert.alert('Navigation Error', 'Failed to navigate to Payment Methods screen');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
        </View>

        <ScrollView style={styles.flex1}>
          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {dates.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                    onPress={() => handleDateSelect(date)}
                  >
                    <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>
                      {formatDate(date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slot Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <View style={styles.timeSlotContainer}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTimeSlot === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.timeSlot, !slot.available && styles.timeSlotDisabled, isSelected && slot.available && styles.timeSlotSelected]}
                    onPress={() => slot.available && setSelectedTimeSlot(slot.id)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[styles.timeSlotText, !slot.available && styles.textGray, isSelected && slot.available && styles.textWhite]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Address Selection */}
          <View style={styles.section}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionTitle}>Service Address</Text>
              <TouchableOpacity 
                onPress={handleAddNewAddress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {addressesLoading ? (
              <Text style={styles.grayText}>Loading addresses...</Text>
            ) : addresses.length > 0 ? (
              addresses.map((address) => {
                const isSelected = selectedAddress === address.id;
                return (
                  <TouchableOpacity
                    key={address.id}
                    style={[styles.addressBox, isSelected && styles.addressSelected]}
                    onPress={() => setSelectedAddress(address.id)}
                  >
                    <View style={styles.addressTopRow}>
                      <Text style={styles.addressTitle}>{address.title}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.addressText}>{address.address}</Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyPaymentContainer}>
                <Text style={styles.grayText}>No saved addresses found</Text>
                <TouchableOpacity onPress={handleAddNewAddress} style={styles.addPaymentButton}>
                  <Text style={styles.addPaymentText}>Add Address</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Special Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
            <TextInput
              style={styles.instructionsInput}
              placeholder="Any special instructions for the service professional?"
              multiline
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
            />
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <View style={styles.addressHeader}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <TouchableOpacity 
                onPress={handleAddPaymentMethod}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>+ Add New</Text>
              </TouchableOpacity>
            </View>
            
            {paymentMethodsApi.loading ? (
              <Text style={styles.grayText}>Loading payment methods...</Text>
            ) : paymentMethodsApi.error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load payment methods</Text>
                <TouchableOpacity onPress={() => paymentMethodsApi.execute()} style={styles.retryButton}>
                  <Text style={styles.linkText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : paymentMethodsApi.data && Array.isArray(paymentMethodsApi.data) && paymentMethodsApi.data.length > 0 ? (
              (paymentMethodsApi.data as any[]).map((method) => {
                const isSelected = selectedPaymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[styles.paymentMethod, isSelected && styles.addressSelected]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <View style={styles.paymentIconBox}>
                      <Ionicons name={method.icon || 'card-outline'} size={20} color="#2563eb" />
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={styles.addressTitle}>{method.name}</Text>
                      {method.details && <Text style={styles.addressSubtitle}>{method.details}</Text>}
                    </View>
                    {method.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyPaymentContainer}>
                <Text style={styles.grayText}>No payment methods found</Text>
                <TouchableOpacity onPress={handleAddPaymentMethod} style={styles.addPaymentButton}>
                  <Text style={styles.addPaymentText}>Add Payment Method</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems && (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.grayText}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₹{cartItems.reduce((s, it) => s + it.price * it.quantity, 0)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.grayText}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>₹49</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.greenText}>Discount</Text>
                  <Text style={styles.greenText}>-₹0</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalText}>Total</Text>
                  <Text style={styles.totalPrimary}>₹{cartItems.reduce((s, it) => s + it.price * it.quantity, 0) + 49}</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  flex1: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  backButton: { 
    marginRight: 16 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  section: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    marginBottom: 12 
  },
  dateOption: { 
    padding: 12, 
    borderRadius: 16, 
    backgroundColor: '#f3f4f6', 
    marginRight: 12 
  },
  dateOptionSelected: { 
    backgroundColor: '#2563eb' 
  },
  dateText: { 
    textAlign: 'center', 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  dateTextSelected: { 
    color: '#fff' 
  },
  timeSlotContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap' 
  },
  timeSlot: { 
    padding: 12, 
    borderRadius: 16, 
    backgroundColor: '#f3f4f6', 
    margin: 4 
  },
  timeSlotSelected: { 
    backgroundColor: '#2563eb' 
  },
  timeSlotDisabled: { 
    backgroundColor: '#e5e7eb' 
  },
  timeSlotText: { 
    textAlign: 'center', 
    color: '#1f2937' 
  },
  textGray: { 
    color: '#9ca3af' 
  },
  textWhite: { 
    color: '#fff' 
  },
  addressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  linkText: { 
    color: '#2563eb' 
  },
  addressBox: { 
    padding: 12, 
    marginBottom: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  addressSelected: { 
    borderColor: '#2563eb', 
    backgroundColor: '#eff6ff' 
  },
  addressTopRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  addressTitle: { 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  addressText: { 
    marginTop: 4, 
    color: '#4b5563' 
  },
  defaultBadge: { 
    backgroundColor: '#e5e7eb', 
    paddingHorizontal: 8, 
    borderRadius: 8 
  },
  defaultBadgeText: { 
    fontSize: 12, 
    color: '#6b7280' 
  },
  instructionsInput: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    padding: 12, 
    height: 100, 
    color: '#1f2937', 
    textAlignVertical: 'top' 
  },
  paymentMethod: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 16, 
    marginBottom: 12 
  },
  paymentIconBox: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  grayText: { 
    color: '#6b7280' 
  },
  greenText: { 
    color: '#16a34a', 
    fontWeight: '600' 
  },
  summaryValue: { 
    fontWeight: '600' 
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  totalPrimary: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2563eb' 
  },
  footer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  placeOrderButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 16, 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  placeOrderText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    marginBottom: 12
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 8
  },
  retryButton: {
    alignSelf: 'flex-start'
  },
  paymentMethodInfo: {
    flex: 1,
    marginLeft: 8
  },
  addressSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2
  },
  emptyPaymentContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12
  },
  addPaymentButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8
  },
  addPaymentText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14
  }
});
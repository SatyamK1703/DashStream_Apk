import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { useNavigation, useRoute, useFocusEffect, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart, useAddresses, useCheckout } from '../../store';
import { useCreateBooking } from '../../hooks/useBookings';
import { useCreateCODPayment } from '../../hooks/usePayments';
import api from '../../services/httpClient'; // <-- Ensure you have a generic API client for direct calls
import { Address } from '../../types/api';
// @ts-ignore: expo-web-browser may not have types in some setups
import * as WebBrowser from 'expo-web-browser';

type CheckoutScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const AddressPicker = ({
  addresses,
  selectedAddress,
  onSelect,
  loading,
  error,
  onAddNew,
}: {
  addresses: Address[];
  selectedAddress: Address | null;
  onSelect: (address: Address) => void;
  loading: boolean;
  error: any;
  onAddNew: () => void;
}) => {
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      onSelect(addresses[0]);
    }
  }, [addresses, selectedAddress, onSelect]);

  if (loading) {
    return <Text style={styles.grayText}>Loading addresses...</Text>;
  }
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load addresses</Text>
        {/* Add retry logic if needed */}
      </View>
    );
  }
  if (addresses.length === 0) {
    return (
      <View style={styles.emptyPaymentContainer}>
        <Text style={styles.grayText}>No saved addresses found</Text>
        <TouchableOpacity onPress={onAddNew} style={styles.addPaymentButton}>
          <Text style={styles.addPaymentText}>Add Address</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <>
      {addresses.map((address) => {
        const isSelected = selectedAddress?._id === address._id;
        const displayLines = [address.addressLine1, address.addressLine2, address.city, address.state]
          .filter(Boolean)
          .join(', ');
        return (
          <TouchableOpacity
            key={address._id}
            style={[styles.addressBox, isSelected && styles.addressSelected]}
            onPress={() => onSelect(address)}
          >
            <View style={styles.addressTopRow}>
              <Text style={styles.addressTitle} numberOfLines={1}>
                {address.title || address.type || 'Saved Address'}
              </Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText} numberOfLines={2}>
              {displayLines || 'No address details provided'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );
};

const CheckoutScreen = () => {
  const route = useRoute<RouteProp<CustomerStackParamList, 'Checkout'>>();
  const navigation = useNavigation<CheckoutScreenNavigationProp>();

  // Use centralized stores
  const { items: cartItems, clear } = useCart();
  const { addresses, defaultAddress, isLoading: addressesLoading, error: addressesError, fetchAddresses } = useAddresses();
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

  // Booking and payment hooks
  const createBookingApi = useCreateBooking();
  const createCODPaymentApi = useCreateCODPayment();

  // Simplified payment methods - only UPI and COD
  const paymentMethods = [
    {
      id: 'upi',
      type: 'razorpay', // UPI will use Razorpay for processing
      name: 'UPI Payment',
      description: 'Pay using UPI apps like GPay, PhonePe, Paytm',
      icon: 'phone-portrait-outline',
      isDefault: true,
      fees: {
        percentage: 0,
        fixed: 0
      }
    },
    {
      id: 'cod',
      type: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay cash after service completion',
      icon: 'cash-outline',
      isDefault: false,
      codSettings: {
        minAmount: 50,
        maxAmount: 5000,
        collectBeforeService: false
      }
    }
  ];

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0]); // Default to UPI

  // Initialize addresses
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const addressToSelect = defaultAddress || addresses[0];
      setSelectedAddress(addressToSelect);
    }
  }, [addresses, defaultAddress, selectedAddress, setSelectedAddress]);

  // Handle address selection from AddressList screen
  useFocusEffect(
    React.useCallback(() => {
      const selectedAddressId = route.params?.selectedAddressId;

      if (selectedAddressId && addresses.length > 0) {
        const addressToSet = addresses.find(addr => addr._id === selectedAddressId);
        if (addressToSet) {
          setSelectedAddress(addressToSet);
          // Clear the parameter
          navigation.setParams({ selectedAddressId: undefined } as any);
        }
      }
    }, [route.params?.selectedAddressId, addresses, navigation, setSelectedAddress])
  );

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

    setLoading(true);
    try {
      if (!selectedAddress) {
        Alert.alert('Error', 'Please select a valid address.');
        return;
      }

      // Calculate complete total including all fees and taxes
      const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
      const deliveryFee = 49;
      const discount = 0; // Can be calculated from promo codes

      // Calculate processing fee from selected payment method
      const processingFee = selectedPaymentMethod?.fees ?
        (selectedPaymentMethod.fees.percentage > 0 ?
          (subtotal * selectedPaymentMethod.fees.percentage / 100) :
          (selectedPaymentMethod.fees.fixed || 0)
        ) : 0;

      // Calculate amount before tax
      const amountBeforeTax = subtotal + deliveryFee + processingFee - discount;

      // Calculate 18% GST
      const gst = amountBeforeTax * 0.18;

      // Calculate final total
      const totalAmount = amountBeforeTax + gst;

      // COD validation
      if (selectedPaymentMethod.type === 'cod') {
        const codSettings = selectedPaymentMethod.codSettings;

        if (codSettings && totalAmount < codSettings.minAmount) {
          Alert.alert('COD Not Available', `Minimum amount for COD is ₹${codSettings.minAmount}. Please add more services or choose UPI payment.`);
          return;
        }

        if (codSettings && totalAmount > codSettings.maxAmount) {
          Alert.alert('COD Not Available', `Maximum amount for COD is ₹${codSettings.maxAmount}. Please choose UPI payment for this order.`);
          return;
        }
      }

      // Create booking on backend
      const bookingPayload = {
        service: cartItems.map(i => i.id),
        scheduledDate: selectedDate.toISOString(),
        scheduledTime: selectedTimeSlot,
        location: {
          address: selectedAddress.addressLine1 || 'Address not specified',
          name: selectedAddress.title || selectedAddress.type || 'Saved Address',
          city: selectedAddress.city || 'City not specified',
          pincode: selectedAddress.postalCode || 'Pincode not available'
        },
        price: subtotal, // Base price without fees and taxes
        totalAmount: totalAmount, // Complete total including all fees and taxes
        notes: specialInstructions,
        additionalServices: [],
        paymentMethod: selectedPaymentMethod?.type || 'razorpay'
      };

      const bookingRes = await createBookingApi.execute(bookingPayload);
      const bookingId = bookingRes?.booking?._id;

      if (!bookingId) {
        console.error('Failed to extract booking ID from response:', bookingRes);
        Alert.alert('Error', 'Failed to create booking. Please try again.');
        return;
      }

      // Handle payment based on selected method
      if (selectedPaymentMethod?.type === 'cod') {
        // For COD, create a COD payment record and navigate to confirmation
        try {
          const amount = totalAmount; // Use the complete total amount
          await createCODPaymentApi.execute({
            bookingId,
            amount,
            notes: {
              paymentMethod: 'cod',
              scheduledDate: selectedDate.toISOString(),
              specialInstructions
            }
          });

          Alert.alert(
            'Order Placed Successfully!',
            'Your booking has been confirmed. You can pay cash when the service is completed.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('BookingConfirmation', {
                    bookingId
                  });
                  clear && clear();
                }
              }
            ]
          );
          return;
        } catch (codError) {
          console.error('COD payment creation failed:', codError);
          Alert.alert('COD Setup Failed', 'Booking created but COD setup failed. You can still pay cash during service.');
          navigation.navigate('BookingConfirmation', {
            bookingId
          });
          clear && clear();
          return;
        }
      }

      // For online payments, create payment link
      const amount = totalAmount; // Use the complete total amount
      // Direct API call to /payments/create-payment-link
      let paymentLinkRes;

      try {
        paymentLinkRes = await api.post('/payments/create-payment-link', {
          bookingId,
          amount
        });
      } catch (paymentError: any) {
        // Handle duplicate key error specifically
        if (paymentError?.errorCode === 'APP-500-407' && paymentError?.message?.includes('duplicate key')) {
          // Try again after a brief delay
          console.log('Duplicate payment detected, retrying...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          try {
            paymentLinkRes = await api.post('/payments/create-payment-link', {
              bookingId,
              amount
            });
          } catch (retryError) {
            console.error('Payment creation retry failed:', retryError);
            throw paymentError; // Throw original error
          }
        } else {
          throw paymentError;
        }
      }

      // Debug: Log the full response to see the structure
      console.log('Payment Link Response:', JSON.stringify(paymentLinkRes, null, 2));

      // Extract payment link from response (backend returns { status: "success", data: { payment_link, paymentId, ... } })
      const paymentLink = paymentLinkRes?.data?.payment_link;
      const paymentId = paymentLinkRes?.data?.paymentId;

      console.log('Extracted Payment Link:', paymentLink);
      console.log('Extracted Payment ID:', paymentId);

      if (!paymentLink) {
        console.error('Payment link missing from response:', paymentLinkRes);
        Alert.alert('Payment info missing', 'Could not start payment. Booking has been created and will be updated once payment is confirmed.');
        navigation.navigate('BookingConfirmation', { bookingId });
        clear && clear();
        return;
      }

      // Open payment link in browser (Expo WebBrowser preferred)
      let browserResult;
      try {
        browserResult = await WebBrowser.openBrowserAsync(paymentLink);
      } catch {
        // Fallback to Linking if WebBrowser fails
        try {
          await Linking.openURL(paymentLink);
          // For Linking, we can't detect when user returns, so show a message
          Alert.alert(
            'Payment Window Opened',
            'Please complete your payment in the browser. Once done, return to the app and check your bookings.',
            [
              {
                text: 'View Bookings',
                onPress: () => {
                  navigation.navigate('CustomerTabs' as any, { screen: 'Bookings' });
                  clear && clear();
                }
              },
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('BookingConfirmation', { bookingId });
                  clear && clear();
                }
              }
            ]
          );
          return;
        } catch {
          Alert.alert('Error', 'Could not open payment page.');
          return;
        }
      }

      // User closed the browser - check payment status
      if (browserResult.type === 'cancel' || browserResult.type === 'dismiss') {
        // Poll payment status for a few seconds
        let paymentStatus = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts && !paymentStatus) {
          try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between checks
            const statusRes = await api.get(`/payments/${paymentId}`);
            const status = statusRes?.data?.payment?.status;

            if (status === 'captured' || status === 'authorized') {
              paymentStatus = 'success';
              break;
            } else if (status === 'failed') {
              paymentStatus = 'failed';
              break;
            }
          } catch (error) {
            console.error('Error checking payment status:', error);
          }
          attempts++;
        }

        // Show appropriate message based on payment status
        if (paymentStatus === 'success') {
          Alert.alert(
            'Payment Successful!',
            'Your booking has been confirmed and payment is complete.',
            [
              {
                text: 'View Booking',
                onPress: () => {
                  navigation.navigate('BookingConfirmation', { bookingId });
                  clear && clear();
                }
              }
            ]
          );
        } else if (paymentStatus === 'failed') {
          Alert.alert(
            'Payment Failed',
            'Your payment could not be processed. Please try again or contact support.',
            [
              {
                text: 'Try Again',
                onPress: () => {
                  // User can try placing order again
                }
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        } else {
          // Payment status unknown - might still be processing
          Alert.alert(
            'Payment Processing',
            'Your payment is being processed. Please check your bookings in a few moments.',
            [
              {
                text: 'View Bookings',
                onPress: () => {
                  navigation.navigate('CustomerTabs' as any, { screen: 'Bookings' });
                  clear && clear();
                }
              },
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('BookingConfirmation', { bookingId });
                  clear && clear();
                }
              }
            ]
          );
        }
      } else {
        // Browser closed normally (shouldn't happen with payment links)
        navigation.navigate('BookingConfirmation', { bookingId });
        clear && clear();
      }
    } catch (error: any) {
      console.error('Place order error:', error);

      // Handle specific error scenarios
      if (error?.errorCode === 'APP-500-407' && error?.message?.includes('duplicate key')) {
        Alert.alert(
          'Duplicate Order',
          'A payment for this booking is already in progress. Please check your bookings or try again in a few minutes.',
          [
            { text: 'View Bookings', onPress: () => navigation.navigate('CustomerTabs' as any, { screen: 'Bookings' }) },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else if (error?.userFriendlyMessage) {
        Alert.alert('Error', error.userFriendlyMessage);
      } else {
        Alert.alert('Error', error?.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddressList', {
      currentAddressId: selectedAddress?._id || null,
    });
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
              <Text style={styles.sectionTitle}>Address</Text>
              <TouchableOpacity
                onPress={handleAddNewAddress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
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
            <Text style={styles.sectionTitle}>Payment Method</Text>

            {paymentMethods.map((method) => {
              const isSelected = selectedPaymentMethod?.id === method.id;
              const totalAmount = cartItems?.reduce((s, it) => s + it.price * it.quantity, 0) || 0;

              // Check if COD is available for this order
              const isCODAvailable = method.type === 'cod' ?
                (method.codSettings && totalAmount >= method.codSettings.minAmount && totalAmount <= method.codSettings.maxAmount) :
                true;

              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    isSelected && styles.addressSelected,
                    !isCODAvailable && styles.paymentMethodDisabled
                  ]}
                  onPress={() => isCODAvailable && setSelectedPaymentMethod(method)}
                  disabled={!isCODAvailable}
                >
                  <View style={styles.paymentIconBox}>
                    <Ionicons name={method.icon as any || 'card-outline'} size={20} color={isCODAvailable ? "#2563eb" : "#9ca3af"} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={[styles.addressTitle, !isCODAvailable && styles.disabledText]}>{method.name}</Text>
                    <Text style={[styles.addressSubtitle, !isCODAvailable && styles.disabledText]}>{method.description}</Text>
                    {method.type === 'cod' && method.codSettings && (
                      <Text style={[
                        styles.codInfo,
                        !isCODAvailable && styles.codUnavailable
                      ]}>
                        {isCODAvailable
                          ? `Available for ₹${method.codSettings.minAmount} - ₹${method.codSettings.maxAmount}`
                          : `Not available (₹${method.codSettings.minAmount} - ₹${method.codSettings.maxAmount})`
                        }
                      </Text>
                    )}
                    {method.fees && method.fees.percentage > 0 && (
                      <Text style={styles.feeInfo}>
                        +{method.fees.percentage}% processing fee
                      </Text>
                    )}
                  </View>
                  {method.isDefault && <Text style={styles.defaultBadge}>Recommended</Text>}
                  {!isCODAvailable && method.type === 'cod' && (
                    <Text style={styles.unavailableBadge}>Not Available</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            {cartItems && (() => {
              const subtotal = cartItems.reduce((s, it) => s + it.price * it.quantity, 0);
              const deliveryFee = 49;
              const discount = 0; // Can be calculated from promo codes

              // Calculate processing fee from selected payment method
              const processingFee = selectedPaymentMethod?.fees ?
                (selectedPaymentMethod.fees.percentage > 0 ?
                  (subtotal * selectedPaymentMethod.fees.percentage / 100) :
                  (selectedPaymentMethod.fees.fixed || 0)
                ) : 0;

              // Calculate amount before tax
              const amountBeforeTax = subtotal + deliveryFee + processingFee - discount;

              // Calculate 18% GST
              const gst = amountBeforeTax * 0.18;

              // Calculate final total
              const finalTotal = amountBeforeTax + gst;

              return (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.grayText}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{subtotal}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.grayText}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>₹{deliveryFee}</Text>
                  </View>
                  {processingFee > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.grayText}>Processing Fee</Text>
                      <Text style={styles.summaryValue}>₹{processingFee.toFixed(2)}</Text>
                    </View>
                  )}
                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.greenText}>Discount</Text>
                      <Text style={styles.greenText}>-₹{discount}</Text>
                    </View>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.grayText}>GST (18%)</Text>
                    <Text style={styles.summaryValue}>₹{gst.toFixed(2)}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalText}>Total</Text>
                    <Text style={styles.totalPrimary}>₹{finalTotal.toFixed(2)}</Text>
                  </View>
                </>
              );
            })()}
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
  addressDisabled: {
    opacity: 0.6
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
  },
  codInfo: {
    fontSize: 10,
    color: '#16a34a',
    marginTop: 2,
    fontWeight: '500'
  },
  codUnavailable: {
    color: '#dc2626',
  },
  paymentMethodDisabled: {
    backgroundColor: '#f3f4f6',
    opacity: 0.6,
  },
  disabledText: {
    color: '#9ca3af',
  },
  feeInfo: {
    fontSize: 10,
    color: '#f59e0b',
    marginTop: 2,
    fontWeight: '500'
  },
  unavailableBadge: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fecaca'
  }
});
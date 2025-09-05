import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import {savedAddresses,timeSlots,paymentMethods} from '../../constants/data/data'

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

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

// Mock data
const CheckoutScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0].id);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(paymentMethods[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const navigation = useNavigation<CheckoutScreenNavigationProp>();
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if user is not authenticated or is a guest user
    if (!user || user.email === 'skip-user') {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

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

  const handlePlaceOrder = () => {
    if (!selectedTimeSlot) {
      Alert.alert('Select Time', 'Please select a time slot for your service.');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('BookingConfirmation', { 
        bookingId: 'BK' + Math.floor(Math.random() * 10000000),
        date: selectedDate,
        timeSlot: timeSlots.find(slot => slot.id === selectedTimeSlot)?.time || '',
        address: savedAddresses.find(addr => addr.id === selectedAddress)?.address || ''
      });
    }, 1500);
  };

  const handleAddNewAddress = () => {
    navigation.navigate('AddAddress')
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
              <TouchableOpacity onPress={handleAddNewAddress}>
                <Text style={styles.linkText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {savedAddresses.map((address) => {
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
            })}
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
              const isSelected = selectedPaymentMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.paymentMethod, isSelected && styles.addressSelected]}
                  onPress={() => setSelectedPaymentMethod(method.id)}
                >
                  <View style={styles.paymentIconBox}>
                    <Ionicons name={method.icon} size={20} color="#2563eb" />
                  </View>
                  <Text style={styles.addressTitle}>{method.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Order Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.summaryRow}><Text style={styles.grayText}>Subtotal</Text><Text style={styles.summaryValue}>₹1,498</Text></View>
            <View style={styles.summaryRow}><Text style={styles.grayText}>Delivery Fee</Text><Text style={styles.summaryValue}>₹49</Text></View>
            <View style={styles.summaryRow}><Text style={styles.greenText}>Discount</Text><Text style={styles.greenText}>-₹150</Text></View>
            <View style={styles.totalRow}><Text style={styles.totalText}>Total</Text><Text style={styles.totalPrimary}>₹1,397</Text></View>
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
  }
});
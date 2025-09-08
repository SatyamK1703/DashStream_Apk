import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, Dimensions } from 'react-native';
import { showErrorNotification, showSuccessNotification } from '../../utils/notificationUtils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import RazorpayCheckout from '../../components/paymentscreen/RazorpayCheckout';
import { usePayment } from '../../contexts/PaymentContext';
import { useAuth } from '../../contexts/AuthContext';

interface PaymentScreenParams {
  bookingId: string;
  amount: number;
  serviceName?: string;
  professionalName?: string;
  bookingDate?: string;
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingId, amount, serviceName, professionalName, bookingDate } = route.params as PaymentScreenParams;
  const { fetchPaymentHistory } = usePayment();
  const { user } = useAuth();
  
  const [paymentStep, setPaymentStep] = useState<'summary' | 'checkout' | 'success'>('summary');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    // Set navigation options
    navigation.setOptions({
      headerTitle: 'Payment',
      headerLeft: () => (
        <TouchableOpacity 
          style={{ marginLeft: 16 }} 
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [paymentStep]);

  const handleBackPress = () => {
    if (paymentStep === 'checkout') {
      // We'll keep using Alert.alert for confirmation dialogs as they require user interaction
      // This is different from notifications which are informational
      Alert.alert(
        'Cancel Payment',
        'Are you sure you want to cancel this payment?',
        [
          { text: 'No', style: 'cancel' },
          { 
            text: 'Yes', 
            onPress: () => setPaymentStep('summary')
          },
        ]
      );
    } else if (paymentStep === 'success') {
      navigation.navigate('Bookings' as never);
    } else {
      navigation.goBack();
    }
  };

  const handleProceedToPayment = () => {
    setPaymentStep('checkout');
  };

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentStep('success');
    // Refresh payment history
    fetchPaymentHistory();
  };

  const handlePaymentFailure = (error: string) => {
    console.error('Payment failed:', error);
    showErrorNotification('Payment Failed', error || 'Your payment could not be processed. Please try again.');
    setPaymentStep('summary');
  };

  const handleViewBookings = () => {
    navigation.navigate('Bookings');
  };

  const renderPaymentSummary = () => (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Booking Summary</Text>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service:</Text>
            <Text style={styles.detailValue}>{serviceName || 'Professional Service'}</Text>
          </View>
          
          {professionalName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Professional:</Text>
              <Text style={styles.detailValue}>{professionalName}</Text>
            </View>
          )}
          
          {bookingDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{bookingDate}</Text>
            </View>
          )}
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{bookingId.substring(0, 8)}...</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₹{amount.toFixed(2)}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleProceedToPayment}>
          <Text style={styles.buttonText}>Proceed to Payment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaymentCheckout = () => (
    <RazorpayCheckout
      bookingId={bookingId}
      amount={amount}
      onSuccess={handlePaymentSuccess}
      onFailure={handlePaymentFailure}
      description={`Payment for ${serviceName || 'Professional Service'}`}
      serviceName={serviceName || 'Professional Service'}
      customerName={user?.name || ''}
      customerEmail={user?.email || ''}
      customerPhone={user?.phone || ''}
    />
  );

  const renderPaymentSuccess = () => (
    <View style={styles.container}>
      <View style={styles.successCard}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
        </View>
        
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successMessage}>
          Your payment has been processed successfully. You can view your booking details in the bookings section.
        </Text>
        
        {paymentId && (
          <View style={styles.paymentIdContainer}>
            <Text style={styles.paymentIdLabel}>Payment ID:</Text>
            <Text style={styles.paymentIdValue}>{paymentId}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.button} onPress={handleViewBookings}>
          <Text style={styles.buttonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { minHeight: windowHeight * 0.9 }]}
      >
        {paymentStep === 'summary' && renderPaymentSummary()}
        {paymentStep === 'checkout' && renderPaymentCheckout()}
        {paymentStep === 'success' && renderPaymentSuccess()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  paymentIdContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  paymentIdLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  paymentIdValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
});

export default PaymentScreen;
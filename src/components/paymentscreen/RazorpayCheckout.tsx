import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { showPaymentSuccessNotification, showPaymentFailureNotification, showErrorNotification } from '../../utils/notificationUtils';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createPaymentOrder, verifyPayment } from '../../services/paymentService';
import { RazorpayOptions, RazorpayResponse, PaymentDetails } from '../../types/PaymentType';

interface RazorpayCheckoutProps {
  bookingId: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onFailure: (error: string) => void;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  bookingId,
  amount,
  onSuccess,
  onFailure,
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  description = 'DashStream Service Booking',
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    // Initialize payment order when component mounts
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      const details = await createPaymentOrder(bookingId, amount);
      setPaymentDetails(details);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      showErrorNotification('Payment Initialization Failed', error.message || 'Failed to initialize payment', error);
      onFailure(error.message || 'Failed to initialize payment');
    }
  };

  const handlePayment = async () => {
    if (!paymentDetails) {
      showErrorNotification('Payment Error', 'Payment details not available');
      return;
    }

    try {
      // Configure Razorpay options
      const options: RazorpayOptions = {
        key: paymentDetails.key,
        amount: paymentDetails.order.amount,
        currency: paymentDetails.order.currency,
        name: 'DashStream',
        description: description,
        order_id: paymentDetails.order.id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: {
          color: '#3498db',
        },
      };

      // Open Razorpay checkout
      if (Platform.OS === 'web') {
        // Web implementation
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.success', handlePaymentSuccess);
        razorpay.on('payment.error', handlePaymentError);
        razorpay.open();
      } else {
        // React Native implementation using RazorpayCheckout library
        // Note: This requires installing react-native-razorpay package
        // For this example, we'll use a mock implementation
        mockNativeRazorpay(options);
      }
    } catch (error: any) {
      showErrorNotification('Payment Gateway Error', error.message || 'Failed to open payment gateway', error);
      onFailure(error.message || 'Failed to open payment gateway');
    }
  };

  // Mock implementation for native platforms (would use react-native-razorpay in real implementation)
  const mockNativeRazorpay = (options: RazorpayOptions) => {
    Alert.alert(
      'Razorpay Checkout',
      'This is a mock implementation. In a real app, this would open the Razorpay payment gateway.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => handlePaymentError({ description: 'Payment cancelled by user' }),
        },
        {
          text: 'Success',
          onPress: () => {
            // Simulate successful payment
            const mockResponse: RazorpayResponse = {
              razorpay_payment_id: 'pay_' + Math.random().toString(36).substr(2, 9),
              razorpay_order_id: paymentDetails?.order.id || '',
              razorpay_signature: 'signature',
            };
            handlePaymentSuccess(mockResponse);
          },
        },
      ]
    );
  };

  const handlePaymentSuccess = async (response: RazorpayResponse) => {
    try {
      setLoading(true);
      // Verify payment with backend
      const result = await verifyPayment(response);
      setLoading(false);
      
      if (result.status === 'success') {
        showPaymentSuccessNotification('Payment Successful', 'Your payment was completed successfully');
        onSuccess(result.data.payment._id);
      } else {
        showPaymentFailureNotification('Payment Failed', 'Payment verification failed');
        onFailure('Payment verification failed');
      }
    } catch (error: any) {
      setLoading(false);
      showErrorNotification('Payment Error', error.message || 'Payment verification failed', error);
      onFailure(error.message || 'Payment verification failed');
    }
  };

  const handlePaymentError = (error: any) => {
    Alert.alert('Payment Failed', error.description || 'Something went wrong');
    onFailure(error.description || 'Payment failed');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Processing payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment Summary</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₹{amount.toFixed(2)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{bookingId.substring(0, 8)}...</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>Razorpay</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Ionicons name="card-outline" size={20} color="#fff" />
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
        
        <Text style={styles.secureText}>
          <Ionicons name="lock-closed" size={14} color="#666" /> Secure Payment via Razorpay
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  payButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secureText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default RazorpayCheckout;
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { showErrorNotification } from '../../utils/notificationUtils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPaymentDetails } from '../../services/paymentService';
import { PaymentDetails } from '../../types/PaymentType';

interface RouteParams {
  paymentId: string;
}

const PaymentDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentId } = route.params as RouteParams;
  
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPaymentDetails(paymentId);
      setPayment(data);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.message || 'Failed to fetch payment details';
      setError(errorMessage);
      showErrorNotification('Payment Details Error', errorMessage, err);
      console.error('Error fetching payment details:', err);
    }
  };

  const handleRetry = () => {
    fetchPaymentDetails();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'captured':
      case 'authorized':
        return '#4CAF50'; // Green
      case 'pending':
      case 'created':
        return '#FF9800'; // Orange
      case 'failed':
      case 'refunded':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading payment details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
        <Text style={styles.errorTitle}>Error Loading Payment</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!payment) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-outline" size={64} color="#9E9E9E" />
        <Text style={styles.errorTitle}>Payment Not Found</Text>
        <Text style={styles.errorMessage}>The requested payment details could not be found.</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount Paid</Text>
            <Text style={styles.amount}>₹{(payment.amount / 100).toFixed(2)}</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
            <Text style={styles.statusText}>{payment.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment ID</Text>
            <Text style={styles.detailValue}>{payment.razorpay_payment_id || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>{payment.razorpay_order_id || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{formatDate(payment.createdAt)}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>{payment.payment_method || 'Razorpay'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Currency</Text>
            <Text style={styles.detailValue}>{payment.currency || 'INR'}</Text>
          </View>
        </View>

        {payment.booking_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Booking ID</Text>
              <Text style={styles.detailValue}>{payment.booking_id}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.viewBookingButton}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: payment.booking_id })}
            >
              <Text style={styles.viewBookingText}>View Booking Details</Text>
              <Ionicons name="arrow-forward" size={16} color="#3498db" />
            </TouchableOpacity>
          </View>
        )}

        {payment.notes && Object.keys(payment.notes).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            
            {Object.entries(payment.notes).map(([key, value]) => (
              <View style={styles.detailRow} key={key}>
                <Text style={styles.detailLabel}>{key}</Text>
                <Text style={styles.detailValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {payment.error_code && (
          <View style={[styles.section, styles.errorSection]}>
            <Text style={styles.sectionTitle}>Error Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Error Code</Text>
              <Text style={styles.errorValue}>{payment.error_code}</Text>
            </View>
            
            {payment.error_description && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Description</Text>
                <Text style={styles.errorValue}>{payment.error_description}</Text>
              </View>
            )}
          </View>
        )}

        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => Alert.alert('Support', 'Contact our support team for any issues with this payment.')}
        >
          <Ionicons name="help-circle-outline" size={20} color="#3498db" />
          <Text style={styles.supportButtonText}>Need help with this payment?</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  errorValue: {
    fontSize: 15,
    color: '#F44336',
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  errorSection: {
    backgroundColor: '#FFF8F8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  viewBookingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingVertical: 10,
  },
  viewBookingText: {
    fontSize: 15,
    color: '#3498db',
    fontWeight: '600',
    marginRight: 8,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  supportButtonText: {
    fontSize: 15,
    color: '#3498db',
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentDetailsScreen;
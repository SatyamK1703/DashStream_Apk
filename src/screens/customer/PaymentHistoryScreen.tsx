import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { showErrorNotification } from '../../utils/notificationUtils';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { usePayment } from '../../contexts/PaymentContext';
import { PaymentDetails } from '../../types/PaymentType';

const PaymentHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { paymentHistory, fetchPaymentHistory, isLoading, error } = usePayment();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Load payment history when screen mounts
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      await fetchPaymentHistory();
    } catch (error: any) {
      console.error('Failed to load payment history:', error);
      showErrorNotification('Payment History Error', error.message || 'Failed to load payment history. Please try again later.', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const handleViewPaymentDetails = (payment: PaymentDetails) => {
    navigation.navigate('PaymentDetails', { paymentId: payment._id });
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
      month: 'short',
      day: 'numeric',
    });
  };

  const renderPaymentItem = ({ item }: { item: PaymentDetails }) => (
    <TouchableOpacity 
      style={styles.paymentCard} 
      onPress={() => handleViewPaymentDetails(item)}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentAmount}>₹{(item.amount / 100).toFixed(2)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment ID:</Text>
          <Text style={styles.detailValue}>{item.razorpay_payment_id || 'N/A'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Method:</Text>
          <Text style={styles.detailValue}>{item.payment_method || 'Razorpay'}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>View Details</Text>
        <Ionicons name="chevron-forward" size={16} color="#3498db" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Payment History</Text>
      <Text style={styles.emptyMessage}>You haven't made any payments yet.</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#F44336" />
      <Text style={styles.emptyTitle}>Error Loading Payments</Text>
      <Text style={styles.emptyMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadPaymentHistory}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && !refreshing && paymentHistory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        renderErrorState()
      ) : (
        <FlatList
          data={paymentHistory}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
    flexGrow: 1,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 90,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  viewDetails: {
    fontSize: 14,
    color: '#3498db',
    marginRight: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 250,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentHistoryScreen;
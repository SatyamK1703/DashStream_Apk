import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { PaymentMethod } from '../../types/PaymentType';
import AddCard from '../../components/paymentscreen/AddCard';
import AddUpi from '../../components/paymentscreen/AddUpi';
import PaymentMethodItem from '../../components/paymentscreen/PaymentMethodItem';
import { SafeAreaView } from 'react-native-safe-area-context';

type PaymentMethodsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<PaymentMethodsScreenNavigationProp>();
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if user is not authenticated or is a guest user
    if (!user || user.email === 'skip-user') {
      navigation.navigate('Login' as never);
    }
  }, [user, navigation]);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await PaymentService.getPaymentMethods();
      setPaymentMethods(response.data.paymentMethods || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
      setError(err.response?.data?.message || 'Failed to load payment methods');
      
      // Set fallback data
      setPaymentMethods([
        {
          _id: '1',
          type: 'card',
          name: 'HDFC Bank Credit Card',
          details: {
            last4: '4567',
            brand: 'Visa'
          },
          isDefault: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          type: 'upi',
          name: 'Google Pay',
          details: {
            upiId: 'user@okicici'
          },
          isDefault: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data on mount and when screen comes into focus
  useEffect(() => {
    if (user && user.email !== 'skip-user') {
      fetchPaymentMethods();
    }
  }, [user, fetchPaymentMethods]);

  useFocusEffect(
    useCallback(() => {
      if (user && user.email !== 'skip-user') {
        fetchPaymentMethods(true);
      }
    }, [user, fetchPaymentMethods])
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchPaymentMethods(true);
  }, [fetchPaymentMethods]);

  // Handle delete payment method
  const handleDeletePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      await PaymentService.deletePaymentMethod(paymentMethodId);
      setPaymentMethods(prev => prev.filter(method => method._id !== paymentMethodId));
      Alert.alert('Success', 'Payment method deleted successfully');
    } catch (err: any) {
      console.error('Error deleting payment method:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to delete payment method');
    }
  }, []);

  // Handle set default payment method
  const handleSetDefault = useCallback(async (paymentMethodId: string) => {
    try {
      await PaymentService.setDefaultPaymentMethod(paymentMethodId);
      setPaymentMethods(prev => 
        prev.map(method => ({
          ...method,
          isDefault: method._id === paymentMethodId
        }))
      );
      Alert.alert('Success', 'Default payment method updated');
    } catch (err: any) {
      console.error('Error setting default payment method:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to update default payment method');
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading payment methods...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPaymentMethods()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle add card success
  const handleAddCardSuccess = useCallback((newCard: PaymentMethod) => {
    setPaymentMethods((methods) => [...methods, newCard]);
    setShowAddCardModal(false);
    Alert.alert('Success', 'Card added successfully');
  }, []);

  // Handle add UPI success
  const handleAddUpiSuccess = useCallback((newUpi: PaymentMethod) => {
    setPaymentMethods((methods) => [...methods, newUpi]);
    setShowAddUpiModal(false);
    Alert.alert('Success', 'UPI ID added successfully');
  });

  const renderPaymentMethodItem = ({ item }: { item: PaymentMethod }) => (
    <PaymentMethodItem
      method={item}
      onSetDefault={() => handleSetDefault(item._id)}
      onDelete={() => handleDeletePaymentMethod(item._id)}
      isDeleting={deletingId === item._id}
    />
  );

  const renderAddPaymentOptions = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionTitle}>Add Payment Method</Text>

      <TouchableOpacity 
        style={styles.optionRow} 
        onPress={() => setShowAddCardModal(true)}
        disabled={loading}
      >
        <View style={styles.optionIcon}>
          <Ionicons name="card-outline" size={20} color="#2563eb" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Add Debit/Credit Card</Text>
          <Text style={styles.optionSubtitle}>Add a new card for faster checkout</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.optionRow} 
        onPress={() => setShowAddUpiModal(true)}
        disabled={loading}
      >
        <View style={styles.optionIcon}>
          <Ionicons name="phone-portrait-outline" size={20} color="#2563eb" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Add UPI ID</Text>
          <Text style={styles.optionSubtitle}>Pay using Google Pay, PhonePe, etc.</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.optionRow}
        onPress={() => Alert.alert('Coming Soon', 'This payment method will be available soon!')}
        disabled={loading}
      >
        <View style={styles.optionIcon}>
          <Ionicons name="cash-outline" size={20} color="#2563eb" />
        </View>
        <View style={styles.optionContent}>
          <Text style={styles.optionTitle}>Cash on Delivery</Text>
          <Text style={styles.optionSubtitle}>Pay after service completion</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6b7280" />
      </TouchableOpacity>
    </View>
  );

  const renderSecurityNote = () => (
    <View style={styles.securityBox}>
      <View style={styles.securityRow}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#2563eb" />
        <Text style={styles.securityTitle}>Secure Payments</Text>
      </View>
      <Text style={styles.securityText}>
        All transactions are secure and encrypted. Your payment information is never stored on
        our servers.
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyBox}>
      <Ionicons name="wallet-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyText}>No payment methods added yet</Text>
      <Text style={styles.emptySubtext}>
        Add a payment method to make faster bookings
      </Text>
    </View>
  );

  if (loading && !showAddCardModal && !showAddUpiModal) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
          {deletingId && <Text style={styles.deletingText}>Deleting payment method...</Text>}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Payment Methods</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {/* Main Content */}
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethodItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          ListHeaderComponent={
            paymentMethods.length > 0 ? null : renderEmptyState()
          }
          ListFooterComponent={
            <View>
              {paymentMethods.length > 0 && renderAddPaymentOptions()}
              {renderSecurityNote()}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Modals with KeyboardAvoidingView */}
        <AddCard
          visible={showAddCardModal}
          onClose={() => setShowAddCardModal(false)}
          onSuccess={handleAddCardSuccess}
        />
        
        <AddUpi
          visible={showAddUpiModal}
          onClose={() => setShowAddUpiModal(false)}
          onSuccess={handleAddUpiSuccess}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  flex: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backBtn: { 
    padding: 4 
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827',
    textAlign: 'center'
  },
  headerRight: {
    width: 40
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  deletingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1
  },
  emptyBox: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyText: { 
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', 
    textAlign: 'center' 
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  },
  sectionTitle: { 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 16, 
    fontSize: 18 
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  optionContent: {
    flex: 1
  },
  optionTitle: { 
    fontWeight: '600', 
    color: '#111827',
    fontSize: 16,
    marginBottom: 2
  },
  optionSubtitle: { 
    color: '#6b7280', 
    fontSize: 14 
  },
  securityBox: { 
    backgroundColor: '#eff6ff', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 24 
  },
  securityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  securityTitle: { 
    marginLeft: 8, 
    fontWeight: '700', 
    color: '#2563eb',
    fontSize: 16
  },
  securityText: { 
    color: '#374151', 
    fontSize: 14,
    lineHeight: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
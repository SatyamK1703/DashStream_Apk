import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { PaymentMethod } from '../../types/api';
import AddCard from '../../components/paymentscreen/AddCard';
import AddUpi from '../../components/paymentscreen/AddUpi';
import PaymentMethodItem from '../../components/paymentscreen/PaymentMethodItem';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaymentMethods } from '../../hooks/usePayments';

type PaymentMethodsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<PaymentMethodsScreenNavigationProp>();

  const [paymentMethods, setPaymentMethods] = useState(usePaymentMethods().data);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showAddUpiModal, setShowAddUpiModal] = useState(false);

  // Handlers
  const handleSetDefault = (id: string) => {
    setPaymentMethods((methods) =>
      methods.map((method) => ({ ...method, isDefault: method.id === id }))
    );
  };

  const handleDeleteMethod = (id: string) => {
    Alert.alert('Delete Payment Method', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((methods) => methods.filter((method) => method.id !== id));
        }
      }
    ]);
  };

  const handleAddCardSuccess = (newCard: PaymentMethod) => {
    setPaymentMethods((methods) => [...methods, newCard]);
    setShowAddCardModal(false);
  };

  const handleAddUpiSuccess = (newUpi: PaymentMethod) => {
    setPaymentMethods((methods) => [...methods, newUpi]);
    setShowAddUpiModal(false);
  };

  const renderPaymentMethodItem = ({ item }: { item: PaymentMethod }) => (
    <PaymentMethodItem
      method={item}
      onSetDefault={handleSetDefault}
      onDelete={handleDeleteMethod}
      isDeleting={false}
    />
  );

  const renderAddPaymentOptions = () => (
    <View style={{ marginBottom: 24 }}>
      <Text style={styles.sectionTitle}>Add Payment Method</Text>

      <TouchableOpacity 
        style={styles.optionRow} 
        onPress={() => setShowAddCardModal(true)}
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  }
});

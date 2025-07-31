import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { PaymentMethod } from '../../types/PaymentType';
import AddCard from '../../components/paymentscreen/AddCard';
import AddUpi from '../../components/paymentscreen/AddUpi';
import PaymentMethodItem from '../../components/paymentscreen/PaymentMethodItem';

type PaymentMethodsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PaymentMethodsScreen: React.FC = () => {
  const navigation = useNavigation<PaymentMethodsScreenNavigationProp>();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'HDFC Bank Credit Card',
      details: '•••• •••• •••• 4567',
      icon: 'card-outline',
      isDefault: true
    },
    {
      id: '2',
      type: 'upi',
      name: 'Google Pay',
      details: 'user@okicici',
      icon: 'phone-portrait-outline',
      isDefault: false
    },
    {
      id: '3',
      type: 'wallet',
      name: 'Paytm Wallet',
      details: '+91 98765 43210',
      icon: 'wallet-outline',
      isDefault: false
    }
  ]);

  const [loading, setLoading] = useState(false);
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
          setLoading(true);
          setTimeout(() => {
            setPaymentMethods((methods) => methods.filter((method) => method.id !== id));
            setLoading(false);
          }, 1000);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
      </View>

      {/* Loader */}
      {loading && !showAddCardModal && !showAddUpiModal ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView style={styles.scroll}>
          {/* Payment Methods */}
          {paymentMethods.length > 0 ? (
            <View style={{ marginBottom: 24 }}>
              {paymentMethods.map((method) => (
                <PaymentMethodItem
                  key={method.id}
                  method={method}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDeleteMethod}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="wallet-outline" size={60} color="#d1d5db" />
              <Text style={styles.emptyText}>No payment methods added yet</Text>
            </View>
          )}

          {/* Add Payment Method Options */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Add Payment Method</Text>

            <TouchableOpacity style={styles.optionRow} onPress={() => setShowAddCardModal(true)}>
              <View style={styles.optionIcon}>
                <Ionicons name="card-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Add Debit/Credit Card</Text>
                <Text style={styles.optionSubtitle}>Add a new card for faster checkout</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionRow} onPress={() => setShowAddUpiModal(true)}>
              <View style={styles.optionIcon}>
                <Ionicons name="phone-portrait-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Add UPI ID</Text>
                <Text style={styles.optionSubtitle}>Pay using Google Pay, PhonePe, etc.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => Alert.alert('Coming Soon', 'This payment method will be available soon!')}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="cash-outline" size={20} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.optionTitle}>Cash on Delivery</Text>
                <Text style={styles.optionSubtitle}>Pay after service completion</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Note */}
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
        </ScrollView>
      )}

      {/* Modals */}
      <AddCard
        visible={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        setPaymentMethods={setPaymentMethods}
      />
      <AddUpi
        visible={showAddUpiModal}
        onClose={() => setShowAddUpiModal(false)}
        setPaymentMethods={setPaymentMethods}
      />
    </View>
  );
};

export default PaymentMethodsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1, padding: 16 },
  emptyBox: { justifyContent: 'center', alignItems: 'center', paddingVertical: 32 },
  emptyText: { marginTop: 12, color: '#6b7280', textAlign: 'center' },
  sectionTitle: { fontWeight: '700', color: '#111827', marginBottom: 12, fontSize: 16 },
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
  optionTitle: { fontWeight: '600', color: '#111827' },
  optionSubtitle: { color: '#6b7280', fontSize: 13 },
  securityBox: { backgroundColor: '#eff6ff', padding: 16, borderRadius: 12, marginBottom: 24 },
  securityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  securityTitle: { marginLeft: 8, fontWeight: '700', color: '#2563eb' },
  securityText: { color: '#374151', fontSize: 13 }
});

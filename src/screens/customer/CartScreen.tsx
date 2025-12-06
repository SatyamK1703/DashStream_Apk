import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../../store';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { offerService } from '../../services/offerService';

const CartScreen = () => {
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    subtotal,
    total,
    discount,
    appliedPromo,
    applyPromo,
    removePromo
  } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const navigation = useNavigation();

  const handleQuantityChange = (id: string, change: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;
    updateQuantity(id, Math.max(1, item.quantity + change));
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', onPress: () => removeItem(id), style: 'destructive' },
    ]);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Error', 'Add items to cart before applying promo code');
      return;
    }

    setPromoLoading(true);
    try {
      const serviceIds = cartItems.map(item => item.id);
      const result = await offerService.applyOffer({
        code: promoCode.trim(),
        amount: subtotal,
        serviceIds,
      });

      if (result.success && result.data.valid) {
        applyPromo({
          code: promoCode.trim().toUpperCase(),
          discount: result.data.discount,
          discountType: result.data.discountType,
          offerId: result.data.offer._id,
          title: result.data.offer.title,
        });
        Alert.alert('Success', `Promo code applied! You saved ₹${result.data.discount.toFixed(2)}`);
      } else {
        Alert.alert('Invalid Code', result.message || 'This promo code is not valid');
      }
    } catch (error: any) {
      console.error('Apply promo error:', error);
      Alert.alert('Error', error.message || 'Failed to apply promo code. Please try again.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setPromoCode('');
    Alert.alert('Success', 'Promo code removed');
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add services before checking out.');
      return;
    }
    navigation.navigate('Checkout', {
      subtotal,
      discount,
      total,
      appliedPromo
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{cartItems.length}</Text>
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image source={require('../../assets/images/empty-cart.png')} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDescription}>Start exploring services to add them here</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('CustomerTabs')}>
            <Text style={styles.browseButtonText}>Browse Services</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            {cartItems.map((item) => (
              <View key={item.id} style={styles.cartCard}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  <View style={styles.itemControls}>
                    <View style={styles.quantityControls}>
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item.id, -1)}
                        disabled={item.quantity <= 1}
                        style={[
                          styles.qtyBtn,
                          { backgroundColor: item.quantity <= 1 ? '#eee' : '#e0e7ff' },
                        ]}>
                        <Ionicons name="remove" size={16} color="#1d4ed8" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(item.id, 1)}
                        style={[styles.qtyBtn, { backgroundColor: '#e0e7ff' }]}>
                        <Ionicons name="add" size={16} color="#1d4ed8" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                      <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            {/* Promo Section */}
            <View style={styles.promoCard}>
              <Text style={styles.sectionTitle}>Have a promo code?</Text>
              {appliedPromo ? (
                <View style={styles.appliedPromoContainer}>
                  <View style={styles.appliedPromoRow}>
                    <View style={styles.appliedPromoInfo}>
                      <Text style={styles.appliedPromoCode}>{appliedPromo.code}</Text>
                      <Text style={styles.appliedPromoTitle}>{appliedPromo.title}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removePromoButton}
                      onPress={handleRemovePromo}
                    >
                      <Ionicons name="close" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.promoRow}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Enter code"
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                    editable={!promoLoading}
                  />
                  <TouchableOpacity
                    style={[styles.applyButton, promoLoading && { opacity: 0.7 }]}
                    onPress={handleApplyPromo}
                    disabled={promoLoading}
                  >
                    {promoLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.applyButtonText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Summary Section */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{(subtotal || 0).toFixed(2)}</Text>
              </View>
              {appliedPromo && discount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#16a34a' }]}>
                    Discount ({appliedPromo.code})
                  </Text>
                  <Text style={[styles.summaryValue, { color: '#16a34a' }]}>
                    -₹{(discount || 0).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>₹{(total || 0).toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutBar}>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Checkout • ₹{(total || 0).toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#fff',
    elevation: 3,
    borderBottomWidth: 0.3,
    borderColor: '#e5e7eb',
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827', flex: 1 },
  headerBadge: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  headerBadgeText: { color: '#fff', fontWeight: '700' },
  scrollContainer: { padding: 16 },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10 },
  itemDetails: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  itemPrice: { color: '#1d4ed8', fontWeight: '600', marginTop: 4 },
  itemControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: { marginHorizontal: 10, fontWeight: '600' },
  promoCard: {
    padding: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  promoRow: { flexDirection: 'row' },
  promoInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  appliedPromoContainer: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  appliedPromoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appliedPromoInfo: {
    flex: 1,
  },
  appliedPromoCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  appliedPromoTitle: {
    fontSize: 14,
    color: '#16a34a',
    marginTop: 2,
  },
  removePromoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  applyButton: {
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 18,
  },
  applyButtonText: { color: '#fff', fontWeight: '700' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    marginBottom: 100,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  summaryLabel: { color: '#6b7280', fontWeight: '500' },
  summaryValue: { fontWeight: '600' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingTop: 10,
  },
  totalLabel: { fontSize: 17, fontWeight: '700' },
  totalValue: { fontSize: 17, fontWeight: '700', color: '#2563eb' },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkoutButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyImage: { width: 200, height: 200, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, color: '#111827' },
  emptyDescription: { textAlign: 'center', color: '#6b7280', marginBottom: 20 },
  browseButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  browseButtonText: { color: '#fff', fontWeight: '700' },
});

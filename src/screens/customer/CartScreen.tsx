import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, TextInput, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type CartScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

// Mock cart data - in a real app, this would come from a cart context/state
const initialCartItems = [
  {
    id: '1',
    title: 'Basic Wash',
    price: 499,
    quantity: 1,
    image: require('../../assets/images/image.png'),
  },
  {
    id: '2',
    title: 'Premium Wash',
    price: 999,
    quantity: 1,
    image: require('../../assets/images/image.png'),
  },
];

const CartScreen = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { user } = useAuth();
  
  useEffect(() => {
    // Check if user is not authenticated or is a guest user
    if (!user || user.email === 'skip-user') {
      navigation.navigate('Login');
    }
  }, [user, navigation]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 49;
  const total = subtotal + deliveryFee - discount;

  const handleQuantityChange = (id: string, change: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setCartItems(prevItems => prevItems.filter(item => item.id !== id));
          }
        },
      ]
    );
  };

  const handleApplyPromoCode = () => {
    if (promoCode.toUpperCase() === 'WELCOME50') {
      const discountAmount = subtotal * 0.5;
      setDiscount(discountAmount);
      Alert.alert('Success', 'Promo code applied successfully!');
    } else {
      Alert.alert('Invalid Code', 'The promo code you entered is invalid or expired.');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add services to your cart before proceeding to checkout.');
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <Text style={styles.headerCount}>({cartItems.length})</Text>
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Image 
              source={require('../../assets/images/image.png')} 
              style={styles.emptyImage} 
              resizeMode="contain" 
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDescription}>Looks like you haven't added any services to your cart yet</Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('CustomerTabs')}>
              <Text style={styles.browseButtonText}>Browse Services</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <ScrollView style={styles.scrollView}>
              <View style={styles.cartList}>
                {cartItems.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <Image source={item.image} style={styles.itemImage} resizeMode="cover" />
                    <View style={styles.itemInfo}>
                      <View>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemPrice}>₹{item.price}</Text>
                      </View>
                      <View style={styles.quantityRow}>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Ionicons name="remove" size={18} color={item.quantity <= 1 ? '#9ca3af' : '#2563eb'} />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() => handleQuantityChange(item.id, 1)}
                          >
                            <Ionicons name="add" size={18} color="#2563eb" />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
              {/* Promo*/}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promo Code</Text>
                <View style={styles.promoRow}>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChangeText={setPromoCode}
                  />
                  <TouchableOpacity style={styles.promoButton} onPress={handleApplyPromoCode}>
                    <Text style={styles.promoButtonText}>Apply</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.promoHint}>Try WELCOME50 for 50% off on your first order</Text>
              </View>

              {/* Order Summary */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}><Text style={styles.grayText}>Subtotal</Text><Text style={styles.summaryText}>₹{subtotal}</Text></View>
                <View style={styles.summaryRow}><Text style={styles.grayText}>Delivery Fee</Text><Text style={styles.summaryText}>₹{deliveryFee}</Text></View>
                {discount > 0 && (
                  <View style={styles.summaryRow}><Text style={styles.discountText}>Discount</Text><Text style={styles.discountText}>-₹{discount}</Text></View>
                )}
                <View style={styles.totalRow}><Text style={styles.totalText}>Total</Text><Text style={styles.totalAmount}>₹{total}</Text></View>
              </View>
            </ScrollView>

            {/* Checkout Button */}
            <View style={styles.checkoutContainer}>
              <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
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
  headerCount: { 
    marginLeft: 8, 
    color: '#6b7280' 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  emptyImage: { 
    width: 160, 
    height: 160, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    marginBottom: 8 
  },
  emptyDescription: { 
    color: '#6b7280', 
    textAlign: 'center', 
    marginBottom: 24 
  },
  browseButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 12, 
    paddingVertical: 16, 
    paddingHorizontal: 32 
  },
  browseButtonText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  scrollView: { 
    flex: 1 
  },
  cartList: { 
    padding: 16 
  },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#f9fafb', 
    borderRadius: 12, 
    padding: 12, 
    marginBottom: 16 
  },
  itemImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 8 
  },
  itemInfo: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: 'space-between' 
  },
  itemTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  itemPrice: { 
    color: '#2563eb', 
    fontWeight: '600' 
  },
  quantityRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  quantityControls: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  quantityButton: { 
    width: 32, 
    height: 32, 
    backgroundColor: '#e5e7eb', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quantityText: { 
    marginHorizontal: 12, 
    fontWeight: '600' 
  },
  section: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginBottom: 8 
  },
  promoRow: { 
    flexDirection: 'row' 
  },
  promoInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#d1d5db', 
    borderTopLeftRadius: 12, 
    borderBottomLeftRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 12 
  },
  promoButton: { 
    backgroundColor: '#2563eb', 
    justifyContent: 'center', 
    paddingHorizontal: 16, 
    borderTopRightRadius: 12, 
    borderBottomRightRadius: 12 
  },
  promoButtonText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  promoHint: { 
    fontSize: 12, 
    color: '#6b7280', 
    marginTop: 8 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  totalRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 8, 
    paddingTop: 8, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  grayText: { 
    color: '#6b7280' 
  },
  discountText: { 
    color: '#16a34a', 
    fontWeight: '600' 
  },
  summaryText: { 
    fontWeight: '600' 
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  totalAmount: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2563eb' 
  },
  checkoutContainer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  checkoutButton: { 
    backgroundColor: '#2563eb', 
    borderRadius: 12, 
    paddingVertical: 16, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkoutButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  }
});
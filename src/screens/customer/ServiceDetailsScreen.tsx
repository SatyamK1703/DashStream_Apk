import React, { useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { services } from '~/constants/data/serviceDetails';

type ServiceDetailsRouteProp = RouteProp<CustomerStackParamList, 'ServiceDetails'>;
type ServiceDetailsNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
const ServiceDetailsScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const navigation = useNavigation<ServiceDetailsNavigationProp>();
  const route = useRoute<ServiceDetailsRouteProp>();
  const { serviceId } = route.params;
  
  const service = services[serviceId as keyof typeof services];
  
    if (!service) {
    return (
      <View style={styles.centerContainer}>
        <Text>Service not found</Text>
      </View>
    );
  }

   const handleAddToCart = () => {
    navigation.navigate('Cart');
  };

  const handleBookNow = () => {
    navigation.navigate('Checkout');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerImageWrapper}>
        <Image source={service.image} style={styles.headerImage} resizeMode="cover" />
        <TouchableOpacity style={[styles.headerButton, styles.leftButton]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerButton, styles.rightButton]} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Title and Rating */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.price}>₹{service.price}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>{service.rating}</Text>
            <Text style={styles.reviewCount}>({service.reviewCount})</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text style={styles.durationText}>{service.duration}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{service.longDescription}</Text>

        {/* Features */}
        <Text style={styles.sectionTitle}>What's Included</Text>
        <View style={{ marginBottom: 24 }}>
          {service.features.map((feature: string, index: number) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name="checkmark" size={16} color="#2563eb" />
              </View>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {/* Quantity Selector */}
        <Text style={styles.sectionTitle}>Quantity</Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity((prev) => Math.max(prev - 1, 1))}>
            <Ionicons name="remove" size={24} color="#2563eb" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={() => setQuantity((prev) => prev + 1)}>
            <Ionicons name="add" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{service.price * quantity}</Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookNowBtn} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImageWrapper: { position: 'relative' },
  headerImage: { width: '100%', height: 256 },
  headerButton: {
    position: 'absolute',
    top: 48,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  leftButton: { left: 16 },
  rightButton: { right: 16 },
  scroll: { paddingHorizontal: 16, paddingTop: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  price: { fontSize: 18, fontWeight: '600', color: '#2563eb' },
  ratingBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(37,99,235,0.1)', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  ratingText: { marginLeft: 4, fontWeight: '600' },
  reviewCount: { marginLeft: 4, color: '#6b7280', fontSize: 12 },
  durationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  durationText: { marginLeft: 6, color: '#6b7280' },
  description: { color: '#374151', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  featureIcon: { width: 24, height: 24, backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  featureText: { color: '#374151' },
  quantityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  quantityButton: { width: 40, height: 40, backgroundColor: '#f3f4f6', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  quantityText: { marginHorizontal: 16, fontSize: 18, fontWeight: '600' },
  totalLabel: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  totalPrice: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
  bottomRow: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  addToCartBtn: { flex: 1, backgroundColor: 'rgba(37,99,235,0.1)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingVertical: 16, marginRight: 8 },
  addToCartText: { color: '#2563eb', fontWeight: '600' },
  bookNowBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 12, justifyContent: 'center', alignItems: 'center', paddingVertical: 16, marginLeft: 8 },
  bookNowText: { color: '#fff', fontWeight: '600' },
});

export default ServiceDetailsScreen;
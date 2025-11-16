import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { useServiceArea } from '../../hooks/useServiceArea';

const ACCENT = '#2563eb';

const ServiceDetailsScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const [serviceData, setServiceData] = useState<any | null>(null);

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { serviceId, service } = route.params || {};
  const id = serviceId || service?._id || service?.id;

  useEffect(() => {
    if (service) return setServiceData(service);

    const fetchServiceById = async () => {
      try {
        const { data } = await (await import('../../services')).serviceService.getServiceById(id);
        setServiceData(data);
      } catch {
        setServiceData(null);
      }
    };

    fetchServiceById();
  }, [id, service]);

  const { addItem } = useCartStore();

  if (!serviceData) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Service not found</Text>
      </SafeAreaView>
    );
  }

  const svc = serviceData;

  const addToCart = (redirect: 'Cart' | 'Checkout') => {
    addItem({
      id: svc.id || svc._id,
      title: svc.title,
      price: svc.price,
      quantity,
      image: typeof svc.image === 'string' ? { uri: svc.image } : svc.image,
      meta: { vehicleType: svc.vehicleType },
    });
    navigation.navigate(redirect);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerImageWrapper}>
        <Image
          source={typeof svc.image === 'string' ? { uri: svc.image } : svc.image}
          style={styles.headerImage}
        />

        {/* Gradient Overlay */}
        <View style={styles.gradient} />

        {/* Back and Cart Buttons */}
        <TouchableOpacity
          style={[styles.floatingBtn, styles.leftBtn]}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={ACCENT} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.floatingBtn, styles.rightBtn]}
          onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{svc.title}</Text>
              <Text style={styles.price}>₹{svc.price}</Text>
            </View>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#f59e0b" />
              <Text style={styles.ratingText}>{svc.rating}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="time-outline" size={18} color="#667085" />
            <Text style={styles.duration}>{svc.duration}</Text>
          </View>

          <Text style={styles.description}>{svc.longDescription || svc.description}</Text>

          <Text style={styles.sectionLabel}>What's Included</Text>

          {svc.features?.map((feature: string, i: number) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={ACCENT} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}

          <Text style={styles.sectionLabel}>Quantity</Text>

          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={20} color={ACCENT} />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{quantity}</Text>

            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
              <Ionicons name="add" size={20} color={ACCENT} />
            </TouchableOpacity>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>₹{svc.price * quantity}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartBtn} onPress={() => addToCart('Cart')}>
          <Text style={styles.cartBtnText}>Add to Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} onPress={() => addToCart('Checkout')}>
          <Text style={styles.primaryBtnText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ServiceDetailsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerImageWrapper: {
    position: 'relative',
    width: '100%',
    height: 260,
    overflow: 'hidden',
  },

  headerImage: {
    width: '100%',
    height: '100%',
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  floatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },

  leftBtn: { left: 16 },
  rightBtn: { right: 16 },

  scroll: { marginTop: -20 },

  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 120,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },

  price: {
    fontSize: 18,
    color: ACCENT,
    marginTop: 4,
  },

  ratingBadge: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },

  ratingText: {
    fontWeight: '600',
    marginLeft: 4,
  },

  duration: {
    marginLeft: 6,
    color: '#667085',
  },

  description: {
    color: '#4b5563',
    marginBottom: 20,
    lineHeight: 20,
  },

  sectionLabel: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  featureText: {
    marginLeft: 8,
    color: '#374151',
    flex: 1,
  },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  qtyBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  qtyText: {
    fontSize: 18,
    marginHorizontal: 16,
    fontWeight: '700',
  },

  totalLabel: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: ACCENT,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  cartBtn: {
    flex: 1,
    backgroundColor: 'rgba(37,99,235,0.12)',
    paddingVertical: 16,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartBtnText: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '600',
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { RootStackParamList } from '../../../app/routes/RootNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceService } from '../../services/serviceService';
import { Service } from '../../types/ServiceType';

type ServiceDetailsRouteProp = RouteProp<CustomerStackParamList, 'ServiceDetails'>;
type ServiceDetailsNavigationProp = NativeStackNavigationProp<CustomerStackParamList | RootStackParamList>;


const ServiceDetailsScreen = () => {
  const [quantity, setQuantity] = useState(1);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigation = useNavigation<ServiceDetailsNavigationProp>();
  const route = useRoute<ServiceDetailsRouteProp>();
  const { serviceId } = route.params;
  const { user } = useAuth();
  
  // Fetch service data
  const fetchService = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ServiceService.getService(serviceId);
      setService(response.data.service);
    } catch (err: any) {
      console.error('Error fetching service:', err);
      setError(err.response?.data?.message || 'Failed to load service details');
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);
  
  // Check if user is authenticated or a guest user
  useEffect(() => {
    if (!user || user.name === 'Guest User') {
      navigation.navigate('Login' as never);
    }
  }, [user, navigation]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading service details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Service Not Found</Text>
          <Text style={styles.errorText}>{error || 'The service you are looking for does not exist.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchService}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleAddToCart = () => {
    if (!user || user.name === 'Guest User') {
      navigation.navigate('Login' as never);
      return;
    }
    navigation.navigate('Cart' as never);
  };

  const handleBookNow = () => {
    if (!user || user.name === 'Guest User') {
      navigation.navigate('Login' as never);
      return;
    }
    navigation.navigate('Checkout' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header Image */}
      <View style={styles.headerImageWrapper}>
        {service.image ? (
          <Image source={{ uri: service.image }} style={styles.headerImage} resizeMode="cover" />
        ) : (
          <View style={[styles.headerImage, styles.placeholderImage]}>
            <Ionicons name="car-outline" size={48} color="#6b7280" />
          </View>
        )}
        <TouchableOpacity style={[styles.headerButton, styles.leftButton]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerButton, styles.rightButton]} onPress={() => navigation.navigate('Cart' as never)}>
          <Ionicons name="cart-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Title and Rating */}
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.price}>₹{service.price}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.ratingText}>4.5</Text>
            <Text style={styles.reviewCount}>(12)</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.durationRow}>
          <Ionicons name="time-outline" size={18} color="#64748b" />
          <Text style={styles.durationText}>{service.duration} minutes</Text>
        </View>

        {/* Vehicle Type */}
        <View style={styles.durationRow}>
          <Ionicons name="car-outline" size={18} color="#64748b" />
          <Text style={styles.durationText}>{service.vehicleType}</Text>
        </View>

        {/* Category */}
        <View style={styles.durationRow}>
          <Ionicons name="grid-outline" size={18} color="#64748b" />
          <Text style={styles.durationText}>{service.category}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{service.description}</Text>

        {/* Professional Info */}
        {service.professional && (
          <>
            <Text style={styles.sectionTitle}>Service Provider</Text>
            <View style={styles.professionalRow}>
              {service.professional.profileImage ? (
                <Image source={{ uri: service.professional.profileImage }} style={styles.professionalAvatar} />
              ) : (
                <View style={[styles.professionalAvatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={20} color="#6b7280" />
                </View>
              )}
              <View style={styles.professionalInfo}>
                <Text style={styles.professionalName}>{service.professional.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#f59e0b" />
                  <Text style={styles.professionalRating}>{service.professional.rating}</Text>
                </View>
              </View>
            </View>
          </>
        )}

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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerImageWrapper: { 
    position: 'relative' 
  },
  headerImage: { 
    width: '100%', 
    height: 256 
  },
  headerButton: {
    position: 'absolute',
    top: 16, // Reduced from 48 to account for SafeAreaView
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  leftButton: { 
    left: 16 
  },
  rightButton: { 
    right: 16 
  },
  scroll: { 
    paddingHorizontal: 16, 
    paddingTop: 16 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#1f2937' 
  },
  price: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2563eb' 
  },
  ratingBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(37,99,235,0.1)', 
    paddingHorizontal: 6, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  ratingText: { 
    marginLeft: 4, 
    fontWeight: '600' 
  },
  reviewCount: { 
    marginLeft: 4, 
    color: '#6b7280', 
    fontSize: 12 
  },
  durationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  durationText: { 
    marginLeft: 6, 
    color: '#6b7280' 
  },
  description: { 
    color: '#374151', 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1f2937', 
    marginBottom: 16 
  },
  featureRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  featureIcon: { 
    width: 24, 
    height: 24, 
    backgroundColor: 'rgba(37,99,235,0.1)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 12 
  },
  featureText: { 
    color: '#374151',
    flex: 1 
  },
  quantityRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  quantityButton: { 
    width: 40, 
    height: 40, 
    backgroundColor: '#f3f4f6', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  quantityText: { 
    marginHorizontal: 16, 
    fontSize: 18, 
    fontWeight: '600' 
  },
  totalLabel: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1f2937' 
  },
  totalPrice: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#2563eb' 
  },
  bottomRow: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  addToCartBtn: { 
    flex: 1, 
    backgroundColor: 'rgba(37,99,235,0.1)', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 16, 
    marginRight: 8 
  },
  addToCartText: { 
    color: '#2563eb', 
    fontWeight: '600',
    fontSize: 16
  },
  bookNowBtn: { 
    flex: 1, 
    backgroundColor: '#2563eb', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 16, 
    marginLeft: 8 
  },
  bookNowText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  placeholderImage: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12
  },
  professionalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  professionalInfo: {
    flex: 1
  },
  professionalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  professionalRating: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4
  },
  avatarPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ServiceDetailsScreen;
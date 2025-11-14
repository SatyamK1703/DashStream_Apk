import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryTabs from '../../components/service/CategoryTabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '../../hooks/useServices';
import { useCart } from '../../store';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'AllServices'>;

const CATEGORY_TABS = ['All', 'Car Wash', 'Deep Clean', 'Special Car Care'];

const AllServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  const [scrollY] = useState(new Animated.Value(0));

  const {
    data: servicesData = [],
    loading: isLoading,
    error,
    refresh: fetchServices,
  } = useServices({
    category: selectedTab === 'All' ? undefined : selectedTab.toLowerCase().replace(' ', '-'),
  });

  const { addItem, items: cartItems } = useCart();

  useEffect(() => {
    fetchServices();
  }, [selectedTab]);

  useEffect(() => {
    if (!servicesData) return setFilteredServices([]);
    if (!searchQuery.trim()) return setFilteredServices(servicesData);

    const filtered = servicesData.filter(
      (service) =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchQuery, servicesData]);

  const handleServicePress = (service: any) => {
    navigation.navigate('ServiceDetails', { serviceId: service._id || service.id, service });
  };

  const handleAddToCart = (service: any) => {
    if (!service) return;
    addItem({
      id: service.id || service._id,
      title: service.title || service.name,
      price: service.price,
      quantity: 1,
      image: typeof service.image === 'string' ? { uri: service.image } : service.image,
      meta: { vehicleType: service.vehicleType },
    });
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    const discountPercentage =
      item.originalPrice && item.price
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    const isInCart = cartItems.some((cartItem) => cartItem.id === (item.id || item._id));

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        style={styles.card}
        onPress={() => handleServicePress(item)}>
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name || item.title}
            </Text>

            <View style={styles.ratingRow}>
              <Text style={styles.ratingStar}>⭐</Text>
              <Text style={styles.ratingValue}>{item.rating || 4.5}</Text>
              <Text style={styles.ratingCount}>({item.reviewCount || item.reviews || 0})</Text>
            </View>
          </View>

          <View>
            <View style={styles.priceRow}>
              <Text style={styles.newPrice}>₹{item.price}</Text>
              {item.originalPrice > item.price && (
                <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>
              )}
            </View>

            <View style={styles.actionRow}>
              {discountPercentage > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.addButton, isInCart && styles.addedButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!isInCart) handleAddToCart(item);
                }}
                disabled={isInCart}>
                <Text style={[styles.addText, isInCart && styles.addedText]}>
                  {isInCart ? 'ADDED' : 'ADD'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <CategoryTabs tabs={CATEGORY_TABS} selected={selectedTab} onSelect={setSelectedTab} />
    </View>
  );

  const EmptyList = () => (
    <View style={styles.emptyState}>
      <Ionicons name="construct-outline" size={70} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No services found</Text>
      <Text style={styles.emptySubtitle}>Try a different search or category.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.header,
          {
            elevation: scrollY.interpolate({
              inputRange: [0, 20],
              outputRange: [0, 4],
              extrapolate: 'clamp',
            }),
          },
        ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services</Text>
        <View style={{ width: 30 }} />
      </Animated.View>

      {isLoading && filteredServices.length === 0 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Fetching Services...</Text>
        </View>
      ) : (
        <Animated.FlatList
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: false,
          })}
          data={filteredServices}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderServiceItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
    zIndex: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 19, fontWeight: '700', color: '#111827' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },

  cardImage: {
    width: 118,
    height: 120,
    backgroundColor: '#f1f1f1',
  },

  cardContent: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: { fontSize: 12, color: '#fbbf24' },
  ratingValue: { marginLeft: 4, fontSize: 13, fontWeight: '600', color: '#475569' },
  ratingCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#94a3b8',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  newPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },

  oldPrice: {
    fontSize: 13,
    marginLeft: 8,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  discountBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: { color: '#b91c1c', fontWeight: '700', fontSize: 11 },

  addButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  addText: {
    fontWeight: '700',
    color: '#fff',
    fontSize: 14,
  },

  addedButton: { backgroundColor: '#10b981' },
  addedText: { color: '#fff' },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 8, color: '#6b7280', fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 10 },
  emptySubtitle: { color: '#6b7280', fontSize: 14, marginTop: 6 },
});

export default AllServicesScreen;

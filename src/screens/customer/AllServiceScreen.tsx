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

  const { 
    data: servicesData = [], 
    loading: isLoading, 
    error, 
    refresh: fetchServices 
  } = useServices({ 
    category: selectedTab === 'All' ? undefined : selectedTab.toLowerCase().replace(' ', '-') 
  });

  const { addItem, items: cartItems } = useCart();

  useEffect(() => {
    fetchServices();
  }, [selectedTab]);

  useEffect(() => {
    if (!servicesData) {
      setFilteredServices([]);
      return;
    }
    if (searchQuery.trim() === '') {
      setFilteredServices(servicesData);
    } else {
      const filtered = servicesData.filter(service =>
        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
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
      meta: { vehicleType: service.vehicleType }
    });
  };

  const renderServiceItem = ({ item }: { item: any }) => {
    const discountPercentage = item.originalPrice && item.price ? 
      Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

    const isInCart = cartItems.some(cartItem => cartItem.id === (item.id || item._id));

    return (
      <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)} activeOpacity={0.9}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage} 
          onError={() => console.log('Failed to load service image')}
        />
        <View style={styles.cardContent}>
          <View style={styles.cardDetails}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.name || item.title}</Text>
            <Text style={styles.cardRating}>⭐ {item.rating || 4.5} ({item.reviewCount || item.reviews || 0})</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.newPrice}>₹{item.price}</Text>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>
              )}
            </View>
          </View>
          <View style={styles.cardActions}>
            {discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.addButton, isInCart && styles.addButtonDisabled]} 
              onPress={(e) => {
                e.stopPropagation();
                if (!isInCart) handleAddToCart(item);
              }}
              disabled={isInCart}
            >
              <Text style={[styles.addText, isInCart && styles.addTextDisabled]}>{isInCart ? 'ADDED' : 'ADD'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for services..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <CategoryTabs
        tabs={CATEGORY_TABS}
        selected={selectedTab}
        onSelect={(tab) => setSelectedTab(tab)}
      />
    </View>
  );

  const EmptyListComponent = () => (
    <View style={styles.emptyContainer}>
        <Ionicons name="sad-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>No Services Found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your search or filters.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading && filteredServices.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading Services...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={item => item.id || item._id}
          renderItem={renderServiceItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyListComponent}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerRight: {
    width: 40
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#111827',
  },
  flatListContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    height: 140,
  },
  cardImage: {
    width: 110,
    height: '100%',
    backgroundColor: '#f3f4f6',
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardDetails: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardRating: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  oldPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#10b981',
  },
  addText: {
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addTextDisabled: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default AllServicesScreen;
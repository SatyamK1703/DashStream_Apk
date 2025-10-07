import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryTabs from '../../components/service/CategoryTabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useServices } from '../../hooks/useServices';
import { useCart } from '../../store';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'AllServices'>;

const CATEGORY_TABS = ['All','Car Wash', 'Deep Clean', 'Special Car Care'];
const AllServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('All');
  
  // Fetch services from API
  const { 
    data: servicesData = [], 
    loading: isLoading, 
    error, 
    refresh: fetchServices 
  } = useServices({ 
    category: selectedTab === 'All' ? undefined : selectedTab.toLowerCase().replace(' ', '-') 
  });

  // Initialize data on mount
  useEffect(() => {
    fetchServices();
  }, []);

  // Debug log when data changes
  useEffect(() => {
   
  }, [servicesData, isLoading, error]);

  // Handle category filter changes
  useEffect(() => {
    if (selectedTab === 'All') {
      fetchServices();
    } else {
      fetchServices();
    }
  }, [selectedTab]);

  // Handle search filtering
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
  const { addItem } = useCart();

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
    
    return (
      <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)} activeOpacity={0.9}>
        <View style={styles.cardContent}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{item.name || item.title}</Text>
            <Text style={styles.cardRating}>⭐ {item.rating || 4.5} ({item.reviewCount || item.reviews || 0} ratings)</Text>
            {item.features && item.features.length > 0 && (
              <>
                <Text style={styles.cardFeature}>• {item.features[0]}</Text>
                {item.features[1] && <Text style={styles.cardFeature}>• {item.features[1]}</Text>}
                {item.features[2] && <Text style={styles.cardFeature}>• {item.features[2]}</Text>}
              </>
            )}
            <View style={styles.cardPriceRow}>
              {item.originalPrice && item.originalPrice > item.price && (
                <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>
              )}
              <Text style={styles.newPrice}>₹{item.price}</Text>
              {discountPercentage > 0 && (
                <Text style={styles.discount}>{discountPercentage}% OFF</Text>
              )}
            </View>
          </View>
          {item.image ? (
            <Image 
              source={{ uri: item.image }} 
              style={styles.cardImage} 
              onError={() => console.log('Failed to load service image')}
            />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
              <Ionicons name="car-outline" size={32} color="#666" />
            </View>
          )}
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>All Services</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <CategoryTabs
          tabs={CATEGORY_TABS}
          selected={selectedTab}
          onSelect={(tab) => setSelectedTab(tab)}
        />
        

        {/* Service List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading Services...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={item => item.id}
            renderItem={renderServiceItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  backButton: {
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
  scrollView: {
    flex: 1
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  filterTag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db', // Gray-300
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563', // Gray-600
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardRating: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  cardFeature: {
    fontSize: 13,
    color: '#4b5563',
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    marginRight: 6,
  },
  newPrice: {
    color: '#111827',
    fontWeight: '600',
    marginRight: 6,
  },
  discount: {
    color: '#10b981',
    fontWeight: '600',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  cardImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  flatListContent: {
    paddingBottom: 100
  }
});

export default AllServicesScreen;
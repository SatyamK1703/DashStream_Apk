import React, { useState, useEffect, useCallback } from 'react';
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
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CategoryTabs from '../../components/service/CategoryTabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Service, ServiceCategory } from '../../types/ServiceType';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'AllServices'>;

const AllServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('All');

  // Fetch services and categories
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const [servicesResponse, categoriesResponse] = await Promise.all([
        ServiceService.getAllServices(),
        ServiceService.getServiceCategories()
      ]);

      setServicesData(servicesResponse.data.services || []);
      setFilteredServices(servicesResponse.data.services || []);
      setCategories(categoriesResponse.data.categories || []);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.response?.data?.message || 'Failed to load services');
      setServicesData([]);
      setFilteredServices([]);
      setCategories([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim() === '') {
      filterServicesByCategory(selectedTab);
    } else {
      const filtered = servicesData.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, servicesData, selectedTab]);

  const filterServicesByCategory = (category: string) => {
    if (category === 'All') {
      setFilteredServices(servicesData);
    } else {
      const filtered = servicesData.filter(service => service.category === category);
      setFilteredServices(filtered);
    }
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
    filterServicesByCategory(tab);
  };

  const handleServicePress = (service: Service) => {
    navigation.navigate('ServiceDetails', { serviceId: service._id });
  };

  const renderServiceItem = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardRating}>⭐ 4.5 (12 ratings)</Text>
          <Text style={styles.cardFeature}>• {item.duration} minutes</Text>
          <Text style={styles.cardFeature}>• {item.vehicleType}</Text>
          <Text style={styles.cardFeature}>• {item.category}</Text>
          <View style={styles.cardPriceRow}>
            <Text style={styles.newPrice}>₹{item.price}</Text>
          </View>
        </View>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.cardImage} />
        ) : (
          <View style={[styles.cardImage, styles.placeholderImage]}>
            <Ionicons name="car-outline" size={32} color="#6b7280" />
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addText}>ADD</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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

      <View style={styles.contentContainer}>
        <CategoryTabs
          tabs={CATEGORY_TABS}
          selected={selectedTab}
          onSelect={(tab) => setSelectedTab(tab)}
        />
        
        {/* Service List */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={styles.errorTitle}>Error Loading Services</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchData()}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredServices}
            keyExtractor={item => item._id}
            renderItem={renderServiceItem}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            style={styles.flatList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchData(true)}
                colors={['#2563eb']}
                tintColor="#2563eb"
              />
            }
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#9ca3af" />
                  <Text style={styles.emptyTitle}>No Services Found</Text>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Try adjusting your search terms' : 'No services available in this category'}
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
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
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16
  },
  flatList: {
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40
  }
});

export default AllServicesScreen;
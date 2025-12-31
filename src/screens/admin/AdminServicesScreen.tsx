import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, Alert, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../../components/admin/Header';
import SearchBar from '~/components/admin/SearchBar';
import CategoryFilter from '~/components/admin/CategoryFilter';
import SortControls from '~/components/admin/SortControls';
import ServiceCard from '~/components/admin/ServiceCard';
import EmptyState from '~/components/admin/EmptyState';
import AddEditServiceModal from '~/components/admin/AddEditServiceModal';


import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

import {
  useAdminServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useToggleServiceStatus,
  useServiceCategories,
} from '../../hooks';
import { useAuth } from '../../store';

type AdminServicesNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Service {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  banner: string;
  duration: string;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
  tags: string[];
  vehicleType?: string;
}

interface ServiceFormData {
  id?: string;
  title: string;
  description: string;
  longDescription?: string;
  price: string;
  discountPrice: string;
  category: string;
  image: string | null;
  banner: string | null;
  duration: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  tags: string[];
  vehicleType: string;
}

const AdminServicesScreen = () => {
  const navigation = useNavigation<AdminServicesNavigationProp>();
  const { user, isAuthenticated } = useAuth();

  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState<string>('date_desc');
  const [services, setServices] = useState<Service[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: '',
    description: '',
    longDescription: '',
    price: '',
    discountPrice: '',
    category: 'car wash',
    image: null,
    banner: null,
    duration: '',
    isActive: true,
    isPopular: false,
    features: [],
    tags: [],
    vehicleType: 'Both',
  });
  const [isEditing, setIsEditing] = useState(false);

  const filters = useMemo(
    () => ({
      status: selectedStatus,
      category: selectedCategory,
      sort: sortOption,
    }),
    [selectedStatus, selectedCategory, sortOption]
  );

  const { data, refresh: fetchServices, loading, error } = useAdminServices({ filters: filters as any });

  // const {
  //   data: services = [],
  //   loading,
  //   error,
  //   refresh: fetchServices,
  //   loadMore,
  // } = useAdminServices();
  // useEffect(() => {}, [services, loading, error]);

  const { execute: createService, loading: createLoading } = useCreateService();
  const { execute: updateService, loading: updateLoading } = useUpdateService();
  const { execute: deleteService, loading: deleteLoading } = useDeleteService();
  const { execute: toggleStatus, loading: toggleLoading } = useToggleServiceStatus();
  const { data: categoriesData = [], execute: fetchCategories } = useServiceCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (data) {
      setServices(data as any);
    }
  }, [data]);

  const filterAndSortServices = useCallback(() => {
    if (!services || !Array.isArray(services)) {
      setFilteredServices([]);
      return;
    }

    let filtered = [...services];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
    setFilteredServices(filtered);
  }, [services, searchQuery, selectedCategory, sortBy, sortOrder]);

  const onRefresh = async () => {
    try {
      await fetchServices();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleSortByChange = () => {
    const options: ('name' | 'price' | 'category' | 'date')[] = ['name', 'price', 'category', 'date'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      const service = services.find((s) => s.id === serviceId);
      if (!service) return;

      await toggleStatus({
        serviceId,
        isActive: !service.isActive,
      });

      await fetchServices();
    } catch (error) {
      console.error('Toggle service status error:', error);
      Alert.alert('Error', 'Failed to update service status. Please try again.');
    }
  };

  const handleAddService = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      longDescription: '',
      price: '',
      discountPrice: '',
      category: 'car wash',
      image: null,
      banner: null,
      duration: '',
      isActive: true,
      isPopular: false,
      features: [],
      tags: [],
      vehicleType: 'Both',
    });
    setShowAddEditModal(true);
  };

  const handleEditService = (service: Service) => {
    setIsEditing(true);
    setFormData({
      id: service.id,
      title: service.title,
      description: service.description,
      longDescription: service.longDescription || '',
      price: service.price.toString(),
      discountPrice: service.discountPrice?.toString() || '',
      category: service.category,
      image: service.image,
      banner: service.banner,
      duration: service.duration,
      isActive: service.isActive,
      isPopular: service.isPopular,
      features: [...service.features],
      tags: [...service.tags],
      vehicleType: service.vehicleType || 'Both',
    });
    setShowAddEditModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(serviceId);
              await fetchServices();
              Alert.alert('Success', 'Service deleted successfully');
            } catch (error) {
              console.error('Delete service error:', error);
              Alert.alert('Error', 'Failed to delete service. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleModalSuccess = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  // Form submission is now handled inside AddEditServiceModal

  const categoriesSource: any[] = Array.isArray(categoriesData)
    ? categoriesData
    : Array.isArray((categoriesData as any)?.categories)
      ? (categoriesData as any).categories
      : [];
  const categories = [
    { id: 'all', name: 'All Services' },
    ...categoriesSource
      .filter((cat: any) => cat && (cat.id || cat._id) && cat.name)
      .map((cat: any) => ({ id: cat.id || cat._id, name: cat.name })),
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={() => navigation.goBack()} onAdd={handleAddService} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Manage Services" onBack={() => navigation.goBack()} onAdd={handleAddService} />

      <View style={styles.controlsContainer}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search services..."
        />

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <SortControls
          itemCount={filteredServices?.length || 0}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderToggle={toggleSortOrder}
        />
      </View>
      {!filteredServices || filteredServices.length === 0 ? (
        <EmptyState onAddService={handleAddService} />
      ) : (
        <FlatList
          data={filteredServices || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onToggleStatus={toggleServiceStatus}
              onEdit={handleEditService as any}
              onDelete={handleDeleteService as any}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#007BFF']} />
          }
          ListEmptyComponent={() => (
            <View style={styles.listEmptyContainer}>
              <Text style={styles.listEmptyText}>No services to display</Text>
            </View>
          )}
        />
      )}

      <AddEditServiceModal
        visible={showAddEditModal}
        isEditing={isEditing}
        formData={formData as any}
        onClose={() => setShowAddEditModal(false)}
        onSuccess={handleModalSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  listEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  listEmptyText: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
});

export default AdminServicesScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../../components/admin/Header';
import SearchBar from '~/components/admin/SearchBar';
import CategoryFilter from '~/components/admin/CategoryFilter';
import SortControls from '~/components/admin/SortControls';
import ServiceCard from '~/components/admin/ServiceCard';
import EmptyState from '~/components/admin/EmptyState';
import AddEditServiceModal from '~/components/admin/AddEditServiceModal';

import { styles } from '../../components/admin/AdminService.styles';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

import { 
  useAdminServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService, 
  useToggleServiceStatus,
  useServiceCategories 
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
}

const AdminServicesScreen = () => {
  const navigation = useNavigation<AdminServicesNavigationProp>();
  const { user, isAuthenticated } = useAuth();
  
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'title' | 'price' | 'category' | 'date'>('title');
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
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: services = [],
    loading,
    error,
    refresh: fetchServices,
    loadMore
  } = useAdminServices();
  useEffect(() => {
  
  }, [services, loading, error]);

  const { execute: createService, loading: createLoading } = useCreateService();
  const { execute: updateService, loading: updateLoading } = useUpdateService();
  const { execute: deleteService, loading: deleteLoading } = useDeleteService();
  const { execute: toggleStatus, loading: toggleLoading } = useToggleServiceStatus();
  const { data: categoriesData = [], execute: fetchCategories } = useServiceCategories();

  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy, sortOrder]);

  const onRefresh = async () => {
    try {
      await fetchServices();
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  const filterAndSortServices = () => {
 
    
    if (!services || !Array.isArray(services)) {
      setFilteredServices([]);
      return;
    }
    
    let filtered = [...services];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        service =>
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'title':
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
  };

  const handleSortByChange = () => {
    const options = ['title', 'price', 'category', 'date'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex] as 'title' | 'price' | 'category' | 'date');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      const service = services.find(s => s.id === serviceId);
      if (!service) return;

      await toggleStatus({
        serviceId,
        isActive: !service.isActive
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
      tags: []
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
      tags: [...service.tags]
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
          }
        }
      ]
    );
  };

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
      .map((cat: any) => ({ id: cat.id || cat._id, name: cat.name }))
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
      <Header title ="Manage Services" onBack={() => navigation.goBack()} onAdd={handleAddService} />
      
      <View style={styles.searchContainer}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="search sercives..."
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
          placetext="No Services Founds"
        />
      </View>
      {(!filteredServices || filteredServices.length === 0) ? (
        <>

          <EmptyState onAddService={handleAddService} />
        </>
      ) : (
        <>
        <FlatList
          data={filteredServices || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              onToggleStatus={toggleServiceStatus}
              onEdit={handleEditService}
              onDelete={handleDeleteService}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={['#2563EB']}
            />
          }
          ListEmptyComponent={() => (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#666', fontSize: 16 }}>No services to display</Text>
            </View>
          )}
        />
        </>
      )}

      <AddEditServiceModal
        visible={showAddEditModal}
        isEditing={isEditing}
        formData={formData}
        onClose={() => setShowAddEditModal(false)}
        onSuccess={fetchServices}
      />
    </SafeAreaView>
  );
};

export default AdminServicesScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,Text
} from 'react-native';
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

// Import admin hooks
import { 
  useAdminServices, 
  useCreateService, 
  useUpdateService, 
  useDeleteService, 
  useToggleServiceStatus,
  useServiceCategories 
} from '../../hooks';

type AdminServicesNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  duration: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
  tags: string[];
}

interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  category: string;
  image: string | null;
  duration: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
}
const AdminServicesScreen = () => {
  const navigation = useNavigation<AdminServicesNavigationProp>();
  
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: '',
    discountedPrice: '',
    category: 'car-wash',
    image: null,
    duration: '',
    isActive: true,
    isPopular: false,
    features: [],
    tags: []
  });
  const [isEditing, setIsEditing] = useState(false);

  // API hooks
  const {
    data: services = [],
    loading,
    error,
    refresh: fetchServices,
    loadMore
  } = useAdminServices();

  const {
    execute: createService,
    loading: createLoading
  } = useCreateService();

  const {
    execute: updateService,
    loading: updateLoading
  } = useUpdateService();

  const {
    execute: deleteService,
    loading: deleteLoading
  } = useDeleteService();

  const {
    execute: toggleStatus,
    loading: toggleLoading
  } = useToggleServiceStatus();

  const {
    data: categoriesData = [],
    execute: fetchCategories
  } = useServiceCategories();

  useEffect(() => {
    fetchServices();
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
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
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
    const options = ['name', 'price', 'category', 'date'];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex] as 'name' | 'price' | 'category' | 'date');
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

      // Refresh the services list to get updated data
      await fetchServices();
    } catch (error) {
      console.error('Toggle service status error:', error);
      Alert.alert('Error', 'Failed to update service status. Please try again.');
    }
  };

  const handleAddService = () => {
    setIsEditing(false);
    setFormData({
      name: '',
      description: '',
      price: '',
      discountedPrice: '',
      category: 'car-wash',
      image: null,
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
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      discountedPrice: service.discountedPrice?.toString() || '',
      category: service.category,
      image: service.image,
      duration: service.duration.toString(),
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
              // Refresh the services list after successful deletion
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

  const handleSubmitForm = async (formData: ServiceFormData) => {
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        category: formData.category,
        duration: parseInt(formData.duration),
        features: formData.features,
        tags: formData.tags,
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        image: formData.image || undefined,
      };

      if (isEditing && formData.id) {
        await updateService({
          serviceId: formData.id,
          serviceData
        });
        Alert.alert('Success', 'Service updated successfully');
      } else {
        await createService(serviceData);
        Alert.alert('Success', 'Service created successfully');
      }

      // Refresh the services list
      await fetchServices();
      setShowAddEditModal(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        discountedPrice: '',
        category: 'car-wash',
        image: null,
        duration: '',
        isActive: true,
        isPopular: false,
        features: [],
        tags: []
      });
    } catch (error) {
      console.error('Submit form error:', error);
      const action = isEditing ? 'update' : 'create';
      Alert.alert('Error', `Failed to ${action} service. Please try again.`);
    }
  };
  // Prepare categories data
  const categories = [
    { id: 'all', name: 'All Services' },
    ...(((categoriesData || []) || []).map(cat => ({ id: cat.id, name: cat.name })))
  ];

  if (loading) {
    return (
      <View style={styles.container}>
        <Header 
          onBack={() => navigation.goBack()} 
          onAdd={handleAddService} 
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading services...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        onBack={() => navigation.goBack()} 
        onAdd={handleAddService} 
      />
      
      <View style={styles.searchContainer}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
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

      {(!filteredServices || filteredServices.length === 0) ? (
        <EmptyState onAddService={handleAddService} />
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
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
        />
      )}

      <AddEditServiceModal
        visible={showAddEditModal}
        isEditing={isEditing}
        formData={formData}
        onClose={() => setShowAddEditModal(false)}
        onSubmit={handleSubmitForm}
        categories={categories.slice(1)}
        loading={createLoading || updateLoading}
      />
    </View>
  );
};

export default AdminServicesScreen;

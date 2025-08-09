import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
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
import {  mockServices } from '../../constants/data/AdminServicesData';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

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
  
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  useEffect(() => {
    fetchServices();
  }, []);
  
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy, sortOrder]);

  const fetchServices = () => {
    setLoading(true);
    setTimeout(() => {
      setServices(mockServices);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  const filterAndSortServices = () => {
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

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId
          ? { ...service, isActive: !service.isActive }
          : service
      )
    );
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
          onPress: () => {
            setServices(prevServices => 
              prevServices.filter(service => service.id !== serviceId)
            );
          }
        }
      ]
    );
  };

  const handleSubmitForm = (newService: Service) => {
    if (isEditing) {
      setServices(prevServices =>
        prevServices.map(service => 
          service.id === newService.id ? newService : service
        )
      );
    } else {
      setServices(prevServices => [...prevServices, newService]);
    }
    setShowAddEditModal(false);
  };
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'car-wash', name: 'Car Wash' },
    { id: 'bike-wash', name: 'Bike Wash' },
    { id: 'detailing', name: 'Detailing' },
    { id: 'polishing', name: 'Polishing' },
    { id: 'coating', name: 'Coating' },
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
          itemCount={filteredServices.length}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderToggle={toggleSortOrder}
        />
      </View>

      {filteredServices.length === 0 ? (
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
              refreshing={refreshing}
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
      />
    </View>
  );
};

export default AdminServicesScreen;

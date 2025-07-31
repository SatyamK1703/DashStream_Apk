import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Switch,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  duration: number; // in minutes
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
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  
  // Mock categories
  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'car-wash', name: 'Car Wash' },
    { id: 'bike-wash', name: 'Bike Wash' },
    { id: 'detailing', name: 'Detailing' },
    { id: 'polishing', name: 'Polishing' },
    { id: 'coating', name: 'Coating' },
  ];
  
  // Mock data for services
  const mockServices: Service[] = [
    {
      id: '1',
      name: 'Basic Car Wash',
      description: 'Exterior wash with foam and water, includes tire cleaning.',
      price: 299,
      category: 'car-wash',
      image: 'https://example.com/basic-car-wash.jpg',
      duration: 30,
      isActive: true,
      isPopular: true,
      createdAt: '2023-05-15T10:30:00Z',
      updatedAt: '2023-06-20T14:45:00Z',
      features: ['Exterior Wash', 'Tire Cleaning', 'Windows Cleaning'],
      tags: ['Quick', 'Exterior']
    },
    {
      id: '2',
      name: 'Premium Car Wash',
      description: 'Complete exterior and interior cleaning with premium products.',
      price: 599,
      discountedPrice: 499,
      category: 'car-wash',
      image: 'https://example.com/premium-car-wash.jpg',
      duration: 60,
      isActive: true,
      isPopular: true,
      createdAt: '2023-04-10T09:15:00Z',
      updatedAt: '2023-06-25T11:30:00Z',
      features: ['Exterior Wash', 'Interior Vacuum', 'Dashboard Cleaning', 'Seat Cleaning', 'Air Freshener'],
      tags: ['Premium', 'Interior', 'Exterior']
    },
    {
      id: '3',
      name: 'Bike Wash',
      description: 'Complete bike cleaning with special attention to chain and wheels.',
      price: 149,
      category: 'bike-wash',
      image: 'https://example.com/bike-wash.jpg',
      duration: 20,
      isActive: true,
      isPopular: false,
      createdAt: '2023-05-20T13:45:00Z',
      updatedAt: '2023-06-15T16:20:00Z',
      features: ['Body Wash', 'Chain Cleaning', 'Wheel Cleaning'],
      tags: ['Quick', 'Bike']
    },
    {
      id: '4',
      name: 'Full Car Detailing',
      description: 'Comprehensive detailing service for interior and exterior with premium products.',
      price: 2999,
      discountedPrice: 2499,
      category: 'detailing',
      image: 'https://example.com/car-detailing.jpg',
      duration: 180,
      isActive: true,
      isPopular: true,
      createdAt: '2023-03-05T11:30:00Z',
      updatedAt: '2023-06-10T09:45:00Z',
      features: ['Deep Exterior Cleaning', 'Interior Deep Cleaning', 'Engine Bay Cleaning', 'Leather Treatment', 'Scratch Removal'],
      tags: ['Premium', 'Detailing', 'Complete']
    },
    {
      id: '5',
      name: 'Ceramic Coating',
      description: 'Long-lasting ceramic coating for paint protection and shine.',
      price: 7999,
      category: 'coating',
      image: 'https://example.com/ceramic-coating.jpg',
      duration: 240,
      isActive: true,
      isPopular: false,
      createdAt: '2023-02-15T14:20:00Z',
      updatedAt: '2023-05-30T10:15:00Z',
      features: ['Surface Preparation', 'Paint Correction', 'Ceramic Coating Application', '3-Year Protection'],
      tags: ['Premium', 'Protection', 'Long-lasting']
    },
    {
      id: '6',
      name: 'Car Polishing',
      description: 'Professional polishing to remove scratches and restore shine.',
      price: 1499,
      category: 'polishing',
      image: 'https://example.com/car-polishing.jpg',
      duration: 120,
      isActive: false,
      isPopular: false,
      createdAt: '2023-04-25T16:40:00Z',
      updatedAt: '2023-06-05T13:10:00Z',
      features: ['Scratch Removal', 'Swirl Mark Removal', 'Paint Restoration', 'Wax Application'],
      tags: ['Restoration', 'Shine']
    },
  ];
  
  useEffect(() => {
    // Simulate API call to fetch services
    fetchServices();
  }, []);
  
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchQuery, selectedCategory, sortBy, sortOrder]);
  
  const fetchServices = () => {
    setLoading(true);
    // Simulate API call
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
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Filter by search query
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
    
    // Sort
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
    setFormErrors({});
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
    setFormErrors({});
    setShowAddEditModal(true);
  };
  
  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Simulate API call to delete service
            setServices(prevServices => prevServices.filter(service => service.id !== serviceId));
          }
        }
      ]
    );
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select an image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setFormData(prev => ({
        ...prev,
        image: result.assets[0].uri
      }));
    }
  };
  
  const updateFormData = (key: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user types
    if (formErrors[key]) {
      setFormErrors(prev => ({
        ...prev,
        [key]: undefined
      }));
    }
  };
  
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };
  
  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };
  
  const addTag = () => {
    if (newTag.trim()) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  
  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    
    if (formData.discountedPrice.trim() && (isNaN(Number(formData.discountedPrice)) || Number(formData.discountedPrice) <= 0)) {
      newErrors.discountedPrice = 'Please enter a valid discounted price';
    }
    
    if (formData.discountedPrice.trim() && Number(formData.discountedPrice) >= Number(formData.price)) {
      newErrors.discountedPrice = 'Discounted price must be less than regular price';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration in minutes';
    }
    
    if (!formData.image) {
      newErrors.image = 'Service image is required';
    }
    
    if (formData.features.length === 0) {
      newErrors.features = 'At least one feature is required';
    }
    
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmitForm = () => {
    if (!validateForm()) {
      return;
    }
    
    // Simulate API call to add/update service
    const newService: Service = {
      id: formData.id || `${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
      category: formData.category,
      image: formData.image || '',
      duration: Number(formData.duration),
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      createdAt: formData.id ? services.find(s => s.id === formData.id)?.createdAt || new Date().toISOString() : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      features: formData.features,
      tags: formData.tags
    };
    
    if (isEditing) {
      setServices(prevServices =>
        prevServices.map(service => (service.id === newService.id ? newService : service))
      );
    } else {
      setServices(prevServices => [...prevServices, newService]);
    }
    
    setShowAddEditModal(false);
  };
  
  const renderServiceItem = ({ item }: { item: Service }) => {
    return (
      <View className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden">
        <View className="relative">
          {/* Service Image */}
          <Image
            source={{ uri: item.image }}
            className="w-full h-40"
            resizeMode="cover"
          />
          
          {/* Category Badge */}
          <View className="absolute top-2 left-2 bg-primary/80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-medium capitalize">{item.category.replace('-', ' ')}</Text>
          </View>
          
          {/* Popular Badge */}
          {item.isPopular && (
            <View className="absolute top-2 right-2 bg-yellow-500/90 px-2 py-1 rounded flex-row items-center">
              <Ionicons name="star" size={12} color="white" />
              <Text className="text-white text-xs font-medium ml-1">Popular</Text>
            </View>
          )}
          
          {/* Status Badge */}
          <View className={`absolute bottom-2 right-2 ${item.isActive ? 'bg-green-500/90' : 'bg-red-500/90'} px-2 py-1 rounded`}>
            <Text className="text-white text-xs font-medium">{item.isActive ? 'Active' : 'Inactive'}</Text>
          </View>
        </View>
        
        <View className="p-4">
          {/* Service Name and Price */}
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-gray-800 font-bold text-lg flex-1 mr-2">{item.name}</Text>
            <View>
              {item.discountedPrice ? (
                <View className="items-end">
                  <Text className="text-gray-500 text-sm line-through">₹{item.price}</Text>
                  <Text className="text-primary font-bold">₹{item.discountedPrice}</Text>
                </View>
              ) : (
                <Text className="text-primary font-bold">₹{item.price}</Text>
              )}
            </View>
          </View>
          
          {/* Description */}
          <Text className="text-gray-600 mb-3" numberOfLines={2}>{item.description}</Text>
          
          {/* Duration */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="time-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 ml-1">{item.duration} minutes</Text>
          </View>
          
          {/* Tags */}
          {item.tags.length > 0 && (
            <View className="flex-row flex-wrap mb-3">
              {item.tags.map((tag, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-2 py-1 mr-2 mb-1">
                  <Text className="text-gray-600 text-xs">{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Features */}
          <Text className="text-gray-700 font-medium mb-1">Features:</Text>
          <View className="mb-4">
            {item.features.slice(0, 3).map((feature, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                <Text className="text-gray-600 text-sm">{feature}</Text>
              </View>
            ))}
            {item.features.length > 3 && (
              <Text className="text-primary text-sm">+{item.features.length - 3} more</Text>
            )}
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-gray-600 mr-2">Active</Text>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleServiceStatus(item.id)}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={item.isActive ? '#2563EB' : '#F3F4F6'}
              />
            </View>
            
            <View className="flex-row">
              <TouchableOpacity 
                className="p-2 mr-2"
                onPress={() => handleEditService(item)}
              >
                <Ionicons name="create-outline" size={20} color="#4B5563" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="p-2"
                onPress={() => handleDeleteService(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  const renderAddEditModal = () => {
    return (
      <Modal
        visible={showAddEditModal}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[90%]">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <Text className="text-gray-800 font-bold text-xl">
                {isEditing ? 'Edit Service' : 'Add New Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddEditModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[1]}
              keyExtractor={() => 'form'}
              renderItem={() => (
                <View className="p-4">
                  {/* Service Image */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-2">Service Image <Text className="text-red-500">*</Text></Text>
                    <TouchableOpacity 
                      onPress={pickImage}
                      className="h-48 bg-gray-100 rounded-lg justify-center items-center overflow-hidden"
                    >
                      {formData.image ? (
                        <Image 
                          source={{ uri: formData.image }}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="items-center">
                          <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                          <Text className="text-gray-500 mt-2">Tap to select image</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    {formErrors.image && <Text className="text-red-500 text-xs mt-1">{formErrors.image}</Text>}
                  </View>
                  
                  {/* Service Name */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Service Name <Text className="text-red-500">*</Text></Text>
                    <TextInput
                      className={`border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                      placeholder="Enter service name"
                      value={formData.name}
                      onChangeText={(value) => updateFormData('name', value)}
                    />
                    {formErrors.name && <Text className="text-red-500 text-xs mt-1">{formErrors.name}</Text>}
                  </View>
                  
                  {/* Description */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Description <Text className="text-red-500">*</Text></Text>
                    <TextInput
                      className={`border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                      placeholder="Enter service description"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      value={formData.description}
                      onChangeText={(value) => updateFormData('description', value)}
                    />
                    {formErrors.description && <Text className="text-red-500 text-xs mt-1">{formErrors.description}</Text>}
                  </View>
                  
                  {/* Category */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Category <Text className="text-red-500">*</Text></Text>
                    <View className="flex-row flex-wrap">
                      {categories.slice(1).map((category) => (
                        <TouchableOpacity 
                          key={category.id}
                          className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${formData.category === category.id ? 'bg-primary/10 border-primary' : 'bg-gray-50 border-gray-300'}`}
                          onPress={() => updateFormData('category', category.id)}
                        >
                          <Text className={formData.category === category.id ? 'text-primary' : 'text-gray-700'}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  
                  {/* Price and Discounted Price */}
                  <View className="flex-row mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-700 font-medium mb-1">Price (₹) <Text className="text-red-500">*</Text></Text>
                      <TextInput
                        className={`border ${formErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                        placeholder="Enter price"
                        keyboardType="number-pad"
                        value={formData.price}
                        onChangeText={(value) => updateFormData('price', value)}
                      />
                      {formErrors.price && <Text className="text-red-500 text-xs mt-1">{formErrors.price}</Text>}
                    </View>
                    
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-700 font-medium mb-1">Discounted Price (₹)</Text>
                      <TextInput
                        className={`border ${formErrors.discountedPrice ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                        placeholder="Optional"
                        keyboardType="number-pad"
                        value={formData.discountedPrice}
                        onChangeText={(value) => updateFormData('discountedPrice', value)}
                      />
                      {formErrors.discountedPrice && <Text className="text-red-500 text-xs mt-1">{formErrors.discountedPrice}</Text>}
                    </View>
                  </View>
                  
                  {/* Duration */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Duration (minutes) <Text className="text-red-500">*</Text></Text>
                    <TextInput
                      className={`border ${formErrors.duration ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                      placeholder="Enter duration in minutes"
                      keyboardType="number-pad"
                      value={formData.duration}
                      onChangeText={(value) => updateFormData('duration', value)}
                    />
                    {formErrors.duration && <Text className="text-red-500 text-xs mt-1">{formErrors.duration}</Text>}
                  </View>
                  
                  {/* Status Toggles */}
                  <View className="mb-4">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-700 font-medium">Active</Text>
                      <Switch
                        value={formData.isActive}
                        onValueChange={(value) => updateFormData('isActive', value)}
                        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                        thumbColor={formData.isActive ? '#2563EB' : '#F3F4F6'}
                      />
                    </View>
                    
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-700 font-medium">Mark as Popular</Text>
                      <Switch
                        value={formData.isPopular}
                        onValueChange={(value) => updateFormData('isPopular', value)}
                        trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                        thumbColor={formData.isPopular ? '#2563EB' : '#F3F4F6'}
                      />
                    </View>
                  </View>
                  
                  {/* Features */}
                  <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Features <Text className="text-red-500">*</Text></Text>
                    <View className="flex-row items-center mb-2">
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 flex-1 mr-2"
                        placeholder="Add a feature"
                        value={newFeature}
                        onChangeText={setNewFeature}
                      />
                      <TouchableOpacity 
                        className="bg-primary px-3 py-2 rounded-lg"
                        onPress={addFeature}
                      >
                        <Text className="text-white font-medium">Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {formData.features.length > 0 ? (
                      <View className="bg-gray-50 rounded-lg p-2">
                        {formData.features.map((feature, index) => (
                          <View key={index} className="flex-row justify-between items-center mb-1 last:mb-0">
                            <View className="flex-row items-center flex-1">
                              <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                              <Text className="text-gray-700">{feature}</Text>
                            </View>
                            <TouchableOpacity onPress={() => removeFeature(index)}>
                              <Ionicons name="close-circle" size={18} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-gray-500 italic">No features added yet</Text>
                    )}
                    
                    {formErrors.features && <Text className="text-red-500 text-xs mt-1">{formErrors.features}</Text>}
                  </View>
                  
                  {/* Tags */}
                  <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-1">Tags</Text>
                    <View className="flex-row items-center mb-2">
                      <TextInput
                        className="border border-gray-300 rounded-lg px-3 py-2 flex-1 mr-2"
                        placeholder="Add a tag"
                        value={newTag}
                        onChangeText={setNewTag}
                      />
                      <TouchableOpacity 
                        className="bg-primary px-3 py-2 rounded-lg"
                        onPress={addTag}
                      >
                        <Text className="text-white font-medium">Add</Text>
                      </TouchableOpacity>
                    </View>
                    
                    {formData.tags.length > 0 ? (
                      <View className="flex-row flex-wrap">
                        {formData.tags.map((tag, index) => (
                          <View key={index} className="flex-row items-center bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                            <Text className="text-gray-700 mr-1">{tag}</Text>
                            <TouchableOpacity onPress={() => removeTag(index)}>
                              <Ionicons name="close-circle" size={16} color="#4B5563" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text className="text-gray-500 italic">No tags added yet</Text>
                    )}
                  </View>
                  
                  {/* Submit Button */}
                  <TouchableOpacity
                    className="bg-primary py-3 rounded-lg"
                    onPress={handleSubmitForm}
                  >
                    <Text className="text-white font-bold text-center">
                      {isEditing ? 'Update Service' : 'Add Service'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="p-2 rounded-full bg-white/20"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Manage Services</Text>
          </View>
          <TouchableOpacity 
            className="bg-white p-2 rounded-full"
            onPress={handleAddService}
          >
            <Ionicons name="add" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search and Filter */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-4 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search services..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className={`mr-2 px-4 py-2 rounded-full ${selectedCategory === category.id ? 'bg-primary' : 'bg-white'} shadow-sm`}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text className={`${selectedCategory === category.id ? 'text-white' : 'text-gray-700'} font-medium`}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Sort Options */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-700 font-medium">
            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
          </Text>
          
          <View className="flex-row items-center">
            <Text className="text-gray-700 mr-2">Sort by:</Text>
            <TouchableOpacity 
              className="flex-row items-center bg-white px-3 py-1.5 rounded-lg shadow-sm"
              onPress={() => {
                const options = ['name', 'price', 'category', 'date'];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex] as 'name' | 'price' | 'category' | 'date');
              }}
            >
              <Text className="text-gray-700 capitalize">{sortBy}</Text>
              <TouchableOpacity 
                className="ml-2"
                onPress={toggleSortOrder}
              >
                <Ionicons 
                  name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                  size={16} 
                  color="#4B5563" 
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Service List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-2">Loading services...</Text>
        </View>
      ) : filteredServices.length === 0 ? (
        <View className="flex-1 justify-center items-center px-4">
          <FontAwesome name="list-alt" size={50} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-medium mt-4 mb-2">No services found</Text>
          <Text className="text-gray-500 text-center mb-6">Try changing your search or filter criteria</Text>
          <TouchableOpacity 
            className="bg-primary px-4 py-2 rounded-lg"
            onPress={handleAddService}
          >
            <Text className="text-white font-medium">Add New Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          renderItem={renderServiceItem}
          contentContainerStyle={{ padding: 16 }}
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
      
      {renderAddEditModal()}
    </View>
  );
};

export default AdminServicesScreen;
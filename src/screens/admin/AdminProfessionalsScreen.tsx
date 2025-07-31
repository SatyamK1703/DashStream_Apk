import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminProfessionalsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Professional {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  skills: string[];
  joinedDate: string;
  lastActive: string;
  profileImage?: string;
  isVerified: boolean;
}

const AdminProfessionalsScreen = () => {
  const navigation = useNavigation<AdminProfessionalsScreenNavigationProp>();
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock data
  const mockProfessionals: Professional[] = [
    {
      id: 'PRO-001',
      name: 'Rajesh Kumar',
      phone: '+91 9876543210',
      email: 'rajesh.kumar@example.com',
      rating: 4.8,
      totalJobs: 156,
      completedJobs: 148,
      cancelledJobs: 8,
      totalEarnings: '₹78,500',
      status: 'active',
      skills: ['Car Wash', 'Detailing', 'Polish'],
      joinedDate: '2022-05-15',
      lastActive: '2023-08-15T10:30:00Z',
      isVerified: true
    },
    {
      id: 'PRO-002',
      name: 'Amit Singh',
      phone: '+91 9876543211',
      email: 'amit.singh@example.com',
      rating: 4.5,
      totalJobs: 98,
      completedJobs: 92,
      cancelledJobs: 6,
      totalEarnings: '₹45,200',
      status: 'active',
      skills: ['Car Wash', 'Bike Wash'],
      joinedDate: '2022-07-20',
      lastActive: '2023-08-14T16:45:00Z',
      isVerified: true
    },
    {
      id: 'PRO-003',
      name: 'Vikram Patel',
      phone: '+91 9876543212',
      email: 'vikram.patel@example.com',
      rating: 4.7,
      totalJobs: 120,
      completedJobs: 118,
      cancelledJobs: 2,
      totalEarnings: '₹62,800',
      status: 'active',
      skills: ['Car Wash', 'Detailing', 'Polish', 'Interior Cleaning'],
      joinedDate: '2022-06-10',
      lastActive: '2023-08-15T09:15:00Z',
      isVerified: true
    },
    {
      id: 'PRO-004',
      name: 'Sunil Verma',
      phone: '+91 9876543213',
      email: 'sunil.verma@example.com',
      rating: 4.9,
      totalJobs: 210,
      completedJobs: 205,
      cancelledJobs: 5,
      totalEarnings: '₹105,600',
      status: 'active',
      skills: ['Car Wash', 'Detailing', 'Polish', 'Interior Cleaning', 'Engine Cleaning'],
      joinedDate: '2022-04-05',
      lastActive: '2023-08-15T11:20:00Z',
      isVerified: true
    },
    {
      id: 'PRO-005',
      name: 'Deepak Sharma',
      phone: '+91 9876543214',
      email: 'deepak.sharma@example.com',
      rating: 4.6,
      totalJobs: 85,
      completedJobs: 80,
      cancelledJobs: 5,
      totalEarnings: '₹42,300',
      status: 'inactive',
      skills: ['Car Wash', 'Bike Wash'],
      joinedDate: '2022-08-12',
      lastActive: '2023-07-30T14:10:00Z',
      isVerified: true
    },
    {
      id: 'PRO-006',
      name: 'Priya Patel',
      phone: '+91 9876543215',
      email: 'priya.patel@example.com',
      rating: 0,
      totalJobs: 0,
      completedJobs: 0,
      cancelledJobs: 0,
      totalEarnings: '₹0',
      status: 'pending',
      skills: ['Car Wash', 'Interior Cleaning'],
      joinedDate: '2023-08-10',
      lastActive: '2023-08-10T09:30:00Z',
      isVerified: false
    },
    {
      id: 'PRO-007',
      name: 'Rahul Gupta',
      phone: '+91 9876543216',
      email: 'rahul.gupta@example.com',
      rating: 0,
      totalJobs: 0,
      completedJobs: 0,
      cancelledJobs: 0,
      totalEarnings: '₹0',
      status: 'rejected',
      skills: ['Car Wash'],
      joinedDate: '2023-08-05',
      lastActive: '2023-08-05T16:45:00Z',
      isVerified: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProfessionals(mockProfessionals);
      setFilteredProfessionals(mockProfessionals);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, sortBy, sortOrder, professionals]);

  const applyFilters = () => {
    let filtered = [...professionals];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pro => pro.status === statusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        pro => 
          pro.name.toLowerCase().includes(query) ||
          pro.id.toLowerCase().includes(query) ||
          pro.phone.includes(query) ||
          pro.email.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'jobs':
          comparison = a.totalJobs - b.totalJobs;
          break;
        case 'earnings':
          // Remove currency symbol and commas for numeric comparison
          const aEarnings = parseFloat(a.totalEarnings.replace(/[^\d.]/g, ''));
          const bEarnings = parseFloat(b.totalEarnings.replace(/[^\d.]/g, ''));
          comparison = aEarnings - bEarnings;
          break;
        case 'date':
          comparison = new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredProfessionals(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setProfessionals(mockProfessionals);
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleSortChange = (sortField: string) => {
    if (sortBy === sortField) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(sortField);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleStatus = (professional: Professional) => {
    Alert.alert(
      'Change Status',
      `Are you sure you want to ${professional.status === 'active' ? 'deactivate' : 'activate'} ${professional.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update professional status in the state
            const updatedProfessionals = professionals.map(pro => {
              if (pro.id === professional.id) {
                return {
                  ...pro,
                  status: pro.status === 'active' ? 'inactive' : 'active'
                };
              }
              return pro;
            });
            setProfessionals(updatedProfessionals);
            
            // Show success message
            Alert.alert(
              'Success',
              `Professional ${professional.status === 'active' ? 'deactivated' : 'activated'} successfully`
            );
          }
        }
      ]
    );
  };

  const handleVerifyProfessional = (professional: Professional) => {
    if (professional.status === 'pending') {
      Alert.alert(
        'Verify Professional',
        `Do you want to approve or reject ${professional.name}'s application?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reject', 
            style: 'destructive',
            onPress: () => {
              // Update professional status to rejected
              const updatedProfessionals = professionals.map(pro => {
                if (pro.id === professional.id) {
                  return {
                    ...pro,
                    status: 'rejected'
                  };
                }
                return pro;
              });
              setProfessionals(updatedProfessionals);
              
              // Show success message
              Alert.alert('Success', 'Professional application rejected');
            }
          },
          { 
            text: 'Approve', 
            onPress: () => {
              // Update professional status to active and set isVerified to true
              const updatedProfessionals = professionals.map(pro => {
                if (pro.id === professional.id) {
                  return {
                    ...pro,
                    status: 'active',
                    isVerified: true
                  };
                }
                return pro;
              });
              setProfessionals(updatedProfessionals);
              
              // Show success message
              Alert.alert('Success', 'Professional application approved');
            }
          }
        ]
      );
    }
  };

  const renderProfessionalItem = ({ item }: { item: Professional }) => {
    const lastActiveDate = new Date(item.lastActive);
    const formattedLastActive = lastActiveDate.toLocaleDateString() + ' ' + lastActiveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <TouchableOpacity 
        className="bg-white rounded-lg shadow-sm mb-4 overflow-hidden"
        onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: item.id })}
      >
        <View className="p-4">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center flex-1">
              {item.profileImage ? (
                <Image 
                  source={{ uri: item.profileImage }} 
                  className="w-12 h-12 rounded-full bg-gray-200"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-gray-600 font-bold text-lg">{item.name.charAt(0)}</Text>
                </View>
              )}
              
              <View className="ml-3 flex-1">
                <View className="flex-row items-center">
                  <Text className="text-gray-800 font-bold text-base">{item.name}</Text>
                  {item.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color="#2563EB" className="ml-1" />
                  )}
                </View>
                <Text className="text-gray-500 text-sm">{item.id}</Text>
              </View>
            </View>
            
            <View className={`px-2.5 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className="text-xs font-medium capitalize">{item.status}</Text>
            </View>
          </View>

          <View className="mt-3 flex-row flex-wrap">
            <View className="flex-row items-center mr-4 mb-2">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-gray-700 ml-1">{item.rating.toFixed(1)}</Text>
            </View>
            
            <View className="flex-row items-center mr-4 mb-2">
              <MaterialIcons name="work" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-1">{item.totalJobs} jobs</Text>
            </View>
            
            <View className="flex-row items-center mr-4 mb-2">
              <MaterialIcons name="attach-money" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-1">{item.totalEarnings}</Text>
            </View>
            
            <View className="flex-row items-center mb-2">
              <Ionicons name="calendar" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-1">Joined {new Date(item.joinedDate).toLocaleDateString()}</Text>
            </View>
          </View>

          <View className="mt-2">
            <Text className="text-gray-600 text-sm mb-1">Skills:</Text>
            <View className="flex-row flex-wrap">
              {item.skills.map((skill, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-2.5 py-1 mr-2 mb-2">
                  <Text className="text-gray-700 text-xs">{skill}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mt-3 pt-3 border-t border-gray-100 flex-row justify-between items-center">
            <Text className="text-gray-500 text-xs">Last active: {formattedLastActive}</Text>
            
            <View className="flex-row">
              {item.status === 'pending' && (
                <TouchableOpacity 
                  className="bg-primary py-1.5 px-3 rounded-lg mr-2 flex-row items-center"
                  onPress={() => handleVerifyProfessional(item)}
                >
                  <MaterialIcons name="verified" size={16} color="white" />
                  <Text className="text-white text-xs font-medium ml-1">Verify</Text>
                </TouchableOpacity>
              )}
              
              {(item.status === 'active' || item.status === 'inactive') && (
                <TouchableOpacity 
                  className={`py-1.5 px-3 rounded-lg flex-row items-center ${item.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                  onPress={() => handleToggleStatus(item)}
                >
                  <MaterialIcons 
                    name={item.status === 'active' ? 'block' : 'check-circle'} 
                    size={16} 
                    color="white" 
                  />
                  <Text className="text-white text-xs font-medium ml-1">
                    {item.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading professionals...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Professionals</Text>
          <TouchableOpacity 
            className="bg-white bg-opacity-20 p-2 rounded-full"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="mt-4 bg-white rounded-lg flex-row items-center px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search by name, ID, phone or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Status Filter */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className={`px-4 py-1.5 rounded-full mr-2 ${statusFilter === 'all' ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => handleStatusChange('all')}
          >
            <Text className={`font-medium ${statusFilter === 'all' ? 'text-white' : 'text-gray-700'}`}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-1.5 rounded-full mr-2 ${statusFilter === 'active' ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => handleStatusChange('active')}
          >
            <Text className={`font-medium ${statusFilter === 'active' ? 'text-white' : 'text-gray-700'}`}>Active</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-1.5 rounded-full mr-2 ${statusFilter === 'inactive' ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => handleStatusChange('inactive')}
          >
            <Text className={`font-medium ${statusFilter === 'inactive' ? 'text-white' : 'text-gray-700'}`}>Inactive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-1.5 rounded-full mr-2 ${statusFilter === 'pending' ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => handleStatusChange('pending')}
          >
            <Text className={`font-medium ${statusFilter === 'pending' ? 'text-white' : 'text-gray-700'}`}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-4 py-1.5 rounded-full mr-2 ${statusFilter === 'rejected' ? 'bg-primary' : 'bg-gray-100'}`}
            onPress={() => handleStatusChange('rejected')}
          >
            <Text className={`font-medium ${statusFilter === 'rejected' ? 'text-white' : 'text-gray-700'}`}>Rejected</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100 mb-2">
        <Text className="text-gray-600 mr-2">Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => handleSortChange('name')}
          >
            <Text className={`${sortBy === 'name' ? 'text-primary font-medium' : 'text-gray-700'}`}>Name</Text>
            {sortBy === 'name' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#2563EB" 
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => handleSortChange('rating')}
          >
            <Text className={`${sortBy === 'rating' ? 'text-primary font-medium' : 'text-gray-700'}`}>Rating</Text>
            {sortBy === 'rating' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#2563EB" 
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => handleSortChange('jobs')}
          >
            <Text className={`${sortBy === 'jobs' ? 'text-primary font-medium' : 'text-gray-700'}`}>Jobs</Text>
            {sortBy === 'jobs' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#2563EB" 
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => handleSortChange('earnings')}
          >
            <Text className={`${sortBy === 'earnings' ? 'text-primary font-medium' : 'text-gray-700'}`}>Earnings</Text>
            {sortBy === 'earnings' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#2563EB" 
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => handleSortChange('date')}
          >
            <Text className={`${sortBy === 'date' ? 'text-primary font-medium' : 'text-gray-700'}`}>Join Date</Text>
            {sortBy === 'date' && (
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#2563EB" 
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Professionals List */}
      <FlatList
        data={filteredProfessionals}
        renderItem={renderProfessionalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-10">
            <MaterialIcons name="person-search" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">No professionals found</Text>
            <Text className="text-gray-400 text-center">Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Add Professional FAB */}
      <TouchableOpacity 
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddProfessional')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminProfessionalsScreen;
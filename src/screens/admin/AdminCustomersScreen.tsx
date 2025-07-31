import React, { useState, useEffect } from 'react';
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
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminCustomersNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: 'active' | 'inactive' | 'blocked';
  totalBookings: number;
  totalSpent: number;
  membershipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  lastActive: string;
  addresses: number;
  vehicles: number;
}

const AdminCustomersScreen = () => {
  const navigation = useNavigation<AdminCustomersNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'spent' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9876543210',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      status: 'active',
      totalBookings: 15,
      totalSpent: 12500,
      membershipStatus: 'gold',
      joinDate: '2023-01-15',
      lastActive: '2023-06-10',
      addresses: 2,
      vehicles: 1
    },
    {
      id: 'CUST-002',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 9876543211',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      status: 'active',
      totalBookings: 8,
      totalSpent: 6800,
      membershipStatus: 'silver',
      joinDate: '2023-02-20',
      lastActive: '2023-06-08',
      addresses: 1,
      vehicles: 2
    },
    {
      id: 'CUST-003',
      name: 'Ananya Patel',
      email: 'ananya.patel@example.com',
      phone: '+91 9876543212',
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      status: 'inactive',
      totalBookings: 3,
      totalSpent: 2200,
      membershipStatus: 'none',
      joinDate: '2023-03-10',
      lastActive: '2023-04-15',
      addresses: 1,
      vehicles: 1
    },
    {
      id: 'CUST-004',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 9876543213',
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      status: 'blocked',
      totalBookings: 1,
      totalSpent: 800,
      membershipStatus: 'none',
      joinDate: '2023-03-25',
      lastActive: '2023-03-28',
      addresses: 1,
      vehicles: 1
    },
    {
      id: 'CUST-005',
      name: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      phone: '+91 9876543214',
      profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      status: 'active',
      totalBookings: 22,
      totalSpent: 18500,
      membershipStatus: 'platinum',
      joinDate: '2022-11-05',
      lastActive: '2023-06-12',
      addresses: 3,
      vehicles: 2
    },
    {
      id: 'CUST-006',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '+91 9876543215',
      profileImage: 'https://randomuser.me/api/portraits/men/6.jpg',
      status: 'active',
      totalBookings: 12,
      totalSpent: 9800,
      membershipStatus: 'silver',
      joinDate: '2023-01-30',
      lastActive: '2023-06-05',
      addresses: 2,
      vehicles: 1
    },
    {
      id: 'CUST-007',
      name: 'Kavita Joshi',
      email: 'kavita.joshi@example.com',
      phone: '+91 9876543216',
      profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
      status: 'inactive',
      totalBookings: 5,
      totalSpent: 4200,
      membershipStatus: 'none',
      joinDate: '2023-02-15',
      lastActive: '2023-05-01',
      addresses: 1,
      vehicles: 1
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, sortBy, sortOrder, customers]);

  const applyFilters = () => {
    let filtered = [...customers];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'bookings':
          comparison = a.totalBookings - b.totalBookings;
          break;
        case 'spent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'date':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCustomers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setRefreshing(false);
    }, 1500);
  };

  const handleToggleSort = (newSortBy: 'name' | 'bookings' | 'spent' | 'date') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleToggleStatus = (customerId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    Alert.alert(
      'Change Customer Status',
      `Are you sure you want to change this customer's status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update customer status
            const updatedCustomers = customers.map(customer => {
              if (customer.id === customerId) {
                return { ...customer, status: newStatus };
              }
              return customer;
            });
            
            setCustomers(updatedCustomers);
          }
        }
      ]
    );
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    return (
      <TouchableOpacity 
        className="bg-white rounded-lg shadow-sm p-4 mb-3"
        onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
      >
        <View className="flex-row">
          {/* Customer Image and Basic Info */}
          <View className="flex-row items-center flex-1">
            <Image 
              source={{ uri: item.profileImage }}
              className="w-12 h-12 rounded-full bg-gray-200"
            />
            <View className="ml-3 flex-1">
              <View className="flex-row items-center">
                <Text className="text-gray-800 font-bold text-base">{item.name}</Text>
                {item.membershipStatus !== 'none' && (
                  <View className="ml-2 px-2 py-0.5 rounded-full bg-amber-100">
                    <Text className="text-amber-800 text-xs font-medium capitalize">
                      {item.membershipStatus}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-500 text-sm">{item.id}</Text>
              <View className="flex-row items-center mt-1">
                <View className={`w-2 h-2 rounded-full mr-1.5 ${
                  item.status === 'active' ? 'bg-green-500' : 
                  item.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                <Text className="text-gray-600 text-xs capitalize">{item.status}</Text>
              </View>
            </View>
          </View>
          
          {/* Customer Stats */}
          <View className="flex-row">
            <View className="items-center mx-2">
              <Text className="text-gray-500 text-xs">Bookings</Text>
              <Text className="text-gray-800 font-bold">{item.totalBookings}</Text>
            </View>
            
            <View className="items-center mx-2">
              <Text className="text-gray-500 text-xs">Spent</Text>
              <Text className="text-gray-800 font-bold">₹{item.totalSpent}</Text>
            </View>
            
            <View className="items-center mx-2">
              <Text className="text-gray-500 text-xs">Joined</Text>
              <Text className="text-gray-800 font-bold">{new Date(item.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}</Text>
            </View>
          </View>
        </View>
        
        {/* Actions */}
        <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
          >
            <Ionicons name="eye-outline" size={16} color="#4B5563" />
            <Text className="text-gray-600 ml-1">View Details</Text>
          </TouchableOpacity>
          
          <View className="flex-row">
            {item.status !== 'active' && (
              <TouchableOpacity 
                className="flex-row items-center mr-4"
                onPress={() => handleToggleStatus(item.id, 'active')}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color="#10B981" />
                <Text className="text-green-600 ml-1">Activate</Text>
              </TouchableOpacity>
            )}
            
            {item.status !== 'inactive' && item.status !== 'blocked' && (
              <TouchableOpacity 
                className="flex-row items-center mr-4"
                onPress={() => handleToggleStatus(item.id, 'inactive')}
              >
                <Ionicons name="pause-circle-outline" size={16} color="#F59E0B" />
                <Text className="text-amber-600 ml-1">Deactivate</Text>
              </TouchableOpacity>
            )}
            
            {item.status !== 'blocked' && (
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => handleToggleStatus(item.id, 'blocked')}
              >
                <Ionicons name="ban-outline" size={16} color="#EF4444" />
                <Text className="text-red-600 ml-1">Block</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading customers...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Customers</Text>
          <TouchableOpacity 
            className="bg-white/20 p-2 rounded-full"
            onPress={() => navigation.navigate('AddCustomer')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="mt-4 bg-white rounded-lg flex-row items-center px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search by name, email, phone or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Filters */}
      <View className="px-4 py-3">
        <View className="flex-row mb-3">
          <Text className="text-gray-700 font-medium">Status: </Text>
          <View className="flex-row flex-wrap">
            {['all', 'active', 'inactive', 'blocked'].map((status) => (
              <TouchableOpacity 
                key={status}
                className={`mr-2 px-3 py-1 rounded-full ${statusFilter === status ? 'bg-primary' : 'bg-gray-200'}`}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text className={`text-xs font-medium capitalize ${statusFilter === status ? 'text-white' : 'text-gray-700'}`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View className="flex-row items-center">
          <Text className="text-gray-700 font-medium mr-2">Sort by: </Text>
          <View className="flex-row">
            <TouchableOpacity 
              className="flex-row items-center mr-3"
              onPress={() => handleToggleSort('name')}
            >
              <Text className={`text-sm ${sortBy === 'name' ? 'text-primary font-medium' : 'text-gray-600'}`}>Name</Text>
              {sortBy === 'name' && (
                <Ionicons 
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#2563EB" 
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center mr-3"
              onPress={() => handleToggleSort('bookings')}
            >
              <Text className={`text-sm ${sortBy === 'bookings' ? 'text-primary font-medium' : 'text-gray-600'}`}>Bookings</Text>
              {sortBy === 'bookings' && (
                <Ionicons 
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#2563EB" 
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center mr-3"
              onPress={() => handleToggleSort('spent')}
            >
              <Text className={`text-sm ${sortBy === 'spent' ? 'text-primary font-medium' : 'text-gray-600'}`}>Spent</Text>
              {sortBy === 'spent' && (
                <Ionicons 
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#2563EB" 
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => handleToggleSort('date')}
            >
              <Text className={`text-sm ${sortBy === 'date' ? 'text-primary font-medium' : 'text-gray-600'}`}>Join Date</Text>
              {sortBy === 'date' && (
                <Ionicons 
                  name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                  size={16} 
                  color="#2563EB" 
                  style={{ marginLeft: 2 }}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Ionicons name="people" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">No customers found</Text>
            <Text className="text-gray-400 text-center">Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
};

export default AdminCustomersScreen;
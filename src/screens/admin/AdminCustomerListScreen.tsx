import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminCustomerListNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

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
}

const AdminCustomerListScreen = () => {
  const navigation = useNavigation<AdminCustomerListNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'none' | 'silver' | 'gold' | 'platinum'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastActive' | 'totalBookings' | 'totalSpent'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock customer data
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
      lastActive: '2023-06-10'
    },
    {
      id: 'CUST-002',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 9876543211',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'active',
      totalBookings: 8,
      totalSpent: 7800,
      membershipStatus: 'silver',
      joinDate: '2023-02-20',
      lastActive: '2023-06-05'
    },
    {
      id: 'CUST-003',
      name: 'Ananya Patel',
      email: 'ananya.patel@example.com',
      phone: '+91 9876543212',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      status: 'inactive',
      totalBookings: 3,
      totalSpent: 2500,
      membershipStatus: 'none',
      joinDate: '2023-03-10',
      lastActive: '2023-04-15'
    },
    {
      id: 'CUST-004',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 9876543213',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      status: 'blocked',
      totalBookings: 1,
      totalSpent: 999,
      membershipStatus: 'none',
      joinDate: '2023-03-25',
      lastActive: '2023-03-30'
    },
    {
      id: 'CUST-005',
      name: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      phone: '+91 9876543214',
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      status: 'active',
      totalBookings: 20,
      totalSpent: 18500,
      membershipStatus: 'platinum',
      joinDate: '2022-12-05',
      lastActive: '2023-06-12'
    },
    {
      id: 'CUST-006',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '+91 9876543215',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      status: 'active',
      totalBookings: 12,
      totalSpent: 10800,
      membershipStatus: 'gold',
      joinDate: '2023-01-30',
      lastActive: '2023-06-08'
    },
    {
      id: 'CUST-007',
      name: 'Kavita Desai',
      email: 'kavita.desai@example.com',
      phone: '+91 9876543216',
      profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      status: 'active',
      totalBookings: 6,
      totalSpent: 5400,
      membershipStatus: 'silver',
      joinDate: '2023-02-15',
      lastActive: '2023-05-20'
    },
    {
      id: 'CUST-008',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 9876543217',
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      status: 'inactive',
      totalBookings: 2,
      totalSpent: 1800,
      membershipStatus: 'none',
      joinDate: '2023-04-05',
      lastActive: '2023-04-20'
    },
    {
      id: 'CUST-009',
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      phone: '+91 9876543218',
      profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      status: 'active',
      totalBookings: 10,
      totalSpent: 9200,
      membershipStatus: 'gold',
      joinDate: '2023-01-20',
      lastActive: '2023-06-01'
    },
    {
      id: 'CUST-010',
      name: 'Sanjay Mehta',
      email: 'sanjay.mehta@example.com',
      phone: '+91 9876543219',
      profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      status: 'active',
      totalBookings: 18,
      totalSpent: 16500,
      membershipStatus: 'platinum',
      joinDate: '2022-11-15',
      lastActive: '2023-06-11'
    }
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
  }, [searchQuery, statusFilter, membershipFilter, sortBy, sortOrder, customers]);

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setRefreshing(false);
    }, 1500);
  };

  const applyFilters = () => {
    let result = [...customers];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    // Apply membership filter
    if (membershipFilter !== 'all') {
      result = result.filter(customer => customer.membershipStatus === membershipFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'joinDate':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
        case 'lastActive':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
        case 'totalBookings':
          comparison = a.totalBookings - b.totalBookings;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCustomers(result);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMembershipFilter('all');
    setSortBy('joinDate');
    setSortOrder('desc');
    setShowFilters(false);
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm p-4 mb-3"
      onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
    >
      <View className="flex-row items-center">
        <Image 
          source={{ uri: item.profileImage }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        
        <View className="ml-3 flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-800 font-bold">{item.name}</Text>
            
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-1.5 ${
                item.status === 'active' ? 'bg-green-500' : 
                item.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <Text className="text-gray-500 text-xs capitalize">{item.status}</Text>
            </View>
          </View>
          
          <Text className="text-gray-500 text-sm">{item.email}</Text>
          <Text className="text-gray-500 text-sm">{item.phone}</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
        <View className="items-center">
          <Text className="text-gray-500 text-xs">ID</Text>
          <Text className="text-gray-800 font-medium">{item.id}</Text>
        </View>
        
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Joined</Text>
          <Text className="text-gray-800 font-medium">
            {new Date(item.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Bookings</Text>
          <Text className="text-gray-800 font-medium">{item.totalBookings}</Text>
        </View>
        
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Spent</Text>
          <Text className="text-gray-800 font-medium">₹{item.totalSpent}</Text>
        </View>
      </View>
      
      {item.membershipStatus !== 'none' && (
        <View className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-amber-100">
          <View className="flex-row items-center">
            <FontAwesome5 name="crown" size={10} color="#F59E0B" />
            <Text className="text-amber-800 text-xs font-medium ml-1 capitalize">
              {item.membershipStatus}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

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
            className="p-2 rounded-full bg-white/20"
            onPress={() => navigation.navigate('CreateCustomer')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View className="px-4 py-3">
        <View className="flex-row items-center bg-white rounded-lg shadow-sm px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search by name, email, phone or ID"
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
      
      {/* Filter Bar */}
      <View className="px-4 flex-row justify-between items-center mb-2">
        <View className="flex-row">
          <TouchableOpacity 
            className="flex-row items-center mr-4"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={18} color="#4B5563" />
            <Text className="text-gray-600 ml-1">Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'} 
              size={18} 
              color="#4B5563" 
            />
            <Text className="text-gray-600 ml-1">
              Sort: {sortBy === 'joinDate' ? 'Date Joined' : 
                     sortBy === 'lastActive' ? 'Last Active' : 
                     sortBy === 'totalBookings' ? 'Bookings' : 
                     sortBy === 'totalSpent' ? 'Amount Spent' : 'Name'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-500 text-sm">{filteredCustomers.length} customers</Text>
      </View>
      
      {/* Filters Panel */}
      {showFilters && (
        <View className="mx-4 mb-3 bg-white rounded-lg shadow-sm p-4">
          <Text className="text-gray-800 font-bold mb-3">Filter Options</Text>
          
          {/* Status Filter */}
          <Text className="text-gray-600 mb-2">Status</Text>
          <View className="flex-row flex-wrap mb-4">
            {['all', 'active', 'inactive', 'blocked'].map((status) => (
              <TouchableOpacity 
                key={status}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${statusFilter === status ? 'bg-primary' : 'bg-gray-100'}`}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text 
                  className={`text-sm font-medium capitalize ${statusFilter === status ? 'text-white' : 'text-gray-600'}`}
                >
                  {status === 'all' ? 'All Status' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Membership Filter */}
          <Text className="text-gray-600 mb-2">Membership</Text>
          <View className="flex-row flex-wrap mb-4">
            {['all', 'none', 'silver', 'gold', 'platinum'].map((membership) => (
              <TouchableOpacity 
                key={membership}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${membershipFilter === membership ? 'bg-primary' : 'bg-gray-100'}`}
                onPress={() => setMembershipFilter(membership as any)}
              >
                <Text 
                  className={`text-sm font-medium capitalize ${membershipFilter === membership ? 'text-white' : 'text-gray-600'}`}
                >
                  {membership === 'all' ? 'All Memberships' : 
                   membership === 'none' ? 'No Membership' : membership}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Sort By */}
          <Text className="text-gray-600 mb-2">Sort By</Text>
          <View className="flex-row flex-wrap mb-4">
            {[
              { id: 'name', label: 'Name' },
              { id: 'joinDate', label: 'Date Joined' },
              { id: 'lastActive', label: 'Last Active' },
              { id: 'totalBookings', label: 'Bookings' },
              { id: 'totalSpent', label: 'Amount Spent' }
            ].map((sort) => (
              <TouchableOpacity 
                key={sort.id}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full ${sortBy === sort.id ? 'bg-primary' : 'bg-gray-100'}`}
                onPress={() => setSortBy(sort.id as any)}
              >
                <Text 
                  className={`text-sm font-medium ${sortBy === sort.id ? 'text-white' : 'text-gray-600'}`}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Reset Button */}
          <TouchableOpacity 
            className="self-end bg-gray-100 px-4 py-2 rounded-lg"
            onPress={resetFilters}
          >
            <Text className="text-gray-700 font-medium">Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
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
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">No customers found</Text>
            <Text className="text-gray-400 text-center">Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
};

export default AdminCustomerListScreen;
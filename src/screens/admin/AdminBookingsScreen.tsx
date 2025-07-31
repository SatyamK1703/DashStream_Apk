import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminBookingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

type BookingStatus = 'all' | 'pending' | 'ongoing' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  professionalName: string | null;
  professionalId: string | null;
  service: string;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  amount: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

const AdminBookingsScreen = () => {
  const navigation = useNavigation<AdminBookingsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  // Mock data
  const mockBookings: Booking[] = [
    {
      id: 'BK-7845',
      customerName: 'Rahul Sharma',
      customerPhone: '+91 9876543210',
      professionalName: 'Rajesh Kumar',
      professionalId: 'PRO-001',
      service: 'Premium Wash & Polish',
      date: '15 Aug 2023',
      time: '10:30 AM',
      address: '123 Main Street, Andheri East, Mumbai',
      status: 'ongoing',
      amount: '₹1,200',
      paymentStatus: 'paid',
      createdAt: '2023-08-14T18:30:00Z'
    },
    {
      id: 'BK-7844',
      customerName: 'Priya Patel',
      customerPhone: '+91 9876543211',
      professionalName: null,
      professionalId: null,
      service: 'Interior Detailing',
      date: '15 Aug 2023',
      time: '09:15 AM',
      address: '456 Park Avenue, Bandra West, Mumbai',
      status: 'pending',
      amount: '₹1,800',
      paymentStatus: 'pending',
      createdAt: '2023-08-14T17:45:00Z'
    },
    {
      id: 'BK-7843',
      customerName: 'Amit Kumar',
      customerPhone: '+91 9876543212',
      professionalName: 'Sunil Verma',
      professionalId: 'PRO-008',
      service: 'Basic Wash',
      date: '15 Aug 2023',
      time: '08:00 AM',
      address: '789 Lake View, Powai, Mumbai',
      status: 'completed',
      amount: '₹600',
      paymentStatus: 'paid',
      createdAt: '2023-08-14T16:20:00Z'
    },
    {
      id: 'BK-7842',
      customerName: 'Sneha Gupta',
      customerPhone: '+91 9876543213',
      professionalName: 'Vikram Singh',
      professionalId: 'PRO-015',
      service: 'Full Detailing Package',
      date: '14 Aug 2023',
      time: '04:30 PM',
      address: '101 Hill Road, Juhu, Mumbai',
      status: 'cancelled',
      amount: '₹2,500',
      paymentStatus: 'failed',
      createdAt: '2023-08-13T14:10:00Z'
    },
    {
      id: 'BK-7841',
      customerName: 'Vikram Malhotra',
      customerPhone: '+91 9876543214',
      professionalName: 'Rajesh Kumar',
      professionalId: 'PRO-001',
      service: 'Exterior Detailing',
      date: '14 Aug 2023',
      time: '02:15 PM',
      address: '202 Sea View, Worli, Mumbai',
      status: 'completed',
      amount: '₹1,500',
      paymentStatus: 'paid',
      createdAt: '2023-08-13T12:30:00Z'
    },
    {
      id: 'BK-7840',
      customerName: 'Neha Singh',
      customerPhone: '+91 9876543215',
      professionalName: 'Sunil Verma',
      professionalId: 'PRO-008',
      service: 'Premium Wash & Polish',
      date: '14 Aug 2023',
      time: '11:00 AM',
      address: '303 Green Park, Malad, Mumbai',
      status: 'completed',
      amount: '₹1,200',
      paymentStatus: 'paid',
      createdAt: '2023-08-13T09:45:00Z'
    },
    {
      id: 'BK-7839',
      customerName: 'Rajat Kapoor',
      customerPhone: '+91 9876543216',
      professionalName: null,
      professionalId: null,
      service: 'Basic Wash',
      date: '16 Aug 2023',
      time: '03:30 PM',
      address: '404 River View, Goregaon, Mumbai',
      status: 'pending',
      amount: '₹600',
      paymentStatus: 'pending',
      createdAt: '2023-08-15T10:20:00Z'
    },
    {
      id: 'BK-7838',
      customerName: 'Ananya Desai',
      customerPhone: '+91 9876543217',
      professionalName: null,
      professionalId: null,
      service: 'Interior Detailing',
      date: '16 Aug 2023',
      time: '05:45 PM',
      address: '505 Mountain View, Thane, Mumbai',
      status: 'pending',
      amount: '₹1,800',
      paymentStatus: 'pending',
      createdAt: '2023-08-15T11:30:00Z'
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, statusFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...bookings];

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        booking =>
          booking.id.toLowerCase().includes(query) ||
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerPhone.includes(query) ||
          (booking.professionalName && booking.professionalName.toLowerCase().includes(query)) ||
          booking.service.toLowerCase().includes(query) ||
          booking.address.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredBookings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-900 font-medium">{item.customerName}</Text>
          <Text className="text-gray-500 text-sm">{item.service}</Text>
        </View>
        <Text className="text-primary font-bold">{item.amount}</Text>
      </View>

      <View className="flex-row items-center mt-2">
        <Ionicons name="calendar-outline" size={14} color="#6B7280" />
        <Text className="text-gray-500 text-xs ml-1">{item.date}, {item.time}</Text>
      </View>

      <View className="flex-row items-center mt-1">
        <Ionicons name="location-outline" size={14} color="#6B7280" />
        <Text className="text-gray-500 text-xs ml-1 flex-1" numberOfLines={1}>{item.address}</Text>
      </View>

      {item.professionalName ? (
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="person-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">Pro: {item.professionalName}</Text>
        </View>
      ) : (
        <View className="flex-row items-center mt-1">
          <MaterialIcons name="person-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">Pro: Not assigned</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center mt-3">
        <View className={`px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-medium capitalize">{item.status}</Text>
        </View>
        
        <View className="flex-row items-center">
          <Text className={`text-xs font-medium ${getPaymentStatusColor(item.paymentStatus)}`}>
            {item.paymentStatus === 'paid' ? 'Paid' : item.paymentStatus === 'pending' ? 'Payment Pending' : 'Payment Failed'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Bookings</Text>
        </View>
      </View>

      {/* Search and Filter */}
      <View className="px-4 pt-4">
        <View className="flex-row items-center bg-white rounded-lg px-3 mb-3 shadow-sm">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 py-2 px-2 text-gray-800"
            placeholder="Search by ID, customer, pro, service..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row">
            <ScrollableFilter
              options={[
                { label: 'All', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Ongoing', value: 'ongoing' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              selectedValue={statusFilter}
              onSelect={(value) => setStatusFilter(value as BookingStatus)}
            />
          </View>

          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => setShowFilters(!showFilters)}
          >
            <MaterialCommunityIcons name="filter-variant" size={20} color="#4B5563" />
            <Text className="text-gray-600 ml-1">Filter</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View className="bg-white rounded-lg p-4 mb-3 shadow-sm">
            <Text className="text-gray-800 font-medium mb-2">Sort By</Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`flex-row items-center mr-4 ${sortBy === 'newest' ? 'opacity-100' : 'opacity-50'}`}
                onPress={() => setSortBy('newest')}
              >
                <View className={`w-4 h-4 rounded-full border border-gray-400 mr-2 ${sortBy === 'newest' ? 'bg-primary border-primary' : 'bg-white'}`} />
                <Text className="text-gray-800">Newest First</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-row items-center ${sortBy === 'oldest' ? 'opacity-100' : 'opacity-50'}`}
                onPress={() => setSortBy('oldest')}
              >
                <View className={`w-4 h-4 rounded-full border border-gray-400 mr-2 ${sortBy === 'oldest' ? 'bg-primary border-primary' : 'bg-white'}`} />
                <Text className="text-gray-800">Oldest First</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Booking List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-8">
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#9CA3AF" />
            <Text className="text-gray-500 mt-4 text-center">No bookings found</Text>
            <Text className="text-gray-400 text-center">Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Add Booking Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('CreateBooking')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

interface ScrollableFilterProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

const ScrollableFilter = ({ options, selectedValue, onSelect }: ScrollableFilterProps) => {
  return (
    <FlatList
      data={options}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity
          className={`px-4 py-1.5 rounded-full mr-2 ${selectedValue === item.value ? 'bg-primary' : 'bg-white'}`}
          onPress={() => onSelect(item.value)}
        >
          <Text 
            className={`text-sm font-medium ${selectedValue === item.value ? 'text-white' : 'text-gray-600'}`}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default AdminBookingsScreen;
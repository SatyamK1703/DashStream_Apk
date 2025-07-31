import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProJobsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Job {
  id: string;
  customerName: string;
  customerImage: string;
  date: string;
  time: string;
  address: string;
  services: {
    name: string;
    price: number;
  }[];
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  distance?: string;
  estimatedArrival?: string;
  completedAt?: string;
  rating?: number;
  feedback?: string;
  paymentStatus: 'paid' | 'pending';
}

type FilterStatus = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const ProJobsScreen = () => {
  const navigation = useNavigation<ProJobsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const mockJobs: Job[] = [
    {
      id: 'JOB123456',
      customerName: 'Priya Sharma',
      customerImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Today',
      time: '11:30 AM',
      address: '123 Main St, Koramangala, Bangalore',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Interior Cleaning', price: 399 }
      ],
      totalAmount: 998,
      status: 'upcoming',
      distance: '3.2 km',
      estimatedArrival: '25 mins',
      paymentStatus: 'paid'
    },
    {
      id: 'JOB123457',
      customerName: 'Arjun Mehta',
      customerImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'Today',
      time: '02:00 PM',
      address: '456 Park Ave, Indiranagar, Bangalore',
      services: [
        { name: 'Basic Wash', price: 399 }
      ],
      totalAmount: 399,
      status: 'upcoming',
      distance: '5.7 km',
      estimatedArrival: '35 mins',
      paymentStatus: 'paid'
    },
    {
      id: 'JOB123458',
      customerName: 'Neha Patel',
      customerImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      date: 'Tomorrow',
      time: '10:15 AM',
      address: '789 Lake View, HSR Layout, Bangalore',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Wax Polish', price: 799 }
      ],
      totalAmount: 1398,
      status: 'upcoming',
      paymentStatus: 'paid'
    },
    {
      id: 'JOB123459',
      customerName: 'Rahul Singh',
      customerImage: 'https://randomuser.me/api/portraits/men/75.jpg',
      date: 'Yesterday',
      time: '03:30 PM',
      address: '101 Green Park, Whitefield, Bangalore',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Interior Cleaning', price: 399 }
      ],
      totalAmount: 998,
      status: 'completed',
      completedAt: 'Yesterday at 04:45 PM',
      rating: 5,
      feedback: 'Excellent service! Very thorough and professional.',
      paymentStatus: 'paid'
    },
    {
      id: 'JOB123460',
      customerName: 'Ananya Desai',
      customerImage: 'https://randomuser.me/api/portraits/women/90.jpg',
      date: '12 May 2023',
      time: '11:00 AM',
      address: '202 Silver Apartments, JP Nagar, Bangalore',
      services: [
        { name: 'Basic Wash', price: 399 },
        { name: 'Tyre Cleaning', price: 199 }
      ],
      totalAmount: 598,
      status: 'completed',
      completedAt: '12 May 2023 at 12:15 PM',
      rating: 4,
      feedback: 'Good service, but arrived a bit late.',
      paymentStatus: 'paid'
    },
    {
      id: 'JOB123461',
      customerName: 'Vikram Malhotra',
      customerImage: 'https://randomuser.me/api/portraits/men/45.jpg',
      date: '10 May 2023',
      time: '09:30 AM',
      address: '303 Royal Enclave, MG Road, Bangalore',
      services: [
        { name: 'Premium Wash', price: 599 }
      ],
      totalAmount: 599,
      status: 'cancelled',
      paymentStatus: 'pending'
    },
    {
      id: 'JOB123462',
      customerName: 'Meera Kapoor',
      customerImage: 'https://randomuser.me/api/portraits/women/33.jpg',
      date: 'Today',
      time: '09:00 AM',
      address: '404 Sunshine Apartments, Jayanagar, Bangalore',
      services: [
        { name: 'Premium Wash', price: 599 },
        { name: 'Interior Cleaning', price: 399 },
        { name: 'Wax Polish', price: 799 }
      ],
      totalAmount: 1797,
      status: 'ongoing',
      paymentStatus: 'paid'
    },
  ];

  useEffect(() => {
    // Simulate API call
    const fetchJobs = () => {
      setLoading(true);
      setTimeout(() => {
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
        setLoading(false);
      }, 1500);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let result = [...jobs];
    
    // Apply status filter
    if (activeFilter !== 'all') {
      result = result.filter(job => job.status === activeFilter);
    }
    
    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        job => job.customerName.toLowerCase().includes(query) || 
               job.id.toLowerCase().includes(query) ||
               job.address.toLowerCase().includes(query)
      );
    }
    
    setFilteredJobs(result);
  }, [activeFilter, searchQuery, jobs]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setJobs(mockJobs);
      setFilteredJobs(mockJobs);
      setRefreshing(false);
    }, 1500);
  };

  const renderFilterButton = (label: string, value: FilterStatus) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full mr-2 ${activeFilter === value ? 'bg-primary' : 'bg-gray-100'}`}
      onPress={() => setActiveFilter(value)}
    >
      <Text 
        className={`font-medium ${activeFilter === value ? 'text-white' : 'text-gray-700'}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderJobItem = ({ item }: { item: Job }) => {
    const getStatusColor = () => {
      switch (item.status) {
        case 'upcoming': return 'bg-blue-100 text-blue-800';
        case 'ongoing': return 'bg-amber-100 text-amber-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusLabel = () => {
      switch (item.status) {
        case 'upcoming': return 'Upcoming';
        case 'ongoing': return 'Ongoing';
        case 'completed': return 'Completed';
        case 'cancelled': return 'Cancelled';
        default: return item.status;
      }
    };

    return (
      <TouchableOpacity 
        className="bg-white rounded-xl p-4 mb-4 shadow-sm"
        onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-row items-center">
            <Image 
              source={{ uri: item.customerImage }}
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="text-gray-800 font-bold text-base">{item.customerName}</Text>
              <Text className="text-gray-500 text-sm">{item.date} • {item.time}</Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor().split(' ')[0]}`}>
            <Text className={`text-xs font-medium ${getStatusColor().split(' ')[1]}`}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center mb-3">
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text className="text-gray-700 text-sm ml-2" numberOfLines={1}>{item.address}</Text>
        </View>
        
        {item.status === 'upcoming' && item.distance && item.estimatedArrival && (
          <View className="flex-row mb-3">
            <View className="flex-row items-center mr-4">
              <Ionicons name="navigate-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 text-sm ml-1">{item.distance}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 text-sm ml-1">ETA: {item.estimatedArrival}</Text>
            </View>
          </View>
        )}
        
        {item.status === 'completed' && item.completedAt && (
          <View className="flex-row mb-3">
            <View className="flex-row items-center mr-4">
              <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
              <Text className="text-gray-700 text-sm ml-1">Completed at {item.completedAt}</Text>
            </View>
          </View>
        )}
        
        {item.status === 'completed' && item.rating && (
          <View className="flex-row items-center mb-3">
            <Text className="text-gray-700 text-sm mr-2">Rating:</Text>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map(star => (
                <Ionicons 
                  key={star}
                  name={star <= item.rating! ? "star" : "star-outline"}
                  size={14}
                  color="#F59E0B"
                />
              ))}
            </View>
            {item.feedback && (
              <Text className="text-gray-500 text-xs ml-2" numberOfLines={1}>"{item.feedback}"</Text>
            )}
          </View>
        )}
        
        <View className="h-[1px] bg-gray-100 my-2" />
        
        <View className="mb-2">
          {item.services.map((service, index) => (
            <View key={index} className="flex-row justify-between mb-1">
              <Text className="text-gray-700">{service.name}</Text>
              <Text className="text-gray-700">₹{service.price}</Text>
            </View>
          ))}
        </View>
        
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Text className="text-gray-800 font-bold mr-2">Total: ₹{item.totalAmount}</Text>
            <View className={`px-2 py-0.5 rounded ${item.paymentStatus === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
              <Text className={`text-xs ${item.paymentStatus === 'paid' ? 'text-green-800' : 'text-amber-800'}`}>
                {item.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="mr-2"
              onPress={() => {
                // Handle call action
              }}
            >
              <Ionicons name="call" size={20} color="#2563eb" />
            </TouchableOpacity>
            <Ionicons name="chevron-forward" size={16} color="#6B7280" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View className="items-center justify-center py-10">
      <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-400 text-lg font-medium mt-4">No jobs found</Text>
      <Text className="text-gray-400 text-sm text-center mt-2 px-10">
        {searchQuery.trim() ? 
          `No jobs matching "${searchQuery}" found.` : 
          `You don't have any ${activeFilter !== 'all' ? activeFilter : ''} jobs at the moment.`
        }
      </Text>
      {(searchQuery.trim() || activeFilter !== 'all') && (
        <TouchableOpacity 
          className="mt-4 px-4 py-2 bg-primary rounded-lg"
          onPress={() => {
            setSearchQuery('');
            setActiveFilter('all');
          }}
        >
          <Text className="text-white font-medium">Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 font-bold text-xl">My Jobs</Text>
          <TouchableOpacity 
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => navigation.navigate('ProNotifications')}
          >
            <Ionicons name="notifications" size={20} color="#4B5563" />
            <View className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Search by customer, job ID, or location"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Filter Tabs */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="-mx-4 px-4"
        >
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Upcoming', 'upcoming')}
          {renderFilterButton('Ongoing', 'ongoing')}
          {renderFilterButton('Completed', 'completed')}
          {renderFilterButton('Cancelled', 'cancelled')}
        </ScrollView>
      </View>

      {/* Job List */}
      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      />
    </View>
  );
};

export default ProJobsScreen;
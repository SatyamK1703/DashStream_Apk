import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProDashboardScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

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
  status: 'upcoming' | 'ongoing' | 'completed';
  distance?: string;
  estimatedArrival?: string;
}

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayout: number;
  lastPayout: {
    amount: number;
    date: string;
  };
}

interface PerformanceMetrics {
  rating: number;
  totalJobs: number;
  completionRate: number;
  onTimeRate: number;
  customerSatisfaction: number;
}

const ProDashboardScreen = () => {
  const navigation = useNavigation<ProDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);

  // Mock data
  const mockUpcomingJobs: Job[] = [
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
      estimatedArrival: '25 mins'
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
      estimatedArrival: '35 mins'
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
      status: 'upcoming'
    },
  ];

  const mockEarningsSummary: EarningsSummary = {
    today: 1397,
    thisWeek: 6785,
    thisMonth: 24650,
    pendingPayout: 12325,
    lastPayout: {
      amount: 12325,
      date: '15 May 2023'
    }
  };

  const mockPerformanceMetrics: PerformanceMetrics = {
    rating: 4.8,
    totalJobs: 127,
    completionRate: 98,
    onTimeRate: 95,
    customerSatisfaction: 92
  };

  useEffect(() => {
    // Simulate API call
    const fetchDashboardData = () => {
      setLoading(true);
      setTimeout(() => {
        setUpcomingJobs(mockUpcomingJobs);
        setEarningsSummary(mockEarningsSummary);
        setPerformanceMetrics(mockPerformanceMetrics);
        setLoading(false);
      }, 1500);
    };

    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setUpcomingJobs(mockUpcomingJobs);
      setEarningsSummary(mockEarningsSummary);
      setPerformanceMetrics(mockPerformanceMetrics);
      setRefreshing(false);
    }, 1500);
  };

  const renderJobItem = (job: Job) => (
    <TouchableOpacity 
      key={job.id}
      className="bg-white rounded-xl p-4 mb-4 shadow-sm"
      onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: job.customerImage }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-gray-800 font-bold text-base">{job.customerName}</Text>
            <Text className="text-gray-500 text-sm">{job.date} • {job.time}</Text>
          </View>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-800 text-xs font-medium">
            {job.status === 'upcoming' ? 'Upcoming' : job.status === 'ongoing' ? 'Ongoing' : 'Completed'}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-3">
        <Ionicons name="location-outline" size={16} color="#6B7280" />
        <Text className="text-gray-700 text-sm ml-2" numberOfLines={1}>{job.address}</Text>
      </View>
      
      {job.distance && job.estimatedArrival && (
        <View className="flex-row mb-3">
          <View className="flex-row items-center mr-4">
            <Ionicons name="navigate-outline" size={16} color="#6B7280" />
            <Text className="text-gray-700 text-sm ml-1">{job.distance}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text className="text-gray-700 text-sm ml-1">ETA: {job.estimatedArrival}</Text>
          </View>
        </View>
      )}
      
      <View className="h-[1px] bg-gray-100 my-2" />
      
      <View className="mb-2">
        {job.services.map((service, index) => (
          <View key={index} className="flex-row justify-between mb-1">
            <Text className="text-gray-700">{service.name}</Text>
            <Text className="text-gray-700">₹{service.price}</Text>
          </View>
        ))}
      </View>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-gray-800 font-bold">Total</Text>
        <Text className="text-primary font-bold">₹{job.totalAmount}</Text>
      </View>
      
      <View className="absolute bottom-4 right-4">
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderEarningsSummary = () => {
    if (!earningsSummary) return null;
    
    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 font-bold text-lg">Earnings Summary</Text>
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text className="text-primary text-sm mr-1">View All</Text>
            <Ionicons name="chevron-forward" size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm mb-1">Today</Text>
            <Text className="text-gray-800 font-bold text-lg">₹{earningsSummary.today}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm mb-1">This Week</Text>
            <Text className="text-gray-800 font-bold text-lg">₹{earningsSummary.thisWeek}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm mb-1">This Month</Text>
            <Text className="text-gray-800 font-bold text-lg">₹{earningsSummary.thisMonth}</Text>
          </View>
        </View>
        
        <View className="h-[1px] bg-gray-100 my-2" />
        
        <View className="flex-row justify-between items-center mt-3">
          <View>
            <Text className="text-gray-500 text-sm">Pending Payout</Text>
            <Text className="text-gray-800 font-bold text-lg">₹{earningsSummary.pendingPayout}</Text>
          </View>
          <TouchableOpacity className="bg-primary px-4 py-2 rounded-lg">
            <Text className="text-white font-medium">View Details</Text>
          </TouchableOpacity>
        </View>
        
        <View className="mt-3 p-3 bg-gray-50 rounded-lg">
          <Text className="text-gray-500 text-sm">Last Payout</Text>
          <View className="flex-row justify-between items-center mt-1">
            <Text className="text-gray-800 font-bold">₹{earningsSummary.lastPayout.amount}</Text>
            <Text className="text-gray-500 text-sm">{earningsSummary.lastPayout.date}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!performanceMetrics) return null;
    
    return (
      <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-800 font-bold text-lg">Performance Metrics</Text>
          <TouchableOpacity className="flex-row items-center">
            <Text className="text-primary text-sm mr-1">Details</Text>
            <Ionicons name="chevron-forward" size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center justify-center mb-4">
          <View className="items-center justify-center bg-primary/10 w-24 h-24 rounded-full">
            <Text className="text-primary font-bold text-3xl">{performanceMetrics.rating}</Text>
            <View className="flex-row items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons 
                  key={star}
                  name={star <= Math.floor(performanceMetrics.rating) ? "star" : star <= performanceMetrics.rating + 0.5 ? "star-half" : "star-outline"}
                  size={12}
                  color="#F59E0B"
                />
              ))}
            </View>
            <Text className="text-gray-500 text-xs mt-1">Overall Rating</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mb-2">
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-1">
              <MaterialCommunityIcons name="car-wash" size={24} color="#2563eb" />
            </View>
            <Text className="text-gray-800 font-bold">{performanceMetrics.totalJobs}</Text>
            <Text className="text-gray-500 text-xs">Total Jobs</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-1">
              <Ionicons name="checkmark-circle" size={24} color="#16A34A" />
            </View>
            <Text className="text-gray-800 font-bold">{performanceMetrics.completionRate}%</Text>
            <Text className="text-gray-500 text-xs">Completion</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-purple-100 items-center justify-center mb-1">
              <Ionicons name="time" size={24} color="#7E22CE" />
            </View>
            <Text className="text-gray-800 font-bold">{performanceMetrics.onTimeRate}%</Text>
            <Text className="text-gray-500 text-xs">On-time</Text>
          </View>
          
          <View className="items-center flex-1">
            <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-1">
              <FontAwesome5 name="smile" size={24} color="#F59E0B" />
            </View>
            <Text className="text-gray-800 font-bold">{performanceMetrics.customerSatisfaction}%</Text>
            <Text className="text-gray-500 text-xs">Satisfaction</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQuickActions = () => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
      <Text className="text-gray-800 font-bold text-lg mb-4">Quick Actions</Text>
      
      <View className="flex-row justify-between">
        <TouchableOpacity className="items-center flex-1" onPress={() => navigation.navigate('Jobs')}>
          <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mb-2">
            <Ionicons name="calendar" size={24} color="#2563eb" />
          </View>
          <Text className="text-gray-700 text-sm text-center">View Jobs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center flex-1" onPress={() => navigation.navigate('Earnings')}>
          <View className="w-14 h-14 rounded-full bg-green-100 items-center justify-center mb-2">
            <Ionicons name="cash" size={24} color="#16A34A" />
          </View>
          <Text className="text-gray-700 text-sm text-center">Earnings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center flex-1">
          <View className="w-14 h-14 rounded-full bg-amber-100 items-center justify-center mb-2">
            <Ionicons name="help-buoy" size={24} color="#F59E0B" />
          </View>
          <Text className="text-gray-700 text-sm text-center">Support</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="items-center flex-1" onPress={() => navigation.navigate('ProProfile')}>
          <View className="w-14 h-14 rounded-full bg-purple-100 items-center justify-center mb-2">
            <Ionicons name="person" size={24} color="#7E22CE" />
          </View>
          <Text className="text-gray-700 text-sm text-center">Profile</Text>
        </TouchableOpacity>
      </View>
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
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              className="w-10 h-10 rounded-full mr-3"
            />
            <View>
              <Text className="text-white text-lg font-bold">Hello, {user?.name || 'Professional'}</Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                <Text className="text-white/80 ml-1">Bangalore</Text>
              </View>
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
              onPress={() => navigation.navigate('ProNotifications')}
            >
              <Ionicons name="notifications" size={20} color="white" />
              <View className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              onPress={() => navigation.navigate('ProSettings')}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-white/10 rounded-lg p-3 mt-4">
          <View>
            <Text className="text-white/80 text-sm">Today's Earnings</Text>
            <Text className="text-white font-bold text-xl">₹{earningsSummary?.today || 0}</Text>
          </View>
          
          <View className="h-10 w-[1px] bg-white/20" />
          
          <View>
            <Text className="text-white/80 text-sm">Jobs Today</Text>
            <Text className="text-white font-bold text-xl">{upcomingJobs.filter(job => job.date === 'Today').length}</Text>
          </View>
          
          <TouchableOpacity className="bg-white px-3 py-2 rounded-lg">
            <Text className="text-primary font-medium">Go Online</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* Upcoming Jobs */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Upcoming Jobs</Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => navigation.navigate('Jobs')}
            >
              <Text className="text-primary text-sm mr-1">View All</Text>
              <Ionicons name="chevron-forward" size={14} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          {upcomingJobs.length > 0 ? (
            upcomingJobs.map(job => renderJobItem(job))
          ) : (
            <View className="bg-white rounded-xl p-6 items-center justify-center">
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 text-lg font-medium mt-4">No upcoming jobs</Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                You don't have any upcoming jobs scheduled at the moment.
              </Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        {renderQuickActions()}
        
        {/* Earnings Summary */}
        {renderEarningsSummary()}
        
        {/* Performance Metrics */}
        {renderPerformanceMetrics()}
      </ScrollView>
    </View>
  );
};

export default ProDashboardScreen;
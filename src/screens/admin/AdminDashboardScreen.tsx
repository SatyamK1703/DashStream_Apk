import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: string;
  isPositive?: boolean;
}

interface BookingCardProps {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  amount: string;
  onPress: () => void;
}

interface ProfessionalCardProps {
  id: string;
  name: string;
  image?: string;
  rating: number;
  jobsCompleted: number;
  isOnline: boolean;
  onPress: () => void;
}

const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');
  
  // Mock data
  const dashboardStats = {
    totalRevenue: '₹1,24,500',
    totalBookings: '156',
    activeCustomers: '89',
    activeProfessionals: '12',
    revenueChange: '+12.5%',
    bookingsChange: '+8.3%',
    customersChange: '+5.7%',
    professionalsChange: '-2.1%'
  };
  
  const recentBookings = [
    {
      id: 'BK-7845',
      customerName: 'Rahul Sharma',
      service: 'Premium Wash & Polish',
      date: '15 Aug 2023',
      time: '10:30 AM',
      status: 'ongoing' as const,
      amount: '₹1,200'
    },
    {
      id: 'BK-7844',
      customerName: 'Priya Patel',
      service: 'Interior Detailing',
      date: '15 Aug 2023',
      time: '09:15 AM',
      status: 'pending' as const,
      amount: '₹1,800'
    },
    {
      id: 'BK-7843',
      customerName: 'Amit Kumar',
      service: 'Basic Wash',
      date: '15 Aug 2023',
      time: '08:00 AM',
      status: 'completed' as const,
      amount: '₹600'
    },
    {
      id: 'BK-7842',
      customerName: 'Sneha Gupta',
      service: 'Full Detailing Package',
      date: '14 Aug 2023',
      time: '04:30 PM',
      status: 'cancelled' as const,
      amount: '₹2,500'
    },
  ];
  
  const topProfessionals = [
    {
      id: 'PRO-001',
      name: 'Rajesh Kumar',
      rating: 4.9,
      jobsCompleted: 156,
      isOnline: true
    },
    {
      id: 'PRO-008',
      name: 'Sunil Verma',
      rating: 4.8,
      jobsCompleted: 142,
      isOnline: true
    },
    {
      id: 'PRO-015',
      name: 'Vikram Singh',
      rating: 4.7,
      jobsCompleted: 128,
      isOnline: false
    },
  ];
  
  // Chart data
  const revenueData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [8500, 7200, 9800, 8100, 10500, 15200, 12800],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    },
    weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      datasets: [{
        data: [42000, 38500, 45200, 52800],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [125000, 118000, 132000, 145000, 158000, 172000],
        color: () => '#2563EB',
        strokeWidth: 2
      }]
    }
  };
  
  const bookingsData = {
    daily: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: [12, 8, 15, 10, 14, 22, 18],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    },
    weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      datasets: [{
        data: [45, 38, 52, 64],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    },
    monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [180, 165, 195, 210, 225, 240],
        color: () => '#8B5CF6',
        strokeWidth: 2
      }]
    }
  };
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };
  
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => statsFilter === 'revenue' ? `rgba(37, 99, 235, ${opacity})` : `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: statsFilter === 'revenue' ? '#2563EB' : '#8B5CF6',
    },
  };
  
  const chartData = statsFilter === 'revenue' ? revenueData[timeFilter] : bookingsData[timeFilter];
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-xl font-bold">Dashboard</Text>
            <Text className="text-white/80 text-sm mt-1">Welcome back, {user?.name || 'Admin'}</Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.navigate('AdminNotifications')}
          >
            <Ionicons name="notifications" size={20} color="white" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Stats Cards */}
        <View className="px-4 py-4">
          <View className="flex-row flex-wrap justify-between">
            <StatCard
              title="Total Revenue"
              value={dashboardStats.totalRevenue}
              icon={<MaterialCommunityIcons name="currency-inr" size={20} color="white" />}
              color="#2563EB"
              change={dashboardStats.revenueChange}
              isPositive={true}
            />
            <StatCard
              title="Total Bookings"
              value={dashboardStats.totalBookings}
              icon={<MaterialCommunityIcons name="calendar-check" size={20} color="white" />}
              color="#8B5CF6"
              change={dashboardStats.bookingsChange}
              isPositive={true}
            />
            <StatCard
              title="Active Customers"
              value={dashboardStats.activeCustomers}
              icon={<Ionicons name="people" size={20} color="white" />}
              color="#10B981"
              change={dashboardStats.customersChange}
              isPositive={true}
            />
            <StatCard
              title="Active Pros"
              value={dashboardStats.activeProfessionals}
              icon={<FontAwesome5 name="user-tie" size={18} color="white" />}
              color="#F59E0B"
              change={dashboardStats.professionalsChange}
              isPositive={false}
            />
          </View>
        </View>
        
        {/* Chart Section */}
        <View className="bg-white mx-4 rounded-lg p-4 mb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-gray-800 font-bold text-lg">
              {statsFilter === 'revenue' ? 'Revenue Analytics' : 'Booking Analytics'}
            </Text>
            <View className="flex-row">
              <TouchableOpacity
                className={`px-3 py-1 rounded-l-full ${statsFilter === 'revenue' ? 'bg-primary' : 'bg-gray-200'}`}
                onPress={() => setStatsFilter('revenue')}
              >
                <Text className={statsFilter === 'revenue' ? 'text-white' : 'text-gray-600'}>Revenue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`px-3 py-1 rounded-r-full ${statsFilter === 'bookings' ? 'bg-primary' : 'bg-gray-200'}`}
                onPress={() => setStatsFilter('bookings')}
              >
                <Text className={statsFilter === 'bookings' ? 'text-white' : 'text-gray-600'}>Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 8
            }}
          />
          
          <View className="flex-row justify-center mt-2">
            <TouchableOpacity
              className={`px-3 py-1 mx-1 rounded-full ${timeFilter === 'daily' ? 'bg-gray-200' : 'bg-white'}`}
              onPress={() => setTimeFilter('daily')}
            >
              <Text className="text-gray-600">Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-1 mx-1 rounded-full ${timeFilter === 'weekly' ? 'bg-gray-200' : 'bg-white'}`}
              onPress={() => setTimeFilter('weekly')}
            >
              <Text className="text-gray-600">Weekly</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-3 py-1 mx-1 rounded-full ${timeFilter === 'monthly' ? 'bg-gray-200' : 'bg-white'}`}
              onPress={() => setTimeFilter('monthly')}
            >
              <Text className="text-gray-600">Monthly</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Bookings */}
        <View className="mx-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
              <Text className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            />
          ))}
        </View>
        
        {/* Top Professionals */}
        <View className="mx-4 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Top Professionals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminProfessionals')}>
              <Text className="text-primary">View All</Text>
            </TouchableOpacity>
          </View>
          
          {topProfessionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              {...professional}
              onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: professional.id })}
            />
          ))}
        </View>
        
        {/* Quick Actions */}
        <View className="mx-4 mb-8">
          <Text className="text-gray-800 font-bold text-lg mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity 
              className="bg-white rounded-lg p-4 w-[48%] mb-4 items-center justify-center shadow-sm"
              onPress={() => navigation.navigate('AdminBookings')}
            >
              <MaterialCommunityIcons name="calendar-plus" size={28} color="#2563EB" />
              <Text className="text-gray-800 font-medium mt-2">Manage Bookings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white rounded-lg p-4 w-[48%] mb-4 items-center justify-center shadow-sm"
              onPress={() => navigation.navigate('AdminProfessionals')}
            >
              <FontAwesome5 name="user-tie" size={24} color="#8B5CF6" />
              <Text className="text-gray-800 font-medium mt-2">Manage Pros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white rounded-lg p-4 w-[48%] mb-4 items-center justify-center shadow-sm"
              onPress={() => navigation.navigate('AdminCustomers')}
            >
              <Ionicons name="people" size={28} color="#10B981" />
              <Text className="text-gray-800 font-medium mt-2">Manage Customers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-white rounded-lg p-4 w-[48%] mb-4 items-center justify-center shadow-sm"
              onPress={() => navigation.navigate('AdminSettings')}
            >
              <Ionicons name="settings" size={28} color="#F59E0B" />
              <Text className="text-gray-800 font-medium mt-2">Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard = ({ title, value, icon, color, change, isPositive }: StatCardProps) => (
  <View className="bg-white rounded-lg p-4 mb-4 w-[48%] shadow-sm">
    <View className="flex-row justify-between items-start">
      <View>
        <Text className="text-gray-500 text-xs">{title}</Text>
        <Text className="text-gray-900 text-xl font-bold mt-1">{value}</Text>
      </View>
      <View style={{ backgroundColor: color }} className="w-8 h-8 rounded-full items-center justify-center">
        {icon}
      </View>
    </View>
    {change && (
      <View className="flex-row items-center mt-2">
        <Ionicons 
          name={isPositive ? 'arrow-up' : 'arrow-down'} 
          size={14} 
          color={isPositive ? '#10B981' : '#EF4444'} 
        />
        <Text className={`text-xs ml-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last month
        </Text>
      </View>
    )}
  </View>
);

const BookingCard = ({ id, customerName, service, date, time, status, amount, onPress }: BookingCardProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <TouchableOpacity 
      className="bg-white rounded-lg p-4 mb-3 shadow-sm"
      onPress={onPress}
    >
      <View className="flex-row justify-between items-start">
        <View>
          <Text className="text-gray-900 font-medium">{customerName}</Text>
          <Text className="text-gray-500 text-sm">{service}</Text>
        </View>
        <Text className="text-primary font-bold">{amount}</Text>
      </View>
      
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text className="text-gray-500 text-xs ml-1">{date}, {time}</Text>
        </View>
        <View className={`px-2 py-1 rounded-full ${getStatusColor()}`}>
          <Text className="text-xs font-medium capitalize">{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ProfessionalCard = ({ id, name, rating, jobsCompleted, isOnline, onPress }: ProfessionalCardProps) => (
  <TouchableOpacity 
    className="bg-white rounded-lg p-4 mb-3 shadow-sm"
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
        <Text className="text-gray-600 font-bold">{name.charAt(0)}</Text>
      </View>
      
      <View className="ml-3 flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-medium">{name}</Text>
          <View className={`px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Text className={`text-xs ${isOnline ? 'text-green-800' : 'text-gray-800'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center mt-1">
          <View className="flex-row items-center">
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text className="text-gray-600 text-xs ml-1">{rating} Rating</Text>
          </View>
          <Text className="text-gray-600 text-xs">{jobsCompleted} Jobs Completed</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

export default AdminDashboardScreen;
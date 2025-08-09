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
import {bookingsData,revenueData,topProfessionals,recentBookings,dashboardStats} from '../../constants/data/AdminScreenData';
import StatCard from '~/components/admin/StatCard';
import BookingCard from '~/components/admin/BookingCard';
import ProfessionalCard from '~/components/admin/ProfessionalCard';
import styles from '~/components/admin/styles';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');
  
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, {user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications" size={20} color="white" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsContainer}>
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
            {/* Other StatCards... */}
          </View>
        </View>
        
        {/* Chart Section */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>
              {statsFilter === 'revenue' ? 'Revenue Analytics' : 'Booking Analytics'}
            </Text>
            <View style={styles.filterToggle}>
              <TouchableOpacity
                style={[styles.filterButton, statsFilter === 'revenue' && styles.activeFilter]}
                onPress={() => setStatsFilter('revenue')}
              >
                <Text style={[styles.filterText, statsFilter === 'revenue' && styles.activeFilterText]}>Revenue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterButton, statsFilter === 'bookings' && styles.activeFilter]}
                onPress={() => setStatsFilter('bookings')}
              >
                <Text style={[styles.filterText, statsFilter === 'bookings' && styles.activeFilterText]}>Bookings</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <LineChart
            data={chartData}
            width={Dimensions.get('window').width - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          
          <View style={styles.timeFilterContainer}>
            {['daily', 'weekly', 'monthly'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.timeFilterButton, timeFilter === filter && styles.activeTimeFilter]}
                onPress={() => setTimeFilter(filter as any)}
              >
                <Text style={styles.timeFilterText}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Recent Bookings */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bookings</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminBookings')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              {...booking}
              onPress={() => navigation.navigate('AdminBookingDetails', { bookingId: booking.id })}
            />
          ))}
        </View>
        
        {/* Top Professionals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Professionals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminProfessionals')}>
              <Text style={styles.viewAllText}>View All</Text>
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
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            {[
              { icon: 'calendar-plus', color: '#2563EB', text: 'Manage Bookings', nav: 'AdminBookings' },
              { icon: 'user-tie', color: '#8B5CF6', text: 'Manage Pros', nav: 'AdminProfessionals' },
              {icon: 'people',color:'#10B981',text:'Manage Customers',nav:'AdminCustomers' },
              {icon:'settings',color:"#F59E0B",text:'Settings',nav:'AdminSettings'}
            ].map((action) => (
              <TouchableOpacity 
                key={action.text}
                style={styles.quickActionButton}
                onPress={() => navigation.navigate(action.nav as any)}
              >
                <FontAwesome5 name={action.icon} size={24} color={action.color} />
                <Text style={styles.quickActionText}>{action.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};



export default AdminDashboardScreen;
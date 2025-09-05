import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../contexts/AuthContext';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import apiService from '../../services/apiService';
import StatCard from '~/components/admin/StatCard';
import BookingCard from '~/components/admin/BookingCard';
import ProfessionalCard from '~/components/admin/ProfessionalCard';

// --- Type Definition ---
type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// --- Main Component ---
const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');
  
  // State for dashboard data
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: '₹0',
    totalBookings: '0',
    activeCustomers: '0',
    activeProfessionals: '0',
    revenueChange: '0%',
    bookingsChange: '0%',
    customersChange: '0%',
    professionalsChange: '0%'
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [topProfessionals, setTopProfessionals] = useState([]);
  const [chartData, setChartData] = useState({
    daily: { labels: [], datasets: [{ data: [], color: () => '#2563EB', strokeWidth: 2 }] },
    weekly: { labels: [], datasets: [{ data: [], color: () => '#2563EB', strokeWidth: 2 }] },
    monthly: { labels: [], datasets: [{ data: [], color: () => '#2563EB', strokeWidth: 2 }] }
  });
  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/admin/dashboard');
      if (response.data) {
        setDashboardStats(response.data.stats);
        setRecentBookings(response.data.recentBookings);
        setTopProfessionals(response.data.topProfessionals);
        setChartData({
          daily: response.data.revenueData.daily,
          weekly: response.data.revenueData.weekly,
          monthly: response.data.revenueData.monthly
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData()
      .finally(() => {
        setRefreshing(false);
      });
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
  
  const currentChartData = statsFilter === 'revenue' ? chartData[timeFilter] : chartData[timeFilter];
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    // 2. Use SafeAreaView as the root component
    <SafeAreaView style={styles.container}>
      {/* 3. Updated Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#1F2937" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
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
          </View>
        </View>
        
        {/* Chart Section */}
        <View style={styles.chartSectionContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>
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
            data={currentChartData}
            width={Dimensions.get('window').width - 32} // Adjusted for padding
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
              { icon: 'users', color: '#10B981', text: 'Manage Customers', nav: 'AdminCustomers' },
              { icon: 'cogs', color: "#F59E0B", text: 'Settings', nav: 'AdminSettings' }
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
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    backgroundColor: '#F9FAFB', // Light grey background for the scrollable content
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Align items to the end (right)
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
     // Ensure title is behind the button
  },
  notificationButton: {
    padding: 5,
  },
  notificationBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  chartSectionContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  viewAllText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterToggle: {
    flexDirection: 'row',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    padding: 2,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeFilter: {
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#2563EB',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  timeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTimeFilter: {
    backgroundColor: '#E5E7EB',
  },
  timeFilterText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  quickActionText: {
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 12,
    fontSize: 14,
  },
});

export default AdminDashboardScreen;


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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../../store';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import StatCard from '~/components/admin/StatCard';
import BookingCard from '~/components/admin/BookingCard';
import ProfessionalCard from '~/components/admin/ProfessionalCard';
import { useAdminDashboard, useAdminBookings, useAdminProfessionals } from '../../hooks/useAdmin';

// --- Type Definition ---
type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

// --- Main Component ---
const AdminDashboardScreen = () => {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [statsFilter, setStatsFilter] = useState<'revenue' | 'bookings'>('revenue');

  // Fetch dashboard data
  const {
    data: dashboardStats,
    loading: isDashboardLoading,
    error: dashboardError,
    execute: fetchDashboard
  } = useAdminDashboard();

  // Fetch recent bookings (limited)
  const {
    data: recentBookings = [],
    loading: isBookingsLoading,
    error: bookingsError,
    loadMore: fetchBookings
  } = useAdminBookings({ limit: 5 });

  // Fetch top professionals (limited)
  const {
    data: topProfessionals = [],
    loading: isProfessionalsLoading,
    error: professionalsError,
    loadMore: fetchProfessionals
  } = useAdminProfessionals({ limit: 5 });

  const isLoading = Boolean(isDashboardLoading || isBookingsLoading || isProfessionalsLoading);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        fetchDashboard(),
        fetchBookings(),
        fetchProfessionals()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    }
  };

  const onRefresh = async () => {
    await loadDashboardData();
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

  // Generate chart data from dashboard stats
  const getChartData = () => {
    if (!dashboardStats?.chartData) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }

    const data = statsFilter === 'revenue' 
      ? dashboardStats.chartData.revenue?.[timeFilter]
      : dashboardStats.chartData.bookings?.[timeFilter];

    return data || {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (dashboardError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.sectionContainer}>
          <View style={styles.statsContainer}>
            <StatCard
              title="Total Revenue"
              value={dashboardStats?.totalRevenue || 0}
              icon={<MaterialCommunityIcons name="currency-inr" size={20} color="white" />}
              color="#2563EB"
              change={dashboardStats?.revenueChange || 0}
              isPositive={true}
            />
            <StatCard
              title="Total Bookings"
              value={dashboardStats?.totalBookings || 0}
              icon={<MaterialCommunityIcons name="calendar-check" size={20} color="white" />}
              color="#8B5CF6"
              change={dashboardStats?.bookingsChange || 0}
              isPositive={true}
            />
            <StatCard
              title="Active Customers"
              value={dashboardStats?.activeCustomers || 0}
              icon={<Ionicons name="people" size={20} color="white" />}
              color="#10B981"
              change={dashboardStats?.customersChange || 0}
              isPositive={true}
            />
            <StatCard
              title="Active Pros"
              value={dashboardStats?.activeProfessionals || 0}
              icon={<FontAwesome5 name="user-tie" size={18} color="white" />}
              color="#F59E0B"
              change={dashboardStats?.professionalsChange || 0}
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
            data={getChartData()}
            width={Dimensions.get('window').width - 32}
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
          {(recentBookings && recentBookings.length > 0) ? (
            recentBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                {...booking}
                onPress={() => navigation.navigate('AdminBookingDetails', { bookingId: booking.id })}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent bookings</Text>
            </View>
          )}
        </View>

        {/* Top Professionals */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Professionals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminProfessionals')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {(topProfessionals && topProfessionals.length > 0) ? (
            topProfessionals.map((professional) => (
              <ProfessionalCard
                key={professional._id}
                {...professional}
                onPress={() => navigation.navigate('AdminProfessionalDetails', { professionalId: professional.id })}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No professionals found</Text>
            </View>
          )}
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
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  scrollContainer: {
    paddingBottom: 32,
  },
  sectionContainer: {
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default AdminDashboardScreen;
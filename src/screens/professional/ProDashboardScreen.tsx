import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { ProStackParamList } from '../../../app/routes/ProNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { ProfessionalService, ProfessionalJob, ProfessionalEarnings, ProfessionalStats } from '../../services/ProfessionalServices';

type ProDashboardScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// --- Interfaces ---
interface Job {
  id: string;
  customerName: string;
  customerImage: string;
  date: string;
  time: string;
  address: string;
  services: { name: string; price: number }[];
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
  lastPayout: { amount: number; date: string };
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
  const [error, setError] = useState<string | null>(null);
  const [upcomingJobs, setUpcomingJobs] = useState<ProfessionalJob[]>([]);
  const [todaysJobs, setTodaysJobs] = useState<ProfessionalJob[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<ProfessionalEarnings>({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    total: 0,
    pendingPayout: 0
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<ProfessionalStats>({
    totalJobs: 0,
    completedJobs: 0,
    cancelledJobs: 0,
    averageRating: 0,
    onTimeRate: 0,
    completionRate: 0
  });

  // --- Data Fetching ---
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const dashboardData = await ProfessionalService.getDashboardData();
      
      setTodaysJobs(dashboardData.todaysJobs);
      setUpcomingJobs(dashboardData.upcomingJobs);
      setEarningsSummary(dashboardData.earnings);
      setPerformanceMetrics(dashboardData.stats);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData(false);
    }, [fetchDashboardData])
  );

  const onRefresh = () => {
    fetchDashboardData(true);
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#10b981';
      case 'assigned': return '#3b82f6';
      case 'in-progress': return '#8b5cf6';
      case 'completed': return '#059669';
      case 'cancelled': return '#ef4444';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'assigned': return 'Assigned';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  // --- Render Functions ---
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerProfile}>
          <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImage} />
          <View>
            <Text style={styles.headerGreeting}>Hello, {user?.name || 'Professional'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.whiteAlpha80} />
              <Text style={styles.locationText}>Bangalore</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ProNotifications')}>
            <Ionicons name="notifications" size={20} color={colors.white} />
            <View style={styles.notificationBadge}><Text style={styles.notificationBadgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ProSettings')}>
            <Ionicons name="settings-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerStatsCard}>
        <View>
          <Text style={styles.headerStatsLabel}>Today's Earnings</Text>
          <Text style={styles.headerStatsValue}>₹{earningsSummary?.today || 0}</Text>
        </View>
        <View style={styles.headerStatsDivider} />
        <View>
          <Text style={styles.headerStatsLabel}>Jobs Today</Text>
          <Text style={styles.headerStatsValue}>{upcomingJobs.filter(job => job.date === 'Today').length}</Text>
        </View>
        <TouchableOpacity style={styles.goOnlineButton}><Text style={styles.goOnlineButtonText}>Go Online</Text></TouchableOpacity>
      </View>
    </View>
  );

  const renderJobItem = (job: ProfessionalJob) => (
    <TouchableOpacity key={job._id} style={styles.card} onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}>
      <View style={styles.jobHeader}>
        <View style={styles.jobCustomerInfo}>
          {job.customer.profileImage ? (
            <Image source={{ uri: job.customer.profileImage }} style={styles.customerImage} />
          ) : (
            <View style={[styles.customerImage, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={20} color="#6b7280" />
            </View>
          )}
          <View>
            <Text style={styles.customerName}>{job.customer.name}</Text>
            <Text style={styles.jobTime}>{new Date(job.scheduledDate).toLocaleDateString()} • {job.scheduledTime}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
          <Text style={styles.statusBadgeText}>{getStatusText(job.status)}</Text>
        </View>
      </View>
      <View style={styles.jobDetailRow}>
        <Ionicons name="location-outline" size={16} color={colors.gray500} />
        <Text style={styles.jobDetailText} numberOfLines={1}>{job.location.address}</Text>
      </View>
      <View style={styles.jobDetailRow}>
        <Ionicons name="car-outline" size={16} color={colors.gray500} />
        <Text style={styles.jobDetailText}>{job.vehicle.type}</Text>
      </View>
      <View style={styles.jobDetailRow}>
        <Ionicons name="time-outline" size={16} color={colors.gray500} />
        <Text style={styles.jobDetailText}>{job.estimatedDuration} minutes</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.serviceList}>
        <View style={styles.serviceItem}>
          <Text style={styles.serviceName}>{job.service.title}</Text>
          <Text style={styles.servicePrice}>₹{job.service.price}</Text>
        </View>
      </View>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₹{job.totalAmount}</Text>
      </View>
      <View style={styles.chevronIcon}>
        <Ionicons name="chevron-forward" size={16} color={colors.gray500} />
      </View>
    </TouchableOpacity>
  );

  const renderUpcomingJobs = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Jobs</Text>
        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate('Jobs')}>
          <Text style={styles.viewAllText}>View All</Text><Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {upcomingJobs.length > 0 ? upcomingJobs.map(renderJobItem) : (
        <View style={styles.emptyStateCard}>
          <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
          <Text style={styles.emptyStateTitle}>No upcoming jobs</Text>
          <Text style={styles.emptyStateSubtitle}>You don't have any jobs scheduled.</Text>
        </View>
      )}
    </View>
  );
  
  const renderQuickActions = () => (
    <View style={[styles.card, styles.section]}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsContainer}>
        {[
          { label: 'View Jobs', icon: 'calendar', color: colors.blue, bgColor: colors.blue100, onPress: () => navigation.navigate('Jobs') },
          { label: 'Earnings', icon: 'cash', color: colors.green, bgColor: colors.green100, onPress: () => navigation.navigate('Earnings') },
          { label: 'Support', icon: 'help-buoy', color: colors.amber, bgColor: colors.amber100, onPress: () => {} },
          { label: 'Profile', icon: 'person', color: colors.purple, bgColor: colors.purple100, onPress: () => navigation.navigate('ProProfile') },
        ].map(action => (
          <TouchableOpacity key={action.label} style={styles.quickActionItem} onPress={action.onPress}>
            <View style={[styles.quickActionIconContainer, { backgroundColor: action.bgColor }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Other render functions (Earnings, Performance) would be structured similarly...

  if (loading) {
    return <View style={styles.loadingScreen}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <View style={styles.contentContainer}>
          {renderUpcomingJobs()}
          {renderQuickActions()}
          {/* Render other sections like Earnings and Performance here */}
        </View>
      </ScrollView>
    </View>
  );
};

// --- Styles ---
const colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
  whiteAlpha80: 'rgba(255,255,255,0.8)',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  red500: '#EF4444',
  blue: '#2563EB',
  blue100: '#DBEAFE',
  blue800: '#1E40AF',
  green: '#16A34A',
  green100: '#D1FAE5',
  amber: '#F59E0B',
  amber100: '#FEF3C7',
  purple: '#7E22CE',
  purple100: '#F3E8FF',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerProfile: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  headerGreeting: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: colors.whiteAlpha80, marginLeft: 4 },
  headerActions: { flexDirection: 'row' },
  headerButton: { width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  notificationBadge: { position: 'absolute', top: 0, right: 0, width: 16, height: 16, backgroundColor: colors.red500, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notificationBadgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
  headerStatsCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, marginTop: 16 },
  headerStatsLabel: { color: colors.whiteAlpha80, fontSize: 14 },
  headerStatsValue: { color: colors.white, fontWeight: 'bold', fontSize: 20 },
  headerStatsDivider: { height: 40, width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  goOnlineButton: { backgroundColor: colors.white, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  goOnlineButtonText: { color: colors.primary, fontWeight: '500' },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { color: colors.primary, fontSize: 14, marginRight: 2 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobCustomerInfo: { flexDirection: 'row', alignItems: 'center' },
  customerImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  customerName: { color: colors.gray800, fontWeight: 'bold', fontSize: 16 },
  jobTime: { color: colors.gray500, fontSize: 14 },
  statusBadge: { backgroundColor: colors.blue100, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { color: colors.blue800, fontSize: 12, fontWeight: '500' },
  jobDetailRowContainer: { flexDirection: 'row', marginBottom: 12 },
  jobDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, flex: 1 },
  jobDetailText: { color: colors.gray700, fontSize: 14, marginLeft: 8, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: 8 },
  serviceList: { marginBottom: 8 },
  serviceItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  serviceName: { color: colors.gray700 },
  servicePrice: { color: colors.gray700 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: colors.gray800, fontWeight: 'bold' },
  totalAmount: { color: colors.primary, fontWeight: 'bold' },
  chevronIcon: { position: 'absolute', bottom: 16, right: 16 },
  emptyStateCard: { backgroundColor: colors.white, borderRadius: 12, padding: 24, alignItems: 'center', justifyContent: 'center' },
  emptyStateTitle: { color: colors.gray500, fontSize: 18, fontWeight: '500', marginTop: 16 },
  emptyStateSubtitle: { color: colors.gray500, fontSize: 14, textAlign: 'center', marginTop: 8 },
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', flex: 1 },
  quickActionIconContainer: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionLabel: { color: colors.gray700, fontSize: 14, textAlign: 'center' },
  avatarPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default ProDashboardScreen;


import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ProStackParamList } from '../../../app/routes/ProfessionalNavigator';
import { useProfessionalDashboardScreen, useProfessionalJobActions, useProfessionalProfileActions } from '../../hooks/useProfessional';

type ProDashboardScreenNavigationProp = NativeStackNavigationProp<ProStackParamList, 'Dashboard'>;

// --- Color Constants ---
const colors = {
  primary: '#2563EB',
  primaryDark: '#1E40AF',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  whiteAlpha80: 'rgba(255, 255, 255, 0.8)',
};

const ProDashboardScreen = () => {
  const navigation = useNavigation<ProDashboardScreenNavigationProp>();
  const { user } = useAuth();
  
  // Use the dashboard hook that combines multiple API calls
  const {
    profile,
    stats,
    isLoading,
    error,
    refresh
  } = useProfessionalDashboardScreen();

  // Professional actions
  const { toggleAvailability } = useProfessionalProfileActions();
  const { acceptJob, startJob } = useProfessionalJobActions();

  const [isOnline, setIsOnline] = useState(profile?.isAvailable || false);

  useEffect(() => {
    if (profile) {
      setIsOnline(profile.isAvailable || false);
    }
  }, [profile]);

  const handleToggleOnline = async () => {
    try {
      const result = await toggleAvailability();
      setIsOnline(result.isAvailable);
      Alert.alert(
        'Status Updated',
        `You are now ${result.isAvailable ? 'online' : 'offline'}`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetails', { jobId });
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await acceptJob(jobId);
      Alert.alert('Success', 'Job accepted successfully!');
      refresh();
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job. Please try again.');
    }
  };

  // --- Render Functions ---
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerProfile}>
          <Image 
            source={{ 
              uri: profile?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' 
            }} 
            style={styles.profileImage} 
          />
          <View>
            <Text style={styles.headerGreeting}>Hello, {profile?.name || user?.name || 'Professional'}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={colors.whiteAlpha80} />
              <Text style={styles.locationText}>
                {profile?.serviceAreas?.[0]?.name || 'Service Area'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('ProNotifications')}
          >
            <Ionicons name="notifications" size={20} color={colors.white} />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('ProSettings')}
          >
            <Ionicons name="settings-outline" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerStatsCard}>
        <View>
          <Text style={styles.headerStatsLabel}>Today's Earnings</Text>
          <Text style={styles.headerStatsValue}>₹{earnings?.today || 0}</Text>
        </View>
        <View style={styles.headerStatsDivider} />
        <View>
          <Text style={styles.headerStatsLabel}>Jobs Today</Text>
          <Text style={styles.headerStatsValue}>
            {upcomingJobs?.filter(job => {
              const today = new Date().toDateString();
              const jobDate = new Date(job.scheduledDate).toDateString();
              return today === jobDate;
            }).length || 0}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.goOnlineButton, isOnline && styles.goOnlineButtonActive]}
          onPress={handleToggleOnline}
        >
          <Text style={[styles.goOnlineButtonText, isOnline && styles.goOnlineButtonTextActive]}>
            {isOnline ? 'Online' : 'Go Online'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderJobItem = (job: any) => (
    <TouchableOpacity 
      key={job.id} 
      style={styles.card} 
      onPress={() => handleJobPress(job.id)}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobCustomerInfo}>
          <Image 
            source={{ 
              uri: job.customer?.profileImage || 'https://randomuser.me/api/portraits/women/44.jpg' 
            }} 
            style={styles.customerImage} 
          />
          <View>
            <Text style={styles.customerName}>
              {job.customer?.name || 'Customer'}
            </Text>
            <View style={styles.jobDateTimeRow}>
              <Ionicons name="calendar" size={14} color={colors.gray500} />
              <Text style={styles.jobDateTime}>
                {new Date(job.scheduledDate).toLocaleDateString()} • {job.scheduledTime}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.jobStatus}>
          <Text style={[styles.jobStatusText, { color: getStatusColor(job.status) }]}>
            {job.status?.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.jobAddress}>
        <Ionicons name="location-outline" size={16} color={colors.gray500} />
        <Text style={styles.jobAddressText} numberOfLines={2}>
          {job.address || 'Address not available'}
        </Text>
      </View>

      <View style={styles.jobServices}>
        {job.services?.slice(0, 2).map((service: any, index: number) => (
          <Text key={index} style={styles.jobServiceText}>
            • {service.name} (₹{service.price})
          </Text>
        ))}
        {job.services?.length > 2 && (
          <Text style={styles.jobServiceText}>
            +{job.services.length - 2} more services
          </Text>
        )}
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.jobTotalAmount}>
          <Text style={styles.jobTotalText}>Total: ₹{job.totalAmount}</Text>
        </View>
        {job.status === 'pending' && (
          <TouchableOpacity 
            style={styles.acceptJobButton}
            onPress={() => handleAcceptJob(job.id)}
          >
            <Text style={styles.acceptJobButtonText}>Accept</Text>
          </TouchableOpacity>
        )}
        {job.distance && (
          <View style={styles.jobDistance}>
            <Ionicons name="car" size={14} color={colors.gray500} />
            <Text style={styles.jobDistanceText}>{job.distance}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEarningsCard = () => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Earnings')}
    >
      <Text style={styles.cardTitle}>Earnings Summary</Text>
      <View style={styles.earningsGrid}>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>₹{earnings?.thisWeek || 0}</Text>
          <Text style={styles.earningsLabel}>This Week</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>₹{earnings?.thisMonth || 0}</Text>
          <Text style={styles.earningsLabel}>This Month</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={[styles.earningsValue, { color: colors.warning }]}>
            ₹{earnings?.pendingPayout || 0}
          </Text>
          <Text style={styles.earningsLabel}>Pending</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={[styles.earningsValue, { color: colors.success }]}>
            ₹{earnings?.lastPayout?.amount || 0}
          </Text>
          <Text style={styles.earningsLabel}>Last Payout</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPerformanceCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Performance Metrics</Text>
      <View style={styles.performanceGrid}>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="star" size={20} color={colors.warning} />
          </View>
          <Text style={styles.performanceValue}>{performance?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.performanceLabel}>Rating</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          </View>
          <Text style={styles.performanceValue}>{performance?.completionRate || 0}%</Text>
          <Text style={styles.performanceLabel}>Completion</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="time" size={20} color={colors.primary} />
          </View>
          <Text style={styles.performanceValue}>{performance?.onTimeRate || 0}%</Text>
          <Text style={styles.performanceLabel}>On Time</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="briefcase" size={20} color={colors.secondary} />
          </View>
          <Text style={styles.performanceValue}>{performance?.totalJobs || 0}</Text>
          <Text style={styles.performanceLabel}>Jobs</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return colors.success;
      case 'ongoing': case 'in_progress': return colors.primary;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.danger;
      default: return colors.gray500;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.danger} />
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshDashboard}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refreshDashboard}
            colors={[colors.primary]}
          />
        }
      >
        {renderEarningsCard()}
        {renderPerformanceCard()}
        
        {/* Upcoming Jobs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Upcoming Jobs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {upcomingJobs && upcomingJobs.length > 0 ? (
            upcomingJobs.map(job => renderJobItem(job))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={colors.gray300} />
              <Text style={styles.emptyText}>No upcoming jobs</Text>
              <Text style={styles.emptySubtext}>
                {isOnline ? 'New jobs will appear here' : 'Go online to receive jobs'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.gray500,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.whiteAlpha80,
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  headerStatsCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerStatsLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginBottom: 4,
  },
  headerStatsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray800,
  },
  headerStatsDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray200,
  },
  goOnlineButton: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goOnlineButtonActive: {
    backgroundColor: colors.success,
  },
  goOnlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
  },
  goOnlineButtonTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  earningsItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: 4,
  },
  earningsLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  performanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  performanceIcon: {
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray800,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobCustomerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray800,
    marginBottom: 4,
  },
  jobDateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDateTime: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
  },
  jobStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gray100,
  },
  jobStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  jobAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobAddressText: {
    fontSize: 14,
    color: colors.gray600,
    marginLeft: 8,
    flex: 1,
  },
  jobServices: {
    marginBottom: 12,
  },
  jobServiceText: {
    fontSize: 13,
    color: colors.gray600,
    marginBottom: 2,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTotalAmount: {
    flex: 1,
  },
  jobTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray800,
  },
  acceptJobButton: {
    backgroundColor: colors.success,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  acceptJobButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  jobDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  jobDistanceText: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray500,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray400,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ProDashboardScreen;
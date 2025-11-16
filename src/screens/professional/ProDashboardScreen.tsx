import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ProfessionalProfile,
  ProfessionalDashboardStats,
  Earnings,
  Performance,
} from '../../types/api';
import JobCard from '../../components/professional/JobCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useNotificationStore } from '../../store';
import { ProStackParamList } from '../../../app/routes/ProNavigator';
import {
  useProfessionalDashboardScreen,
  useProfessionalJobActions,
  useProfessionalProfileActions,
} from '../../hooks/useProfessional';
import { SCREEN_TEXTS } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../utils/CustomAlert';

type ProDashboardScreenNavigationProp = NativeStackNavigationProp<ProStackParamList, 'Dashboard'>;

const ProDashboardScreen = () => {
  const navigation = useNavigation<ProDashboardScreenNavigationProp>();
  const { user } = useAuth();
  const { unreadCount } = useNotificationStore();

  // Use the dashboard hook that combines multiple API calls
  const {
    profile,
    stats,
    isLoading,
    error,
    refresh,
  }: {
    profile: ProfessionalProfile | null;
    stats: ProfessionalDashboardStats | null;
    isLoading: boolean;
    error: any;
    refresh: () => void;
  } = useProfessionalDashboardScreen();

  const {
    earnings,
    todayJobs: upcomingJobs,
    performance,
  }: {
    earnings: Earnings | undefined;
    todayJobs: any[] | undefined;
    performance: Performance | undefined;
  } = stats || {};
  const profileImageUri = profile?.profileImage?.url ?? profile?.profileImage ?? user?.profileImage;
  const refreshDashboard = refresh;

  // Professional actions
  const { toggleAvailability } = useProfessionalProfileActions();
  const { acceptJob, startJob } = useProfessionalJobActions();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'ongoing': case 'in-progress': return '#2563EB';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const handleToggleOnline = async () => {
    try {
      await toggleAvailability();
      CustomAlert.alert(
        SCREEN_TEXTS.ProDashboard.statusUpdated,
        `You are now ${profile?.isAvailable ? 'offline' : 'online'}`
      );
    } catch (error) {
      CustomAlert.alert('Error', SCREEN_TEXTS.ProDashboard.statusUpdateError);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await acceptJob(jobId);
      CustomAlert.alert('Success', SCREEN_TEXTS.ProDashboard.jobAccepted);
      refresh();
    } catch (error) {
      CustomAlert.alert('Error', SCREEN_TEXTS.ProDashboard.jobAcceptError);
    }
  };

  const handleJobPress = (jobId: string) => {
    navigation.navigate('JobDetails', { jobId });
  };

  // --- Render Functions ---
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <View style={styles.headerProfile}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                profileImageUri ? { uri: profileImageUri } : require('../../assets/images/user.png')
              }
              style={styles.profileImage}
            />
            <View style={[styles.onlineIndicator, profile?.isAvailable && styles.onlineIndicatorActive]} />
          </View>
          <View>
            <Text style={styles.headerGreeting}>
              {SCREEN_TEXTS.ProDashboard.greeting}
              {profile?.name || user?.name || SCREEN_TEXTS.ProDashboard.defaultName}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={'rgba(255, 255, 255, 0.8)'} />
              <Text style={styles.locationText}>
                {profile?.serviceAreas?.[0]?.name || 'Service Area'}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProNotifications')}>
            <Ionicons name="notifications" size={20} color={'#FFFFFF'} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('ProSettings')}>
            <Ionicons name="settings-outline" size={20} color={'#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerStatsCard}>
        <View style={styles.statsItem}>
          <Ionicons name="cash" size={20} color={'#10B981'} />
          <View style={styles.statsTextContainer}>
            <Text style={styles.headerStatsLabel}>{SCREEN_TEXTS.ProDashboard.todayEarnings}</Text>
            <Text style={styles.headerStatsValue}>₹{earnings?.today || 0}</Text>
          </View>
        </View>
        <View style={styles.headerStatsDivider} />
        <View style={styles.statsItem}>
          <Ionicons name="briefcase" size={20} color={'#2563EB'} />
          <View style={styles.statsTextContainer}>
            <Text style={styles.headerStatsLabel}>{SCREEN_TEXTS.ProDashboard.jobsToday}</Text>
            <Text style={styles.headerStatsValue}>
              {upcomingJobs?.length || 0}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.goOnlineButton, profile?.isAvailable && styles.goOnlineButtonActive]}
          onPress={handleToggleOnline}>
          <Text
            style={[
              styles.goOnlineButtonText,
              profile?.isAvailable && styles.goOnlineButtonTextActive,
            ]}>
            {profile?.isAvailable
              ? SCREEN_TEXTS.ProDashboard.online
              : SCREEN_TEXTS.ProDashboard.goOnline}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEarningsCard = () => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Earnings')}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{SCREEN_TEXTS.ProDashboard.earningsSummary}</Text>
        <Ionicons name="chevron-forward" size={20} color={'#6B7280'} />
      </View>
      <View style={styles.earningsGrid}>
        <View style={styles.earningsItem}>
          <View style={[styles.earningsIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="calendar" size={16} color={'#2563EB'} />
          </View>
          <Text style={styles.earningsValue}>₹{earnings?.thisWeek || 0}</Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.thisWeek}</Text>
        </View>
        <View style={styles.earningsItem}>
          <View style={[styles.earningsIconContainer, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="calendar-outline" size={16} color={'#16A34A'} />
          </View>
          <Text style={styles.earningsValue}>₹{earnings?.thisMonth || 0}</Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.thisMonth}</Text>
        </View>
        <View style={styles.earningsItem}>
          <View style={[styles.earningsIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="time" size={16} color={'#F59E0B'} />
          </View>
          <Text style={[styles.earningsValue, { color: '#F59E0B' }]}>
            ₹{earnings?.pendingPayout || 0}
          </Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.pending}</Text>
        </View>
        <View style={styles.earningsItem}>
          <View style={[styles.earningsIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={16} color={'#10B981'} />
          </View>
          <Text style={[styles.earningsValue, { color: '#10B981' }]}>
            ₹{earnings?.lastPayout?.amount || 0}
          </Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.lastPayout}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderPerformanceCard = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{SCREEN_TEXTS.ProDashboard.performanceMetrics}</Text>
      <View style={styles.performanceGrid}>
        <View style={styles.performanceItem}>
          <View style={[styles.performanceIconContainer, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={24} color={'#F59E0B'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.rating}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={[styles.performanceIconContainer, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={24} color={'#10B981'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.completionRate || 0}%</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.completion}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={[styles.performanceIconContainer, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="time" size={24} color={'#2563EB'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.onTimeRate || 0}%</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.onTime}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={[styles.performanceIconContainer, { backgroundColor: '#EDE9FE' }]}>
            <Ionicons name="briefcase" size={24} color={'#8B5CF6'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.totalJobs || 0}</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.jobs}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading && !profile && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={'#2563EB'} />
        <Text style={styles.loadingText}>{SCREEN_TEXTS.ProDashboard.loadingDashboard}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={'#EF4444'} />
        <Text style={styles.errorText}>{SCREEN_TEXTS.ProDashboard.failedToLoadDashboard}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshDashboard}>
          <Text style={styles.retryButtonText}>{SCREEN_TEXTS.ProDashboard.retry}</Text>
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
            colors={['#2563EB']}
          />
        }>
        {renderEarningsCard()}
        {renderPerformanceCard()}

        {/* Upcoming Jobs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{SCREEN_TEXTS.ProDashboard.upcomingJobs}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
              <Text style={styles.viewAllText}>{SCREEN_TEXTS.ProDashboard.viewAll}</Text>
            </TouchableOpacity>
          </View>

          {upcomingJobs && upcomingJobs.length > 0 ? (
            upcomingJobs.slice(0, 3).map((job: any) => (
              <TouchableOpacity key={job.id} style={styles.jobCard} onPress={() => handleJobPress(job.id)}>
                <View style={styles.jobCardContent}>
                  <View style={styles.jobCardLeft}>
                    <Ionicons name="location" size={20} color={'#2563EB'} />
                    <View style={styles.jobCardTextContainer}>
                      <Text style={styles.jobCardAddress} numberOfLines={1}>{job.address}</Text>
                      <Text style={styles.jobCardTime}>at {job.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.jobStatusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                    <Text style={[styles.jobStatusText, { color: getStatusColor(job.status) }]}>
                      {job.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color={'#D1D5DB'} />
              </View>
              <Text style={styles.emptyText}>{SCREEN_TEXTS.ProDashboard.noUpcomingJobs}</Text>
              <Text style={styles.emptySubtext}>
                {profile?.isAvailable
                  ? SCREEN_TEXTS.ProDashboard.newJobsWillAppear
                  : SCREEN_TEXTS.ProDashboard.goOnlineToReceiveJobs}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#2563EB',
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
   profileImageContainer: {
     position: 'relative',
     marginRight: 12,
   },
   profileImage: {
     width: 50,
     height: 50,
     borderRadius: 25,
   },
   onlineIndicator: {
     position: 'absolute',
     bottom: 0,
     right: 0,
     width: 16,
     height: 16,
     borderRadius: 8,
     backgroundColor: '#EF4444',
     borderWidth: 2,
     borderColor: '#FFFFFF',
   },
   onlineIndicatorActive: {
     backgroundColor: '#10B981',
   },
  headerGreeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
   headerStatsCard: {
     backgroundColor: '#FFFFFF',
     borderRadius: 12,
     padding: 16,
     flexDirection: 'row',
     alignItems: 'center',
     justifyContent: 'space-between',
     marginTop: 20,
   },
   statsItem: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   statsTextContainer: {
     marginLeft: 8,
   },
   headerStatsLabel: {
     fontSize: 12,
     color: '#6B7280',
     marginBottom: 2,
   },
   headerStatsValue: {
     fontSize: 18,
     fontWeight: '700',
     color: '#1F2937',
   },
   headerStatsDivider: {
     width: 1,
     height: 40,
     backgroundColor: '#E5E7EB',
     marginHorizontal: 16,
   },
  goOnlineButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goOnlineButtonActive: {
    backgroundColor: '#10B981',
  },
  goOnlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  goOnlineButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#111827',
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
    color: '#1F2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
   earningsGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     justifyContent: 'space-between',
     marginTop: 16,
   },
   earningsItem: {
     width: '48%',
     alignItems: 'center',
     marginBottom: 16,
     backgroundColor: '#F9FAFB',
     borderRadius: 12,
     padding: 12,
   },
   earningsIconContainer: {
     width: 32,
     height: 32,
     borderRadius: 16,
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 8,
   },
   earningsValue: {
     fontSize: 18,
     fontWeight: '700',
     color: '#1F2937',
     marginBottom: 4,
   },
   earningsLabel: {
     fontSize: 12,
     color: '#6B7280',
     textAlign: 'center',
   },
   performanceGrid: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: 16,
   },
   performanceItem: {
     alignItems: 'center',
     flex: 1,
     backgroundColor: '#F9FAFB',
     borderRadius: 12,
     padding: 12,
     marginHorizontal: 4,
   },
   performanceIconContainer: {
     width: 40,
     height: 40,
     borderRadius: 20,
     alignItems: 'center',
     justifyContent: 'center',
     marginBottom: 8,
   },
   performanceValue: {
     fontSize: 16,
     fontWeight: '700',
     color: '#1F2937',
     marginBottom: 4,
   },
   performanceLabel: {
     fontSize: 12,
     color: '#6B7280',
     textAlign: 'center',
   },
   jobCard: {
     backgroundColor: '#FFFFFF',
     borderRadius: 12,
     padding: 16,
     marginVertical: 6,
     elevation: 2,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 1 },
     shadowOpacity: 0.1,
     shadowRadius: 2,
   },
   jobCardContent: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   jobCardLeft: {
     flexDirection: 'row',
     alignItems: 'center',
     flex: 1,
   },
   jobCardTextContainer: {
     marginLeft: 12,
     flex: 1,
   },
   jobCardAddress: {
     fontSize: 16,
     fontWeight: '600',
     color: '#1F2937',
   },
   jobCardTime: {
     fontSize: 14,
     color: '#6B7280',
     marginTop: 2,
   },
   jobStatusBadge: {
     paddingHorizontal: 12,
     paddingVertical: 6,
     borderRadius: 16,
   },
   jobStatusText: {
     fontWeight: '600',
     fontSize: 12,
   },
   emptyContainer: {
     alignItems: 'center',
     paddingVertical: 40,
   },
   emptyIconContainer: {
     backgroundColor: '#F3F4F6',
     borderRadius: 50,
     padding: 20,
     marginBottom: 16,
   },
   emptyText: {
     fontSize: 16,
     color: '#6B7280',
     fontWeight: '500',
     marginTop: 12,
   },
   emptySubtext: {
     fontSize: 14,
     color: '#9CA3AF',
     marginTop: 4,
     textAlign: 'center',
   },
});

export default ProDashboardScreen;
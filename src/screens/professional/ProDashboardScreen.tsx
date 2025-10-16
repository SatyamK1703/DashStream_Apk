import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfessionalProfile, ProfessionalDashboardStats, Earnings, Performance } from '../../types/api';
import JobCard from '../../components/professional/JobCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useNotificationStore } from '../../store';
import { ProStackParamList } from '../../../app/routes/ProNavigator';
import { useProfessionalDashboardScreen, useProfessionalJobActions, useProfessionalProfileActions } from '../../hooks/useProfessional';
import { styles } from './ProDashboardScreen.styles';
import { SCREEN_TEXTS } from '../../config/config';
import { Ionicons } from '@expo/vector-icons';

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
    refresh
  }: { profile: ProfessionalProfile | null, stats: ProfessionalDashboardStats | null, isLoading: boolean, error: any, refresh: () => void } = useProfessionalDashboardScreen();

  const { earnings, todayJobs: upcomingJobs, performance }: { earnings: Earnings | undefined, todayJobs: any[] | undefined, performance: Performance | undefined } = stats || {};
  const refreshDashboard = refresh;

  // Professional actions
  const { toggleAvailability } = useProfessionalProfileActions();
  const { acceptJob, startJob } = useProfessionalJobActions();

  const handleToggleOnline = async () => {
    try {
      await toggleAvailability();
      Alert.alert(
        SCREEN_TEXTS.ProDashboard.statusUpdated,
        `You are now ${profile?.isAvailable ? 'offline' : 'online'}`
      );
    } catch (error) {
      Alert.alert('Error', SCREEN_TEXTS.ProDashboard.statusUpdateError);
    }
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await acceptJob(jobId);
      Alert.alert('Success', SCREEN_TEXTS.ProDashboard.jobAccepted);
      refresh();
    } catch (error) {
      Alert.alert('Error', SCREEN_TEXTS.ProDashboard.jobAcceptError);
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
          <Image 
            source={{ 
              uri: profile?.profileImage 
            }} 
            style={styles.profileImage} 
          />
          <View>
            <Text style={styles.headerGreeting}>{SCREEN_TEXTS.ProDashboard.greeting}{profile?.name || user?.name || SCREEN_TEXTS.ProDashboard.defaultName}</Text>
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
            onPress={() => navigation.navigate('ProNotifications')}
          >
            <Ionicons name="notifications" size={20} color={'#FFFFFF'} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate('ProSettings')}
          >
            <Ionicons name="settings-outline" size={20} color={'#FFFFFF'} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headerStatsCard}>
        <View>
          <Text style={styles.headerStatsLabel}>{SCREEN_TEXTS.ProDashboard.todayEarnings}</Text>
          <Text style={styles.headerStatsValue}>₹{earnings?.today || 0}</Text>
        </View>
        <View style={styles.headerStatsDivider} />
        <View>
          <Text style={styles.headerStatsLabel}>{SCREEN_TEXTS.ProDashboard.jobsToday}</Text>
          <Text style={styles.headerStatsValue}>
            {upcomingJobs?.filter(job => {
              const today = new Date().toDateString();
              const jobDate = new Date(job.scheduledDate).toDateString();
              return today === jobDate;
            }).length || 0}
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.goOnlineButton, profile?.isAvailable && styles.goOnlineButtonActive]}
          onPress={handleToggleOnline}
        >
          <Text style={[styles.goOnlineButtonText, profile?.isAvailable && styles.goOnlineButtonTextActive]}>
            {profile?.isAvailable ? SCREEN_TEXTS.ProDashboard.online : SCREEN_TEXTS.ProDashboard.goOnline}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEarningsCard = () => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Earnings')}
    >
      <Text style={styles.cardTitle}>{SCREEN_TEXTS.ProDashboard.earningsSummary}</Text>
      <View style={styles.earningsGrid}>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>₹{earnings?.thisWeek || 0}</Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.thisWeek}</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={styles.earningsValue}>₹{earnings?.thisMonth || 0}</Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.thisMonth}</Text>
        </View>
        <View style={styles.earningsItem}>
          <Text style={[styles.earningsValue, { color: '#F59E0B' }]}>
            ₹{earnings?.pendingPayout || 0}
          </Text>
          <Text style={styles.earningsLabel}>{SCREEN_TEXTS.ProDashboard.pending}</Text>
        </View>
        <View style={styles.earningsItem}>
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
          <View style={styles.performanceIcon}>
            <Ionicons name="star" size={20} color={'#F59E0B'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.rating}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="checkmark-circle" size={20} color={'#10B981'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.completionRate || 0}%</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.completion}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="time" size={20} color={'#2563EB'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.onTimeRate || 0}%</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.onTime}</Text>
        </View>
        <View style={styles.performanceItem}>
          <View style={styles.performanceIcon}>
            <Ionicons name="briefcase" size={20} color={'#8B5CF6'} />
          </View>
          <Text style={styles.performanceValue}>{performance?.totalJobs || 0}</Text>
          <Text style={styles.performanceLabel}>{SCREEN_TEXTS.ProDashboard.jobs}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
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
        }
      >
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
            upcomingJobs.map(job => <JobCard key={job.id} job={job} onAcceptJob={handleAcceptJob} />)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color={'#D1D5DB'} />
              <Text style={styles.emptyText}>{SCREEN_TEXTS.ProDashboard.noUpcomingJobs}</Text>
              <Text style={styles.emptySubtext}>
                {profile?.isAvailable ? SCREEN_TEXTS.ProDashboard.newJobsWillAppear : SCREEN_TEXTS.ProDashboard.goOnlineToReceiveJobs}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProDashboardScreen;

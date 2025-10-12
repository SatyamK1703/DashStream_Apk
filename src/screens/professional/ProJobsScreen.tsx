import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import proper types and hooks
import { ProNavigator, ProRoutes } from '../../../app/routes/ProNavigator';
import { useProfessionalJobsScreen, useProfessionalJobActions } from '../../hooks/useProfessional';

type ProJobsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList, 'Jobs'>;

interface Job {
  id: string;
  customer: {
    name: string;
    profileImage?: string;
    phone: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  distance?: string;
}

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';

const ProJobsScreen = () => {
  const navigation = useNavigation<ProJobsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  // Use the professional jobs hook
  const {
    jobs,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    error,
    refresh
  } = useProfessionalJobsScreen();

  // Job actions hook
  const { 
    acceptJob, 
    startJob, 
    completeJob, 
    cancelJob,
    isLoading: isActionLoading 
  } = useProfessionalJobActions();

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return job.customerName.toLowerCase().includes(query) ||
           job.id.toLowerCase().includes(query) ||
           job.address.toLowerCase().includes(query);
  });
  
  const onRefresh = refresh;

  // --- Render Functions ---
  const renderFilterButton = (label: string, value: FilterStatus) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedStatus === value && styles.activeFilterButton]}
      onPress={() => setSelectedStatus(value)}
    >
      <Text style={[styles.filterButtonText, selectedStatus === value && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderJobItem = ({ item }: { item: Job }) => {
    const statusInfo = {
      pending: { label: 'Pending', bg: colors.yellow100, text: colors.yellow800 },
      confirmed: { label: 'Confirmed', bg: colors.blue100, text: colors.blue800 },
      assigned: { label: 'Assigned', bg: colors.purple100, text: colors.purple800 },
      'in-progress': { label: 'In Progress', bg: colors.amber100, text: colors.amber800 },
      completed: { label: 'Completed', bg: colors.green100, text: colors.green800 },
      cancelled: { label: 'Cancelled', bg: colors.red100, text: colors.red800 },
      rejected: { label: 'Rejected', bg: colors.gray100, text: colors.gray800 },
    }[item.status] || { label: 'Unknown', bg: colors.gray100, text: colors.gray800 };

    return (
      <TouchableOpacity style={styles.jobCard} onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}>
        <View style={styles.jobCardHeader}>
          <View style={styles.jobCardCustomer}>
            <Image source={{ uri: item.customerImage }} style={styles.customerImage} />
            <View>
              <Text style={styles.customerName}>{item.customerName}</Text>
              <Text style={styles.jobTime}>{item.date} • {item.time}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>{statusInfo.label}</Text>
          </View>
        </View>
        <View style={styles.jobCardDetailRow}>
          <Ionicons name="location-outline" size={16} color={colors.gray500} />
          <Text style={styles.jobAddress} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.jobCardFooter}>
          <Text style={styles.jobTotal}>Total: ₹{item.totalAmount}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.gray500} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyTitle}>No jobs found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() ? `No jobs matching "${searchQuery}".` : `You have no ${selectedStatus} jobs.`}
      </Text>
      {(searchQuery.trim() || selectedStatus !== 'all') && (
        <TouchableOpacity style={styles.clearFilterButton} onPress={() => { setSearchQuery(''); setSelectedStatus('all'); }}>
          <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  if (isLoading) {
    return <View style={styles.centeredScreen}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Jobs</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by customer, job ID, etc."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Pending', 'pending')}
          {renderFilterButton('Confirmed', 'confirmed')}
          {renderFilterButton('In Progress', 'in-progress')}
          {renderFilterButton('Completed', 'completed')}
          {renderFilterButton('Cancelled', 'cancelled')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={renderJobItem}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      />
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray300: '#D1D5DB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray700: '#374151', gray800: '#1F2937', red100: '#FEE2E2', red800: '#991B1B',
  blue100: '#DBEAFE', blue800: '#1E40AF', green100: '#D1FAE5', green800: '#065F46', amber100: '#FEF3C7', amber800: '#92400E',
  yellow100: '#FEF3C7', yellow800: '#92400E', purple100: '#E9D5FF', purple800: '#6B21A8',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 12, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.gray800, marginBottom: 16 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray100, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, height: 44, color: colors.gray800 },
  filterScrollView: { marginHorizontal: -16, paddingHorizontal: 16 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8, backgroundColor: colors.gray100 },
  activeFilterButton: { backgroundColor: colors.primary },
  filterButtonText: { fontWeight: '500', color: colors.gray700 },
  activeFilterButtonText: { color: colors.white },
  listContentContainer: { padding: 16 },
  jobCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  jobCardCustomer: { flexDirection: 'row', alignItems: 'center' },
  customerImage: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  jobTime: { fontSize: 14, color: colors.gray500 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 12, fontWeight: '500' },
  jobCardDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  jobAddress: { flex: 1, marginLeft: 8, color: colors.gray700 },
  divider: { height: 1, backgroundColor: colors.gray100, marginVertical: 8 },
  jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTotal: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: colors.gray500, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  clearFilterButton: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 999 },
  clearFilterButtonText: { color: colors.white, fontWeight: '500' },
});

export default ProJobsScreen;

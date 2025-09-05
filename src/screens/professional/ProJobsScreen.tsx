import React, { useState, useEffect } from 'react';
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
import apiService from '../../services/apiService';

// Mock types for self-contained component
type ProStackParamList = {
  Jobs: undefined;
  JobDetails: { jobId: string };
  ProNotifications: undefined;
};

type ProJobsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Job {
  id: string;
  customerName: string;
  customerImage: string;
  date: string;
  time: string;
  address: string;
  totalAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
}

type FilterStatus = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const ProJobsScreen = () => {
  const navigation = useNavigation<ProJobsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // --- Data Fetching and Filtering ---
  const fetchJobs = async () => {
    try {
      const response = await apiService.get('/professional/jobs');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      Alert.alert('Error', 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [refreshing]);

  useEffect(() => {
    let result = jobs;
    if (activeFilter !== 'all') {
      result = result.filter(job => job.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(job =>
        job.customerName.toLowerCase().includes(query) ||
        job.id.toLowerCase().includes(query) ||
        job.address.toLowerCase().includes(query)
      );
    }
    setFilteredJobs(result);
  }, [activeFilter, searchQuery, jobs]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
  };

  // --- Render Functions ---
  const renderFilterButton = (label: string, value: FilterStatus) => (
    <TouchableOpacity
      style={[styles.filterButton, activeFilter === value && styles.activeFilterButton]}
      onPress={() => setActiveFilter(value)}
    >
      <Text style={[styles.filterButtonText, activeFilter === value && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderJobItem = ({ item }: { item: Job }) => {
    const statusInfo = {
      upcoming: { label: 'Upcoming', bg: colors.blue100, text: colors.blue800 },
      ongoing: { label: 'Ongoing', bg: colors.amber100, text: colors.amber800 },
      completed: { label: 'Completed', bg: colors.green100, text: colors.green800 },
      cancelled: { label: 'Cancelled', bg: colors.red100, text: colors.red800 },
    }[item.status];

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
        {searchQuery.trim() ? `No jobs matching "${searchQuery}".` : `You have no ${activeFilter} jobs.`}
      </Text>
      {(searchQuery.trim() || activeFilter !== 'all') && (
        <TouchableOpacity style={styles.clearFilterButton} onPress={() => { setSearchQuery(''); setActiveFilter('all'); }}>
          <Text style={styles.clearFilterButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  if (loading && !refreshing) {
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
          {renderFilterButton('Upcoming', 'upcoming')}
          {renderFilterButton('Ongoing', 'ongoing')}
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      />
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray300: '#D1D5DB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray700: '#374151', gray800: '#1F2937', red100: '#FEE2E2', red800: '#991B1B',
  blue100: '#DBEAFE', blue800: '#1E40AF', green100: '#D1FAE5', green800: '#065F46', amber100: '#FEF3C7', amber800: '#92400E',
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

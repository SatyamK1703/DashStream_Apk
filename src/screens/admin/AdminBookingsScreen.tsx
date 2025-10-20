import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

// Components
import SearchAndFilter from '~/components/admin/SearchAndFilter';
import ScrollableFilter from '~/components/admin/ScrollableFilter';
import FilterDropdown from '~/components/admin/FilterDropdown';
import BookingCard from '~/components/admin/BookingCardPro';
import EmptyState from '~/components/admin/EmptyStatePro';

// Type definitions
import { Booking, BookingStatus, FilterOption } from '../../types/AdminType';

// API hooks
import { useAdminBookings, useAdminBookingActions } from '../../hooks/useAdmin';

type AdminBookingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminBookingsScreen = () => {
  const navigation = useNavigation<AdminBookingsScreenNavigationProp>();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // API hooks
  const {
    data: bookings = [],
    loading,
    error,
    refresh,
    loadMore,
    pagination,
  } = useAdminBookings({
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy: sortBy === 'newest' ? 'created_at' : 'created_at',
    sortOrder: sortBy === 'newest' ? 'desc' : 'asc',
    limit: 20,
  });

  // Alias for consistent naming
  const fetchBookings = refresh;
  const hasMore = pagination.hasMore;
  const isLoadingMore = loading && pagination.page > 1;

  const { updateBookingStatus } = useAdminBookingActions();

  const filterOptions: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  useEffect(() => {
    fetchBookings();
  }, [searchQuery, statusFilter, sortBy, fetchBookings]);

  const onRefresh = useCallback(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await updateBookingStatus(bookingId, { status });
      Alert.alert('Success', 'Booking status updated successfully');
      fetchBookings(); // Refresh the list
    } catch (error) {
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleBookingPress = (bookingId: string) => {
    navigation.navigate('AdminBookingDetails', { bookingId });
  };

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredScreen}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load bookings</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. New white header with centered title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.headerButton} />{/* Placeholder for balance */}
      </View>

      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onClearSearch={() => setSearchQuery('')}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      <View style={styles.filterRow}>
        <ScrollableFilter
          options={filterOptions}
          selectedValue={statusFilter}
          onSelect={(value) => setStatusFilter(value as BookingStatus)}
        />
      </View>

      <FilterDropdown
        visible={showFilters}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <FlatList
        data={bookings}
        renderItem={({ item }) => (
          <BookingCard 
            booking={item} 
            onPress={() => handleBookingPress(item.id)} 
            onUpdateStatus={(status) => handleUpdateBookingStatus(item.id, status)}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={<EmptyState />}
        onEndReached={() => {
          if (hasMore && !isLoadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() => 
          isLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingFooterText}>Loading more...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
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
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingFooterText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80, // For FAB
  }
});

export default AdminBookingsScreen;

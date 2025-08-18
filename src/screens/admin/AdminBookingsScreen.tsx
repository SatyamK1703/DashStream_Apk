import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 1. Import from react-native-safe-area-context
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { mockBookings } from '../../constants/data/AdminProfessionalScreen';

// Assuming these are your custom components, no changes needed here
import SearchAndFilter from '~/components/admin/SearchAndFilter';
import ScrollableFilter from '~/components/admin/ScrollableFilter';
import FilterDropdown from '~/components/admin/FilterDropdown';
import BookingCard from '~/components/admin/BookingCardPro';
import EmptyState from '~/components/admin/EmptyStatePro';

// Type definitions
import { Booking, BookingStatus, FilterOption } from '../../types/AdminType';

type AdminBookingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminBookingsScreen = () => {
  const navigation = useNavigation<AdminBookingsScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);

  const filterOptions: FilterOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Ongoing', value: 'ongoing' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBookings(mockBookings);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, statusFilter, sortBy]);

  const applyFilters = () => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(query) ||
          booking.customerName.toLowerCase().includes(query) ||
          booking.customerPhone.includes(query) ||
          (booking.professionalName &&
            booking.professionalName.toLowerCase().includes(query)) ||
          booking.service.toLowerCase().includes(query) ||
          booking.address.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredBookings(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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
        data={filteredBookings}
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => handleBookingPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateBooking')}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#2563EB',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default AdminBookingsScreen;

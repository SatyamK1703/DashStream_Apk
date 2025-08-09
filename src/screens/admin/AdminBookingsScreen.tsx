
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { mockBookings } from '../../constants/data/AdminProfessionalScreen';

import BookingsHeader from '../../components/admin/BookingsHeader';
import SearchAndFilter from '~/components/admin/SearchAndFilter';
import ScrollableFilter from '~/components/admin/ScrollableFilter';
import FilterDropdown from '~/components/admin/FilterDropdown';
import BookingCard from '~/components/admin/BookingCardPro';
import EmptyState from '~/components/admin/EmptyStatePro';

import { styles } from '../../components/admin/BookingsScreen.styles';
import { Booking, BookingStatus, FilterOption } from '../../types/AdminType';

type AdminBookingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
interface ScrollableFilterProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onSelect: (value: string) => void;
}

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BookingsHeader onBack={() => navigation.goBack()} />

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
          <BookingCard booking={item} onPress={handleBookingPress} />
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
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminBookingsScreen;


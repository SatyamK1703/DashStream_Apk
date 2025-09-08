import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { Booking } from '../../types/BookingType';
type BookingsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;


const BookingsScreen = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const { isFullyAuthenticated } = useRequireAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from API
  const fetchBookings = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      let response;
      if (activeTab === 'upcoming') {
        response = await BookingService.getUpcomingBookings();
      } else {
        response = await BookingService.getCompletedBookings();
      }

      setBookings(response.bookings || []);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.response?.data?.message || 'Failed to load bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  // Load bookings when component mounts or tab changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Refresh bookings when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings(false);
    }, [fetchBookings])
  );

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings(false);
  }, [fetchBookings]);

  // Filter bookings based on active tab
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'upcoming') {
      return ['pending', 'confirmed', 'assigned', 'in-progress'].includes(booking.status);
    } else {
      return ['completed', 'cancelled', 'rejected'].includes(booking.status);
    }
  });

  const handleViewBooking = (booking: Booking) => {
    const { _id, status } = booking;
    if (['pending', 'confirmed', 'assigned', 'in-progress'].includes(status)) {
      navigation.navigate('TrackBooking', { bookingId: _id });
    } else {
      navigation.navigate('OrderDetails', { orderId: _id });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return styles.statusBlue;
      case 'confirmed': return styles.statusBlue;
      case 'assigned': return styles.statusBlue;
      case 'in-progress': return styles.statusGreen;
      case 'completed': return styles.statusGreen;
      case 'cancelled': return styles.statusRed;
      case 'rejected': return styles.statusRed;
      default: return styles.statusGray;
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

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleViewBooking(item)}>
      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.bookingId}>Booking #{item._id.slice(-8)}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={[styles.statusText, getStatusStyle(item.status)]}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.scheduledDate).toLocaleDateString('en-IN', { 
              day: '2-digit', month: 'short', year: 'numeric' 
            })}, {item.scheduledTime}
          </Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="car-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{item.service.title}</Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="location-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{item.location.address}</Text>
        </View>

        {item.professional && (
          <View style={styles.rowIconText}>
            <Ionicons name="person-outline" size={18} color="#2563eb" />
            <View style={styles.rowCenter}>
              {item.professional.profileImage ? (
                <Image source={{ uri: item.professional.profileImage }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={16} color="#6b7280" />
                </View>
              )}
              <Text style={styles.text}>{item.professional.name}</Text>
            </View>
          </View>
        )}

        <View style={styles.rowIconText}>
          <Ionicons name="cash-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>₹{item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {item.vehicle.type} • {item.estimatedDuration} min
        </Text>
        <View style={styles.rowCenter}>
          <Text style={styles.linkText}>
            {['pending', 'confirmed', 'assigned', 'in-progress'].includes(item.status) ? 'Track Booking' : 'View Details'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#2563eb" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No bookings found</Text>
      <Text style={styles.emptyMessage}>
        {activeTab === 'upcoming'
          ? "You don't have any upcoming bookings. Book a service now!"
          : "You don't have any completed bookings yet."}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerTabs')}>
          <Text style={styles.buttonText}>Book a Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}> 
    

      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={activeTab === 'upcoming' ? styles.activeTabText : styles.inactiveTabText}>
            Upcoming & Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={activeTab === 'completed' ? styles.activeTabText : styles.inactiveTabText}>
            Completed & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorTitle}>Error Loading Bookings</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: {
    width: 24, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderColor: 'transparent' },
  activeTab: { borderColor: '#2563eb' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  inactiveTabText: { color: '#6b7280' },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
  cardContent: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowIconText: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bookingId: { fontWeight: '600', color: '#1f2937' },
  timestamp: { color: '#6b7280', fontSize: 12 },
  statusBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  statusText: { fontSize: 12, fontWeight: '500' },
  statusBlue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  statusGreen: { backgroundColor: '#d1fae5', color: '#10b981' },
  statusRed: { backgroundColor: '#fee2e2', color: '#ef4444' },
  statusGray: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  text: { color: '#1f2937', flexShrink: 1, marginLeft: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  footer: { backgroundColor: '#f9fafb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f3f4f6' },
  footerText: { color: '#6b7280', fontSize: 12 },
  linkText: { color: '#2563eb', fontWeight: '500', marginRight: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#6b7280' },
  listContent: { padding: 16 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#9ca3af', fontSize: 18, marginTop: 16 },
  emptyMessage: { color: '#6b7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginTop: 16, marginBottom: 8 },
  errorText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  avatarPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
});

export default BookingsScreen;

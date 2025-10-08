import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMyBookings } from '../../hooks/useBookings';
import { Booking } from '../../types/api';
import { showErrorAlert } from '../../utils/errorHandler';
import { bookingService } from '../../services';
type BookingsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const BookingsScreen = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  // API hooks for fetching bookings
  const upcomingBookingsApi = useMyBookings({
    status: 'pending,confirmed,in-progress'
  });
  
  const completedBookingsApi = useMyBookings({
    status: 'completed,cancelled'
  });

  // Get current API based on active tab
  const currentApi = activeTab === 'upcoming' ? upcomingBookingsApi : completedBookingsApi;

  useEffect(() => {
    // Load initial data when component mounts or tab changes
    console.log('BookingsScreen - Refreshing bookings for tab:', activeTab);
    currentApi.refresh();
  }, [activeTab]);

  // Debug log when data changes
  useEffect(() => {
    console.log('BookingsScreen - Data updated:', {
      activeTab,
      dataLength: currentApi.data?.length,
      loading: currentApi.loading,
      error: currentApi.error,
      hasMore: currentApi.pagination.hasMore,
      dataIsArray: Array.isArray(currentApi.data),
      dataType: typeof currentApi.data,
      firstBooking: currentApi.data?.[0],
      fullData: currentApi.data
    });
  }, [currentApi.data, currentApi.loading, currentApi.error, activeTab]);

  const handleTabChange = (tab: 'upcoming' | 'completed') => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    currentApi.refresh();
  };

  const handleLoadMore = () => {
    if (currentApi.pagination.hasMore && !currentApi.loading) {
      currentApi.loadMore();
    }
  };

  const handleViewBooking = (bookingId: string, status: string) => {
    if (status === 'pending' || status === 'confirmed' || status === 'in-progress') {
      navigation.navigate('TrackBooking', { bookingId });
    } else {
      navigation.navigate('OrderDetails', { bookingId });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  const formatTime = (timeString: string) => {
    const time = new Date(timeString);
    return time.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
      case 'confirmed': return styles.statusBlue;
      case 'in-progress': return styles.statusGreen;
      case 'completed': return styles.statusGreen;
      case 'cancelled': return styles.statusRed;
      default: return styles.statusGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleViewBooking(item._id, item.status)}>
      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.bookingId}>#{item.bookingId}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={[styles.statusText, getStatusStyle(item.status)]}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {formatDate(item.scheduledDate)}, {formatTime(item.scheduledTime)}
          </Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="construct-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{item.service.name}</Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="location-outline" size={18} color="#2563eb" />
          <Text style={styles.text} numberOfLines={1}>
            {`${item.address.addressLine1}, ${item.address.city}`}
          </Text>
        </View>

        {item.professional && (
          <View style={styles.rowIconText}>
            <Ionicons name="person-outline" size={18} color="#2563eb" />
            <View style={styles.rowCenter}>
              {item.professional.user.profileImage?.url ? (
                <Image 
                  source={{ uri: item.professional.user.profileImage.url }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={12} color="#666" />
                </View>
              )}
              <Text style={styles.text}>{item.professional.user.name}</Text>
            </View>
          </View>
        )}

        <View style={styles.rowIconText}>
          <Ionicons name="cash-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>₹{item.totalAmount.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Service • {formatDate(item.scheduledDate)}
        </Text>
        <View style={styles.rowCenter}>
          <Text style={styles.linkText}>
            {item.status === 'pending' || item.status === 'confirmed' || item.status === 'in-progress' 
              ? 'Track Booking' 
              : 'View Details'}
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
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
          <Text style={styles.buttonText}>Book a Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}> 
      {/* ✅ SafeAreaView used here */}

      {/* Header with Back Button + Centered Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Bookings</Text>
        {/* Empty view for balancing center alignment */}
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => handleTabChange('upcoming')}
        >
          <Text style={activeTab === 'upcoming' ? styles.activeTabText : styles.inactiveTabText}>
            Upcoming & Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => handleTabChange('completed')}
        >
          <Text style={activeTab === 'completed' ? styles.activeTabText : styles.inactiveTabText}>
            Completed & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {currentApi.loading && (!currentApi.data || currentApi.data.length === 0) ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : currentApi.error && (!currentApi.data || currentApi.data.length === 0) ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load bookings</Text>
          <Text style={styles.errorMessage}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={currentApi.data || []}
          renderItem={renderBookingItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={currentApi.loading && currentApi.data && currentApi.data.length > 0}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={() => 
            currentApi.loading && currentApi.data && currentApi.data.length > 0 ? (
              <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingMoreText}>Loading more...</Text>
              </View>
            ) : null
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
    justifyContent: 'space-between', // space between ensures title is centered
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: {
    width: 24, // ensures proper spacing
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
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  errorTitle: { color: '#ef4444', fontSize: 18, fontWeight: '600', marginTop: 16 },
  errorMessage: { color: '#6b7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  retryButton: { backgroundColor: '#ef4444', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryButtonText: { color: '#fff', fontWeight: '600' },
  avatarPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  loadingMore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  loadingMoreText: { marginLeft: 8, color: '#6b7280' },
});

export default BookingsScreen;


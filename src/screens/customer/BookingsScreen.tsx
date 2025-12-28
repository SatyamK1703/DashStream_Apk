import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMyBookings } from '../../hooks/useBookings';
import { Booking } from '../../types/api';
import BookingCard from './BookingCard';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../store';

type NavProp = NativeStackNavigationProp<CustomerStackParamList>;

const BookingsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { isGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const upcomingApi = useMyBookings({ status: 'pending,confirmed,in-progress,rescheduled' });
  const completedApi = useMyBookings({ status: 'completed,cancelled' });

  const currentApi = activeTab === 'upcoming' ? upcomingApi : completedApi;

  useEffect(() => {
    if (!isGuest) {
      currentApi.refresh();
    }
  }, [activeTab, isGuest]);

  const handleViewBooking = (id: string, status: string) => {
    const route =
      status === 'pending' || status === 'confirmed' || status === 'in-progress'
        ? 'TrackBooking'
        : 'OrderDetails';
    navigation.navigate(route, { bookingId: id });
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <BookingCard booking={item} onPress={() => handleViewBooking(item._id, item.status)} />
  );

  const handleRefresh = useCallback(() => currentApi.refresh(), [currentApi]);
  const handleLoadMore = useCallback(() => {
    if (currentApi.pagination.hasMore && !currentApi.loading) currentApi.loadMore();
  }, [currentApi]);

  const renderEmpty = () => (
    <View style={styles.stateContainer}>
      <Ionicons name="calendar-outline" size={60} color="#94a3b8" />
      <Text style={styles.stateTitle}>No {activeTab} bookings</Text>
      <Text style={styles.stateText}>
        {activeTab === 'upcoming'
          ? 'You don’t have any upcoming services. Book one now!'
          : 'You haven’t completed any bookings yet.'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
          <Text style={styles.primaryButtonText}>Book a Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderError = () => (
    <View style={styles.stateContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
      <Text style={styles.stateTitle}>Failed to load</Text>
      <Text style={styles.stateText}>Please check your internet and try again.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={styles.iconPlaceholder} />
      </View>

      {isGuest ? (
        <View style={styles.guestContainer}>
          <Ionicons name="calendar-outline" size={60} color="#94a3b8" />
          <Text style={styles.guestTitle}>Booking History</Text>
          <Text style={styles.guestText}>
            Create an account to view your booking history and track your service requests.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login' as never)}
          >
            <Text style={styles.loginButtonText}>Create Account / Login</Text>
          </TouchableOpacity>
        </View>
       ) : (
         <View style={{ flex: 1 }}>
           <View style={styles.tabs}>
            {['upcoming', 'completed'].map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab as 'upcoming' | 'completed')}>
                  <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                    {tab === 'upcoming' ? 'Upcoming & Ongoing' : 'Completed & Cancelled'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Data Rendering */}
          {currentApi.loading && !currentApi.data?.length ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#2563eb" />
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          ) : currentApi.error && !currentApi.data?.length ? (
            renderError()
          ) : (
            <View style={{ flex: 1 }}>
              <FlatList
                data={currentApi.data || []}
                renderItem={renderBooking}
                keyExtractor={(item) => item._id}
                key={activeTab}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                  <RefreshControl
                    refreshing={currentApi.loading && !!currentApi.data?.length}
                    onRefresh={handleRefresh}
                    colors={['#2563eb']}
                  />
                }
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.2}
                ListFooterComponent={() =>
                  currentApi.loading && !!currentApi.data?.length ? (
                    <View style={styles.footerLoader}>
                      <ActivityIndicator size="small" color="#2563eb" />
                      <Text style={styles.footerText}>Loading more...</Text>
                    </View>
                  ) : null
                }
              />
            </View>
          )}
        </View>
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
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    borderBottomWidth: 0.8,
    borderColor: '#e5e7eb',
  },
  iconButton: { width: 30, alignItems: 'center' },
  iconPlaceholder: { width: 30 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: { borderColor: '#2563eb' },
  tabText: { color: '#6b7280', fontWeight: '500' },
  activeTabText: { color: '#2563eb', fontWeight: '700' },

  list: { padding: 16, paddingBottom: 40 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },

  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  stateTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginTop: 16 },
  stateText: { color: '#6b7280', textAlign: 'center', marginTop: 8, marginBottom: 20 },

  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },

  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { color: '#fff', fontWeight: '600' },

  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: { color: '#6b7280', marginLeft: 8 },

  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  guestText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingsScreen;

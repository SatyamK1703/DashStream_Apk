// Example Component demonstrating Enhanced Connection Usage
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput
} from 'react-native';
import { useEnhancedConnection, useApiRequest, useConnectionStatus } from '../hooks/useEnhancedConnection';

// Service interface example
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isActive: boolean;
}

interface Booking {
  id: string;
  serviceId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  scheduledAt: string;
  createdAt: string;
}

const ExampleEnhancedComponent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  // Use the enhanced connection hook
  const {
    execute,
    requestState,
    retry,
    clearError,
    isAuthenticated,
    user,
    connectionQuality,
    canMakeRequests
  } = useEnhancedConnection<Service[]>();

  // Use specialized hooks
  const {
    isOnline,
    isBackendReachable,
    showConnectionStatus,
    forceRefresh
  } = useConnectionStatus();

  // Example: Fetch services with caching
  const {
    data: services,
    loading: servicesLoading,
    error: servicesError,
    refetch: refetchServices
  } = useApiRequest<Service[]>('/services', {
    cacheKey: 'services_list',
    cacheTimeout: 300000, // 5 minutes
    showErrorAlert: true
  });

  // Example: Fetch user's bookings
  const {
    data: bookings,
    loading: bookingsLoading,
    error: bookingsError,
    refetch: refetchBookings
  } = useApiRequest<Booking[]>(
    isAuthenticated ? '/bookings/my-bookings' : '',
    {
      immediate: isAuthenticated,
      cacheKey: 'user_bookings',
      showErrorAlert: false
    }
  );

  // Handle service booking
  const handleBookService = async (serviceId: string) => {
    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to book a service');
      return;
    }

    if (!canMakeRequests()) {
      showConnectionStatus();
      return;
    }

    try {
      const response = await execute('/bookings', 'POST', {
        serviceId,
        scheduledAt: new Date().toISOString(),
        notes: 'Booked via mobile app'
      }, {
        showErrorAlert: true
      });

      if (response.success) {
        Alert.alert('Success', 'Service booked successfully!');
        refetchBookings(); // Refresh bookings list
      }
    } catch (error: any) {
      // Error handling is done automatically by the hook
      console.error('Booking failed:', error);
    }
  };

  // Handle service search
  const handleSearchServices = async () => {
    if (!searchQuery.trim()) {
      refetchServices();
      return;
    }

    try {
      await execute('/services/search', 'GET', { q: searchQuery }, {
        showErrorAlert: true
      });
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Render connection status indicator
  const renderConnectionStatus = () => {
    if (isOnline && isBackendReachable) {
      return null;
    }

    const getStatusColor = () => {
      if (!isOnline) return '#ff4757';
      if (!isBackendReachable) return '#ffa502';
      return '#2ed573';
    };

    const getStatusText = () => {
      if (!isOnline) return 'Offline';
      if (!isBackendReachable) return 'Server Unavailable';
      return `Connection: ${connectionQuality}`;
    };

    return (
      <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <TouchableOpacity onPress={forceRefresh} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render service item
  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceName}>{item.name}</Text>
      <Text style={styles.serviceDescription}>{item.description}</Text>
      <Text style={styles.servicePrice}>₹{item.price}</Text>
      
      <TouchableOpacity
        style={[
          styles.bookButton,
          !canMakeRequests() && styles.bookButtonDisabled
        ]}
        onPress={() => handleBookService(item.id)}
        disabled={!canMakeRequests()}
      >
        <Text style={styles.bookButtonText}>
          {canMakeRequests() ? 'Book Now' : 'Offline'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render booking item
  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingId}>Booking #{item.id.slice(-6)}</Text>
      <Text style={styles.bookingStatus}>Status: {item.status}</Text>
      <Text style={styles.bookingDate}>
        Scheduled: {new Date(item.scheduledAt).toLocaleDateString()}
      </Text>
    </View>
  );

  // Render loading state
  if (servicesLoading && !services) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Connection Status Bar */}
      {renderConnectionStatus()}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isAuthenticated ? `Welcome, ${user?.name || 'User'}` : 'DashStream Services'}
        </Text>
        <TouchableOpacity onPress={showConnectionStatus}>
          <Text style={styles.connectionIndicator}>
            {isOnline && isBackendReachable ? '🟢' : '🔴'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchServices}
        />
        <TouchableOpacity
          onPress={handleSearchServices}
          style={styles.searchButton}
          disabled={!canMakeRequests()}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {(servicesError || requestState.error) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {servicesError?.message || requestState.error?.message}
          </Text>
          <TouchableOpacity onPress={retry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Services List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Services</Text>
        <FlatList
          data={requestState.data || services || []}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={requestState.loading}
              onRefresh={refetchServices}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* User Bookings (if authenticated) */}
      {isAuthenticated && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Bookings</Text>
          {bookingsLoading ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : bookingsError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load bookings</Text>
              <TouchableOpacity onPress={refetchBookings}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={bookings || []}
              renderItem={renderBooking}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No bookings yet</Text>
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  connectionIndicator: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  section: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginVertical: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  bookButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  bookingCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    marginRight: 8,
    minWidth: 160,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  bookingStatus: {
    fontSize: 12,
    color: '#7f8c8d',
    marginVertical: 2,
  },
  bookingDate: {
    fontSize: 10,
    color: '#95a5a6',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    margin: 16,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    flex: 1,
  },
  loadingText: {
    marginTop: 12,
    color: '#7f8c8d',
  },
  emptyText: {
    color: '#7f8c8d',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ExampleEnhancedComponent;
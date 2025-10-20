import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAdminCustomers } from '../../hooks/useAdmin';
import { User } from '../../types/api';

type AdminCustomersNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Customer extends User {
  totalBookings: number;
  totalSpent: number;
  status: 'active' | 'inactive' | 'blocked';
  joinDate: string;
  profileImage: string;
  membershipStatus?: 'none' | 'silver' | 'gold' | 'platinum';
}

const AdminCustomersScreen = () => {
  const navigation = useNavigation<AdminCustomersNavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'none' | 'silver' | 'gold' | 'platinum'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Use admin customers hook instead of direct service calls
  const {
    data: customers,
    loading,
    error,
    loadMore,
    refresh,
    pagination
  } = useAdminCustomers({
    search: searchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  // Refresh data when search or status filter changes
  useEffect(() => {
    refresh();
  }, [searchQuery, statusFilter, refresh]);

  const handleRefresh = () => {
    refresh();
  };

  const handleLoadMore = () => {
    if (!loading && pagination.hasMore) {
      loadMore();
    }
  };

  // Filter + Search
  const filteredCustomers = useMemo(() => {
    let filtered = [...customers];

    if (statusFilter !== 'all') filtered = filtered.filter(c => c.status === statusFilter);
    if (membershipFilter !== 'all') filtered = filtered.filter(c => c.membershipStatus === membershipFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [customers, statusFilter, membershipFilter, searchQuery]);

  const getStatusDotStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.statusDotActive;
      case 'inactive': return styles.statusDotInactive;
      case 'blocked': return styles.statusDotBlocked;
      default: return styles.statusDotInactive;
    }
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => navigation.navigate('AdminCustomerDetails', { customerId: item.id })}
    >
      <View style={styles.customerHeader}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.profileImage, { backgroundColor: '#e5e7eb' }]} />
        )}
        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, getStatusDotStyle(item.status)]} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.customerEmail}>{item.email}</Text>
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Loading customers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, phone or ID"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filterBarContainer}>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        <Text>{filteredCustomers.length} customers</Text>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text>Status</Text>
          <View style={styles.filterChipsContainer}>
            {['all', 'active', 'inactive', 'blocked'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status as any)}
                style={[
                  styles.filterChip,
                  statusFilter === status ? styles.filterChipActive : styles.filterChipInactive,
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  statusFilter === status ? styles.filterChipTextActive : styles.filterChipTextInactive
                ]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text>Membership</Text>
          <View style={styles.filterChipsContainer}>
            {['all', 'none', 'silver', 'gold', 'platinum'].map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMembershipFilter(m as any)}
                style={[
                  styles.filterChip,
                  membershipFilter === m ? styles.filterChipActive : styles.filterChipInactive,
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  membershipFilter === m ? styles.filterChipTextActive : styles.filterChipTextInactive
                ]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderCustomerItem}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text>No customers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminCustomersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  headerContainer: { backgroundColor: 'white', paddingTop: 16, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backButton: { position: 'absolute', left: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  searchContainer: { flexDirection: 'row', padding: 16, alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  searchInput: { flex: 1, marginRight: 8, color: '#111827' },
  filterBarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  filterButtonText: { color: '#2563EB', fontWeight: '500' },
  filtersPanel: { backgroundColor: 'white', padding: 16 },
  filterChipsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  filterChipActive: { backgroundColor: '#2563EB' },
  filterChipInactive: { backgroundColor: '#f3f4f6' },
  filterChipText: { fontSize: 12 },
  filterChipTextActive: { color: 'white' },
  filterChipTextInactive: { color: '#4b5563' },
  customerCard: { backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 12 },
  customerHeader: { flexDirection: 'row', marginBottom: 12 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  customerInfo: { flex: 1 },
  customerNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  statusDotActive: { backgroundColor: '#10b981' },
  statusDotInactive: { backgroundColor: '#6b7280' },
  statusDotBlocked: { backgroundColor: '#ef4444' },
  statusText: { fontSize: 12, color: '#6b7280', textTransform: 'capitalize' },
  customerEmail: { fontSize: 14, color: '#6b7280', marginBottom: 2 },
  customerPhone: { fontSize: 14, color: '#6b7280' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
});


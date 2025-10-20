import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { adminService } from '../../services';
import { handleApiError } from '../../utils/errorHandler';

// --- Type Definitions ---
type AdminCustomerListNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: 'active' | 'inactive' | 'blocked';
  totalBookings: number;
  totalSpent: number;
  membershipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  lastActive: string;
}

// --- Main Component ---
const AdminCustomerListScreen = () => {
  const navigation = useNavigation<AdminCustomerListNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load customers from backend
  const loadCustomers = async () => {
    try {
      setLoading(true);
      // Reuse admin users endpoint with role=customer
      const res = await adminService.getUsers({ role: 'customer', limit: 50 });
      // Backend returns { status: 'success', data: { users, pagination } }
      const apiUsers = (res as any)?.data?.users || [];

      const mapped: Customer[] = apiUsers.map((u: any) => ({
        id: u._id || u.id,
        name: u.name || 'Unknown',
        email: u.email || '',
        phone: u.phone || '',
        profileImage: u.profileImage?.url || '',
        status: (u.status === true || u.active === true) ? 'active' : (u.status || 'active'),
        totalBookings: u.totalBookings || 0,
        totalSpent: u.totalSpent || 0,
        membershipStatus: u.membershipStatus || 'none',
        joinDate: u.createdAt || '',
        lastActive: u.lastActive || '',
      }));

      setCustomers(mapped);
      setFilteredCustomers(mapped);
    } catch (error) {
      handleApiError(error, 'LoadCustomers');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const applyFilters = useCallback(() => {
    let result = [...customers];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    }
    
    setFilteredCustomers(result);
  }, [customers, searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

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
        <Image 
          source={{ uri: item.profileImage }}
          style={styles.profileImage}
        />
        <View style={styles.customerInfo}>
          <View style={styles.customerNameRow}>
            <Text style={styles.customerName}>{item.name}</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, getStatusDotStyle(item.status)]} />
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          <Text style={styles.customerEmail}>{item.email}</Text>
        </View>
      </View>
      {item.membershipStatus !== 'none' && (
        <View style={styles.membershipBadge}>
            <FontAwesome5 name="crown" size={10} color="#F59E0B" />
            <Text style={styles.membershipBadgeText}>{item.membershipStatus}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Corrected Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2563EB']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No customers found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AdminCustomerListScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Ensures notch area is also white
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  // 2. Updated Header Style
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the title
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    flexGrow: 1, // Ensures empty list component can be centered
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  customerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: { backgroundColor: '#10B981' },
  statusDotInactive: { backgroundColor: '#F59E0B' },
  statusDotBlocked: { backgroundColor: '#EF4444' },
  statusText: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  customerEmail: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  membershipBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipBadgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1, // Takes up remaining space
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
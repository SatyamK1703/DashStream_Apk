import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminCustomersNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

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
  addresses: number;
  vehicles: number;
}

const AdminCustomersScreen = () => {
  const navigation = useNavigation<AdminCustomersNavigationProp>();
  const [showFilters, setShowFilters] = useState(false);
const [membershipFilter, setMembershipFilter] = useState<'all' | 'none' | 'silver' | 'gold' | 'platinum'>('all');

const resetFilters = () => {
  setStatusFilter('all');
  setMembershipFilter('all');
  setSortBy('date');
  setSortOrder('desc');
  setSearchQuery('');
};
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'bookings' | 'spent' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: 'CUST-001',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+91 9876543210',
      profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
      status: 'active',
      totalBookings: 15,
      totalSpent: 12500,
      membershipStatus: 'gold',
      joinDate: '2023-01-15',
      lastActive: '2023-06-10',
      addresses: 2,
      vehicles: 1
    },
    {
      id: 'CUST-002',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 9876543211',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      status: 'active',
      totalBookings: 8,
      totalSpent: 6800,
      membershipStatus: 'silver',
      joinDate: '2023-02-20',
      lastActive: '2023-06-08',
      addresses: 1,
      vehicles: 2
    },
    {
      id: 'CUST-003',
      name: 'Ananya Patel',
      email: 'ananya.patel@example.com',
      phone: '+91 9876543212',
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      status: 'inactive',
      totalBookings: 3,
      totalSpent: 2200,
      membershipStatus: 'none',
      joinDate: '2023-03-10',
      lastActive: '2023-04-15',
      addresses: 1,
      vehicles: 1
    },
    {
      id: 'CUST-004',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 9876543213',
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      status: 'blocked',
      totalBookings: 1,
      totalSpent: 800,
      membershipStatus: 'none',
      joinDate: '2023-03-25',
      lastActive: '2023-03-28',
      addresses: 1,
      vehicles: 1
    },
    {
      id: 'CUST-005',
      name: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      phone: '+91 9876543214',
      profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      status: 'active',
      totalBookings: 22,
      totalSpent: 18500,
      membershipStatus: 'platinum',
      joinDate: '2022-11-05',
      lastActive: '2023-06-12',
      addresses: 3,
      vehicles: 2
    },
    {
      id: 'CUST-006',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '+91 9876543215',
      profileImage: 'https://randomuser.me/api/portraits/men/6.jpg',
      status: 'active',
      totalBookings: 12,
      totalSpent: 9800,
      membershipStatus: 'silver',
      joinDate: '2023-01-30',
      lastActive: '2023-06-05',
      addresses: 2,
      vehicles: 1
    },
    {
      id: 'CUST-007',
      name: 'Kavita Joshi',
      email: 'kavita.joshi@example.com',
      phone: '+91 9876543216',
      profileImage: 'https://randomuser.me/api/portraits/women/7.jpg',
      status: 'inactive',
      totalBookings: 5,
      totalSpent: 4200,
      membershipStatus: 'none',
      joinDate: '2023-02-15',
      lastActive: '2023-05-01',
      addresses: 1,
      vehicles: 1
    },
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, sortBy, sortOrder, customers]);

  const applyFilters = () => {
    let filtered = [...customers];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.id.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'bookings':
          comparison = a.totalBookings - b.totalBookings;
          break;
        case 'spent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'date':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCustomers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setRefreshing(false);
    }, 1500);
  };

  const handleToggleSort = (newSortBy: 'name' | 'bookings' | 'spent' | 'date') => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const handleToggleStatus = (customerId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    Alert.alert(
      'Change Customer Status',
      `Are you sure you want to change this customer's status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update customer status
            const updatedCustomers = customers.map(customer => {
              if (customer.id === customerId) {
                return { ...customer, status: newStatus };
              }
              return customer;
            });
            
            setCustomers(updatedCustomers);
          }
        }
      ]
    );
  };
  const getSortLabel = (sortBy: string) => {
    switch (sortBy) {
      case 'joinDate':
        return 'Date Joined';
      case 'lastActive':
        return 'Last Active';
      case 'totalBookings':
        return 'Bookings';
      case 'totalSpent':
        return 'Amount Spent';
      case 'name':
        return 'Name';
      default:
        return 'Date Joined';
    }
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
          <Text style={styles.customerPhone}>{item.phone}</Text>
        </View>
      </View>
      
      <View style={styles.customerMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ID</Text>
          <Text style={styles.metricValue}>{item.id}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Joined</Text>
          <Text style={styles.metricValue}>
            {new Date(item.joinDate).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Bookings</Text>
          <Text style={styles.metricValue}>{item.totalBookings}</Text>
        </View>
        
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Spent</Text>
          <Text style={styles.metricValue}>₹{item.totalSpent}</Text>
        </View>
      </View>
      
      {item.membershipStatus !== 'none' && (
        <View style={styles.membershipBadge}>
          <View style={styles.membershipBadgeContent}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.membershipBadgeText}>
              {item.membershipStatus}
            </Text>
          </View>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Customers</Text>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, phone or ID"
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
      
      {/* Filter Bar */}
      <View style={styles.filterBarContainer}>
        <View style={styles.filterBarLeft}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={18} color="#4B5563" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'} 
              size={18} 
              color="#4B5563" 
            />
            <Text style={styles.sortButtonText}>
              Sort: {getSortLabel(sortBy)}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.customerCount}>{filteredCustomers.length} customers</Text>
      </View>
      
      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <Text style={styles.filtersPanelTitle}>Filter Options</Text>
          
          {/* Status Filter */}
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterChipsContainer}>
            {['all', 'active', 'inactive', 'blocked'].map((status) => (
              <TouchableOpacity 
                key={status}
                style={[
                  styles.filterChip,
                  statusFilter === status ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setStatusFilter(status as any)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    statusFilter === status ? styles.filterChipTextActive : styles.filterChipTextInactive
                  ]}
                >
                  {status === 'all' ? 'All Status' : status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Membership Filter */}
          <Text style={styles.filterSectionTitle}>Membership</Text>
          <View style={styles.filterChipsContainer}>
            {['all', 'none', 'silver', 'gold', 'platinum'].map((membership) => (
              <TouchableOpacity 
                key={membership}
                style={[
                  styles.filterChip,
                  membershipFilter === membership ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setMembershipFilter(membership as any)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    membershipFilter === membership ? styles.filterChipTextActive : styles.filterChipTextInactive
                  ]}
                >
                  {membership === 'all' ? 'All Memberships' : 
                   membership === 'none' ? 'No Membership' : membership}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Sort By */}
          <Text style={styles.filterSectionTitle}>Sort By</Text>
          <View style={styles.filterChipsContainer}>
            {[
              { id: 'name', label: 'Name' },
              { id: 'joinDate', label: 'Date Joined' },
              { id: 'lastActive', label: 'Last Active' },
              { id: 'totalBookings', label: 'Bookings' },
              { id: 'totalSpent', label: 'Amount Spent' }
            ].map((sort) => (
              <TouchableOpacity 
                key={sort.id}
                style={[
                  styles.filterChip,
                  sortBy === sort.id ? styles.filterChipActive : styles.filterChipInactive
                ]}
                onPress={() => setSortBy(sort.id as any)}
              >
                <Text 
                  style={[
                    styles.filterChipText,
                    sortBy === sort.id ? styles.filterChipTextActive : styles.filterChipTextInactive
                  ]}
                >
                  {sort.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Reset Button */}
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetFilters}
          >
            <Text style={styles.resetButtonText}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}
      
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
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No customers found</Text>
            <Text style={styles.emptySubText}>Try adjusting your filters</Text>
          </View>
        }
      />
    </View>
  );
};

export default AdminCustomersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  headerContainer: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#111827',
  },
  filterBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 4,
    color: '#4b5563',
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  sortButtonText: {
    marginLeft: 4,
    color: '#4b5563',
    fontSize: 14,
  },
  customerCount: {
    color: '#6b7280',
    fontSize: 14,
  },
  filtersPanel: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersPanelTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#111827',
  },
  filterSectionTitle: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563eb',
  },
  filterChipInactive: {
    backgroundColor: '#f3f4f6',
  },
  filterChipText: {
    fontSize: 12,
  },
  filterChipTextActive: {
    color: 'white',
  },
  filterChipTextInactive: {
    color: '#4b5563',
  },
  resetButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  resetButtonText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  customerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusDotActive: {
    backgroundColor: '#10b981',
  },
  statusDotInactive: {
    backgroundColor: '#6b7280',
  },
  statusDotBlocked: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  customerEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
  },
  customerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  membershipBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membershipBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#92400e',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';


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

const AdminCustomerListScreen = () => {
  const navigation = useNavigation<AdminCustomerListNavigationProp>();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'blocked'>('all');
  const [membershipFilter, setMembershipFilter] = useState<'all' | 'none' | 'silver' | 'gold' | 'platinum'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'joinDate' | 'lastActive' | 'totalBookings' | 'totalSpent'>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock customer data
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
      lastActive: '2023-06-10'
    },
    {
      id: 'CUST-002',
      name: 'Rahul Verma',
      email: 'rahul.verma@example.com',
      phone: '+91 9876543211',
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      status: 'active',
      totalBookings: 8,
      totalSpent: 7800,
      membershipStatus: 'silver',
      joinDate: '2023-02-20',
      lastActive: '2023-06-05'
    },
    {
      id: 'CUST-003',
      name: 'Ananya Patel',
      email: 'ananya.patel@example.com',
      phone: '+91 9876543212',
      profileImage: 'https://randomuser.me/api/portraits/women/2.jpg',
      status: 'inactive',
      totalBookings: 3,
      totalSpent: 2500,
      membershipStatus: 'none',
      joinDate: '2023-03-10',
      lastActive: '2023-04-15'
    },
    {
      id: 'CUST-004',
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      phone: '+91 9876543213',
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      status: 'blocked',
      totalBookings: 1,
      totalSpent: 999,
      membershipStatus: 'none',
      joinDate: '2023-03-25',
      lastActive: '2023-03-30'
    },
    {
      id: 'CUST-005',
      name: 'Neha Gupta',
      email: 'neha.gupta@example.com',
      phone: '+91 9876543214',
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      status: 'active',
      totalBookings: 20,
      totalSpent: 18500,
      membershipStatus: 'platinum',
      joinDate: '2022-12-05',
      lastActive: '2023-06-12'
    },
    {
      id: 'CUST-006',
      name: 'Arjun Reddy',
      email: 'arjun.reddy@example.com',
      phone: '+91 9876543215',
      profileImage: 'https://randomuser.me/api/portraits/men/3.jpg',
      status: 'active',
      totalBookings: 12,
      totalSpent: 10800,
      membershipStatus: 'gold',
      joinDate: '2023-01-30',
      lastActive: '2023-06-08'
    },
    {
      id: 'CUST-007',
      name: 'Kavita Desai',
      email: 'kavita.desai@example.com',
      phone: '+91 9876543216',
      profileImage: 'https://randomuser.me/api/portraits/women/4.jpg',
      status: 'active',
      totalBookings: 6,
      totalSpent: 5400,
      membershipStatus: 'silver',
      joinDate: '2023-02-15',
      lastActive: '2023-05-20'
    },
    {
      id: 'CUST-008',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@example.com',
      phone: '+91 9876543217',
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      status: 'inactive',
      totalBookings: 2,
      totalSpent: 1800,
      membershipStatus: 'none',
      joinDate: '2023-04-05',
      lastActive: '2023-04-20'
    },
    {
      id: 'CUST-009',
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      phone: '+91 9876543218',
      profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      status: 'active',
      totalBookings: 10,
      totalSpent: 9200,
      membershipStatus: 'gold',
      joinDate: '2023-01-20',
      lastActive: '2023-06-01'
    },
    {
      id: 'CUST-010',
      name: 'Sanjay Mehta',
      email: 'sanjay.mehta@example.com',
      phone: '+91 9876543219',
      profileImage: 'https://randomuser.me/api/portraits/men/5.jpg',
      status: 'active',
      totalBookings: 18,
      totalSpent: 16500,
      membershipStatus: 'platinum',
      joinDate: '2022-11-15',
      lastActive: '2023-06-11'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, membershipFilter, sortBy, sortOrder, customers]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      setRefreshing(false);
    }, 1500);
  };

  const applyFilters = () => {
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
    
    if (statusFilter !== 'all') {
      result = result.filter(customer => customer.status === statusFilter);
    }
    
    if (membershipFilter !== 'all') {
      result = result.filter(customer => customer.membershipStatus === membershipFilter);
    }
    
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'joinDate':
          comparison = new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime();
          break;
        case 'lastActive':
          comparison = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
          break;
        case 'totalBookings':
          comparison = a.totalBookings - b.totalBookings;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setFilteredCustomers(result);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setMembershipFilter('all');
    setSortBy('joinDate');
    setSortOrder('desc');
    setShowFilters(false);
  };

  const getStatusDotStyle = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusDotActive;
      case 'inactive':
        return styles.statusDotInactive;
      case 'blocked':
        return styles.statusDotBlocked;
      default:
        return styles.statusDotInactive;
    }
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

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity 
      style={styles.customerCard}
      onPress={() => navigation.navigate('CustomerDetails', { customerId: item.id })}
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
            <FontAwesome5 name="crown" size={10} color="#F59E0B" />
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
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateCustomer')}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
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

export default AdminCustomerListScreen;

const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // Loading State
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

  // Header
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Search Bar
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#1F2937',
  },

  // Filter Bar
  filterBarContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterBarLeft: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  filterButtonText: {
    color: '#4B5563',
    marginLeft: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButtonText: {
    color: '#4B5563',
    marginLeft: 4,
  },
  customerCount: {
    color: '#6B7280',
    fontSize: 14,
  },

  // Filters Panel
  filtersPanel: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
  },
  filtersPanelTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterSectionTitle: {
    color: '#4B5563',
    marginBottom: 8,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterChipInactive: {
    backgroundColor: '#F3F4F6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterChipTextActive: {
    color: 'white',
  },
  filterChipTextInactive: {
    color: '#4B5563',
  },
  resetButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#374151',
    fontWeight: '500',
  },

  // Customer List
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },

  // Customer Item
  customerCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 12,
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
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotInactive: {
    backgroundColor: '#F59E0B',
  },
  statusDotBlocked: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  customerEmail: {
    color: '#6B7280',
    fontSize: 14,
  },
  customerPhone: {
    color: '#6B7280',
    fontSize: 14,
  },
  customerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  metricValue: {
    color: '#1F2937',
    fontWeight: '500',
  },
  membershipBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: '#FEF3C7',
  },
  membershipBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

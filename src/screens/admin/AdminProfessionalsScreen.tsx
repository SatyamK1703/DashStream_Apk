import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAdminProfessionals, useAdminProfessionalActions } from '../../hooks/useAdmin';


// --- Helper Hook for Debouncing ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

// --- Type Definitions ---
type AdminProfessionalsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Professional {
  id: string;
  name: string;
  phone: string;
  email:string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  skills: string[];
  joinedDate: string;
  lastActive: string;
  profileImage?: string;
  isVerified: boolean;
}

// --- Memoized Card Component for Performance ---
const ProfessionalCard = React.memo(({ item, navigation, getStatusStyles }) => {
  const lastActiveDate = new Date(item.lastActive);
  const formattedLastActive = `${lastActiveDate.toLocaleDateString()} ${lastActiveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const statusStyles = getStatusStyles(item.status);

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: item.id })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            {item.profileImage ? (
              <Image source={{ uri: item.profileImage }} style={styles.cardAvatar} />
            ) : (
              <View style={[styles.cardAvatar, styles.cardAvatarPlaceholder]}>
                <Text style={styles.cardAvatarText}>{item.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <View style={styles.cardNameContainer}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                {item.isVerified && <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={styles.cardVerifiedIcon} />}
              </View>
              <Text style={styles.cardId}>{item.id}</Text>
            </View>
          </View>
          <View style={[styles.cardStatusBadge, statusStyles.badge]}>
            <Text style={[styles.cardStatusText, statusStyles.text]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardStatsContainer}>
            <View style={styles.cardStatItem}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.cardStatText}>{(item.rating || 0).toFixed(1)}</Text>
            </View>
            <View style={styles.cardStatItem}>
              <MaterialIcons name="work" size={16} color="#6B7280" />
              <Text style={styles.cardStatText}>{item.totalJobs || 0} jobs</Text>
            </View>
        </View>
        <View style={styles.cardFooter}>
            <Text style={styles.cardLastActive}>Last active: {formattedLastActive}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// --- Main Screen Component ---
const AdminProfessionalsScreen = () => {
  const navigation = useNavigation<AdminProfessionalsScreenNavigationProp>();

  // Filtering and Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // API hooks
  const {
    data: professionals = [],
    isLoading: loading,
    error,
    execute: fetchProfessionals,
    hasMore,
    loadMore,
    isLoadingMore,
  } = useAdminProfessionals({
    search: debouncedSearchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 20,
  });

  const { updateVerificationStatus } = useAdminProfessionalActions();

  useEffect(() => {
    fetchProfessionals();
  }, [debouncedSearchQuery, statusFilter]);

  const onRefresh = useCallback(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  const filteredProfessionals = useMemo(() => {
    let filtered = [...professionals];

    // Sort the professionals locally since API provides filtered data based on search/status
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': 
          comparison = a.name.localeCompare(b.name); 
          break;
        case 'rating': 
          comparison = (b.rating || 0) - (a.rating || 0); 
          break;
        case 'jobs': 
          comparison = (b.totalJobs || 0) - (a.totalJobs || 0); 
          break;
        case 'date': 
          comparison = new Date(b.joinedDate || 0).getTime() - new Date(a.joinedDate || 0).getTime(); 
          break;
        default: 
          comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [professionals, sortBy, sortOrder]);

  const handleSortChange = (sortField: string) => {
    if (sortBy === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(sortField);
      setSortOrder('asc');
    }
  };
  
  const getStatusStyles = (status: Professional['status']) => {
    switch (status) {
      case 'active': return { badge: styles.statusBadgeActive, text: styles.statusTextActive };
      case 'inactive': return { badge: styles.statusBadgeInactive, text: styles.statusTextInactive };
      case 'pending': return { badge: styles.statusBadgePending, text: styles.statusTextPending };
      case 'rejected': return { badge: styles.statusBadgeRejected, text: styles.statusTextRejected };
      default: return { badge: styles.statusBadgeInactive, text: styles.statusTextInactive };
    }
  };

  const renderSortButton = (field: string, label: string) => (
    <TouchableOpacity style={styles.sortButton} onPress={() => handleSortChange(field)}>
      <Text style={[styles.sortText, sortBy === field && styles.sortTextActive]}>{label}</Text>
      {sortBy === field && (
        <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#2563EB" style={styles.sortIcon} />
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading professionals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professionals</Text>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.controlsContainer}>
        <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search by name, ID, phone..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#6B7280"
            />
            {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            ) : null}
        </View>
        <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['all', 'active', 'inactive', 'pending', 'rejected'].map(status => (
                <TouchableOpacity
                key={status}
                style={[styles.filterButton, statusFilter === status ? styles.filterButtonActive : styles.filterButtonInactive]}
                onPress={() => setStatusFilter(status)}
                >
                <Text style={[styles.filterText, statusFilter === status ? styles.filterTextActive : styles.filterTextInactive, {textTransform: 'capitalize'}]}>{status}</Text>
                </TouchableOpacity>
            ))}
            </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredProfessionals}
        renderItem={({ item }) => (
            <ProfessionalCard
                item={item}
                navigation={navigation}
                getStatusStyles={getStatusStyles}
            />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#2563EB']} tintColor="#2563EB" />}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <MaterialIcons name="person-search" size={60} color="#9CA3AF" />
            <Text style={styles.emptyListText}>No Professionals Found</Text>
            <Text style={styles.emptyListSubText}>Try adjusting your search or filters.</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AdminCreateProfessional')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Updated Styles ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white', // Changed to white for seamless look
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4B5563',
    },
    // New White Header
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerTitle: {
        color: '#1F2937', // Black color for text
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerButton: {
        padding: 4,
    },
    // Container for Search and Filters
    controlsContainer: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    // New Search Bar Style
    searchBarContainer: {
        backgroundColor: '#F3F4F6', // Light grey background
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: '#1F2937',
        fontSize: 16,
    },
    filterBar: {
        marginTop: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#2563EB',
    },
    filterButtonInactive: {
        backgroundColor: '#E5E7EB',
    },
    filterText: {
        fontWeight: '600',
        fontSize: 14,
    },
    filterTextActive: {
        color: 'white',
    },
    filterTextInactive: {
        color: '#374151',
    },
    listContentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 80, // Space for FAB
        backgroundColor: '#F9FAFB' // List background
    },
    emptyListContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        backgroundColor: '#F9FAFB'
    },
    emptyListText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4B5563',
        marginTop: 16,
    },
    emptyListSubText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
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
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        elevation: 1,
        shadowColor: '#4B5563',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardContent: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    cardAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    cardAvatarPlaceholder: {
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardAvatarText: {
        color: '#4B5563',
        fontWeight: 'bold',
        fontSize: 20,
    },
    cardInfo: {
        marginLeft: 12,
        flex: 1,
    },
    cardNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        flexShrink: 1,
    },
    cardVerifiedIcon: {
        marginLeft: 6,
    },
    cardId: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    cardStatusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start'
    },
    statusBadgeActive: { backgroundColor: '#D1FAE5' },
    statusBadgeInactive: { backgroundColor: '#F3F4F6' },
    statusBadgePending: { backgroundColor: '#FEF3C7' },
    statusBadgeRejected: { backgroundColor: '#FEE2E2' },
    cardStatusText: {
        fontSize: 12,
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    statusTextActive: { color: '#065F46' },
    statusTextInactive: { color: '#374151' },
    statusTextPending: { color: '#92400E' },
    statusTextRejected: { color: '#991B1B' },
    cardStatsContainer: {
        marginTop: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cardStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 8,
    },
    cardStatText: {
        color: '#374151',
        marginLeft: 6,
        fontSize: 13,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        paddingTop: 12,
        marginTop: 8,
    },
    cardLastActive: {
        fontSize: 12,
        color: '#6B7280',
    },
});

export default AdminProfessionalsScreen;
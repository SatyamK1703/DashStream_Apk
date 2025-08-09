import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator,
  RefreshControl, Image, Alert, ScrollView,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { mockProfessionals } from '../../constants/data/AdminProfessionalScreen';


type AdminProfessionalsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;


interface Professional {
  id: string;
  name: string;
  phone: string;
  email: string;
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

const AdminProfessionalsScreen = () => {
  const navigation = useNavigation<AdminProfessionalsScreenNavigationProp>();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfessionals(mockProfessionals);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [searchQuery, statusFilter, sortBy, sortOrder, professionals]);

  const applyFiltersAndSort = () => {
    let filtered = [...professionals];
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pro => pro.status === statusFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        pro =>
          pro.name.toLowerCase().includes(query) ||
          pro.id.toLowerCase().includes(query) ||
          pro.phone.includes(query) ||
          pro.email.toLowerCase().includes(query)
      );
    }
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'rating': comparison = a.rating - b.rating; break;
        case 'jobs': comparison = a.totalJobs - b.totalJobs; break;
        case 'earnings':
          const aEarnings = parseFloat(a.totalEarnings.replace(/[^\d.]/g, ''));
          const bEarnings = parseFloat(b.totalEarnings.replace(/[^\d.]/g, ''));
          comparison = aEarnings - bEarnings;
          break;
        case 'date': comparison = new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime(); break;
        default: comparison = a.name.localeCompare(b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    setFilteredProfessionals(filtered);
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setProfessionals(mockProfessionals);
      setRefreshing(false);
    }, 1500);
  }, []);

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

  const renderProfessionalItem = ({ item }: { item: Professional }) => {
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
                  <Text style={styles.cardName}>{item.name}</Text>
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
            <View style={styles.cardStatItem}><Ionicons name="star" size={16} color="#F59E0B" /><Text style={styles.cardStatText}>{item.rating.toFixed(1)}</Text></View>
            <View style={styles.cardStatItem}><MaterialIcons name="work" size={16} color="#6B7280" /><Text style={styles.cardStatText}>{item.totalJobs} jobs</Text></View>
            <View style={styles.cardStatItem}><MaterialIcons name="attach-money" size={16} color="#6B7280" /><Text style={styles.cardStatText}>{item.totalEarnings}</Text></View>
            <View style={styles.cardStatItem}><Ionicons name="calendar" size={16} color="#6B7280" /><Text style={styles.cardStatText}>Joined {new Date(item.joinedDate).toLocaleDateString()}</Text></View>
          </View>

          <View style={styles.cardSkillsContainer}>
            <Text style={styles.cardSkillsLabel}>Skills:</Text>
            <View style={styles.cardSkillsWrapper}>
              {item.skills.map((skill, index) => (
                <View key={index} style={styles.cardSkillBadge}><Text style={styles.cardSkillText}>{skill}</Text></View>
              ))}
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardLastActive}>Last active: {formattedLastActive}</Text>
            <View style={styles.cardActionsContainer}>
              {/* Action buttons would be rendered here */}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSortButton = (field: string, label: string) => (
    <TouchableOpacity style={styles.sortButton} onPress={() => handleSortChange(field)}>
      <Text style={[styles.sortText, sortBy === field && styles.sortTextActive]}>{label}</Text>
      {sortBy === field && (
        <Ionicons name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} size={16} color="#2563EB" style={styles.sortIcon} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading professionals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Professionals</Text>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, phone or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ) : null}
        </View>
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
      
      <View style={styles.sortBar}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderSortButton('name', 'Name')}
          {renderSortButton('rating', 'Rating')}
          {renderSortButton('jobs', 'Jobs')}
          {renderSortButton('earnings', 'Earnings')}
          {renderSortButton('date', 'Join Date')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProfessionals}
        renderItem={renderProfessionalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} tintColor="#2563EB" />}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <MaterialIcons name="person-search" size={48} color="#9CA3AF" />
            <Text style={styles.emptyListText}>No professionals found</Text>
            <Text style={styles.emptyListSubText}>Try adjusting your filters</Text>
          </View>
        }
      />
      
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddProfessional')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default AdminProfessionalsScreen;



 const styles = StyleSheet.create({
  // Main Container & Loading
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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

  // Header
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 9999,
  },

  // Search Bar
  searchBarContainer: {
    marginTop: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#1F2937',
    fontSize: 16
  },
  clearSearchButton: {},

  // Filters & Sorting
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonInactive: {
    backgroundColor: '#F3F4F6',
  },
  filterText: {
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  filterTextInactive: {
    color: '#374151',
  },
  sortBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  sortLabel: {
    color: '#4B5563',
    marginRight: 8,
    alignSelf: 'center'
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  sortText: {
    color: '#374151',
  },
  sortTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  sortIcon: {
    marginLeft: 2,
  },

  // List & List Items
  listContentContainer: {
    padding: 16,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyListText: {
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyListSubText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#2563EB',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  // Professional Card
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  cardAvatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  cardAvatarText: {
    color: '#4B5563',
    fontWeight: 'bold',
    fontSize: 18,
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
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardVerifiedIcon: {
    marginLeft: 4,
  },
  cardId: {
    color: '#6B7280',
    fontSize: 14,
  },
  cardStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
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
    marginTop: 12,
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
    marginLeft: 4,
  },
  cardSkillsContainer: {
    marginTop: 8,
  },
  cardSkillsLabel: {
    color: '#4B5563',
    fontSize: 14,
    marginBottom: 4,
  },
  cardSkillsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cardSkillBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  cardSkillText: {
    color: '#374151',
    fontSize: 12,
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLastActive: {
    color: '#6B7280',
    fontSize: 12,
  },
  cardActionsContainer: {
    flexDirection: 'row',
  },
  cardActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardVerifyButton: {
    backgroundColor: '#2563EB',
  },
  cardDeactivateButton: {
    backgroundColor: '#EF4444',
  },
  cardActivateButton: {
    backgroundColor: '#10B981',
  },
  cardActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

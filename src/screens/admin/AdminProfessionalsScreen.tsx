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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAdminProfessionals } from '../../hooks/useAdmin';
import { adminService } from '../../services/adminService';

// --- Debounce Hook ---
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Types ---
type AdminProfessionalsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Professional {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending' | 'rejected';
  skills?: string[];
  joinedDate?: string;
  lastActive?: string;
  profileImage?: string;
  rating?: number;
  totalJobs?: number;
  completedJobs?: number;
  cancelledJobs?: number;
  totalEarnings?: string;
  isVerified?: boolean;
}

// --- Professional Card ---
const ProfessionalCard = React.memo(({ item, navigation, getStatusStyles }: any) => {
  const lastActiveDate = new Date(item.lastActive || Date.now());
  const formattedLastActive = `${lastActiveDate.toLocaleDateString()} ${lastActiveDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const statusStyles = getStatusStyles(item.status || 'inactive');

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
                <Text style={styles.cardAvatarText}>{(item.name || 'U').charAt(0)}</Text>
              </View>
            )}
            <View style={styles.cardInfo}>
              <View style={styles.cardNameContainer}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name || 'Unknown Professional'}</Text>
                {item.isVerified && <Ionicons name="checkmark-circle" size={16} color="#2563EB" style={styles.cardVerifiedIcon} />}
              </View>
              <Text style={styles.cardId}>{item.id || 'N/A'}</Text>
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

// --- Main Screen ---
const AdminProfessionalsScreen = () => {
  const navigation = useNavigation<AdminProfessionalsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending' | 'rejected'>('all');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use the admin professionals hook
  const {
    data: professionals = [],
    loading,
    error,
    refresh: fetchProfessionals,
    loadMore
  } = useAdminProfessionals({
    search: debouncedSearchQuery || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const onRefresh = useCallback(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  // Since filtering is handled by the API hook, we can use professionals directly
  const filteredProfessionals = professionals;

  const getStatusStyles = (status: Professional['status']) => {
    switch (status) {
      case 'active': return { badge: styles.statusBadgeActive, text: styles.statusTextActive };
      case 'inactive': return { badge: styles.statusBadgeInactive, text: styles.statusTextInactive };
      case 'pending': return { badge: styles.statusBadgePending, text: styles.statusTextPending };
      case 'rejected': return { badge: styles.statusBadgeRejected, text: styles.statusTextRejected };
      default: return { badge: styles.statusBadgeInactive, text: styles.statusTextInactive };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading professionals...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.loadingText}>Failed to load professionals</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#2563EB', padding: 12, borderRadius: 8, marginTop: 16 }}
          onPress={fetchProfessionals}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
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
        <View style={{ width: 24 }} /> {/* placeholder for spacing */}
      </View>

      {/* Search + Filters */}
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
                onPress={() => setStatusFilter(status as any)}
              >
                <Text style={[styles.filterText, statusFilter === status ? styles.filterTextActive : styles.filterTextInactive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={filteredProfessionals}
        renderItem={({ item }) => (
          <ProfessionalCard item={item} navigation={navigation} getStatusStyles={getStatusStyles} />
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          <View style={styles.emptyListContainer}>
            <MaterialIcons name="person-search" size={60} color="#9CA3AF" />
            <Text style={styles.emptyListText}>No Professionals Found</Text>
            <Text style={styles.emptyListSubText}>Try adjusting your search or filters.</Text>
          </View>
        }
      />
      <TouchableOpacity 
  style={styles.fab} 
  onPress={() => navigation.navigate('AdminCreateProfessional')}
>
  <Ionicons name="add" size={28} color="white" />
</TouchableOpacity>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#4B5563' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  headerButton: { padding: 4 },
  controlsContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, height: 44 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },
  filterBar: { marginTop: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterButtonActive: { backgroundColor: '#2563EB' },
  filterButtonInactive: { backgroundColor: '#E5E7EB' },
  filterText: { fontWeight: '600', fontSize: 14 },
  filterTextActive: { color: 'white' },
  filterTextInactive: { color: '#374151' },
  listContentContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  emptyListContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyListText: { fontSize: 18, fontWeight: '600', color: '#4B5563', marginTop: 16 },
  emptyListSubText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  cardContainer: { backgroundColor: 'white', borderRadius: 12, marginBottom: 16, elevation: 1, shadowColor: '#4B5563', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  cardAvatar: { width: 48, height: 48, borderRadius: 24 },
  cardAvatarPlaceholder: { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  cardAvatarText: { color: '#4B5563', fontWeight: 'bold', fontSize: 20 },
  cardInfo: { marginLeft: 12, flex: 1 },
  cardNameContainer: { flexDirection: 'row', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', flexShrink: 1 },
  cardVerifiedIcon: { marginLeft: 6 },
  cardId: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusBadgeActive: { backgroundColor: '#D1FAE5' },
  statusBadgeInactive: { backgroundColor: '#F3F4F6' },
  statusBadgePending: { backgroundColor: '#FEF3C7' },
  statusBadgeRejected: { backgroundColor: '#FEE2E2' },
  cardStatusText: { fontSize: 12, fontWeight: '500', textTransform: 'capitalize' },
  statusTextActive: { color: '#065F46' },
  statusTextInactive: { color: '#374151' },
  statusTextPending: { color: '#92400E' },
  statusTextRejected: { color: '#991B1B' },
  cardStatsContainer: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' },
  cardStatItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 },
  cardStatText: { color: '#374151', marginLeft: 6, fontSize: 13 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 8 },
  cardLastActive: { fontSize: 12, color: '#6B7280' },
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
});

export default AdminProfessionalsScreen;


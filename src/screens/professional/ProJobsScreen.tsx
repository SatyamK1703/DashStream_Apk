import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, ScrollView, FlatList, RefreshControl, StyleSheet, Platform } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SCREEN_TEXTS } from '../../config/config';

import { colors } from '../../styles/colors';
// Import proper types and hooks
 
import { useProfessionalJobsScreen, useProfessionalJobActions } from '../../hooks/useProfessional';

import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProJobsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList, 'Jobs'>;

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled' | 'rejected';

const ProJobsScreen = () => {
  const navigation = useNavigation<ProJobsScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  // Use the professional jobs hook
  const {
    jobs,
    selectedStatus,
    setSelectedStatus,
    isLoading,
    error,
    refresh
  } = useProfessionalJobsScreen();

  // Job actions hook
  const { 
  } = useProfessionalJobActions();

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (job.customerName?.toLowerCase().includes(query) ||
           job.id?.toLowerCase().includes(query) ||
           job.address?.toLowerCase().includes(query));
  });
  
  const onRefresh = refresh;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return '#10B981';
      case 'ongoing': case 'in-progress': return '#2563EB';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  // --- Render Functions ---
  const renderFilterButton = (label: string, value: FilterStatus) => (
    <TouchableOpacity
      style={[styles.filterButton, selectedStatus === value && styles.activeFilterButton]}
      onPress={() => setSelectedStatus(value)}
    >
      <Text style={[styles.filterButtonText, selectedStatus === value && styles.activeFilterButtonText]}>
        {label}
      </Text>
      {selectedStatus === value && (
        <View style={styles.activeIndicator} />
      )}
    </TouchableOpacity>
  );



  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyTitle}>{SCREEN_TEXTS.ProJobs.noJobsFound}</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery.trim() ? `${SCREEN_TEXTS.ProJobs.noJobsMatching} "${searchQuery}".` : `You have no ${selectedStatus} jobs.`}
      </Text>
      {(searchQuery.trim() || selectedStatus !== 'all') && (
        <TouchableOpacity style={styles.clearFilterButton} onPress={() => { setSearchQuery(''); setSelectedStatus('all'); }}>
          <Text style={styles.clearFilterButtonText}>{SCREEN_TEXTS.ProJobs.clearFilters}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  if (isLoading && jobs.length === 0) {
    return <View style={styles.centeredScreen}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{SCREEN_TEXTS.ProJobs.myJobs}</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchIconContainer}>
            <Ionicons name="search" size={20} color={colors.gray400} />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={SCREEN_TEXTS.ProJobs.searchPlaceholder}
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.gray400} />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          {renderFilterButton(SCREEN_TEXTS.ProJobs.all, 'all')}
          {renderFilterButton(SCREEN_TEXTS.ProJobs.pending, 'pending')}
          {renderFilterButton(SCREEN_TEXTS.ProJobs.confirmed, 'confirmed')}
          {renderFilterButton(SCREEN_TEXTS.ProJobs.inProgress, 'in-progress')}
          {renderFilterButton(SCREEN_TEXTS.ProJobs.completed, 'completed')}
          {renderFilterButton(SCREEN_TEXTS.ProJobs.cancelled, 'cancelled')}
        </ScrollView>
      </View>

      <FlatList
        data={filteredJobs}
        keyExtractor={item => item.id}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            style={styles.jobCard}
            onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
          >
            <View style={styles.jobCardHeader}>
              <View style={styles.customerInfo}>
                <View style={styles.customerAvatar}>
                  <Ionicons name="person" size={20} color={colors.gray400} />
                </View>
                <View>
                  <Text style={styles.customerName}>{item.customerName}</Text>
                  <Text style={styles.jobTime}>
                    {new Date(item.date).toLocaleDateString()} at {item.time}
                  </Text>
                </View>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                  {item.status?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.jobCardBody}>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={colors.gray500} />
                <Text style={styles.jobAddress} numberOfLines={2}>{item.address}</Text>
              </View>
            </View>

            <View style={styles.jobCardFooter}>
              <View style={styles.amountContainer}>
                <Ionicons name="cash" size={16} color={colors.primary} />
                <Text style={styles.jobAmount}>₹{item.totalAmount}</Text>
              </View>
              <View style={styles.actionButton}>
                <Ionicons name="chevron-forward" size={16} color={colors.gray400} />
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.white, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 12, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: colors.gray800, marginBottom: 16 },
   searchContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     backgroundColor: colors.gray100,
     borderRadius: 12,
     paddingHorizontal: 16,
     marginBottom: 16,
     height: 48,
   },
   searchIconContainer: {
     marginRight: 12,
   },
   searchInput: { flex: 1, height: 48, color: colors.gray800, fontSize: 16 },
   clearButton: {
     marginLeft: 8,
     padding: 4,
   },
  filterScrollView: { marginHorizontal: -16, paddingHorizontal: 16 },
   filterButton: {
     paddingHorizontal: 20,
     paddingVertical: 10,
     borderRadius: 20,
     marginRight: 8,
     backgroundColor: colors.gray100,
     position: 'relative',
   },
   activeFilterButton: { backgroundColor: colors.primary },
   filterButtonText: { fontWeight: '500', color: colors.gray700, fontSize: 14 },
   activeFilterButtonText: { color: colors.white },
   activeIndicator: {
     position: 'absolute',
     bottom: 2,
     left: '50%',
     transform: [{ translateX: -2 }],
     width: 4,
     height: 4,
     borderRadius: 2,
     backgroundColor: colors.white,
   },
   listContentContainer: { padding: 16 },
   jobCard: {
     backgroundColor: colors.white,
     borderRadius: 16,
     padding: 20,
     marginBottom: 12,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   jobCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
   customerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
   customerAvatar: {
     width: 40,
     height: 40,
     borderRadius: 20,
     backgroundColor: colors.gray100,
     alignItems: 'center',
     justifyContent: 'center',
     marginRight: 12,
   },
   customerName: { fontSize: 16, fontWeight: '600', color: colors.gray800 },
   jobTime: { fontSize: 14, color: colors.gray500, marginTop: 2 },
   statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
   statusBadgeText: { fontSize: 12, fontWeight: '600' },
   jobCardBody: { marginBottom: 16 },
   locationRow: { flexDirection: 'row', alignItems: 'flex-start' },
   jobAddress: { flex: 1, marginLeft: 8, color: colors.gray600, lineHeight: 20 },
   jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
   amountContainer: { flexDirection: 'row', alignItems: 'center' },
   jobAmount: { fontSize: 18, fontWeight: '700', color: colors.primary, marginLeft: 4 },
   actionButton: {
     width: 32,
     height: 32,
     borderRadius: 16,
     backgroundColor: colors.gray100,
     alignItems: 'center',
     justifyContent: 'center',
   },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: colors.gray500, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: colors.gray500, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  clearFilterButton: { marginTop: 16, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 999 },
  clearFilterButtonText: { color: colors.white, fontWeight: '500' },
});

export default ProJobsScreen;

import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, ScrollView, FlatList, RefreshControl, StyleSheet, Platform } from 'react-native';
import { styles } from './ProJobsScreen.styles';
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
          <Ionicons name="search" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder={SCREEN_TEXTS.ProJobs.searchPlaceholder}
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
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
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              marginVertical: 8,
              marginHorizontal: 16,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.41,
            }}
            onPress={() => navigation.navigate('JobDetails', { jobId: item.id })}
          >
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937'}}>{item.customerName}</Text>
              <Text style={{color: getStatusColor(item.status), fontWeight: 'bold'}}>{item.status?.toUpperCase()}</Text>
            </View>
            <View style={{marginBottom: 8}}>
              <Text style={{color: '#6B7280'}}>{new Date(item.date).toLocaleDateString()} at {item.time}</Text>
            </View>
            <View style={{marginBottom: 8}}>
              <Text style={{color: '#6B7280'}}>{item.address}</Text>
            </View>
            <View style={{borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 8, alignItems: 'flex-end'}}>
              <Text style={{fontSize: 16, fontWeight: 'bold', color: '#1F2937'}}>₹{item.totalAmount}</Text>
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

export default ProJobsScreen;
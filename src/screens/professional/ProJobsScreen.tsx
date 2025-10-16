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

import { Booking } from '../../types/api';
import JobCard from '../../components/professional/JobCard';

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
    return job.customerName.toLowerCase().includes(query) ||
           job.id.toLowerCase().includes(query) ||
           job.address.toLowerCase().includes(query);
  });
  
  const onRefresh = refresh;

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
  
  if (isLoading) {
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
        renderItem={({ item }) => <JobCard job={item} />}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} colors={[colors.primary]} />}
      />
    </View>
  );
};



export default ProJobsScreen;

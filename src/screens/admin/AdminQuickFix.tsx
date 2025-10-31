import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../../components/admin/Header';
import SearchBar from '~/components/admin/SearchBar';
import SortControls from '~/components/admin/SortControls';
import QuickFixCard from '~/components/admin/QuickFixCard';
import EmptyState from '~/components/admin/EmptyState';
import AddEditQuickFixModal from '~/components/admin/AddEditQuickFixModal';

import {
  useAdminQuickFixes,
  useCreateQuickFix,
  useUpdateQuickFix,
  useDeleteQuickFix,
} from '../../hooks/useQuickFixes';

interface QuickFix {
  _id: string;
  label: string;
  image: string;
  isActive?: boolean;
}

const AdminQuickFixScreen = () => {
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'label' | 'date'>('label');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [formData, setFormData] = useState<QuickFix>({
    _id: '',
    label: '',
    image: '',
    isActive: true,
  });
  const [isEditing, setIsEditing] = useState(false);

  const { data: quickFixes, refresh: fetchQuickFixes, loading, error } = useAdminQuickFixes();
  const { execute: deleteQuickFix } = useDeleteQuickFix();
  const { execute: updateQuickFix } = useUpdateQuickFix();

  const filteredAndSortedQuickFixes = useMemo(() => {
    if (!quickFixes?.data) return [];
    let filtered = [...quickFixes.data];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => item.label.toLowerCase().includes(query));
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'label') {
        comparison = a.label.localeCompare(b.label);
      } else {
        // Assuming date is available in the quick fix data
        // comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [quickFixes, searchQuery, sortBy, sortOrder]);

  const onRefresh = useCallback(() => {
    fetchQuickFixes();
  }, [fetchQuickFixes]);

  const handleSortByChange = () => {
    setSortBy(sortBy === 'label' ? 'date' : 'label');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleAddQuickFix = () => {
    setIsEditing(false);
    setFormData({
      _id: '',
      label: '',
      image: '',
      isActive: true,
    });
    setShowAddEditModal(true);
  };

  const handleEditQuickFix = (quickFix: QuickFix) => {
    setIsEditing(true);
    setFormData(quickFix);
    setShowAddEditModal(true);
  };

  const handleDeleteQuickFix = (quickFixId: string) => {
    Alert.alert('Delete Quick Fix', 'Are you sure you want to delete this quick fix?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteQuickFix(quickFixId);
            fetchQuickFixes();
            Alert.alert('Success', 'Quick fix deleted successfully');
          } catch (error) {
            console.error('Delete quick fix error:', error);
            Alert.alert('Error', 'Failed to delete quick fix. Please try again.');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async (quickFixId: string, isActive: boolean) => {
    try {
      await updateQuickFix({ id: quickFixId, data: { isActive } });
      fetchQuickFixes();
    } catch (error) {
      console.error('Toggle quick fix status error:', error);
      Alert.alert('Error', 'Failed to update quick fix status. Please try again.');
    }
  };

  const handleModalSuccess = useCallback(() => {
    fetchQuickFixes();
  }, [fetchQuickFixes]);

  if (loading && !quickFixes?.data) {
    return (
      <SafeAreaView style={styles.container}>
        <Header onBack={() => navigation.goBack()} onAdd={handleAddQuickFix} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading quick fixes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Manage Quick Fixes" onBack={() => navigation.goBack()} onAdd={handleAddQuickFix} />

      <View style={styles.controlsContainer}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search quick fixes..."
        />

        <SortControls
          itemCount={filteredAndSortedQuickFixes.length}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={handleSortByChange}
          onSortOrderToggle={toggleSortOrder}
          placetext="No Quick Fixes Found"
        />
      </View>
      {filteredAndSortedQuickFixes.length === 0 ? (
        <EmptyState onAddService={handleAddQuickFix} title="No quick fixes found" />
      ) : (
        <FlatList
          data={filteredAndSortedQuickFixes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <QuickFixCard
              quickFix={item}
              onEdit={handleEditQuickFix}
              onDelete={handleDeleteQuickFix}
              onToggleStatus={handleToggleStatus}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} colors={['#007BFF']} />}
        />
      )}

      <AddEditQuickFixModal
        visible={showAddEditModal}
        isEditing={isEditing}
        formData={formData}
        onClose={() => setShowAddEditModal(false)}
        onSuccess={handleModalSuccess}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
  },
  controlsContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});

export default AdminQuickFixScreen;

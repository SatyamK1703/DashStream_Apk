import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { RootStackParamList } from '../../../app/routes/RootNavigator';   
import { useAuth } from '../../contexts/AuthContext';
import { VehicleService, Vehicle } from '../../services/vehicleService';

type VehicleListScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type FilterOption = 'all' | 'car' | 'motorcycle' | 'bicycle';

const VehicleListScreen = () => {
  const navigation = useNavigation<VehicleListScreenNavigationProp | RootStackParamList>();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterOption>('all');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  
  // Check if user is authenticated or a guest user
  useEffect(() => {
    if (!user || user.name === 'Guest User') {
      navigation.navigate('Login' as never );
    }
  }, [user, navigation]);

  // Fetch vehicles data
  const fetchVehicles = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await VehicleService.getMyVehicles();
      setVehicles(response.data.vehicles || []);
    } catch (err: any) {
      console.error('Error fetching vehicles:', err);
      setError(err.response?.data?.message || 'Failed to load vehicles');
      
      // Set fallback data
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load data on mount and when screen comes into focus
  useEffect(() => {
    if (user && user.name !== 'Guest User') {
      fetchVehicles();
    }
  }, [user, fetchVehicles]);

  useFocusEffect(
    useCallback(() => {
      if (user && user.name !== 'Guest User') {
        fetchVehicles(true);
      }
    }, [user, fetchVehicles])
  );

  // Handle refresh
  const onRefresh = useCallback(() => {
    fetchVehicles(true);
  }, [fetchVehicles]);

  // Filter vehicles based on search query and filter
  useEffect(() => {
    let filtered = vehicles;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(vehicle =>
        vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (vehicle.licensePlate && vehicle.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === filter);
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchQuery, filter]);

  const confirmDelete = (id: string) => {
    setVehicleToDelete(id);
    setDeleteModalVisible(true);
  };

  const deleteVehicle = useCallback(async () => {
    if (vehicleToDelete) {
      try {
        await VehicleService.deleteVehicle(vehicleToDelete);
        setVehicles(prev => prev.filter(v => v._id !== vehicleToDelete));
        setFilteredVehicles(prev => prev.filter(v => v._id !== vehicleToDelete));
        Alert.alert('Success', 'Vehicle deleted successfully');
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        Alert.alert('Error', 'Failed to delete vehicle');
      } finally {
        setDeleteModalVisible(false);
        setVehicleToDelete(null);
      }
    }
  }, [vehicleToDelete]);

  const getVehicleIcon = (type: Vehicle['type']) => {
    switch (type) {
      case 'car': return 'car-sport';
      case 'motorcycle': return 'bicycle';
      case 'bicycle': return 'bicycle';
      default: return 'car-sport';
    }
  };

  const renderVehicleItem = ({ item }: { item: Vehicle }) => (
    <TouchableOpacity 
      style={styles.vehicleCard}
      onPress={() => navigation.navigate('VehicleDetails', { vehicleId: item._id, vehicleData: item })}
    >
      <View style={styles.vehicleImageContainer}>
        {item.image?.url ? (
          <Image source={{ uri: item.image.url }} style={styles.vehicleImage} />
        ) : (
          <View style={styles.vehiclePlaceholder}>
            <Ionicons name={getVehicleIcon(item.type)} size={32} color="#9CA3AF" />
          </View>
        )}
      </View>
      
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>{item.brand} {item.model}</Text>
        <Text style={styles.vehicleYear}>{item.year}</Text>
        {item.licensePlate && (
          <Text style={styles.licensePlate}>{item.licensePlate}</Text>
        )}
        <View style={styles.vehicleTypeBadge}>
          <Ionicons 
            name={getVehicleIcon(item.type)} 
            size={16} 
            color="#4F46E5" 
          />
          <Text style={styles.vehicleTypeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Text style={styles.defaultText}>Default</Text>
          </View>
        )}
      </View>
      
      <View style={styles.vehicleActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddVehicle', { 
            vehicleId: item._id, 
            vehicleData: item 
          })}
        >
          <Ionicons name="pencil" size={20} color="#4F46E5" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => confirmDelete(item._id)}
        >
          <Ionicons name="trash" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="car-outline" size={64} color="#2563eb" />
      <Text style={styles.emptyStateTitle}>No vehicles added yet</Text>
      <Text style={styles.emptyStateText}>
        Add your first vehicle to get started
      </Text>
      <TouchableOpacity 
        style={styles.addFirstVehicleButton}
        onPress={() => navigation.navigate('AddVehicle')}
      >
        <Text style={styles.addFirstVehicleText}>Add Your First Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddVehicle')}
        >
          <Ionicons name="add" size={24} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by:</Text>
        <View style={styles.filterOptions}>
          {(['all', 'car', 'motorcycle', 'bicycle'] as FilterOption[]).map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.filterOption, filter === option && styles.filterOptionSelected]}
              onPress={() => setFilter(option)}
            >
              <Text style={[
                styles.filterOptionText,
                filter === option && styles.filterOptionTextSelected
              ]}>
                {option === 'all' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchVehicles()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading your vehicles...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4F46E5']}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Vehicle</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={deleteVehicle}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VehicleListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterOptionTextSelected: {
    color: '#4F46E5',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vehicleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  vehiclePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  vehicleYear: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  licensePlate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4F46E5',
    marginBottom: 8,
  },
  vehicleTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vehicleTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4F46E5',
    marginLeft: 4,
  },
  vehicleActions: {
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstVehicleButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstVehicleText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
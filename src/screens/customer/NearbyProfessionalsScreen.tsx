import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

interface Professional {
  _id: string;
  name: string;
  phone: string;
  status: string;
  distance?: number;
  specialization?: string;
}

const NearbyProfessionalsScreen = () => {
  const { authState } = useAuth();
  const navigation = useNavigation();
  
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('available');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      setUserLocation(userCoords);
      return userCoords;
    } catch (err) {
      console.error('Error getting user location:', err);
      setError('Failed to get your location');
      return null;
    }
  };

  // Fetch nearby professionals
  const fetchNearbyProfessionals = async (coords?: { latitude: number; longitude: number }) => {
    try {
      setLoading(true);
      setError(null);

      // Use provided coordinates or get current location
      const location = coords || userLocation || await getUserLocation();
      
      if (!location) {
        setError('Location is required to find nearby professionals');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/location/nearby`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            maxDistance: 10000, // 10km radius
            status: statusFilter,
          },
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.data.success && Array.isArray(response.data.data)) {
        setProfessionals(response.data.data);
      } else {
        setProfessionals([]);
      }
    } catch (err: any) {
      console.error('Error fetching nearby professionals:', err);
      setError(err.response?.data?.message || 'Failed to fetch nearby professionals');
      setProfessionals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNearbyProfessionals();
  };

  // Filter professionals by search query
  const filteredProfessionals = professionals.filter(professional => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      professional.name.toLowerCase().includes(query) ||
      (professional.specialization && professional.specialization.toLowerCase().includes(query))
    );
  });

  // View professional's location
  const viewProfessionalLocation = (professional: Professional) => {
    navigation.navigate('ProfessionalLocation', {
      professionalId: professional._id,
      professionalName: professional.name,
    });
  };

  // Initialize component
  useEffect(() => {
    getUserLocation().then(location => {
      if (location) {
        fetchNearbyProfessionals(location);
      }
    });
  }, [statusFilter]);

  // Render status filter buttons
  const renderStatusFilters = () => {
    const statuses = ['available', 'busy', 'offline'];
    
    return (
      <View style={styles.statusFilterContainer}>
        {statuses.map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilterButton,
              statusFilter === status && styles.statusFilterButtonActive,
            ]}
            onPress={() => setStatusFilter(status)}
          >
            <View style={[styles.statusDot, { backgroundColor: status === 'available' ? 'green' : status === 'busy' ? 'orange' : 'red' }]} />
            <Text style={[
              styles.statusFilterText,
              statusFilter === status && styles.statusFilterTextActive,
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render professional item
  const renderProfessionalItem = ({ item }: { item: Professional }) => {
    return (
      <TouchableOpacity
        style={styles.professionalCard}
        onPress={() => viewProfessionalLocation(item)}
      >
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.name}</Text>
          {item.specialization && (
            <Text style={styles.specialization}>{item.specialization}</Text>
          )}
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: item.status === 'available' ? 'green' : item.status === 'busy' ? 'orange' : 'red' }]} />
            <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
          </View>
          {item.distance !== undefined && (
            <Text style={styles.distanceText}>{(item.distance / 1000).toFixed(1)} km away</Text>
          )}
        </View>
        <View style={styles.actionContainer}>
          <Ionicons name="location" size={24} color="#0066CC" />
          <Text style={styles.actionText}>View</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search professionals..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>
      
      {renderStatusFilters()}
      
      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Finding nearby professionals...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={50} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchNearbyProfessionals()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProfessionals.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="location-outline" size={50} color="#999" />
          <Text style={styles.noResultsText}>
            {searchQuery 
              ? 'No professionals match your search' 
              : `No ${statusFilter} professionals found nearby`}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => fetchNearbyProfessionals()}
          >
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProfessionals}
          renderItem={renderProfessionalItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#0066CC']}
              tintColor="#0066CC"
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  noResultsText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066CC',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statusFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#EEEEEE',
  },
  statusFilterButtonActive: {
    backgroundColor: '#0066CC',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
  },
  professionalCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  distanceText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 12,
    color: '#0066CC',
    marginTop: 4,
  },
});

export default NearbyProfessionalsScreen;
// src/screens/admin/LocationManagementScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useAuth } from '../../contexts/AuthContext';
import { LocationData } from '../../services/LocationApiService';
import * as locationApi from '../../services/locationApi';

interface Professional {
  id: string;
  name: string;
  phone: string;
  email?: string;
  specialization?: string;
  currentLocation?: LocationData;
  status?: 'available' | 'busy' | 'offline';
  lastActive?: number;
}

const LocationManagementScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const mapRef = useRef<MapView | null>(null);
  
  // State
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Check if user is an admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      Alert.alert(
        'Access Restricted',
        'This screen is only available for administrators.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [user, navigation]);

  // Fetch professionals with location data
  useEffect(() => {
    fetchProfessionals();
    
    // Set up polling for location updates every 30 seconds
    const intervalId = setInterval(() => {
      if (professionals.length > 0) {
        updateProfessionalsWithLocation();
      }
    }, 30000);

    return () => {
      // Clean up interval
      clearInterval(intervalId);
    };
  }, [professionals.length]);

  // Filter professionals when search query or status filter changes
  useEffect(() => {
    filterProfessionals();
  }, [searchQuery, statusFilter, professionals]);

  // Fetch professionals from API
  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch professionals from the API
      const response = await locationApi.getProfessionals();
      
      if (response.success && response.data) {
        setProfessionals(response.data);
        setFilteredProfessionals(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch professionals');
      }
    } catch (err: any) {
      console.error('Error fetching professionals:', err);
      setError(err.message || 'Failed to fetch professionals');
      Alert.alert('Error', 'Failed to load professionals. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update professionals with location data
  const updateProfessionalsWithLocation = async () => {
    try {
      const updatedProfessionals = await Promise.all(
        professionals.map(async (professional) => {
          try {
            const response = await locationApi.getProfessionalLocation(professional.id);
            if (response.success && response.data) {
              return {
                ...professional,
                currentLocation: response.data.location,
                status: response.data.status || professional.status,
                lastActive: response.data.timestamp || professional.lastActive,
              };
            }
          } catch (error) {
            console.error(`Error fetching location for ${professional.id}:`, error);
          }
          return professional;
        })
      );
      
      setProfessionals(updatedProfessionals);
    } catch (error) {
      console.error('Error updating professionals with location:', error);
    }
  };

  // Filter professionals based on search query and status filter
  const filterProfessionals = () => {
    let filtered = professionals;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(professional => 
        professional.name.toLowerCase().includes(query) ||
        professional.phone.includes(query) ||
        (professional.email && professional.email.toLowerCase().includes(query)) ||
        (professional.specialization && professional.specialization.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(professional => professional.status === statusFilter);
    }
    
    setFilteredProfessionals(filtered);
  };

  // Fetch location history for a professional
  const fetchLocationHistory = async (professionalId: string) => {
    try {
      setLoadingHistory(true);
      
      // Fetch location history from API
      const response = await locationApi.getProfessionalLocationHistory(professionalId, 50);
      
      if (response.success && response.data?.data) {
        const historyData = response.data.data;
        
        // Sort by timestamp (newest first)
        historyData.sort((a, b) => b.timestamp - a.timestamp);
        
        setLocationHistory(historyData);
      } else {
        setLocationHistory([]);
      }
    } catch (err) {
      console.error('Error fetching location history:', err);
      Alert.alert('Error', 'Failed to fetch location history');
      setLocationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle professional selection
  const handleSelectProfessional = (professional: Professional) => {
    setSelectedProfessional(professional);
    
    // If professional has location, center map on it
    if (professional.currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: professional.currentLocation.latitude,
        longitude: professional.currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  // View professional details and location history
  const viewProfessionalDetails = (professional: Professional) => {
    setSelectedProfessional(professional);
    fetchLocationHistory(professional.id);
    setShowModal(true);
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Format time elapsed since last active
  const formatTimeElapsed = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    
    const now = Date.now();
    const elapsed = now - timestamp;
    
    // Less than a minute
    if (elapsed < 60 * 1000) {
      return 'Just now';
    }
    
    // Less than an hour
    if (elapsed < 60 * 60 * 1000) {
      const minutes = Math.floor(elapsed / (60 * 1000));
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Less than a day
    if (elapsed < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(elapsed / (60 * 60 * 1000));
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // More than a day
    const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return '#4CAF50'; // Green
      case 'busy':
        return '#FFC107'; // Yellow
      case 'offline':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  // Render map with professionals
  const renderMap = () => {
    // Find center coordinates based on professionals with location
    let initialRegion = {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    
    const professionalsWithLocation = filteredProfessionals.filter(p => p.currentLocation);
    
    if (professionalsWithLocation.length > 0) {
      // If selected professional has location, center on them
      if (selectedProfessional?.currentLocation) {
        initialRegion = {
          latitude: selectedProfessional.currentLocation.latitude,
          longitude: selectedProfessional.currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
      } else {
        // Otherwise, calculate center of all professionals with location
        const latitudes = professionalsWithLocation.map(p => p.currentLocation!.latitude);
        const longitudes = professionalsWithLocation.map(p => p.currentLocation!.longitude);
        
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        
        initialRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: Math.max(0.01, (maxLat - minLat) * 1.5),
          longitudeDelta: Math.max(0.01, (maxLng - minLng) * 1.5),
        };
      }
    }
    
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={initialRegion}
          showsUserLocation={false}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
          showsTraffic={false}
        >
          {filteredProfessionals.map(professional => {
            if (!professional.currentLocation) return null;
            
            return (
              <Marker
                key={professional.id}
                coordinate={{
                  latitude: professional.currentLocation.latitude,
                  longitude: professional.currentLocation.longitude,
                }}
                title={professional.name}
                description={`Status: ${professional.status || 'Unknown'}`}
                pinColor={getStatusColor(professional.status)}
                onPress={() => handleSelectProfessional(professional)}
              >
                <Callout tooltip onPress={() => viewProfessionalDetails(professional)}>
                  <View style={styles.calloutContainer}>
                    <Text style={styles.calloutTitle}>{professional.name}</Text>
                    <Text style={styles.calloutText}>
                      {professional.specialization || 'Professional'}
                    </Text>
                    <View style={styles.calloutStatusContainer}>
                      <View
                        style={[
                          styles.calloutStatusIndicator,
                          { backgroundColor: getStatusColor(professional.status) },
                        ]}
                      />
                      <Text style={styles.calloutStatusText}>
                        {professional.status || 'Unknown'}
                      </Text>
                    </View>
                    <Text style={styles.calloutLastActive}>
                      Last active: {formatTimeElapsed(professional.lastActive || 0)}
                    </Text>
                    <Text style={styles.calloutViewDetails}>Tap for details</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>
    );
  };

  // Render professional list item
  const renderProfessionalItem = ({ item }: { item: Professional }) => {
    return (
      <TouchableOpacity
        style={[
          styles.professionalItem,
          selectedProfessional?.id === item.id && styles.selectedProfessionalItem,
        ]}
        onPress={() => handleSelectProfessional(item)}
      >
        <View style={styles.professionalInfo}>
          <Text style={styles.professionalName}>{item.name}</Text>
          <Text style={styles.professionalSpecialization}>
            {item.specialization || 'Professional'}
          </Text>
          <View style={styles.professionalStatusContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
            <Text style={styles.statusText}>{item.status || 'Unknown'}</Text>
          </View>
        </View>
        <View style={styles.professionalActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => viewProfessionalDetails(item)}
          >
            <Ionicons name="information-circle-outline" size={24} color="#0066CC" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Render professional details modal
  const renderProfessionalDetailsModal = () => {
    if (!selectedProfessional) return null;
    
    return (
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedProfessional.name}</Text>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* Professional Info */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Professional Information</Text>
              <View style={styles.detailItem}>
                <Ionicons name="person" size={20} color="#666" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{selectedProfessional.name}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="call" size={20} color="#666" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{selectedProfessional.phone}</Text>
              </View>
              {selectedProfessional.email && (
                <View style={styles.detailItem}>
                  <Ionicons name="mail" size={20} color="#666" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedProfessional.email}</Text>
                </View>
              )}
              {selectedProfessional.specialization && (
                <View style={styles.detailItem}>
                  <Ionicons name="briefcase" size={20} color="#666" style={styles.detailIcon} />
                  <Text style={styles.detailLabel}>Specialization:</Text>
                  <Text style={styles.detailValue}>{selectedProfessional.specialization}</Text>
                </View>
              )}
              <View style={styles.detailItem}>
                <Ionicons name="time" size={20} color="#666" style={styles.detailIcon} />
                <Text style={styles.detailLabel}>Last Active:</Text>
                <Text style={styles.detailValue}>
                  {selectedProfessional.lastActive
                    ? formatTimestamp(selectedProfessional.lastActive)
                    : 'Unknown'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(selectedProfessional.status) },
                  ]}
                />
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{selectedProfessional.status || 'Unknown'}</Text>
              </View>
            </View>
            
            {/* Current Location */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Current Location</Text>
              {selectedProfessional.currentLocation ? (
                <View>
                  <View style={styles.currentLocationMap}>
                    <MapView
                      style={styles.miniMap}
                      provider={PROVIDER_GOOGLE}
                      initialRegion={{
                        latitude: selectedProfessional.currentLocation.latitude,
                        longitude: selectedProfessional.currentLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: selectedProfessional.currentLocation.latitude,
                          longitude: selectedProfessional.currentLocation.longitude,
                        }}
                        pinColor={getStatusColor(selectedProfessional.status)}
                      />
                    </MapView>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location" size={20} color="#666" style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Coordinates:</Text>
                    <Text style={styles.detailValue}>
                      {selectedProfessional.currentLocation.latitude.toFixed(6)}, {selectedProfessional.currentLocation.longitude.toFixed(6)}
                    </Text>
                  </View>
                  {selectedProfessional.currentLocation.accuracy && (
                    <View style={styles.detailItem}>
                      <MaterialIcons name="gps-fixed" size={20} color="#666" style={styles.detailIcon} />
                      <Text style={styles.detailLabel}>Accuracy:</Text>
                      <Text style={styles.detailValue}>
                        {selectedProfessional.currentLocation.accuracy.toFixed(1)} meters
                      </Text>
                    </View>
                  )}
                  {selectedProfessional.currentLocation.speed !== null && selectedProfessional.currentLocation.speed !== undefined && (
                    <View style={styles.detailItem}>
                      <FontAwesome name="tachometer" size={20} color="#666" style={styles.detailIcon} />
                      <Text style={styles.detailLabel}>Speed:</Text>
                      <Text style={styles.detailValue}>
                        {(selectedProfessional.currentLocation.speed * 3.6).toFixed(1)} km/h
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Ionicons name="time" size={20} color="#666" style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Timestamp:</Text>
                    <Text style={styles.detailValue}>
                      {formatTimestamp(selectedProfessional.currentLocation.timestamp)}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noDataText}>No current location data available</Text>
              )}
            </View>
            
            {/* Location History */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Location History</Text>
              {loadingHistory ? (
                <ActivityIndicator size="small" color="#0066CC" style={styles.historyLoader} />
              ) : locationHistory.length > 0 ? (
                locationHistory.map((location, index) => (
                  <View key={index} style={styles.historyItem}>
                    <View style={styles.historyHeader}>
                      <Text style={styles.historyTimestamp}>{formatTimestamp(location.timestamp)}</Text>
                      {location.status && (
                        <View
                          style={[
                            styles.historyStatusIndicator,
                            { backgroundColor: getStatusColor(location.status) },
                          ]}
                        />
                      )}
                    </View>
                    <Text style={styles.historyCoordinates}>
                      Lat: {location.latitude.toFixed(6)}, Lon: {location.longitude.toFixed(6)}
                    </Text>
                    {location.accuracy && (
                      <Text style={styles.historyDetail}>Accuracy: {location.accuracy.toFixed(1)} m</Text>
                    )}
                    {location.speed !== null && location.speed !== undefined && (
                      <Text style={styles.historyDetail}>Speed: {(location.speed * 3.6).toFixed(1)} km/h</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noDataText}>No location history available</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Loading professionals...</Text>
      </SafeAreaView>
    );
  }

  if (error && professionals.length === 0) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfessionals}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professional Locations</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search professionals..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>
      
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by status:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === null && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(null)}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'available' && styles.filterButtonActive,
              { borderColor: '#4CAF50' },
            ]}
            onPress={() => setStatusFilter('available')}
          >
            <View style={[styles.filterStatusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.filterButtonText}>Available</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'busy' && styles.filterButtonActive,
              { borderColor: '#FFC107' },
            ]}
            onPress={() => setStatusFilter('busy')}
          >
            <View style={[styles.filterStatusDot, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.filterButtonText}>Busy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'offline' && styles.filterButtonActive,
              { borderColor: '#F44336' },
            ]}
            onPress={() => setStatusFilter('offline')}
          >
            <View style={[styles.filterStatusDot, { backgroundColor: '#F44336' }]} />
            <Text style={styles.filterButtonText}>Offline</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {renderMap()}
      
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            Professionals ({filteredProfessionals.length})
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => {
            setRefreshing(true);
            fetchProfessionals();
          }}>
            <Ionicons name="refresh" size={20} color="#0066CC" />
          </TouchableOpacity>
        </View>
        
        {refreshing ? (
          <ActivityIndicator size="small" color="#0066CC" style={styles.refreshingIndicator} />
        ) : filteredProfessionals.length > 0 ? (
          <FlatList
            data={filteredProfessionals}
            keyExtractor={(item) => item.id}
            renderItem={renderProfessionalItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={48} color="#CCCCCC" />
            <Text style={styles.emptyText}>No professionals found</Text>
          </View>
        )}
      </View>
      
      {renderProfessionalDetailsModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#0066CC',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  filterButtonActive: {
    borderColor: '#0066CC',
    backgroundColor: '#E3F2FD',
  },
  filterStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  filterButtonText: {
    fontSize: 12,
    color: '#333',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  calloutContainer: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  calloutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  calloutStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  calloutStatusText: {
    fontSize: 14,
    color: '#333',
  },
  calloutLastActive: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calloutViewDetails: {
    fontSize: 12,
    color: '#0066CC',
    textAlign: 'center',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    paddingTop: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  refreshingIndicator: {
    marginVertical: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  professionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedProfessionalItem: {
    borderColor: '#0066CC',
    backgroundColor: '#E3F2FD',
  },
  professionalInfo: {
    flex: 1,
  },
  professionalName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  professionalSpecialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  professionalStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
  },
  professionalActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeButton: {
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    marginRight: 8,
    width: 24,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    width: 120,
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  currentLocationMap: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
  },
  historyLoader: {
    marginVertical: 16,
  },
  historyItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTimestamp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyCoordinates: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  historyDetail: {
    fontSize: 14,
    color: '#666',
  },
});

export default LocationManagementScreen;
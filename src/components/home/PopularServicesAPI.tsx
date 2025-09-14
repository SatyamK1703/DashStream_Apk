import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApi } from '../../hooks/useApi';
import { serviceService } from '../../services';
import { Service } from '../../types/api';

interface PopularServicesAPIProps {
  limit?: number;
}

const PopularServicesAPI: React.FC<PopularServicesAPIProps> = ({ limit = 6 }) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [services, setServices] = useState<Service[]>([]);

  // Use the API hook for loading popular services
  const {
    data,
    loading,
    error,
    execute: loadPopularServices,
  } = useApi(
    () => serviceService.getPopularServices(limit),
    {
      onSuccess: (data) => {
        setServices(data || []);
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to load popular services. Please try again.');
      },
    }
  );

  useEffect(() => {
    loadPopularServices();
  }, []);

  const handleServicePress = (service: Service) => {
    navigation.navigate('ServiceDetails', { serviceId: service._id });
  };

  const handleSeeAll = () => {
    navigation.navigate('AllServices');
  };

  if (loading && services.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading popular services...</Text>
      </View>
    );
  }

  if (error && services.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load services</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadPopularServices}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Popular Services</Text>
        <TouchableOpacity onPress={handleSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.map((service) => (
          <TouchableOpacity
            key={service._id}
            style={styles.serviceCard}
            onPress={() => handleServicePress(service)}
            activeOpacity={0.8}
          >
            <Image
              source={{ 
                uri: service.images?.[0]?.url || 'https://via.placeholder.com/150x120'
              }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName} numberOfLines={2}>
                {service.name}
              </Text>
              <Text style={styles.servicePrice}>
                ₹{service.basePrice}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.rating}>⭐ {service.rating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>({service.reviewCount})</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && services.length > 0 && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  serviceCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshIndicator: {
    marginTop: 10,
    alignItems: 'center',
  },
});

export default PopularServicesAPI;
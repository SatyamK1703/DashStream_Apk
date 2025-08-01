import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { services } from '../../constants/data/serviceDetails';
import CategoryTabs from '../../components/service/CategoryTabs';


type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'AllServices'>;

const CATEGORY_TABS = ['All','Car Wash', 'Deep Clean', 'Special Car Care'];
const AllServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Car Wash');

  useEffect(() => {
    setIsLoading(true);

    if (route.params?.allServices) {
      setServicesData(route.params.allServices);
      setFilteredServices(route.params.allServices);
    } else {
      const servicesArray = Object.values(services);
      setServicesData(servicesArray);
      setFilteredServices(servicesArray);
    }
    setIsLoading(false);
  }, [route.params]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredServices(servicesData);
    } else {
      const filtered = servicesData.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  }, [searchQuery, servicesData]);

  const handleServicePress = (service: any) => {
    navigation.navigate('ServiceDetails', { serviceId: service.id });
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleServicePress(item)} activeOpacity={0.9}>
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardRating}>⭐ {item.rating} ({item.reviews} ratings)</Text>
          <Text style={styles.cardFeature}>• {item.features?.[0]}</Text>
          <Text style={styles.cardFeature}>• {item.features?.[1]}</Text>
          <Text style={styles.cardFeature}>• {item.features?.[2]}</Text>
          <View style={styles.cardPriceRow}>
            <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>
            <Text style={styles.newPrice}>₹{item.discountedPrice}</Text>
            <Text style={styles.discount}>50% OFF</Text>
          </View>
        </View>
        <Image source={item.image} style={styles.cardImage} />
      </View>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addText}>ADD</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Services</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>

        <CategoryTabs
        tabs={CATEGORY_TABS}
        selected={selectedTab}
        onSelect={(tab) => setSelectedTab(tab)}
        />
        

      {/* Service List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading Services...</Text>
        </View>
      ) : (
        <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
        renderItem={renderServiceItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        />
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  filterTag: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d1d5db', // Gray-300
    backgroundColor: '#fff',
    marginRight: 8,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563', // Gray-600
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardInfo: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardRating: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
  },
  cardFeature: {
    fontSize: 13,
    color: '#4b5563',
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    marginRight: 6,
  },
  newPrice: {
    color: '#111827',
    fontWeight: '600',
    marginRight: 6,
  },
  discount: {
    color: '#10b981',
    fontWeight: '600',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  addButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#111827',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
});

export default AllServicesScreen;

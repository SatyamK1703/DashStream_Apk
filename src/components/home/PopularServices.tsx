import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 3; // Account for horizontal padding

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PopularServices = ({ services }: any) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (service: any) => {
    // Pass a stable id and the whole service object so ServiceDetailsScreen can use either
    navigation.navigate('ServiceDetails', { serviceId: service._id || service.id, service });
  };

  const handleSeeAll = () => {
    navigation.navigate('AllServices'); // Assuming you have an 'AllServices' screen
  };

  // ✅ Safety check for services data
  const safeServices = services && Array.isArray(services) ? services : [];

  // Don't render if no services
  if (safeServices.length === 0) {
    return null; // or return a loading/empty state component
  }

  return (
    <View style={styles.container}>
      {/* Header with title and See All */}
      <View style={styles.header}>
        <Text style={styles.title}>Doorstep Autocare Services</Text>
        <TouchableOpacity 
          style={styles.seeAllButton}
          onPress={handleSeeAll}
          activeOpacity={0.7}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <MaterialIcons name="arrow-forward" size={18} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Services Grid (2 columns) */}
      <View>
        {safeServices.slice(0, 6).reduce((rows: any[], item: any, index: number) => {
            if (index % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.rowTwoCol}>
              {row.map((item: any, colIndex: number) => {
                // Normalize image source: accept string urls or local sources
                let imageSrc: any = item.image || item.imageUrl || item.thumbnail;
                if (typeof imageSrc === 'string' && imageSrc.length > 0) imageSrc = { uri: imageSrc };
                if (!imageSrc) imageSrc = require('../../../assets/1.png');

                return (
                  <TouchableOpacity
                    key={item._id || item.id || `${rowIndex}-${colIndex}`}
                    style={styles.itemTwoCol}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.iconContainer}>
                      <Image source={imageSrc} style={styles.icon} resizeMode="cover" />
                    </View>
                    <Text style={styles.label} numberOfLines={2}>
                      {item.title || item.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
      </View>
    </View>
  );
};

export default PopularServices;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  itemTwoCol: {
    width: (width - 48) / 2,
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    lineHeight: 16,
  },
});
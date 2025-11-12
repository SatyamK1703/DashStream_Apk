import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - scaleWidth(48)) / 3; // Account for horizontal padding

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
          accessibilityRole="button"
          accessibilityLabel="See all services"
          hitSlop={8}>
          <Text style={styles.seeAllText}>See All</Text>
          <MaterialIcons name="arrow-forward" size={scaleFont(18)} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Services Grid (2 columns) */}
      <View>
        {safeServices
          .slice(0, 6)
          .reduce((rows: any[], item: any, index: number) => {
            if (index % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.rowTwoCol}>
              {row.map((item: any, colIndex: number) => {
                // Normalize image source: accept string urls or local sources
                let imageSrc: any = item.image || item.imageUrl || item.thumbnail;
                if (typeof imageSrc === 'string' && imageSrc.length > 0)
                  imageSrc = { uri: imageSrc };
                if (!imageSrc) imageSrc = require('../../../assets/1.png');

                return (
                  <TouchableOpacity
                    key={item._id || item.id || `${rowIndex}-${colIndex}`}
                    style={styles.itemTwoCol}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.title || item.name}`}
                    hitSlop={8}>
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
    marginBottom: scaleHeight(24),
    backgroundColor: '#fff',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
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
    marginBottom: scaleHeight(16),
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(4),
  },
  seeAllText: {
    color: '#2563eb',
    fontSize: scaleFont(14),
    fontWeight: '600',
    marginRight: scaleWidth(4),
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: scaleHeight(8),
  },
  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleHeight(12),
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: scaleHeight(16),
    padding: scaleWidth(8),
    borderRadius: scaleWidth(12),
    backgroundColor: '#f9fafb',
  },
  itemTwoCol: {
    width: (width - scaleWidth(48)) / 2,
    alignItems: 'center',
    marginBottom: scaleHeight(8),
    padding: scaleWidth(12),
    borderRadius: scaleWidth(12),
    backgroundColor: '#f9fafb',
  },
  iconContainer: {
    width: scaleWidth(90),
    height: scaleWidth(90),
    borderRadius: scaleWidth(64),
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },
  icon: {
    width: scaleWidth(90),
    height: scaleWidth(90),
  },
  label: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    lineHeight: scaleFont(16),
  },
});

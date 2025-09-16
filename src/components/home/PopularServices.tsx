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
    navigation.navigate('ServiceDetails', { serviceId: service.id });
  };

  const handleSeeAll = () => {
    navigation.navigate('AllServices'); // Assuming you have an 'AllServices' screen
  };

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

      {/* Services Grid without FlatList to avoid nested VirtualizedList in ScrollView */}
      <View>
        {services
          .slice(0, 6)
          .reduce((rows: any[], item: any, index: number) => {
            if (index % 3 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.item}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconContainer}>
                    <Image source={item.image} style={styles.icon} resizeMode="contain" />
                  </View>
                  <Text style={styles.label} numberOfLines={2}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
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
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
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
    width: 40,
    height: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#374151',
    lineHeight: 16,
  },
});
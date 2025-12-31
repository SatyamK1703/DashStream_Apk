import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - scaleWidth(48)) / 2;

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PopularServices = ({ services }: any) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (service: any) => {
    navigation.navigate('ServiceDetails', {
      serviceId: service._id || service.id,
    });
  };

  const handleSeeAll = () => {
    navigation.navigate('AllServices');
  };

  const safeServices = Array.isArray(services) ? services : [];
  if (safeServices.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Doorstep Autocare Services</Text>

        <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll} activeOpacity={0.8}>
          <Text style={styles.seeAllText}>See All</Text>
          <MaterialIcons name="arrow-forward" size={scaleFont(18)} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Service Grid */}
      <View>
        {safeServices
          .slice(0, 6)
          .reduce((rows: any[], item, index) => {
            if (index % 2 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.rowTwoCol}>
              {row.map((item, colIndex) => {
                let img: any = item.image || item.imageUrl || item.thumbnail;
                if (typeof img === 'string') img = { uri: img };
                if (!img) img = require('../../../assets/1.png');

                return (
                  <TouchableOpacity
                    key={item._id || item.id || `${rowIndex}-${colIndex}`}
                    style={styles.card}
                    onPress={() => handlePress(item)}
                    activeOpacity={0.85}>
                    <View style={styles.iconWrapper}>
                      <Image source={img} style={styles.icon} resizeMode="cover" />
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
    backgroundColor: '#ffffff',
    borderRadius: scaleWidth(14),
    padding: scaleWidth(16),
    marginBottom: scaleHeight(24),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleHeight(14),
  },

  title: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    color: '#2563eb',
    fontSize: scaleFont(14),
    fontWeight: '600',
    marginRight: scaleWidth(4),
  },

  rowTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleHeight(14),
  },

  card: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: scaleWidth(12),
    borderRadius: scaleWidth(14),
    shadowColor: '#1e293b',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  iconWrapper: {
    width: scaleWidth(76),
    height: scaleWidth(76),
    borderRadius: scaleWidth(38),
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(10),
  },

  icon: {
    width: '90%',
    height: '90%',
    borderRadius: scaleWidth(12),
  },

  label: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    textAlign: 'center',
    color: '#334155',
    lineHeight: scaleHeight(18),
  },
});

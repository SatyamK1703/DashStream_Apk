import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const fixes = [
  { id: '1', label: 'Hybrid Ceramic', image: require('../../assets/images/image.png') },
  { id: '2', label: 'Odor Eliminator', image: require('../../assets/images/image.png') },
  { id: '3', label: 'Pet Hair Removal', image: require('../../assets/images/image.png') },
  { id: '4', label: 'Roof Cleaning', image: require('../../assets/images/image.png') },
  { id: '5', label: 'Seat Cleaning', image: require('../../assets/images/image.png') },
  { id: '6', label: 'Underbody Cleaning', image: require('../../assets/images/image.png') },
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_SPACING = 12;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_SPACING * 4 - 32) / 3; // 3 columns + paddings
type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
const QuickFixes = () => {
  const navigation = useNavigation<NavigationProp>();
  const handleSeeAll = () => {
    navigation.navigate('AllServices'); // Assuming you have an 'AllServices' screen
  };
  return (

    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>Common Problems Quick Fixes</Text>
      {/* ✅ FIXED: Replace FlatList with View to avoid VirtualizedList nesting */}
      <View style={{ paddingHorizontal: 16 }}>
        {fixes
          .reduce((rows: any[], item: any, index: number) => {
            if (index % 3 === 0) rows.push([]);
            rows[rows.length - 1].push(item);
            return rows;
          }, [])
          .map((row: any[], rowIndex: number) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <TouchableOpacity key={item.id} style={styles.card} onPress={handleSeeAll}>
                  <Image source={item.image} style={styles.image} resizeMode="cover" />
                  <View style={styles.labelWrapper}>
                    <Text style={styles.label}>{item.label} →</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden', // ⬅️ Ensures children respect border radius
  },
  image: {
    height: 80,
    width: '100%',
  },
  labelWrapper: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
  },
});

export default QuickFixes;




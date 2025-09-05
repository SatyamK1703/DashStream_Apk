import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
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
  const { user } = useAuth();
  
  const handleSeeAll = () => {
    // Check if user is not authenticated or is a guest user
    if (!user || user.email === 'skip-user') {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('AllServices'); // Assuming you have an 'AllServices' screen
  };
  return (

    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>Common Problems Quick Fixes</Text>
      <FlatList
        data={fixes}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={handleSeeAll}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
            <View style={styles.labelWrapper}>
              <Text style={styles.label}>{item.label} →</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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




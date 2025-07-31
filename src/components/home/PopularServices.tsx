import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 3;

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PopularServices = ({ services }: any) => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = (service: any) => {
    navigation.navigate('ServiceDetails', { serviceId: service.id });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doorstep Autocare Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePress(item)}>
            <Image source={item.image} style={styles.icon} resizeMode="contain" />
            <Text style={styles.label} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default PopularServices;

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-around',
  },
  item: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
    color: '#1f2937',
  },
});

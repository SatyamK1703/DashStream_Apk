import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export const PromoBanner = ({ onPress }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const handlePress = () => {
    // Check if user is not authenticated or is a guest user
    if (!user || user.name === 'Guest User') {
      // Redirect to login screen
      navigation.navigate('Login' as never);
    } else {
      // If authenticated, proceed with the original onPress action
      onPress();
    }
  };
  
  return (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image source={require('../../assets/images/image.png')} style={styles.image} />
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Become a Member</Text>
        <Text style={styles.subtitle}>Get exclusive discounts and free services</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#2563eb" />
    </TouchableOpacity>
  </View>
);};
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  card: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    marginRight: 16,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
  },
});
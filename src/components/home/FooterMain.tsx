// components/home/Footer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator'; 

const Footer = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();

  return (
    <View style={styles.container}>
     
      <Text style={styles.copyrightText}>© {new Date().getFullYear()} DashSteam. All rights reserved.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
    padding: 20,
  },
  copyrightText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    
  },
});

export default Footer;
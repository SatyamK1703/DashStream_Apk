// components/home/Footer.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Footer = () => {

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
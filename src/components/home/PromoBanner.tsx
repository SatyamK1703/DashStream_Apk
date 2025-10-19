import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';

const PromoBanner = ({ onPress }) => (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={require('../../assets/images/become-a-member.png')} style={styles.image} />
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Become a Member</Text>
        <Text style={styles.subtitle}>Get exclusive discounts and free services</Text>
      </View>
      <Ionicons name="chevron-forward" size={scaleFont(24)} color="#2563eb" />
    </TouchableOpacity>
  </View>
);

export default PromoBanner;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(32),
  },
  card: {
    backgroundColor: 'rgba(37,99,235,0.1)',
    borderRadius: scaleWidth(16),
    padding: scaleWidth(16),
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: scaleWidth(64),
    height: scaleWidth(64),
    marginRight: scaleWidth(16),
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: scaleFont(14),
    color: '#4b5563',
  },
});
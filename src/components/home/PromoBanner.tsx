import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';

const PromoBanner = ({ onPress }: { onPress: () => void }) => (
  <View style={styles.wrapper}>
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={require('../../assets/images/become-a-member.png')} style={styles.image} />

      <View style={styles.textWrapper}>
        <Text style={styles.title}>Become a Member</Text>
        <Text style={styles.subtitle}>Unlock premium perks, exclusive offers, and more</Text>
      </View>

      <Ionicons name="chevron-forward" size={scaleFont(24)} color="#2563eb" style={styles.icon} />
    </TouchableOpacity>
  </View>
);

export default PromoBanner;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: scaleWidth(16),
    marginBottom: scaleHeight(28),
  },

  card: {
    backgroundColor: '#f0f6ff',
    padding: scaleWidth(18),
    borderRadius: scaleWidth(18),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  image: {
    width: scaleWidth(62),
    height: scaleWidth(62),
    borderRadius: scaleWidth(12),
    marginRight: scaleWidth(16),
  },

  textWrapper: {
    flex: 1,
  },

  title: {
    fontSize: scaleFont(18),
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: scaleHeight(4),
  },

  subtitle: {
    fontSize: scaleFont(14),
    color: '#4b5563',
    lineHeight: scaleHeight(20),
  },

  icon: {
    marginLeft: scaleWidth(8),
  },
});

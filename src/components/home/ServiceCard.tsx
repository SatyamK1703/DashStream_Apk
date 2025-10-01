import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ServiceCard = ({ title, price, duration, onPress, description, image }) => {
  const imageSource = typeof image === 'string' ? { uri: image } : image;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      android_ripple={{ color: '#e5e7eb' }}
      accessibilityRole="button"
      accessibilityLabel={`${title}, AED ${price}, ${duration} minutes`}
      hitSlop={8}
    >
      {imageSource ? (
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, { backgroundColor: '#f3f4f6' }]} />
      )}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.priceTag}>
            <Ionicons name="pricetag-outline" size={14} color="#fff" />
            <Text style={styles.price}>AED {price}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.duration}>{duration} mins</Text>
        </View>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  price: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  duration: {
    color: '#6b7280',
    marginLeft: 4,
    fontSize: 13,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
});

export default ServiceCard;

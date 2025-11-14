import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scaleWidth, scaleHeight, scaleFont } from '../../utils/scaling';

const Header = ({ userName }: { userName: string }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    if (route.params?.selectedLocation) {
      setLocationName(route.params.selectedLocation as string);
    }
  }, [route.params?.selectedLocation]);

  return (
    <View style={[styles.header, { paddingTop: insets.top + scaleHeight(6) }]}>
      {/* Left side */}
      <View style={{ flex: 1 }}>
        <Text style={styles.greeting}>Hi, {userName}</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.locationPill}
          onPress={() => navigation.navigate('LocationPicker')}>
          <Ionicons name="location-outline" size={scaleFont(15)} color="#2563eb" />
          <Text style={styles.locationText} numberOfLines={1}>
            {locationName || 'Select Location'}
          </Text>
          <Ionicons name="chevron-down" size={scaleFont(14)} color="#2563eb" />
        </TouchableOpacity>
      </View>

      {/* Right side icons */}
      <View style={styles.iconGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={scaleFont(20)} color="#2563eb" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={scaleFont(20)} color="#2563eb" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: scaleWidth(16),
    paddingBottom: scaleHeight(12),
    alignItems: 'center',
  },

  greeting: {
    fontSize: scaleFont(19),
    fontWeight: '700',
    color: '#1f2937',
  },

  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: scaleHeight(6),
    backgroundColor: 'rgba(37,99,235,0.08)',
    borderRadius: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    paddingHorizontal: scaleWidth(8),
    maxWidth: scaleWidth(180),
  },

  locationText: {
    fontSize: scaleFont(13.5),
    color: '#2563eb',
    marginHorizontal: scaleWidth(4),
    flexShrink: 1,
  },

  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconButton: {
    width: scaleWidth(42),
    height: scaleWidth(42),
    borderRadius: scaleWidth(21),
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaleWidth(10),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
});

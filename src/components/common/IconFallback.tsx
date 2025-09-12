import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Constants from 'expo-constants';

// Comprehensive icon fallback system
interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Icon mapping between different libraries
const iconMappings = {
  // Home icons
  'home': { material: 'home', ant: 'home', fallback: '🏠' },
  'home-outline': { material: 'home', ant: 'home', fallback: '🏠' },
  
  // Person icons
  'person': { material: 'person', ant: 'user', fallback: '👤' },
  'person-outline': { material: 'person', ant: 'user', fallback: '👤' },
  
  // Settings icons
  'settings': { material: 'settings', ant: 'setting', fallback: '⚙️' },
  'settings-outline': { material: 'settings', ant: 'setting', fallback: '⚙️' },
  
  // Dashboard icons
  'speedometer': { material: 'speed', ant: 'dashboard', fallback: '⚡' },
  'speedometer-outline': { material: 'speed', ant: 'dashboard', fallback: '⚡' },
  
  // Work icons
  'briefcase': { material: 'work', ant: 'appstore-o', fallback: '💼' },
  'briefcase-outline': { material: 'work', ant: 'appstore-o', fallback: '💼' },
  
  // Money icons
  'cash': { material: 'attach-money', ant: 'pay-circle1', fallback: '💰' },
  'cash-outline': { material: 'attach-money', ant: 'pay-circle1', fallback: '💰' },
  
  // Calendar icons
  'calendar': { material: 'event', ant: 'calendar', fallback: '📅' },
  'calendar-outline': { material: 'event', ant: 'calendar', fallback: '📅' },
  
  // Location icons
  'location': { material: 'location-on', ant: 'environment', fallback: '📍' },
  'location-outline': { material: 'location-on', ant: 'environment', fallback: '📍' },
  
  // Support icons
  'help-buoy': { material: 'help', ant: 'questioncircle', fallback: '🆘' },
  'help-buoy-outline': { material: 'help', ant: 'questioncircle', fallback: '🆘' },
  
  // Card icons
  'card': { material: 'credit-card', ant: 'creditcard', fallback: '💳' },
  'card-outline': { material: 'credit-card', ant: 'creditcard', fallback: '💳' },
  
  // Grid icons
  'grid': { material: 'dashboard', ant: 'appstore', fallback: '▦' },
  'grid-outline': { material: 'dashboard', ant: 'appstore', fallback: '▦' },
  
  // People icons
  'people': { material: 'people', ant: 'team', fallback: '👥' },
  'people-outline': { material: 'people', ant: 'team', fallback: '👥' },
  
  // Car icons
  'car': { material: 'directions-car', ant: 'car', fallback: '🚗' },
  'car-outline': { material: 'directions-car', ant: 'car', fallback: '🚗' },
};

const SmartIcon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  const mapping = iconMappings[name as keyof typeof iconMappings];
  const isExpoGo = Constants.appOwnership === 'expo';

  // Method 1: Try Ionicons first
  const tryIonicons = () => {
    try {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <Ionicons name={name as any} size={size} color={color} />
        </View>
      );
    } catch (error) {
      console.log(`Ionicons failed for ${name}:`, error);
      return null;
    }
  };

  // Method 2: Try MaterialIcons
  const tryMaterialIcons = () => {
    if (!mapping?.material) return null;
    try {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <MaterialIcons name={mapping.material as any} size={size} color={color} />
        </View>
      );
    } catch (error) {
      console.log(`MaterialIcons failed for ${name}:`, error);
      return null;
    }
  };

  // Method 3: Try AntDesign
  const tryAntDesign = () => {
    if (!mapping?.ant) return null;
    try {
      return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
          <AntDesign name={mapping.ant as any} size={size} color={color} />
        </View>
      );
    } catch (error) {
      console.log(`AntDesign failed for ${name}:`, error);
      return null;
    }
  };

  // Method 4: Emoji fallback
  const emojiSize = size * 0.8; // Scale emoji to be slightly smaller
  const emojiFallback = () => {
    if (!mapping?.fallback) return null;
    return (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
        <Text style={{ fontSize: emojiSize, textAlign: 'center' }}>
          {mapping.fallback}
        </Text>
      </View>
    );
  };

  // Try methods in order of preference
  // In Expo Go, skip Ionicons and go straight to alternatives if needed
  if (isExpoGo) {
    return tryMaterialIcons() || tryAntDesign() || emojiFallback() || tryIonicons() || (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', backgroundColor: color, borderRadius: size/2 }, style]} />
    );
  } else {
    return tryIonicons() || tryMaterialIcons() || tryAntDesign() || emojiFallback() || (
      <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', backgroundColor: color, borderRadius: size/2 }, style]} />
    );
  }
};

export default SmartIcon;
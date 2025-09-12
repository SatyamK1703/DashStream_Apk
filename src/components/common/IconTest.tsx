import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SmartIcon from './IconFallback';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import Constants from 'expo-constants';

const IconTest = () => {
  const testIcons = [
    'home',
    'home-outline', 
    'person',
    'person-outline',
    'settings',
    'settings-outline',
  ] as const;

  const isExpoGo = Constants.appOwnership === 'expo';

  React.useEffect(() => {
    console.log('Running on:', isExpoGo ? 'Expo Go' : 'Development Build');
    console.log('Ionicons component:', typeof Ionicons);
    console.log('MaterialIcons component:', typeof MaterialIcons);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Icon System Test</Text>
      <Text style={styles.subtitle}>
        Running on: {isExpoGo ? 'Expo Go' : 'Development Build'}
      </Text>
      <Text style={styles.subtitle}>Testing smart fallback system:</Text>
      
      {/* Test SmartIcon System */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SmartIcon Fallback System:</Text>
        <View style={styles.iconGrid}>
          {testIcons.map((iconName, index) => (
            <View key={index} style={styles.iconItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f2ff' }]}>
                <SmartIcon 
                  name={iconName} 
                  size={24} 
                  color="#2563eb" 
                />
              </View>
              <Text style={styles.iconLabel}>{iconName}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Test Raw Ionicons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Raw Ionicons Test:</Text>
        <View style={styles.iconGrid}>
          {testIcons.map((iconName, index) => (
            <View key={index} style={styles.iconItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
                <Ionicons 
                  name={iconName} 
                  size={24} 
                  color="#2563eb" 
                />
              </View>
              <Text style={styles.iconLabel}>{iconName}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Test MaterialIcons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MaterialIcons Test:</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <MaterialIcons name="home" size={24} color="#059669" />
            </View>
            <Text style={styles.iconLabel}>home</Text>
          </View>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <MaterialIcons name="person" size={24} color="#059669" />
            </View>
            <Text style={styles.iconLabel}>person</Text>
          </View>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <MaterialIcons name="settings" size={24} color="#059669" />
            </View>
            <Text style={styles.iconLabel}>settings</Text>
          </View>
        </View>
      </View>

      {/* Test AntDesign */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AntDesign Test:</Text>
        <View style={styles.iconRow}>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <AntDesign name="home" size={24} color="#dc2626" />
            </View>
            <Text style={styles.iconLabel}>home</Text>
          </View>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <AntDesign name="user" size={24} color="#dc2626" />
            </View>
            <Text style={styles.iconLabel}>user</Text>
          </View>
          <View style={styles.iconItem}>
            <View style={[styles.iconContainer, { backgroundColor: '#f0f0f0' }]}>
              <AntDesign name="setting" size={24} color="#dc2626" />
            </View>
            <Text style={styles.iconLabel}>setting</Text>
          </View>
        </View>
      </View>

      {/* Navigation Icons Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation Icons (SmartIcon):</Text>
        <View style={styles.iconGrid}>
          {['speedometer', 'briefcase', 'cash', 'calendar', 'location', 'help-buoy', 'card', 'grid'].map((iconName, index) => (
            <View key={index} style={styles.iconItem}>
              <View style={[styles.iconContainer, { backgroundColor: '#e8f5e8' }]}>
                <SmartIcon 
                  name={iconName} 
                  size={24} 
                  color="#059669" 
                />
              </View>
              <Text style={styles.iconLabel}>{iconName}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Large test icons */}
      <View style={styles.largeIconRow}>
        <Text style={styles.subtitle}>Large Icons Test:</Text>
        <View style={styles.iconRow}>
          <SmartIcon name="home" size={48} color="#2563eb" />
          <SmartIcon name="person" size={48} color="#059669" />
          <SmartIcon name="settings" size={48} color="#dc2626" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconItem: {
    alignItems: 'center',
    margin: 8,
    width: 60,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 5,
  },
  iconLabel: {
    fontSize: 9,
    textAlign: 'center',
    color: '#666',
  },
  largeIconRow: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
});

export default IconTest;
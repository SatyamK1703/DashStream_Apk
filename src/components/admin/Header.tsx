import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Header = ({ onAdd }: { onAdd: () => void }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Services</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Ionicons name="add" size={22} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
const styles=StyleSheet.create({
    header: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 999,
  }
})

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// ✅ Define props type
type HeaderProps = {
  title?: string;
  onAdd?: () => void;
  onBack?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title = 'Manage Services', onAdd, onBack }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack ? onBack : () => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={22} color="black" />
      </TouchableOpacity>

      {/* Center Title */}
      <Text style={styles.headerTitle}>{title}</Text>

      {/* Add Button (optional) */}
      {onAdd ? (
        <TouchableOpacity style={styles.addButton} onPress={onAdd}>
          <Ionicons name="add" size={22} color="white" />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 38 }} /> // keeps layout balanced if no add button
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  backButton: {
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 8,
    zIndex: 1,
    borderRadius: 99,
  },
});

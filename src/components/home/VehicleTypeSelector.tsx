import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const vehicleOptions = [
  { label: 'Car', icon: 'car-outline' },
  { label: 'Motorcycle', icon: 'bicycle-outline' },
  { label: 'Bicycle', icon: 'trail-sign-outline' },
];

const VehicleTypeSelector = ({ selectedType, onSelectType }: { selectedType: string; onSelectType: (type: string) => void }) => (
  <View style={styles.container}>
    {vehicleOptions.map((vehicle) => {
      const isActive = selectedType === vehicle.label;
      return (
        <TouchableOpacity
          key={vehicle.label}
          style={[styles.button, isActive && styles.activeButton]}
          onPress={() => onSelectType(vehicle.label)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={vehicle.icon as any}
            size={20}
            color={isActive ? '#fff' : '#6b7280'}
            style={styles.icon}
          />
          <Text style={[styles.text, isActive && styles.activeText]}>{vehicle.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    width: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: '#2563eb',
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  icon: {
    marginBottom: 6,
  },
  text: {
    fontWeight: '600',
    color: '#374151',
    fontSize: 14,
  },
  activeText: {
    color: '#fff',
  },
});

export default VehicleTypeSelector;

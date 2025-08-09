import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './BookingsScreen.styles';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="calendar-blank" size={48} color="#9CA3AF" />
      <Text style={styles.emptyText}>No bookings found</Text>
      <Text style={styles.emptySubText}>Try adjusting your filters</Text>
    </View>
  );
};

export default EmptyState;

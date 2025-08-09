import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AdminService.styles';

interface EmptyStateProps {
  onAddService: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddService }) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="list" size={50} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No services found</Text>
      <Text style={styles.emptyDescription}>
        Try changing your search or filter criteria
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddService}>
        <Text style={styles.emptyButtonText}>Add New Service</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyState;

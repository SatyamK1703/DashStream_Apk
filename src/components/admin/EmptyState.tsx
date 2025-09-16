import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AdminService.styles';

type EmptyStateProps = {
  onAddService: () => void;
  placetext?: string;
  title?: string;
  description?:string;
};

const EmptyState: React.FC<EmptyStateProps> = ({ 
  onAddService, 
  placetext = "Add a new service",
  title ="No services found",
  description = "Try changing your search or filter criteria"
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="list" size={50} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>
      {description}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onAddService}>
        <Text style={styles.emptyButtonText}>{placetext}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EmptyState;

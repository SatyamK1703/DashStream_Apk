import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AdminService.styles';

interface SortControlsProps {
  itemCount: number;
  sortBy: 'name' | 'price' | 'category' | 'date';
  sortOrder: 'asc' | 'desc';
  onSortByChange: () => void;
  onSortOrderToggle: () => void;
}

const SortControls: React.FC<SortControlsProps> = ({
  itemCount,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle
}) => {
  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sortText}>
        {itemCount} {itemCount === 1 ? 'service' : 'services'} found
      </Text>
      
      <View style={styles.sortButtonContainer}>
        <Text style={[styles.sortText, { marginRight: 8 }]}>Sort by:</Text>
        <TouchableOpacity style={styles.sortButton} onPress={onSortByChange}>
          <Text style={[styles.sortText, { textTransform: 'capitalize' }]}>
            {sortBy}
          </Text>
          <TouchableOpacity style={{ marginLeft: 8 }} onPress={onSortOrderToggle}>
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="#4B5563" 
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SortControls;

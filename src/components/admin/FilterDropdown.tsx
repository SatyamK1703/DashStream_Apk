import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './BookingsScreen.styles';

interface FilterDropdownProps {
  visible: boolean;
  sortBy: 'newest' | 'oldest';
  onSortChange: (sort: 'newest' | 'oldest') => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  visible,
  sortBy,
  onSortChange,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.filterDropdown}>
      <Text style={styles.filterDropdownTitle}>Sort By</Text>
      <View style={styles.sortOptions}>
        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'newest' ? styles.sortOptionActive : styles.sortOptionInactive,
          ]}
          onPress={() => onSortChange('newest')}
        >
          <View
            style={[
              styles.radioButton,
              sortBy === 'newest' && styles.radioButtonSelected,
            ]}
          />
          <Text style={styles.sortOptionText}>Newest First</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === 'oldest' ? styles.sortOptionActive : styles.sortOptionInactive,
          ]}
          onPress={() => onSortChange('oldest')}
        >
          <View
            style={[
              styles.radioButton,
              sortBy === 'oldest' && styles.radioButtonSelected,
            ]}
          />
          <Text style={styles.sortOptionText}>Oldest First</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterDropdown;

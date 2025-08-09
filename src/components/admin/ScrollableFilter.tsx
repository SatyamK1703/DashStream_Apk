import React from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import { FilterOption } from '../../types/AdminType';
import { styles } from './BookingsScreen.styles';

interface ScrollableFilterProps {
  options: FilterOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const ScrollableFilter: React.FC<ScrollableFilterProps> = ({
  options,
  selectedValue,
  onSelect,
}) => {
  return (
    <FlatList
      data={options}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.value}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedValue === item.value ? styles.filterChipActive : styles.filterChipInactive,
          ]}
          onPress={() => onSelect(item.value)}
        >
          <Text
            style={[
              styles.filterChipText,
              selectedValue === item.value ? styles.filterChipTextActive : styles.filterChipTextInactive,
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default ScrollableFilter;

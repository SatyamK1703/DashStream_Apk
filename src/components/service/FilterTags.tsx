import React from 'react';
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface FilterTagsProps {
  tags: string[];
  selectedTag?: string;
  onPress?: (tag: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({ tags, selectedTag, onPress }) => {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      {tags.map(tag => {
        const isSelected = selectedTag === tag;
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagItem,
              isSelected && styles.tagItemSelected,
            ]}
            onPress={() => onPress?.(tag)}
          >
            <Text style={[
              styles.tagText,
              isSelected && styles.tagTextSelected,
            ]}>
              {tag}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
  },
  tagItem: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 9999, // fully rounded pill
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    backgroundColor: 'transparent',
    marginRight: 8,
  },
  tagItemSelected: {
    backgroundColor: '#FDE047', // yellow-300 (if needed)
    borderColor: '#FACC15',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151', // gray-700
  },
  tagTextSelected: {
    color: '#1F2937', // gray-800
  },
});

export default FilterTags;

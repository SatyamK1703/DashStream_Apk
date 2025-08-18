import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './BookingsScreen.styles';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onToggleFilters: () => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onToggleFilters,
}) => {
  return (
    <View style={styles.searchFilterContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by ID, customer, pro, service..."
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={onClearSearch}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity style={styles.filterButton} onPress={onToggleFilters}>
        <MaterialCommunityIcons name="filter-variant" size={20} color="#4B5563" />
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SearchAndFilter;



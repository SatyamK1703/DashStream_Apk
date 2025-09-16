import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './AdminService.styles';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClear: () => void;
  placeholder?:string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onClear,
  placeholder
}) => {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={20} color="#9CA3AF" />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
      {searchQuery ? (
        <TouchableOpacity onPress={onClear}>
          <Ionicons name="close-circle" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;

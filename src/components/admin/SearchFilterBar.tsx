import React from 'react';
import { View, TextInput, TouchableOpacity,StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from'./styles';

interface Props {
  searchQuery: string;
  onChange: (text: string) => void;
  onClear: () => void;
}

const SearchFilterBar: React.FC<Props> = ({ searchQuery, onChange, onClear }) => (
  <View style={styles.searchBarContainer}>
    <Ionicons name="search" size={20} color="#9CA3AF" />
    <TextInput
      style={styles.searchInput}
      placeholder="Search services..."
      value={searchQuery}
      onChangeText={onChange}
    />
    {searchQuery ? (
      <TouchableOpacity onPress={onClear}>
        <Ionicons name="close-circle" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    ) : null}
  </View>
);

export default SearchFilterBar;

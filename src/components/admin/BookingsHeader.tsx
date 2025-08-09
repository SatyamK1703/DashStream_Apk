import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './BookingsScreen.styles';

interface BookingsHeaderProps {
  onBack: () => void;
}

const BookingsHeader: React.FC<BookingsHeaderProps> = ({ onBack }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>
    </View>
  );
};

export default BookingsHeader;

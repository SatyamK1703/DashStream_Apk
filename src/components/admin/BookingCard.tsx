import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

interface BookingCardProps {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  amount: string;
  onPress: () => void;
}

const BookingCard = ({ id, customerName, service, date, time, status, amount, onPress }: BookingCardProps) => {
  const statusBgStyle = styles[`status-${status}`];
  const statusTextStyle = styles[`status-${status}Text`];
  
  return (
    <TouchableOpacity 
      style={styles.bookingCard}
      onPress={onPress}
    >
      <View style={styles.bookingCardHeader}>
        <View>
          <Text style={styles.bookingCardName}>{customerName}</Text>
          <Text style={styles.bookingCardService}>{service}</Text>
        </View>
        <Text style={styles.bookingCardAmount}>{amount}</Text>
      </View>
      
      <View style={styles.bookingCardFooter}>
        <View style={styles.bookingCardDate}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.bookingCardDateTime}>{date}, {time}</Text>
        </View>
        <View style={[styles.bookingCardStatus, statusBgStyle]}>
          <Text style={[styles.bookingCardStatusText, statusTextStyle]}>{status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookingCard;
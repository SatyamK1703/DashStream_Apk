import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Booking } from '../../types/AdminType';
import { styles } from './BookingsScreen.styles';

interface BookingCardProps {
  booking: Booking;
  onPress: (bookingId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return { badge: styles.statusPending, text: styles.statusTextPending };
      case 'ongoing':
        return { badge: styles.statusOngoing, text: styles.statusTextOngoing };
      case 'completed':
        return { badge: styles.statusCompleted, text: styles.statusTextCompleted };
      case 'cancelled':
        return { badge: styles.statusCancelled, text: styles.statusTextCancelled };
      default:
        return { badge: styles.statusDefault, text: styles.statusTextDefault };
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return styles.paymentPaid;
      case 'pending':
        return styles.paymentPending;
      case 'failed':
        return styles.paymentFailed;
      default:
        return styles.paymentDefault;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Payment Pending';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Unknown';
    }
  };

  const statusStyles = getStatusStyles(booking.status);

  return (
    <TouchableOpacity
      style={styles.bookingCard}
      onPress={() => onPress(booking._id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{booking.customer.name}</Text>
          <Text style={styles.serviceName}>{booking.service.title}</Text>
        </View>
        <Text style={styles.amount}>₹{booking.totalAmount}</Text>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            {booking.date}, {booking.time}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText} numberOfLines={1}>
            {booking.address}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <MaterialIcons name="person-outline" size={14} color="#6B7280" />
          <Text style={styles.detailText}>
            Pro: {booking.professionalName || 'Not assigned'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.statusBadge, statusStyles.badge]}>
          <Text style={[styles.statusText, statusStyles.text]}>
            {booking.status}
          </Text>
        </View>

        <View style={styles.paymentStatus}>
          <Text
            style={[
              styles.paymentStatusText,
              getPaymentStatusStyle(booking.paymentStatus),
            ]}
          >
            {getPaymentStatusText(booking.paymentStatus)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BookingCard;

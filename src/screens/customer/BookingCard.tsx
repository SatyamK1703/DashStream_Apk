import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../../types/api';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

const formatTime = (timeString: string) => {
  const time = new Date(timeString);
  return time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed': return styles.statusBlue;
    case 'in-progress': return styles.statusGreen;
    case 'completed': return styles.statusGreen;
    case 'cancelled': return styles.statusRed;
    default: return styles.statusGray;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Pending';
    case 'confirmed': return 'Confirmed';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Completed';
    case 'cancelled': return 'Cancelled';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  // Handle potential missing data
  if (!booking || typeof booking !== 'object') {
    console.error('Invalid booking data:', booking);
    return null;
  }

  // Check if booking has the required fields
  if (!booking._id || !booking.status) {
    console.error('Booking missing required fields:', booking);
    return null;
  }

  // Handle services array vs single service object
  const serviceName = booking.service?.name || 
                     (booking.services && booking.services[0]?.serviceId?.title) || 
                     'Service';

  // Handle address data
  const addressLine = booking.address?.addressLine1 || 'Address not available';
  const city = booking.address?.city || '';
  const addressText = city ? `${addressLine}, ${city}` : addressLine;

  // Handle professional data
  const hasProfessional = !!booking.professional;
  const professionalName = hasProfessional ? 
                          (booking.professional.user?.name || booking.professional.name || 'Professional') : 
                          'Not assigned';
  const profileImageUrl = hasProfessional && 
                         (booking.professional.user?.profileImage?.url || booking.professional.profileImage?.url);

  // Handle amount formatting
  const amount = booking.totalAmount || 0;
  const formattedAmount = typeof amount === 'number' ? 
                         amount.toLocaleString('en-IN') : 
                         String(amount);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.bookingId}>#{booking.bookingId || booking._id}</Text>
            <View style={[styles.statusBadge, getStatusStyle(booking.status)]}>
              <Text style={[styles.statusText, getStatusStyle(booking.status)]}>{getStatusText(booking.status)}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {formatDate(booking.scheduledDate)}, {formatTime(booking.scheduledTime || booking.scheduledDate)}
          </Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="construct-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{serviceName}</Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="location-outline" size={18} color="#2563eb" />
          <Text style={styles.text} numberOfLines={1}>
            {addressText}
          </Text>
        </View>

        {hasProfessional && (
          <View style={styles.rowIconText}>
            <Ionicons name="person-outline" size={18} color="#2563eb" />
            <View style={styles.rowCenter}>
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Ionicons name="person" size={12} color="#666" />
                </View>
              )}
              <Text style={styles.text}>{professionalName}</Text>
            </View>
          </View>
        )}

        <View style={styles.rowIconText}>
          <Ionicons name="cash-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>₹{formattedAmount}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Service • {formatDate(booking.scheduledDate)}
        </Text>
        <View style={styles.rowCenter}>
          <Text style={styles.linkText}>
            {booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'in-progress'
              ? 'Track Booking'
              : 'View Details'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#2563eb" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
  cardContent: { padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowIconText: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  bookingId: { fontWeight: '600', color: '#1f2937' },
  timestamp: { color: '#6b7280', fontSize: 12 },
  statusBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
  statusText: { fontSize: 12, fontWeight: '500' },
  statusBlue: { backgroundColor: '#dbeafe', color: '#2563eb' },
  statusGreen: { backgroundColor: '#d1fae5', color: '#10b981' },
  statusRed: { backgroundColor: '#fee2e2', color: '#ef4444' },
  statusGray: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  text: { color: '#1f2937', flexShrink: 1, marginLeft: 8 },
  avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  footer: { backgroundColor: '#f9fafb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f3f4f6' },
  footerText: { color: '#6b7280', fontSize: 12 },
  linkText: { color: '#2563eb', fontWeight: '500', marginRight: 4 },
  avatarPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
});

export default BookingCard;

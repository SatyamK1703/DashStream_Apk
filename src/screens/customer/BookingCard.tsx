// import React from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Booking } from '../../types/api';

// interface BookingCardProps {
//   booking: Booking;
//   onPress: () => void;
// }

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);

//   if (date.toDateString() === today.toDateString()) {
//     return 'Today';
//   } else if (date.toDateString() === tomorrow.toDateString()) {
//     return 'Tomorrow';
//   } else {
//     return date.toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   }
// };

// const formatTime = (timeString: string) => {
//   const time = new Date(timeString);
//   return time.toLocaleTimeString('en-IN', {
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true
//   });
// };

// const getStatusStyle = (status: string) => {
//   switch (status) {
//     case 'pending':
//     case 'confirmed': return styles.statusBlue;
//     case 'in-progress': return styles.statusGreen;
//     case 'completed': return styles.statusGreen;
//     case 'cancelled': return styles.statusRed;
//     default: return styles.statusGray;
//   }
// };

// const getStatusText = (status: string) => {
//   switch (status) {
//     case 'pending': return 'Pending';
//     case 'confirmed': return 'Confirmed';
//     case 'in-progress': return 'In Progress';
//     case 'completed': return 'Completed';
//     case 'cancelled': return 'Cancelled';
//     default: return status.charAt(0).toUpperCase() + status.slice(1);
//   }
// };

// const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
//   // Handle potential missing data
//   if (!booking || typeof booking !== 'object') {
//     console.error('Invalid booking data:', booking);
//     return null;
//   }

//   // Check if booking has the required fields
//   if (!booking._id || !booking.status) {
//     console.error('Booking missing required fields:', booking);
//     return null;
//   }

//   // Handle one or more services
//   const serviceName =
//     booking.service?.name ||
//     (booking.services && booking.services.length > 0
//       ? booking.services
//           .map((s) => s?.serviceId?.title || s.title)
//           .filter(Boolean)
//           .join(', ')
//       : 'Service');

//   // Handle address data
//   const addressObject = (booking as any).location?.address;
//   const addressText =
//     addressObject && typeof addressObject === 'object'
//       ? [
//           addressObject.name,
//           addressObject.address,
//           addressObject.landmark,
//           addressObject.city,
//           addressObject.pincode,
//         ]
//           .filter(Boolean)
//           .join(', ')
//       : addressObject || 'Address not available';

//   // Handle professional data
//   const hasProfessional = !!booking.professional;
//   const professionalName = hasProfessional ?
//     (booking.professional.user?.name || booking.professional.name || 'Professional') :
//     'Not assigned';
//   const profileImageUrl = hasProfessional &&
//     (booking.professional.user?.profileImage?.url || booking.professional.profileImage?.url);

//   // Handle amount formatting
//   const amount = booking.totalAmount || 0;
//   const formattedAmount = typeof amount === 'number' ?
//     amount.toLocaleString('en-IN') :
//     String(amount);

//   return (
//     <TouchableOpacity style={styles.card} onPress={onPress}>
//       <View style={styles.cardContent}>
//         <View style={styles.rowBetween}>
//           <View style={styles.rowCenter}>
//             <Text style={styles.bookingId}>#{booking.bookingId || booking._id}</Text>
//             <View style={[styles.statusBadge, getStatusStyle(booking.status)]}>
//               <Text style={[styles.statusText, getStatusStyle(booking.status)]}>{getStatusText(booking.status)}</Text>
//             </View>
//           </View>
//           <Text style={styles.timestamp}>
//             {formatDate(booking.scheduledDate)}, {formatTime(booking.scheduledTime || booking.scheduledDate)}
//           </Text>
//         </View>

//         <View style={styles.rowIconText}>
//           <Ionicons name="construct-outline" size={18} color="#2563eb" />
//           <Text style={styles.text}>{serviceName}</Text>
//         </View>

//         <View style={styles.rowIconText}>
//           <Ionicons name="location-outline" size={18} color="#2563eb" />
//           <Text style={styles.text} numberOfLines={1}>
//             {addressText}
//           </Text>
//         </View>

//         {hasProfessional && (
//           <View style={styles.rowIconText}>
//             <Ionicons name="person-outline" size={18} color="#2563eb" />
//             <View style={styles.rowCenter}>
//               {profileImageUrl ? (
//                 <Image
//                   source={{ uri: profileImageUrl }}
//                   style={styles.avatar}
//                 />
//               ) : (
//                 <View style={[styles.avatar, styles.avatarPlaceholder]}>
//                   <Ionicons name="person" size={12} color="#666" />
//                 </View>
//               )}
//               <Text style={styles.text}>{professionalName}</Text>
//             </View>
//           </View>
//         )}

//         <View style={styles.rowIconText}>
//           <Ionicons name="cash-outline" size={18} color="#2563eb" />
//           <Text style={styles.text}>₹{formattedAmount}</Text>
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>
//           Service • {formatDate(booking.scheduledDate)}
//         </Text>
//         <View style={styles.rowCenter}>
//           <Text style={styles.linkText}>
//             {booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'in-progress'
//               ? 'Track Booking'
//               : 'View Details'}
//           </Text>
//           <Ionicons name="chevron-forward" size={16} color="#2563eb" />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
//   cardContent: { padding: 16 },
//   rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
//   rowCenter: { flexDirection: 'row', alignItems: 'center' },
//   rowIconText: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   bookingId: { fontWeight: '600', color: '#1f2937' },
//   timestamp: { color: '#6b7280', fontSize: 12 },
//   statusBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999 },
//   statusText: { fontSize: 12, fontWeight: '500' },
//   statusBlue: { backgroundColor: '#dbeafe', color: '#2563eb' },
//   statusGreen: { backgroundColor: '#d1fae5', color: '#10b981' },
//   statusRed: { backgroundColor: '#fee2e2', color: '#ef4444' },
//   statusGray: { backgroundColor: '#f3f4f6', color: '#6b7280' },
//   text: { color: '#1f2937', flexShrink: 1, marginLeft: 8 },
//   avatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
//   footer: { backgroundColor: '#f9fafb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f3f4f6' },
//   footerText: { color: '#6b7280', fontSize: 12 },
//   linkText: { color: '#2563eb', fontWeight: '500', marginRight: 4 },
//   avatarPlaceholder: { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
// });

// export default BookingCard;

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
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (timeString: string) => {
  const time = new Date(timeString);
  return time.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
    case 'confirmed':
      return '#2563eb';
    case 'in-progress':
      return '#10b981';
    case 'completed':
      return '#059669';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const statusColor = getStatusColor(booking.status);

  const serviceName =
    booking.service?.name ||
    booking.services
      ?.map((s) => s?.serviceId?.title || s.title)
      .filter(Boolean)
      .join(', ') ||
    'Service';

  const professionalName =
    booking.professional?.user?.name || booking.professional?.name || 'Not assigned';

  const profileImage =
    booking.professional?.user?.profileImage?.url || booking.professional?.profileImage?.url;

  const formattedAmount = (booking.totalAmount || 0).toLocaleString('en-IN');

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.bookingId}>#{booking.bookingId || booking._id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {booking.status.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Ionicons name="construct-outline" size={18} color="#2563eb" />
          <Text style={[styles.text, { flex: 1 }]}>{serviceName}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>
            {formatDate(booking.scheduledDate)} •{' '}
            {formatTime(booking.scheduledTime || booking.scheduledDate)}
          </Text>
        </View>

        {booking.location?.address && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color="#2563eb" />
            <Text style={styles.text} numberOfLines={1}>
              {booking.location.address.address || 'Address not available'}
            </Text>
          </View>
        )}

        {booking.professional && (
          <View style={styles.professionalRow}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={14} color="#6b7280" />
              </View>
            )}
            <Text style={styles.text}>{professionalName}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>₹{formattedAmount}</Text>
        <View style={styles.footerAction}>
          <Text style={styles.linkText}>
            {['pending', 'confirmed', 'in-progress'].includes(booking.status)
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  body: {
    marginTop: 8,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    color: '#374151',
    fontSize: 14,
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f3f4f6',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 8,
  },
  amount: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111827',
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
});

export default BookingCard;

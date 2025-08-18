import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator,StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView  } from 'react-native-safe-area-context';

type BookingsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

type Booking = {
  id: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  date: string;
  time: string;
  services: Array<{
    name: string;
    price: number;
  }>;
  totalAmount: number;
  address: string;
  professionalName?: string;
  professionalImage?: any;
};

const BookingsScreen = () => {
  const navigation = useNavigation<BookingsScreenNavigationProp>();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for bookings
  const bookings: Booking[] = [
    {
      id: 'BK1001',
      status: 'upcoming',
      date: 'Today',
      time: '11:00 AM',
      services: [
        { name: 'Basic Wash', price: 499 },
        { name: 'Premium Wash', price: 999 }
      ],
      totalAmount: 1397,
      address: '123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Rahul Sharma',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1002',
      status: 'ongoing',
      date: 'Today',
      time: '09:30 AM',
      services: [
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 799,
      address: 'Office - 42 Business Park, Mumbai, Maharashtra',
      professionalName: 'Amit Patel',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1003',
      status: 'upcoming',
      date: 'Tomorrow',
      time: '10:00 AM',
      services: [
        { name: 'Basic Wash', price: 499 }
      ],
      totalAmount: 499,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra'
    },
    {
      id: 'BK1004',
      status: 'completed',
      date: 'Yesterday',
      time: '02:00 PM',
      services: [
        { name: 'Premium Wash', price: 999 },
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 1798,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Vikram Singh',
      professionalImage: require('../../assets/images/image.png')
    },
    {
      id: 'BK1005',
      status: 'cancelled',
      date: '12 Jun 2023',
      time: '11:30 AM',
      services: [
        { name: 'Basic Wash', price: 499 }
      ],
      totalAmount: 499,
      address: 'Office - 42 Business Park, Mumbai, Maharashtra'
    },
    {
      id: 'BK1006',
      status: 'completed',
      date: '10 Jun 2023',
      time: '09:00 AM',
      services: [
        { name: 'Interior Cleaning', price: 799 }
      ],
      totalAmount: 799,
      address: 'Home - 123 Main Street, Mumbai, Maharashtra',
      professionalName: 'Rahul Sharma',
      professionalImage: require('../../assets/images/image.png')
    },
  ];

  const filteredBookings = bookings.filter(booking => {
    if (activeTab === 'upcoming') {
      return booking.status === 'upcoming' || booking.status === 'ongoing';
    } else {
      return booking.status === 'completed' || booking.status === 'cancelled';
    }
  });

  const handleViewBooking = (bookingId: string, status: string) => {
    if (status === 'upcoming' || status === 'ongoing') {
      navigation.navigate('TrackBooking', { bookingId });
    } else {
      navigation.navigate('OrderDetails', { bookingId });
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'upcoming': return styles.statusBlue;
      case 'ongoing': return styles.statusGreen;
      case 'completed': return styles.statusGreen;
      case 'cancelled': return styles.statusRed;
      default: return styles.statusGray;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'ongoing': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleViewBooking(item.id, item.status)}>
      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <Text style={styles.bookingId}>Booking #{item.id}</Text>
            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
              <Text style={[styles.statusText, getStatusStyle(item.status)]}>{getStatusText(item.status)}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>{item.date}, {item.time}</Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="car-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{item.services.map(service => service.name).join(', ')}</Text>
        </View>

        <View style={styles.rowIconText}>
          <Ionicons name="location-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>{item.address}</Text>
        </View>

        {(item.status === 'ongoing' || item.status === 'completed') && item.professionalName && (
          <View style={styles.rowIconText}>
            <Ionicons name="person-outline" size={18} color="#2563eb" />
            <View style={styles.rowCenter}>
              <Image source={item.professionalImage} style={styles.avatar} />
              <Text style={styles.text}>{item.professionalName}</Text>
            </View>
          </View>
        )}

        <View style={styles.rowIconText}>
          <Ionicons name="cash-outline" size={18} color="#2563eb" />
          <Text style={styles.text}>₹{item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {item.services.length} {item.services.length === 1 ? 'service' : 'services'}
        </Text>
        <View style={styles.rowCenter}>
          <Text style={styles.linkText}>
            {item.status === 'upcoming' || item.status === 'ongoing' ? 'Track Booking' : 'View Details'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#2563eb" />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No bookings found</Text>
      <Text style={styles.emptyMessage}>
        {activeTab === 'upcoming'
          ? "You don't have any upcoming bookings. Book a service now!"
          : "You don't have any completed bookings yet."}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
          <Text style={styles.buttonText}>Book a Service</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}> 
      {/* ✅ SafeAreaView used here */}

      {/* Header with Back Button + Centered Title */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerText}>My Bookings</Text>
        {/* Empty view for balancing center alignment */}
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={activeTab === 'upcoming' ? styles.activeTabText : styles.inactiveTabText}>
            Upcoming & Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={activeTab === 'completed' ? styles.activeTabText : styles.inactiveTabText}>
            Completed & Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // space between ensures title is centered
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  backButton: {
    width: 24, // ensures proper spacing
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderColor: 'transparent' },
  activeTab: { borderColor: '#2563eb' },
  activeTabText: { color: '#2563eb', fontWeight: '600' },
  inactiveTabText: { color: '#6b7280' },
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
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#6b7280' },
  listContent: { padding: 16 },
  emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { color: '#9ca3af', fontSize: 18, marginTop: 16 },
  emptyMessage: { color: '#6b7280', textAlign: 'center', paddingHorizontal: 40, marginBottom: 24 },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
});

export default BookingsScreen;


// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   Image,
//   ActivityIndicator,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context'; // 1. Import from react-native-safe-area-context
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons } from '@expo/vector-icons';
// import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

// // --- Type Definitions ---
// type BookingsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

// type Booking = {
//   id: string;
//   status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
//   date: string;
//   time: string;
//   services: Array<{
//     name: string;
//     price: number;
//   }>;
//   totalAmount: number;
//   address: string;
//   professionalName?: string;
//   professionalImage?: any;
// };

// // --- Main Component ---
// const BookingsScreen = () => {
//   const navigation = useNavigation<BookingsScreenNavigationProp>();
//   const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
//   const [isLoading, setIsLoading] = useState(false);

//   // Mock data for bookings
//   const bookings: Booking[] = [
//     { id: 'BK1001', status: 'upcoming', date: 'Today', time: '11:00 AM', services: [{ name: 'Basic Wash', price: 499 }, { name: 'Premium Wash', price: 999 }], totalAmount: 1397, address: '123 Main Street, Mumbai, Maharashtra', professionalName: 'Rahul Sharma', professionalImage: require('../../assets/images/image.png') },
//     { id: 'BK1002', status: 'ongoing', date: 'Today', time: '09:30 AM', services: [{ name: 'Interior Cleaning', price: 799 }], totalAmount: 799, address: 'Office - 42 Business Park, Mumbai, Maharashtra', professionalName: 'Amit Patel', professionalImage: require('../../assets/images/image.png') },
//     { id: 'BK1004', status: 'completed', date: 'Yesterday', time: '02:00 PM', services: [{ name: 'Premium Wash', price: 999 }, { name: 'Interior Cleaning', price: 799 }], totalAmount: 1798, address: 'Home - 123 Main Street, Mumbai, Maharashtra', professionalName: 'Vikram Singh', professionalImage: require('../../assets/images/image.png') },
//     { id: 'BK1005', status: 'cancelled', date: '12 Jun 2023', time: '11:30 AM', services: [{ name: 'Basic Wash', price: 499 }], totalAmount: 499, address: 'Office - 42 Business Park, Mumbai, Maharashtra' },
//   ];

//   const filteredBookings = bookings.filter(booking => {
//     if (activeTab === 'upcoming') {
//       return booking.status === 'upcoming' || booking.status === 'ongoing';
//     } else {
//       return booking.status === 'completed' || booking.status === 'cancelled';
//     }
//   });

//   const handleViewBooking = (bookingId: string, status: string) => {
//     if (status === 'upcoming' || status === 'ongoing') {
//       navigation.navigate('TrackBooking', { bookingId });
//     } else {
//       navigation.navigate('OrderDetails', { bookingId });
//     }
//   };

//   const getStatusStyle = (status: string) => {
//     switch (status) {
//       case 'upcoming': return styles.statusBlue;
//       case 'ongoing': return styles.statusGreen;
//       case 'completed': return styles.statusGreen;
//       case 'cancelled': return styles.statusRed;
//       default: return styles.statusGray;
//     }
//   };

//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'upcoming': return 'Upcoming';
//       case 'ongoing': return 'In Progress';
//       case 'completed': return 'Completed';
//       case 'cancelled': return 'Cancelled';
//       default: return status;
//     }
//   };

//   const renderBookingItem = ({ item }: { item: Booking }) => (
//     <TouchableOpacity style={styles.card} onPress={() => handleViewBooking(item.id, item.status)}>
//       <View style={styles.cardContent}>
//         <View style={styles.rowBetween}>
//           <View style={styles.rowCenter}>
//             <Text style={styles.bookingId}>Booking #{item.id}</Text>
//             <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
//               <Text style={[styles.statusText, getStatusStyle(item.status)]}>{getStatusText(item.status)}</Text>
//             </View>
//           </View>
//           <Text style={styles.timestamp}>{item.date}, {item.time}</Text>
//         </View>

//         <View style={styles.rowIconText}>
//           <Ionicons name="car-outline" size={18} color="#2563eb" />
//           <Text style={styles.text}>{item.services.map(service => service.name).join(', ')}</Text>
//         </View>
//       </View>

//       <View style={styles.footer}>
//         <Text style={styles.footerText}>
//           {item.services.length} {item.services.length === 1 ? 'service' : 'services'}
//         </Text>
//         <View style={styles.rowCenter}>
//           <Text style={styles.linkText}>
//             {item.status === 'upcoming' || item.status === 'ongoing' ? 'Track Booking' : 'View Details'}
//           </Text>
//           <Ionicons name="chevron-forward" size={16} color="#2563eb" />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyList = () => (
//     <View style={styles.emptyContainer}>
//       <Ionicons name="calendar-outline" size={60} color="#d1d5db" />
//       <Text style={styles.emptyTitle}>No bookings found</Text>
//       <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })}>
//         <Text style={styles.buttonText}>Book a Service</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* 2. New white header with centered title and back button */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={24} color="#1f2937" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Bookings</Text>
//         <View style={styles.headerButton} />
//       </View>

//       <View style={styles.tabs}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
//           onPress={() => setActiveTab('upcoming')}
//         >
//           <Text style={activeTab === 'upcoming' ? styles.activeTabText : styles.inactiveTabText}>
//             Upcoming & Ongoing
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
//           onPress={() => setActiveTab('completed')}
//         >
//           <Text style={activeTab === 'completed' ? styles.activeTabText : styles.inactiveTabText}>
//             History
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {isLoading ? (
//         <View style={styles.loaderContainer}>
//           <ActivityIndicator size="large" color="#2563eb" />
//           <Text style={styles.loadingText}>Loading bookings...</Text>
//         </View>
//       ) : (
//         <FlatList
//           data={filteredBookings}
//           renderItem={renderBookingItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={renderEmptyList}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// // 3. Consolidated Stylesheet
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: 'white' },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderColor: '#e5e7eb',
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#1f2937',
//   },
//   tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#e5e7eb' },
//   tab: { flex: 1, alignItems: 'center', paddingVertical: 16, borderBottomWidth: 2, borderColor: 'transparent' },
//   activeTab: { borderColor: '#2563eb' },
//   activeTabText: { color: '#2563eb', fontWeight: '600' },
//   inactiveTabText: { color: '#6b7280' },
//   card: { backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden' },
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
//   footer: { backgroundColor: '#f9fafb', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#f3f4f6' },
//   footerText: { color: '#6b7280', fontSize: 12 },
//   linkText: { color: '#2563eb', fontWeight: '500', marginRight: 4 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { marginTop: 16, color: '#6b7280' },
//   listContent: { paddingBottom: 16, backgroundColor: '#f9fafb' },
//   emptyContainer: { justifyContent: 'center', alignItems: 'center', paddingVertical: 40, flex: 1 },
//   emptyTitle: { color: '#9ca3af', fontSize: 18, marginTop: 16 },
//   button: { backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
//   buttonText: { color: '#fff', fontWeight: '600' },
// });

// export default BookingsScreen;

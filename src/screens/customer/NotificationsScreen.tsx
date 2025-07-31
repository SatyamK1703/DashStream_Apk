import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'booking' | 'promo' | 'system' | 'payment';
  relatedId?: string;
};

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data fetch
  const fetchNotifications = async () => {
    // In a real app, this would be an API call
    return new Promise<Notification[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Booking Confirmed',
            message: 'Your car wash booking #BK1234 has been confirmed for tomorrow at 10:00 AM.',
            timestamp: '2023-09-15T10:30:00Z',
            isRead: false,
            type: 'booking',
            relatedId: 'BK1234'
          },
          {
            id: '2',
            title: 'Professional on the way',
            message: 'Your car wash professional is on the way. Estimated arrival in 15 minutes.',
            timestamp: '2023-09-14T14:20:00Z',
            isRead: true,
            type: 'booking',
            relatedId: 'BK1233'
          },
          {
            id: '3',
            title: 'Special Offer',
            message: 'Get 20% off on Premium Wash services this weekend. Use code WEEKEND20.',
            timestamp: '2023-09-13T09:15:00Z',
            isRead: false,
            type: 'promo'
          },
          {
            id: '4',
            title: 'Payment Successful',
            message: 'Your payment of ₹499 for booking #BK1232 was successful.',
            timestamp: '2023-09-12T18:45:00Z',
            isRead: true,
            type: 'payment',
            relatedId: 'BK1232'
          },
          {
            id: '5',
            title: 'Rate Your Experience',
            message: 'How was your car wash experience? Rate your service provider now.',
            timestamp: '2023-09-11T12:30:00Z',
            isRead: true,
            type: 'system',
            relatedId: 'BK1231'
          },
          {
            id: '6',
            title: 'Membership Offer',
            message: 'Upgrade to Premium Membership and get unlimited washes at just ₹1999/month.',
            timestamp: '2023-09-10T08:20:00Z',
            isRead: false,
            type: 'promo'
          },
          {
            id: '7',
            title: 'Booking Completed',
            message: 'Your car wash service has been completed. Thank you for using our service!',
            timestamp: '2023-09-09T16:10:00Z',
            isRead: true,
            type: 'booking',
            relatedId: 'BK1230'
          },
        ]);
      }, 1000);
    });
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleNotificationPress = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'booking' && notification.relatedId) {
      // Check if it's an active booking that can be tracked
      if (notification.title.includes('on the way') || notification.title.includes('Confirmed')) {
        navigation.navigate('TrackBooking', { bookingId: notification.relatedId });
      } else {
        navigation.navigate('OrderDetails', { orderId: notification.relatedId });
      }
    } else if (notification.type === 'payment') {
      navigation.navigate('OrderDetails', { orderId: notification.relatedId });
    } else if (notification.type === 'promo') {
      navigation.navigate('Home');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return <Ionicons name="car-outline" size={24} color="#2563eb" />;
      case 'promo':
        return <Ionicons name="gift-outline" size={24} color="#f59e0b" />;
      case 'system':
        return <Ionicons name="information-circle-outline" size={24} color="#10b981" />;
      case 'payment':
        return <Ionicons name="card-outline" size={24} color="#6366f1" />;
      default:
        return <Ionicons name="notifications-outline" size={24} color="#2563eb" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 24) {
      return `${Math.round(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.round(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
  <TouchableOpacity
    style={[styles.notificationItem, !item.isRead ? styles.unread : styles.read]}
    onPress={() => handleNotificationPress(item)}
  >
    <View style={styles.row}>
      <View style={styles.iconContainer}>{getNotificationIcon(item.type)}</View>
      <View style={styles.flex}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, !item.isRead ? styles.boldTitle : styles.normalTitle]}>{item.title}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        <Text style={[styles.message, !item.isRead ? styles.unreadMessage : styles.readMessage]}>{item.message}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

const renderEmptyComponent = () => (
  <View style={styles.emptyContainer}>
    <Ionicons name="notifications-off-outline" size={60} color="#d1d5db" />
    <Text style={styles.emptyText}>No notifications yet</Text>
  </View>
);

if (loading && !refreshing) {
  return (
    <View style={styles.loaderContainer}>
      <ActivityIndicator size="large" color="#2563eb" />
      <Text style={styles.loadingText}>Loading notifications...</Text>
    </View>
  );
}

return (
  <View style={styles.container}>
    <View style={styles.header}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      {notifications.length > 0 && (
        <TouchableOpacity
          onPress={() => {
            setNotifications(prevNotifications =>
              prevNotifications.map(notification => ({ ...notification, isRead: true }))
            );
          }}
        >
          <Text style={styles.markAll}>Mark all as read</Text>
        </TouchableOpacity>
      )}
    </View>

    <FlatList
      data={notifications}
      renderItem={renderNotificationItem}
      keyExtractor={item => item.id}
      contentContainerStyle={{ flexGrow: 1 }}
      ListEmptyComponent={renderEmptyComponent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }
    />
  </View>
);}
export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  backButton: { marginRight: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unread: { backgroundColor: '#eff6ff' },
  read: { backgroundColor: '#fff' },
  iconContainer: { marginRight: 12, marginTop: 4 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 16 },
  boldTitle: { fontWeight: '700', color: '#111827' },
  normalTitle: { fontWeight: '500', color: '#1f2937' },
  timestamp: { fontSize: 12, color: '#6b7280', marginLeft: 8 },
  message: { marginTop: 4 },
  unreadMessage: { color: '#374151' },
  readMessage: { color: '#4b5563' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyText: { color: '#9ca3af', fontSize: 18, marginTop: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, color: '#4b5563' },
  markAll: { color: '#2563eb', fontWeight: '600' },
});


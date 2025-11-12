import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Notification } from '../../types/notification';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'Notifications'
>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const { notifications, loading, error, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    switch (notification.type) {
      case 'booking':
        notification.actionParams?.bookingId &&
          navigation.navigate('TrackBooking', { bookingId: notification.actionParams.bookingId });
        break;
      case 'payment':
        navigation.navigate('PaymentMethods');
        break;
      case 'offer':
        navigation.navigate('CustomerTabs', { screen: 'Home' });
        break;
      case 'system':
        if (notification.actionType === 'open_support_ticket') {
          navigation.navigate('Support');
        }
        break;
      default:
        break;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      Alert.alert('Error', 'Failed to mark all notifications as read.');
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const getIcon = (type: string) => {
    const colorMap: Record<string, string> = {
      booking: '#2563eb',
      payment: '#10b981',
      promo: '#f59e0b',
      offer: '#f59e0b',
      system: '#6b7280',
      chat: '#3b82f6',
    };

    const iconMap: Record<string, string> = {
      booking: 'calendar-outline',
      payment: 'wallet-outline',
      promo: 'pricetag-outline',
      offer: 'gift-outline',
      system: 'settings-outline',
      chat: 'chatbubble-ellipses-outline',
    };

    return (
      <Ionicons
        name={iconMap[type] || 'notifications-outline'}
        size={24}
        color={colorMap[type] || '#6b7280'}
      />
    );
  };

  const formatTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const expanded = expandedId === item._id;

    return (
      <TouchableOpacity
        style={[styles.card, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.9}>
        <View style={styles.row}>
          <View style={styles.iconWrapper}>{getIcon(item.type)}</View>
          <View style={styles.content}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, !item.read && styles.unreadTitle]}>{item.title}</Text>
              <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
            </View>
            <Text
              numberOfLines={expanded ? undefined : 2}
              style={[styles.message, !item.read && styles.unreadMessage]}>
              {item.message}
            </Text>
            {item.message.length > 100 && (
              <TouchableOpacity style={styles.expandButton} onPress={() => toggleExpand(item._id)}>
                <Text style={styles.expandText}>{expanded ? 'Hide Details' : 'View Details'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.centerState}>
      <Ionicons name="notifications-off-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySub}>You’ll see updates and alerts here when available.</Text>
    </View>
  );

  const ErrorState = () => (
    <View style={styles.centerState}>
      <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
      <Text style={styles.errorTitle}>Couldn’t load notifications</Text>
      <Text style={styles.errorSub}>Check your connection and try again.</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={fetchNotifications}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#111" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Notifications</Text>
      {notifications.length > 0 ? (
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAll}>Mark all read</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 80 }} />
      )}
    </View>
  );

  if (loading && notifications.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header />
      {error && notifications.length === 0 ? (
        <ErrorState />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchNotifications}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  backBtn: { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  markAll: { color: '#2563eb', fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadCard: { backgroundColor: '#eef2ff' },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrapper: { marginRight: 12, marginTop: 4 },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  title: { fontSize: 16, color: '#1f2937', fontWeight: '500' },
  unreadTitle: { fontWeight: '700', color: '#111827' },
  time: { fontSize: 12, color: '#6b7280' },
  message: { marginTop: 6, fontSize: 14, color: '#4b5563', lineHeight: 20 },
  unreadMessage: { color: '#1f2937' },
  expandButton: { marginTop: 6 },
  expandText: { color: '#2563eb', fontSize: 13, fontWeight: '600' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#9ca3af', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#6b7280', marginTop: 6, textAlign: 'center' },
  errorTitle: { fontSize: 18, fontWeight: '600', color: '#ef4444', marginTop: 16 },
  errorSub: { color: '#6b7280', fontSize: 14, marginTop: 6, textAlign: 'center' },
  retryBtn: {
    marginTop: 16,
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: '#fff', fontWeight: '600' },
  loadingText: { marginTop: 10, color: '#4b5563', fontSize: 15 },
});

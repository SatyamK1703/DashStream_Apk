import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Notification } from '../../types/notification';

type NotificationsScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'Notifications'
>;

const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const {
    notifications,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotificationStore();

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {    // Mark as read if unread
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
        if (notification.actionParams?.bookingId) {
          navigation.navigate('TrackBooking', { 
            bookingId: notification.actionParams.bookingId 
          });
        }
        break;
      case 'payment':
        if (notification.actionParams?.paymentId) {
          navigation.navigate('PaymentMethods');
        }
        break;
      case 'offer':
        navigation.navigate('CustomerTabs', { screen: 'Home' });
        break;
      default:
        // For general notifications, just mark as read
        break;
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Ionicons name="calendar-outline" size={24} color="#2563eb" />;
      case 'payment':
        return <Ionicons name="wallet-outline" size={24} color="#10b981" />;
      case 'promo':
        return <Ionicons name="pricetag-outline" size={24} color="#f59e0b" />;
      case 'offer':
        return <Ionicons name="gift-outline" size={24} color="#f59e0b" />;
      case 'system':
        return <Ionicons name="settings-outline" size={24} color="#6b7280" />;
      case 'chat':
        return <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3b82f6" />;
      default:
        return <Ionicons name="notifications-outline" size={24} color="#6b7280" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    }
    if (hours > 0) {
      return `${hours}h ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return 'just now';
  };

  const refresh = () => {
    fetchNotifications();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read ? styles.unread : styles.read]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.row}>
        <View style={styles.iconContainer}>{getNotificationIcon(item.type)}</View>
        <View style={styles.flex}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, !item.read ? styles.boldTitle : styles.normalTitle]}>
              {item.title}
            </Text>
            <View style={styles.notificationActions}>
              <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
            </View>
          </View>
          <Text style={[styles.message, !item.read ? styles.unreadMessage : styles.readMessage]}>
            {item.message}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>You&#39;ll see notifications here when you receive them</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
      <Text style={styles.errorTitle}>Failed to load notifications</Text>
      <Text style={styles.errorMessage}>Please check your connection and try again</Text>
      <TouchableOpacity style={styles.retryButton} onPress={refresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && notifications.length === 0 && !error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            Notifications
          </Text>
        </View>
        {notifications.length > 0 && (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.headerAction}>
              <Text style={styles.markAll}>Mark all read</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {error && notifications.length === 0 ? (
        renderErrorState()
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={item => item._id}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmptyComponent}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  markAll: {
    color: '#2563eb',
    fontWeight: '600'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  flex: {
    flex: 1
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  unread: {
    backgroundColor: '#eff6ff'
  },
  read: {
    backgroundColor: '#fff'
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 4
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  title: {
    fontSize: 16
  },
  boldTitle: {
    fontWeight: '700',
    color: '#111827'
  },
  normalTitle: {
    fontWeight: '500',
    color: '#1f2937'
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8
  },
  message: {
    marginTop: 4
  },
  unreadMessage: {
    color: '#374151'
  },
  readMessage: {
    color: '#4b5563'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 18,
    marginTop: 16
  },
  emptySubText: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80
  },
  errorTitle: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16
  },
  errorMessage: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24
  },
  retryButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerAction: {
    marginLeft: 12
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#6b7280'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  loadingText: {
    marginTop: 16,
    color: '#4b5563'
  }
});
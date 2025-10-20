import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotificationStore } from '../../store/useNotificationStore';
import { Notification } from '../../types/notification';

type AdminNotificationsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminNotificationsScreen = () => {
  const navigation = useNavigation<AdminNotificationsScreenNavigationProp>();
  const { 
    notifications, 
    loading, 
    error, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Enable LayoutAnimation for Android
  useEffect(() => {
    if (Platform.OS === 'android') {
          }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }

    // Admin navigation logic
    if (notification.actionType === 'open_booking' && notification.actionParams?.bookingId) {
      navigation.navigate('AdminBookingDetails', { bookingId: notification.actionParams.bookingId });
    } else if (notification.actionType === 'open_support_ticket' && notification.actionParams?.questionId) {
      // Assuming a screen for support tickets exists
      // navigation.navigate('AdminSupportTicketDetails', { ticketId: notification.actionParams.questionId });
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
        return <Ionicons name="car-outline" size={24} color="#2563eb" />;
      case 'offer':
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

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.round(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      const days = Math.round(diffInDays);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-IN');
    }
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const isExpanded = expandedId === item._id;

    const toggleExpansion = () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedId(isExpanded ? null : item._id);
    };

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read ? styles.unread : styles.read]}
        onPress={toggleExpansion}
        activeOpacity={0.7}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>{getNotificationIcon(item.type)}</View>
          <View style={styles.flex}>
            <View style={styles.headerRow}>
              <Text style={[styles.title, !item.read ? styles.boldTitle : styles.normalTitle]}>
                {item.title}
              </Text>
              <Text style={styles.timestamp}>{formatTimestamp(item.createdAt)}</Text>
            </View>
            <Text
              style={[styles.message, !item.read ? styles.unreadMessage : styles.readMessage]}
              numberOfLines={isExpanded ? undefined : 2}
            >
              {item.message}
            </Text>
            {isExpanded && (
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => handleNotificationPress(item)}
              >
                <Text style={styles.detailsButtonText}>View Details</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#d1d5db" />
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubText}>You'll see notifications here when you receive them</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
      <Text style={styles.errorTitle}>Failed to load notifications</Text>
      <Text style={styles.errorMessage}>Please check your connection and try again</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchNotifications}>
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

export default AdminNotificationsScreen;

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
  detailsButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detailsButtonText: {
    color: '#1f2937',
    fontWeight: '500',
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

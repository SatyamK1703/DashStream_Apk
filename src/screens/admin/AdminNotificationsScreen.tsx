import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminNotificationsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

type NotificationType = 'booking' | 'professional' | 'customer' | 'payment' | 'system';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: string;
  data?: {
    bookingId?: string;
    professionalId?: string;
    customerId?: string;
    paymentId?: string;
  };
}

const AdminNotificationsScreen = () => {
  const navigation = useNavigation<AdminNotificationsScreenNavigationProp>();
  
  // State variables
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  
  // Mock data for notifications
  const mockNotifications: Notification[] = [
    {
      id: 'notif001',
      title: 'New Booking Request',
      message: 'A new booking #BK7890 has been created by customer John Doe',
      type: 'booking',
      isRead: false,
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
      data: { bookingId: 'BK7890' }
    },
    {
      id: 'notif002',
      title: 'Professional Verification',
      message: 'Professional Rahul Singh has submitted documents for verification',
      type: 'professional',
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), // 2 hours ago
      data: { professionalId: 'PRO456' }
    },
    {
      id: 'notif003',
      title: 'Payment Failed',
      message: 'Payment for booking #BK7885 has failed. Please check the payment gateway',
      type: 'payment',
      isRead: true,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), // 5 hours ago
      data: { bookingId: 'BK7885', paymentId: 'PAY12345' }
    },
    {
      id: 'notif004',
      title: 'New Customer Registration',
      message: 'A new customer Priya Sharma has registered on the platform',
      type: 'customer',
      isRead: true,
      timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
      data: { customerId: 'CUS789' }
    },
    {
      id: 'notif005',
      title: 'System Update',
      message: 'The system will undergo maintenance on Sunday, 10 PM to 2 AM',
      type: 'system',
      isRead: false,
      timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    },
    {
      id: 'notif006',
      title: 'Booking Canceled',
      message: 'Booking #BK7870 has been canceled by the customer',
      type: 'booking',
      isRead: true,
      timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
      data: { bookingId: 'BK7870' }
    },
    {
      id: 'notif007',
      title: 'Professional Rating',
      message: 'Professional Amit Kumar has received a 5-star rating',
      type: 'professional',
      isRead: true,
      timestamp: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      data: { professionalId: 'PRO123' }
    },
    {
      id: 'notif008',
      title: 'Payment Received',
      message: 'Payment of ₹1,200 received for booking #BK7865',
      type: 'payment',
      isRead: true,
      timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
      data: { bookingId: 'BK7865', paymentId: 'PAY12340' }
    },
    {
      id: 'notif009',
      title: 'Customer Complaint',
      message: 'Customer Vikram Singh has raised a complaint about booking #BK7860',
      type: 'customer',
      isRead: false,
      timestamp: new Date(Date.now() - 6 * 86400000).toISOString(), // 6 days ago
      data: { customerId: 'CUS456', bookingId: 'BK7860' }
    },
    {
      id: 'notif010',
      title: 'Database Backup',
      message: 'Automatic database backup completed successfully',
      type: 'system',
      isRead: true,
      timestamp: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
    },
  ];
  
  // Load notifications
  useEffect(() => {
    // Simulate API call
    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setNotifications(mockNotifications);
          setFilteredNotifications(mockNotifications);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load notifications. Please try again.');
      }
    };
    
    loadNotifications();
  }, []);
  
  // Filter notifications when activeFilter changes
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(notif => notif.type === activeFilter));
    }
  }, [activeFilter, notifications]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would refresh data from the server
      setNotifications(mockNotifications);
      setIsRefreshing(false);
    }, 1500);
  }, []);
  
  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    
    // In a real app, you would make an API call to update the read status
  }, []);
  
  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    if (filteredNotifications.every(notif => notif.isRead)) {
      // All notifications are already read
      Alert.alert('Info', 'All notifications are already marked as read.');
      return;
    }
    
    setIsMarkingAllRead(true);
    
    // Simulate API call
    setTimeout(() => {
      setNotifications(prevNotifications => 
        prevNotifications.map(notif => 
          activeFilter === 'all' || notif.type === activeFilter 
            ? { ...notif, isRead: true } 
            : notif
        )
      );
      setIsMarkingAllRead(false);
    }, 1000);
  }, [filteredNotifications, activeFilter]);
  
  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setNotifications(prevNotifications => 
              prevNotifications.filter(notif => notif.id !== notificationId)
            );
            // In a real app, you would make an API call to delete the notification
          }
        }
      ]
    );
  }, []);
  
  // Handle notification press
  const handleNotificationPress = useCallback((notification: Notification) => {
    // Mark as read when pressed
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type and data
    switch (notification.type) {
      case 'booking':
        if (notification.data?.bookingId) {
          navigation.navigate('AdminBookingDetails', { bookingId: notification.data.bookingId });
        } else {
          navigation.navigate('AdminBookings');
        }
        break;
        
      case 'professional':
        if (notification.data?.professionalId) {
          navigation.navigate('AdminProfessionalDetails', { professionalId: notification.data.professionalId });
        } else {
          navigation.navigate('AdminProfessionals');
        }
        break;
        
      case 'customer':
        if (notification.data?.customerId) {
          navigation.navigate('AdminCustomerDetails', { customerId: notification.data.customerId });
        } else {
          navigation.navigate('AdminCustomers');
        }
        break;
        
      case 'payment':
        if (notification.data?.bookingId) {
          navigation.navigate('AdminBookingDetails', { bookingId: notification.data.bookingId });
        } else {
          // Navigate to a payment screen if available
          Alert.alert('Info', 'Payment details view is not implemented yet.');
        }
        break;
        
      case 'system':
        // System notifications typically don't navigate anywhere
        break;
        
      default:
        break;
    }
  }, [navigation, markAsRead]);
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };
  
  // Get icon for notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'booking':
        return <MaterialIcons name="event-note" size={24} color="#2196F3" />;
      case 'professional':
        return <MaterialIcons name="person" size={24} color="#4CAF50" />;
      case 'customer':
        return <MaterialIcons name="people" size={24} color="#FF9800" />;
      case 'payment':
        return <MaterialIcons name="payment" size={24} color="#9C27B0" />;
      case 'system':
        return <MaterialIcons name="settings-system-daydream" size={24} color="#607D8B" />;
      default:
        return <MaterialIcons name="notifications" size={24} color="#757575" />;
    }
  };
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, item.isRead ? styles.readNotification : styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>{formatTimestamp(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        
        <View style={styles.notificationFooter}>
          <View style={styles.notificationTypeContainer}>
            <Text style={styles.notificationTypeText}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => deleteNotification(item.id)}
          >
            <MaterialIcons name="delete-outline" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Render filter button
  const renderFilterButton = (filter: 'all' | NotificationType, label: string, icon: string) => (
    <TouchableOpacity 
      style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]}
      onPress={() => setActiveFilter(filter)}
    >
      <MaterialIcons 
        name={icon} 
        size={16} 
        color={activeFilter === filter ? '#FFFFFF' : '#555555'} 
      />
      <Text style={[styles.filterButtonText, activeFilter === filter && styles.activeFilterButtonText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.emptyStateText}>Loading notifications...</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyStateContainer}>
        <Image 
          source={require('../../assets/images/image.png')} 
          style={styles.emptyStateImage}
          defaultSource={require('../../assets/images/image.png')}
        />
        <Text style={styles.emptyStateTitle}>No Notifications</Text>
        <Text style={styles.emptyStateText}>
          {activeFilter === 'all' 
            ? 'You don\'t have any notifications yet' 
            : `You don\'t have any ${activeFilter} notifications`}
        </Text>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.markAllReadButton}
          onPress={markAllAsRead}
          disabled={isMarkingAllRead || filteredNotifications.every(notif => notif.isRead)}
        >
          {isMarkingAllRead ? (
            <ActivityIndicator size="small" color="#4CAF50" />
          ) : (
            <>
              <MaterialIcons name="done-all" size={18} color="#4CAF50" />
              <Text style={styles.markAllReadText}>Mark all read</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContentContainer}
      >
        {renderFilterButton('all', 'All', 'notifications')}
        {renderFilterButton('booking', 'Bookings', 'event-note')}
        {renderFilterButton('professional', 'Professionals', 'person')}
        {renderFilterButton('customer', 'Customers', 'people')}
        {renderFilterButton('payment', 'Payments', 'payment')}
        {renderFilterButton('system', 'System', 'settings-system-daydream')}
      </ScrollView>
      
      {/* Notification List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={handleRefresh} 
            colors={['#4CAF50']} 
            tintColor="#4CAF50"
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />
    </View>
  );
};

// ScrollView component for filters
const ScrollView = ({ children, ...props }: any) => {
  return (
    <View {...props}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[{ key: 'filters' }]}
        renderItem={() => <>{children}</>}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  markAllReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
  },
  markAllReadText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  filtersContentContainer: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555555',
    marginLeft: 4,
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  readNotification: {
    opacity: 0.8,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  notificationIconContainer: {
    marginRight: 16,
    alignSelf: 'flex-start',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  notificationTime: {
    fontSize: 12,
    color: '#888888',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTypeContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  notificationTypeText: {
    fontSize: 12,
    color: '#555555',
  },
  deleteButton: {
    padding: 4,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});

export default AdminNotificationsScreen;
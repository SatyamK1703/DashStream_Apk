import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProNotificationsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Notification {
  id: string;
  type: 'job' | 'payment' | 'system' | 'promo';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: {
    jobId?: string;
    paymentId?: string;
    route?: string;
  };
}

const ProNotificationsScreen = () => {
  const navigation = useNavigation<ProNotificationsScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'job' | 'payment' | 'system' | 'promo'>('all');

  // Mock data for notifications
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'job',
      title: 'New Job Assigned',
      message: 'You have been assigned a new car wash job in Koramangala area.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      data: {
        jobId: 'JOB123456',
        route: 'JobDetails'
      }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment Received',
      message: 'You have received a payment of ₹450 for job #JOB123123.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      isRead: true,
      data: {
        paymentId: 'PAY789012',
        route: 'ProEarnings'
      }
    },
    {
      id: '3',
      type: 'system',
      title: 'Profile Verification Complete',
      message: 'Your profile and documents have been verified successfully.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      data: {
        route: 'ProProfile'
      }
    },
    {
      id: '4',
      type: 'job',
      title: 'Job Reminder',
      message: 'Reminder: You have a scheduled job tomorrow at 10:00 AM in Indiranagar.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), // 26 hours ago
      isRead: false,
      data: {
        jobId: 'JOB123457',
        route: 'JobDetails'
      }
    },
    {
      id: '5',
      type: 'promo',
      title: 'Performance Bonus',
      message: 'Complete 10 jobs this week and earn a bonus of ₹500!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
      isRead: true
    },
    {
      id: '6',
      type: 'system',
      title: 'App Update Available',
      message: 'A new version of DashStream Pro is available. Update now for improved features.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
      isRead: true
    },
    {
      id: '7',
      type: 'payment',
      title: 'Weekly Earnings Summary',
      message: 'Your earnings for last week: ₹3,250. Tap to view detailed breakdown.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
      isRead: true,
      data: {
        route: 'ProEarnings'
      }
    },
    {
      id: '8',
      type: 'job',
      title: 'Customer Feedback',
      message: 'You received a 5-star rating for job #JOB122001. Keep up the good work!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
      isRead: true,
      data: {
        jobId: 'JOB122001'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call to fetch notifications
    setIsLoading(true);
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
    }, 1000);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refreshing data
    setTimeout(() => {
      setNotifications(mockNotifications);
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    if (notifications.some(notification => !notification.isRead)) {
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      Alert.alert('Success', 'All notifications marked as read');
    } else {
      Alert.alert('Info', 'All notifications are already read');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read when pressed
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type and data
    if (notification.data?.route) {
      switch (notification.data.route) {
        case 'JobDetails':
          if (notification.data.jobId) {
            navigation.navigate('JobDetails', { jobId: notification.data.jobId });
          }
          break;
        case 'ProEarnings':
          navigation.navigate('ProEarnings');
          break;
        case 'ProProfile':
          navigation.navigate('ProProfile');
          break;
        default:
          // Default fallback
          navigation.navigate('ProDashboard');
      }
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
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
              prevNotifications.filter(notification => notification.id !== notificationId)
            );
          }
        }
      ]
    );
  };

  const getFilteredNotifications = () => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.type === activeFilter);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <FontAwesome5 name="briefcase" size={20} color="#2563EB" />;
      case 'payment':
        return <MaterialIcons name="payments" size={22} color="#10B981" />;
      case 'system':
        return <Ionicons name="settings" size={22} color="#6B7280" />;
      case 'promo':
        return <Ionicons name="megaphone" size={22} color="#F59E0B" />;
      default:
        return <Ionicons name="notifications" size={22} color="#2563EB" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    return timestamp.toLocaleDateString();
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      className={`p-4 border-b border-gray-200 ${!item.isRead ? 'bg-blue-50' : 'bg-white'}`}
      onPress={() => handleNotificationPress(item)}
    >
      <View className="flex-row justify-between">
        <View className="flex-row flex-1 pr-4">
          <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
            {getNotificationIcon(item.type)}
          </View>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`font-bold ${!item.isRead ? 'text-gray-900' : 'text-gray-800'} flex-1 pr-2`}>
                {item.title}
              </Text>
              {!item.isRead && (
                <View className="w-2 h-2 rounded-full bg-primary" />
              )}
            </View>
            <Text className="text-gray-600 mt-1">{item.message}</Text>
            <Text className="text-gray-500 text-xs mt-2">{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => handleDeleteNotification(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View className="flex-1 items-center justify-center py-10">
      <Ionicons name="notifications-off-outline" size={60} color="#D1D5DB" />
      <Text className="text-gray-500 mt-4 text-center">
        {activeFilter === 'all'
          ? 'No notifications yet'
          : `No ${activeFilter} notifications`}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Notifications</Text>
          </View>
          
          <TouchableOpacity
            className="px-3 py-1 bg-white/20 rounded-full"
            onPress={handleMarkAllAsRead}
          >
            <Text className="text-white text-sm">Mark all as read</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter tabs */}
      <View className="flex-row border-b border-gray-200">
        <ScrollableTab
          label="All"
          isActive={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
          count={notifications.length}
        />
        <ScrollableTab
          label="Jobs"
          isActive={activeFilter === 'job'}
          onPress={() => setActiveFilter('job')}
          count={notifications.filter(n => n.type === 'job').length}
        />
        <ScrollableTab
          label="Payments"
          isActive={activeFilter === 'payment'}
          onPress={() => setActiveFilter('payment')}
          count={notifications.filter(n => n.type === 'payment').length}
        />
        <ScrollableTab
          label="System"
          isActive={activeFilter === 'system'}
          onPress={() => setActiveFilter('system')}
          count={notifications.filter(n => n.type === 'system').length}
        />
        <ScrollableTab
          label="Promos"
          isActive={activeFilter === 'promo'}
          onPress={() => setActiveFilter('promo')}
          count={notifications.filter(n => n.type === 'promo').length}
        />
      </View>

      {/* Notification list */}
      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
      />
    </View>
  );
};

interface ScrollableTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  count: number;
}

const ScrollableTab = ({ label, isActive, onPress, count }: ScrollableTabProps) => (
  <TouchableOpacity
    className={`py-3 px-4 ${isActive ? 'border-b-2 border-primary' : ''}`}
    onPress={onPress}
  >
    <View className="flex-row items-center">
      <Text className={isActive ? 'text-primary font-medium' : 'text-gray-600'}>
        {label}
      </Text>
      {count > 0 && (
        <View className="ml-1 px-1.5 py-0.5 bg-gray-200 rounded-full">
          <Text className="text-gray-700 text-xs">{count}</Text>
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default ProNotificationsScreen;
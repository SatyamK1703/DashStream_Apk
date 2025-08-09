import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types for self-contained component
type ProStackParamList = {
  ProNotifications: undefined;
  JobDetails: { jobId: string };
  ProEarnings: undefined;
  ProProfile: undefined;
  ProDashboard: undefined;
};

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
    route?: keyof ProStackParamList;
  };
}

const ProNotificationsScreen = () => {
  const navigation = useNavigation<ProNotificationsScreenNavigationProp>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'job' | 'payment' | 'system' | 'promo'>('all');

  // --- Data Fetching ---
  const fetchNotifications = useCallback(() => {
    const mockNotifications: Notification[] = [
        { id: '1', type: 'job', title: 'New Job Assigned', message: 'New car wash job in Koramangala.', timestamp: new Date(Date.now() - 30 * 60 * 1000), isRead: false, data: { jobId: 'JOB123456', route: 'JobDetails' } },
        { id: '2', type: 'payment', title: 'Payment Received', message: 'Received ₹450 for job #JOB123123.', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isRead: true, data: { route: 'ProEarnings' } },
        { id: '3', type: 'system', title: 'Profile Verified', message: 'Your profile and documents are verified.', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true, data: { route: 'ProProfile' } },
        { id: '4', type: 'job', title: 'Job Reminder', message: 'Upcoming job tomorrow at 10:00 AM.', timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), isRead: false, data: { jobId: 'JOB123457', route: 'JobDetails' } },
        { id: '5', type: 'promo', title: 'Performance Bonus', message: 'Complete 10 jobs this week for a ₹500 bonus!', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000), isRead: true },
    ];
    setTimeout(() => {
      setNotifications(mockNotifications);
      setIsLoading(false);
      setRefreshing(false);
    }, 1000);
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // --- Handlers ---
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllAsRead = () => {
    if (notifications.some(n => !n.isRead)) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert('Success', 'All notifications marked as read.');
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.data?.route) {
        const { route, ...params } = notification.data;
        // This is a type-safe way to navigate
        navigation.navigate(route, params as any);
    }
  };

  const handleDeleteNotification = (id: string) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setNotifications(prev => prev.filter(n => n.id !== id)) },
    ]);
  };

  // --- Helpers & Render Functions ---
  const getFilteredNotifications = () => {
    if (activeFilter === 'all') return notifications;
    return notifications.filter(n => n.type === activeFilter);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      job: { component: FontAwesome5, name: 'briefcase', color: colors.blue800 },
      payment: { component: MaterialIcons, name: 'payments', color: colors.green800 },
      system: { component: Ionicons, name: 'settings', color: colors.gray700 },
      promo: { component: Ionicons, name: 'megaphone', color: colors.amber800 },
    };
    const { component: Icon, name, color } = iconMap[type];
    return <Icon name={name as any} size={20} color={color} />;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity style={[styles.notificationItem, !item.isRead && styles.unreadItem]} onPress={() => handleNotificationPress(item)}>
      <View style={styles.notificationContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors[`${item.type}100`] }]}>
          {getNotificationIcon(item.type)}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteNotification(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.red500} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={colors.gray300} />
      <Text style={styles.emptyText}>
        {activeFilter === 'all' ? 'You have no notifications' : `No ${activeFilter} notifications`}
      </Text>
    </View>
  );

  if (isLoading) {
    return <View style={styles.centeredScreen}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllAsRead}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'job', 'payment', 'system', 'promo'] as const).map(filter => (
            <TouchableOpacity key={filter} style={[styles.filterButton, activeFilter === filter && styles.activeFilterButton]} onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredNotifications()}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray300: '#D1D5DB',
  gray500: '#6B7280', gray700: '#374151', gray800: '#1F2937', gray900: '#111827',
  red500: '#EF4444', blue50: '#EFF6FF', blue100: '#DBEAFE', blue800: '#1E40AF',
  green100: '#D1FAE5', green800: '#065F46', amber100: '#FEF3C7', amber800: '#92400E',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', position: 'absolute', left: 60, right: 60, textAlign: 'center' },
  markAllButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  markAllText: { color: colors.white, fontSize: 12 },
  filterBar: { backgroundColor: colors.white, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  filterScroll: { paddingHorizontal: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: colors.gray100 },
  activeFilterButton: { backgroundColor: colors.primary },
  filterText: { color: colors.gray700, fontWeight: '500' },
  activeFilterText: { color: colors.white },
  listContainer: { flexGrow: 1 },
  notificationItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  unreadItem: { backgroundColor: colors.blue50, borderLeftWidth: 4, borderLeftColor: colors.primary },
  notificationContent: { flexDirection: 'row', flex: 1 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textContainer: { flex: 1, marginRight: 8 },
  notificationTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray900 },
  notificationMessage: { fontSize: 14, color: colors.gray700, marginTop: 2 },
  timestamp: { fontSize: 12, color: colors.gray500, marginTop: 4 },
  deleteButton: { padding: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: 16, color: colors.gray500, marginTop: 16, textAlign: 'center' },
});

export default ProNotificationsScreen;

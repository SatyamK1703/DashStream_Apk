import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { bookingService } from '../../services';

type OrderHistoryScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

interface Order {
  id: string;
  date: string;
  time: string;
  status: 'completed' | 'cancelled' | 'refunded';
  services: {
    name: string;
    price: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  address: string;
  professional?: {
    name: string;
    rating: number;
    image: string;
  };
  rating?: number;
  reviewSubmitted?: boolean;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
}

const OrderHistoryScreen = () => {
  const navigation = useNavigation<OrderHistoryScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'completed' | 'cancelled' | 'refunded'>('all');

  // API service for orders
  const fetchOrdersFromAPI = async () => {
    try {
      const response = await bookingService.getMyBookings();

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch orders');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const fetchedOrders = await fetchOrdersFromAPI();
        setOrders(fetchedOrders as any);
      } catch (error) {
        console.error('Failed to load orders:', error);
        // Handle error - show empty state or error message
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const fetchedOrders = await fetchOrdersFromAPI();
      setOrders(fetchedOrders as any);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // Handle error silently during refresh
    } finally {
      setRefreshing(false);
    }
  };

  const filteredOrders = activeFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const renderStatusBadge = (status: 'completed' | 'cancelled' | 'refunded') => {
    let icon = '';
    let badgeStyle = {};
    let textStyle = {};
    let iconColor = '';

    switch (status) {
      case 'completed':
        icon = 'checkmark-circle';
        badgeStyle = styles.completed;
        textStyle = styles.completedText;
        iconColor = '#166534';
        break;
      case 'cancelled':
        icon = 'close-circle';
        badgeStyle = styles.cancelled;
        textStyle = styles.cancelledText;
        iconColor = '#991B1B';
        break;
      case 'refunded':
        icon = 'refresh-circle';
        badgeStyle = styles.refunded;
        textStyle = styles.refundedText;
        iconColor = '#1E40AF';
        break;
    }

    return (
      <View style={[styles.badgeBase, badgeStyle]}>
        <Ionicons name={icon} size={14} color={iconColor} />
        <Text style={[styles.textBase, textStyle]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.itemHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.orderMeta}>{item.date} • {item.time}</Text>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      <View style={styles.divider} />

      <View style={styles.serviceSection}>
        {item.services.map((service, index) => (
          <View key={index} style={styles.serviceRow}>
            <Text style={styles.serviceText}>{service.name}</Text>
            <Text style={styles.serviceText}>₹{service.price}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
        </View>
      </View>

      {item.status === 'completed' && item.professional && (
        <View style={styles.proSection}>
          <View style={styles.proInfo}>
            <Image 
              source={{ uri: item.professional.image }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.proName}>{item.professional.name}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.professional.rating}</Text>
              </View>
            </View>
          </View>

          {item.reviewSubmitted ? (
            <View style={styles.ratedRow}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratedText}>Rated {item.rating}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() =>
                navigation.navigate('OrderDetails', {
                  orderId: item.id,
                  showReviewModal: true,
                })
              }
            >
              <Ionicons name="star-outline" size={14} color="#F59E0B" />
              <Text style={styles.rateButtonText}>Rate Service</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {item.status === 'cancelled' && item.cancellationReason && (
        <View style={styles.metaSection}>
          <Text style={styles.metaText}>Reason: {item.cancellationReason}</Text>
        </View>
      )}

      {item.status === 'refunded' && item.refundAmount && item.refundDate && (
        <View style={styles.metaSection}>
          <Text style={styles.metaText}>Refunded ₹{item.refundAmount} on {item.refundDate}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="card-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{item.paymentMethod}</Text>
        </View>
      </View>

      <View style={styles.chevronIcon}>
        <Ionicons name="chevron-forward" size={16} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.itemContainer}>
      <Ionicons name="receipt-outline" size={60} color="#D1D5DB" />
      <Text style={styles.title}>No orders found</Text>
      <Text style={styles.subtitle}>
        {activeFilter === 'all'
          ? "You haven't placed any orders yet"
          : activeFilter === 'completed'
            ? "You don't have any completed orders"
            : activeFilter === 'cancelled'
              ? "You don't have any cancelled orders"
              : "You don't have any refunded orders"}
      </Text>
      {activeFilter !== 'all' && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={styles.buttonText}>View All Orders</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Order History</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {['all', 'completed', 'cancelled', 'refunded'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.tabButton,
              activeFilter === filter ? styles.activeTab : styles.inactiveTab,
              filter !== 'refunded' && styles.tabSpacing,
            ]}
            onPress={() => setActiveFilter(filter as any)}
          >
            <Text
              style={
                activeFilter === filter
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
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
    fontWeight: 'bold',
    color: '#1F2937'
  },
  headerRight: {
    width: 40
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999
  },
  tabSpacing: {
    marginRight: 12
  },
  activeTab: {
    backgroundColor: '#3B82F6'
  },
  inactiveTab: {
    backgroundColor: '#F3F4F6'
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '500'
  },
  inactiveTabText: {
    color: '#374151'
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100
  },
  badgeBase: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999
  },
  textBase: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4
  },
  completed: {
    backgroundColor: '#DCFCE7'
  },
  completedText: {
    color: '#166534'
  },
  cancelled: {
    backgroundColor: '#FEE2E2'
  },
  cancelledText: {
    color: '#991B1B'
  },
  refunded: {
    backgroundColor: '#DBEAFE'
  },
  refundedText: {
    color: '#1E40AF'
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  orderId: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16
  },
  orderMeta: {
    color: '#6B7280',
    fontSize: 14
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8
  },
  serviceSection: {
    marginBottom: 12
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  serviceText: {
    color: '#374151',
    fontSize: 14
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  totalLabel: {
    fontWeight: 'bold',
    color: '#1F2937'
  },
  totalAmount: {
    fontWeight: 'bold',
    color: '#3B82F6'
  },
  proSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  proInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  proName: {
    color: '#374151',
    fontSize: 14
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 4
  },
  ratedRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratedText: {
    color: '#374151',
    fontSize: 14,
    marginLeft: 4
  },
  rateButton: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center'
  },
  rateButtonText: {
    color: '#FB923C',
    fontSize: 14,
    marginLeft: 4
  },
  metaSection: {
    marginTop: 8
  },
  metaText: {
    color: '#6B7280',
    fontSize: 14
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  infoText: {
    color: '#6B7280',
    fontSize: 12,
    marginLeft: 4
  },
  chevronIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16
  },
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#9CA3AF'
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 40
  },
  button: {
    marginTop: 24,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '500'
  }
});
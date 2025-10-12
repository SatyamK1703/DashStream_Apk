import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Share, ActivityIndicator, StyleSheet, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBookingDetails } from '../../hooks/useBookings';
import { Booking } from '../../types/api';

// Types
type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type OrderDetailsScreenRouteProp = RouteProp<CustomerStackParamList, 'OrderDetails'>;

const OrderDetailsScreen = () => {
  const navigation = useNavigation<OrderDetailsScreenNavigationProp>();
  const route = useRoute<OrderDetailsScreenRouteProp>();
  const { bookingId } = route.params;

  const { data: bookingResponse, loading, error } = useBookingDetails(bookingId);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const order = bookingResponse?.booking;

  const handleShareInvoice = async () => {
    if (!order) return;
    try {
      await Share.share({
        message: `Your DashStream invoice for booking #${order.bookingId} is ready. Total amount: ₹${order.totalAmount.toFixed(
          2
        )}`,
        title: `DashStream Invoice #${order.bookingId}`,
      });
    } catch (error) {
      alert('Error sharing invoice');
    }
  };

  const handleDownloadInvoice = () => {
    alert('Invoice download started');
  };

  const handleSubmitReview = () => {
    // Add your review submission logic here
    setShowRatingModal(false);
    alert('Thank you for your review!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loaderContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Failed to load booking details</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go Back</Text>
          </TouchableOpacity>
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
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>Booking #{order.bookingId}</Text>
        </View>
        <TouchableOpacity onPress={handleShareInvoice} style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* Status Banner */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusTitle}>Service {order.status}</Text>
          <Text style={styles.statusMeta}>
            {new Date(order.scheduledDate).toDateString()} at {order.scheduledTime}
          </Text>
        </View>

        {/* Professional Details */}
        {order.professional && (
          <View style={[styles.section, styles.sectionDivider]}>
            <Text style={styles.sectionTitle}>Professional</Text>
            <View style={styles.professionalCard}>
              <Image source={{ uri: order.professional.user.profileImage?.url || 'https://via.placeholder.com/150' }} style={styles.proAvatar} resizeMode="cover" />
              <View style={styles.proInfo}>
                <Text style={styles.proName}>{order.professional.user.name}</Text>
                <View style={styles.rowCenter}>
                  <Ionicons name="star" size={16} color="#f59e0b" />
                  <Text style={styles.proRating}>{order.professional.rating || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* User Review */}
        {order.rating ? (
          <View style={[styles.section, styles.sectionDivider]}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            <View style={styles.reviewCard}>
              <View style={styles.rowStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= (order.rating?.rating || 0) ? 'star' : 'star-outline'}
                    size={20}
                    color="#f59e0b"
                    style={{ marginRight: 2 }}
                  />
                ))}</View>
              <Text style={styles.reviewText}>{order.rating.review}</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.section, styles.sectionDivider]}>
            <Text style={styles.sectionTitle}>Rate Your Experience</Text>
            <TouchableOpacity style={styles.primaryButton} onPress={() => setShowRatingModal(true)}>
              <Text style={styles.primaryButtonText}>Leave a Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service Details */}
        <View style={[styles.section, styles.sectionDivider]}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.card}>
            <View style={styles.serviceRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{order.service.name}</Text>
                {order.service.description ? (
                  <Text style={styles.serviceDesc}>{order.service.description}</Text>
                ) : null}
              </View>
              <Text style={styles.servicePrice}>₹{order.service.price}</Text>
            </View>
          </View>
        </View>

        {/* Booking Details */}
        <View style={[styles.section, styles.sectionDivider]}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Date & Time</Text>
              <Text style={styles.semibold}>{new Date(order.scheduledDate).toDateString()}, {order.scheduledTime}</Text>
            </View>
            <View style={styles.rowAddress}>
              <Text style={[styles.muted, { width: 96 }]}>Address</Text>
              <Text style={[styles.semibold, styles.addressValue]}>{`${order.address.addressLine1}, ${order.address.city}`}</Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.section, styles.sectionDivider]}>
          <View style={styles.paymentHeader}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.paidBadgeRow}>
              <View style={styles.paidDot} />
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.rowBetween}><Text style={styles.muted}>Subtotal</Text><Text style={styles.semibold}>₹{order.price.toFixed(2)}</Text></View>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalLabel}>₹{order.totalAmount.toFixed(2)}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.muted}>Payment Method</Text><Text style={styles.semibold}>{order.paymentMethod}</Text></View>
          </View>
        </View>

        {/* Invoice */}
        <View style={[styles.section, styles.sectionDivider]}>
          <Text style={styles.sectionTitle}>Invoice</Text>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.muted}>Invoice Number</Text>
              <Text style={styles.semibold}>{order.bookingId}</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleDownloadInvoice}>
              <Text style={styles.primaryButtonText}>Download Invoice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={handleShareInvoice}>
              <Text style={styles.outlineButtonText}>Share Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.supportRow} onPress={() => navigation.navigate('Support')}>
            <Text style={styles.supportText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Rating Modal */}
      {showRatingModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ marginHorizontal: 8 }}>
                  <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color="#f59e0b" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.reviewBox}>
              <Text style={styles.reviewHint}>Share your experience (optional)</Text>
              <TextInput
                style={styles.reviewValue}
                placeholder="Tap to write a review..."
                multiline
                value={reviewText}
                onChangeText={setReviewText}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGhost]} onPress={() => setShowRatingModal(false)}>
                <Text style={styles.actionGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleSubmitReview} disabled={rating === 0}>
                <Text style={styles.actionPrimaryText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    color: '#4b5563'
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16
  },
  retryText: {
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
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
    color: '#1f2937',
    textAlign: 'center'
  },
  headerSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2
  },
  shareButton: {
    padding: 4
  },
  scroll: {
    flex: 1
  },
  statusBanner: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  statusTitle: {
    color: '#fff',
    fontWeight: '600'
  },
  statusMeta: {
    color: 'rgba(255,255,255,0.85)'
  },
  section: {
    padding: 16
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937'
  },
  photo: {
    width: 160,
    height: 128,
    borderRadius: 12,
    marginRight: 12
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16
  },
  proAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32
  },
  proInfo: {
    flex: 1,
    marginLeft: 12
  },
  proName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  proRating: {
    marginLeft: 4,
    color: '#111827'
  },
  proBookings: {
    marginLeft: 4,
    color: '#6b7280'
  },
  reviewCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16
  },
  rowStars: {
    flexDirection: 'row',
    marginBottom: 8
  },
  reviewText: {
    color: '#111827'
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 12
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  serviceName: {
    fontWeight: '600',
    color: '#111827'
  },
  serviceDesc: {
    color: '#6b7280',
    fontSize: 12
  },
  servicePrice: {
    fontWeight: '600'
  },
  addonSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  addonTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827'
  },
  addonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  addonName: {
    color: '#1f2937'
  },
  addonPrice: {
    fontWeight: '600'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  rowAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  addressValue: {
    textAlign: 'right',
    flex: 1
  },
  muted: {
    color: '#6b7280'
  },
  semibold: {
    fontWeight: '600',
    color: '#111827'
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  paidBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  paidDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    marginRight: 6
  },
  paidText: {
    color: '#16a34a',
    fontWeight: '600'
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  totalLabel: {
    fontWeight: '700'
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  outlineButtonText: {
    color: '#2563eb',
    fontWeight: '600'
  },
  supportRow: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  supportText: {
    fontWeight: '600',
    color: '#111827'
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16
  },
  reviewBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  reviewHint: {
    color: '#6b7280',
    marginBottom: 8
  },
  reviewValue: {
    color: '#1f2937',
    minHeight: 80
  },
  modalActions: {
    flexDirection: 'row'
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  actionBtnGhost: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginRight: 8
  },
  actionBtnPrimary: {
    backgroundColor: '#2563eb',
    marginLeft: 8
  },
  actionGhostText: {
    color: '#6b7280',
    fontWeight: '600'
  },
  actionPrimaryText: {
    color: '#fff',
    fontWeight: '600'
  },
});

export default OrderDetailsScreen;

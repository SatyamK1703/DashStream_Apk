import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  StyleSheet,
  Platform
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import apiService from '../../services/apiService';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Type Definitions ---
type AdminBookingDetailsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
type AdminBookingDetailsScreenRouteProp = RouteProp<AdminStackParamList, 'AdminBookingDetails'>;

interface BookingDetails {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerId: string;
  professionalName: string | null;
  professionalPhone: string | null;
  professionalId: string | null;
  services: Array<{ name: string; price: string; duration: string }>;
  date: string;
  time: string;
  address: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  subtotal: string;
  tax: string;
  total: string;
  specialInstructions: string;
  createdAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
}

// --- Main Component ---
const AdminBookingDetailsScreen = () => {
  const navigation = useNavigation<AdminBookingDetailsScreenNavigationProp>();
  const route = useRoute<AdminBookingDetailsScreenRouteProp>();
  const { bookingId } = route.params;

  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [professionals, setProfessionals] = useState<Array<{ id: string; name: string; rating: number }>>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  

  // --- Effects ---
  useEffect(() => {
    fetchBookingDetails();
    fetchAvailableProfessionals();
  }, [bookingId]);
  
  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/admin/bookings/${bookingId}`);
      if (response.data && response.data.booking) {
        setBooking(response.data.booking);
        if (response.data.booking.professionalId) {
          setSelectedProfessionalId(response.data.booking.professionalId);
        }
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableProfessionals = async () => {
    try {
      const response = await apiService.get('/admin/professionals/available');
      if (response.data && response.data.professionals) {
        setProfessionals(response.data.professionals);
      }
    } catch (error) {
      console.error('Error fetching professionals:', error);
    }
  };

  // --- Handlers ---
  const handleAssignProfessional = async () => {
    if (!selectedProfessionalId) return Alert.alert('Error', 'Please select a professional.');
    setAssignLoading(true);
    try {
      await apiService.put(`/admin/bookings/${bookingId}/assign`, {
        professionalId: selectedProfessionalId
      });
      
      // Update local state with the selected professional
      const selectedPro = professionals.find(pro => pro.id === selectedProfessionalId);
      if (booking && selectedPro) {
        setBooking({ 
          ...booking, 
          professionalId: selectedPro.id, 
          professionalName: selectedPro.name, 
          professionalPhone: selectedPro.phone || '+91 9876543220' 
        });
      }
      
      Alert.alert('Success', 'Professional assigned successfully');
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning professional:', error);
      Alert.alert('Error', 'Failed to assign professional');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) return Alert.alert('Error', 'Please provide a reason for cancellation.');
    setCancelLoading(true);
    try {
      await apiService.put(`/admin/bookings/${bookingId}/cancel`, {
        reason: cancelReason
      });
      
      // Update local state
      if (booking) {
        setBooking({ 
          ...booking, 
          status: 'cancelled', 
          cancelledAt: new Date().toISOString(), 
          cancelReason 
        });
      }
      
      Alert.alert('Success', 'Booking cancelled successfully');
      setShowCancelModal(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      Alert.alert('Error', 'Failed to cancel booking');
    } finally {
      setCancelLoading(false);
    }
  };

  // --- Style Helpers ---
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { container: styles.statusPendingBg, text: styles.statusPendingText };
      case 'ongoing': return { container: styles.statusOngoingBg, text: styles.statusOngoingText };
      case 'completed': return { container: styles.statusCompletedBg, text: styles.statusCompletedText };
      case 'cancelled': return { container: styles.statusCancelledBg, text: styles.statusCancelledText };
      default: return { container: styles.statusDefaultBg, text: styles.statusDefaultText };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return styles.paymentPaid;
      case 'pending': return styles.paymentPending;
      case 'failed': return styles.paymentFailed;
      default: return styles.paymentDefault;
    }
  };

  // --- Render Functions ---
const renderActionButtons = () => {
  if (!booking) return null;

  switch (booking.status) {
    case 'pending':
      return (
        <View style={buttonstyles.row}>
          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonPrimary, buttonstyles.mr2]}
            onPress={() => setShowAssignModal(true)}
          >
            <MaterialIcons name="person-add" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>
              {booking.professionalId ? 'Reassign Professional' : 'Assign Professional'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonRed, buttonstyles.ml2]}
            onPress={() => setShowCancelModal(true)}
          >
            <MaterialIcons name="cancel" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      );

    case 'ongoing':
      return (
        <View style={buttonstyles.row}>
          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonPrimary, buttonstyles.mr2]}
            onPress={() => navigation.navigate('TrackBooking', { bookingId: booking.id })}
          >
            <MaterialIcons name="location-on" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Track Progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonRed, buttonstyles.ml2]}
            onPress={() => setShowCancelModal(true)}
          >
            <MaterialIcons name="cancel" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      );

    case 'completed':
      return (
        <View style={buttonstyles.row}>
          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonPrimary, buttonstyles.mr2]}
            onPress={() => Alert.alert('Success', 'Invoice sent to customer')}
          >
            <MaterialIcons name="receipt" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Send Invoice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonGray, buttonstyles.ml2]}
            onPress={() => navigation.navigate('CreateBooking', { customerId: booking.customerId })}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      );

    case 'cancelled':
      return (
        <View style={buttonstyles.row}>
          <TouchableOpacity
            style={[buttonstyles.button, buttonstyles.buttonPrimary]}
            onPress={() => navigation.navigate('CreateBooking', { customerId: booking.customerId })}
          >
            <MaterialIcons name="refresh" size={20} color="white" />
            <Text style={buttonstyles.buttonText}>Book Again</Text>
          </TouchableOpacity>
        </View>
      );

    default:
      return null;
  }
};

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.centeredScreen}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorSubtitle}>The booking you're looking for doesn't exist.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusStyle = getStatusStyle(booking.status);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Booking Details</Text>
          <Text style={styles.headerSubtitle}>{booking.id}</Text>
        </View>
        <View style={styles.headerButton} />{/* Placeholder */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={[styles.statusBadge, statusStyle.container]}>
              <Text style={[styles.statusText, statusStyle.text]}>{booking.status}</Text>
            </View>
            <Text style={[styles.paymentStatusText, getPaymentStatusColor(booking.paymentStatus)]}>
              {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
            </Text>
          </View>
          {/* Other details... */}
          <View style={styles.rowBetweenMarginTop}>
            <View style={styles.row}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text style={styles.timeText}>{booking.date}</Text>
            </View>
            <View style={styles.row}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text style={styles.timeText}>{booking.time}</Text>
            </View>
          </View>

          <View style={styles.rowMarginTop}>
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text style={styles.addressText}>{booking.address}</Text>
          </View>

          {booking.specialInstructions ? (
            <View style={styles.instructions}>
              <Text style={styles.instructionsLabel}>Special Instructions:</Text>
              <Text style={styles.instructionsText}>{booking.specialInstructions}</Text>
            </View>
          ) : null}
        </View>
        {/* Other sections... */}
        {/* Customer Details */}
        <View style={Customerstyles.card}>
        <View style={Customerstyles.headerRow}>
          <Text style={Customerstyles.headerText}>Customer Details</Text>
          <TouchableOpacity 
            style={Customerstyles.profileButton}
            onPress={() => navigation.navigate('AdminCustomerDetails', { customerId: booking.customerId })}
          >
            <Text style={Customerstyles.primaryText}>View Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>

        <View style={Customerstyles.customerRow}>
          <View style={Customerstyles.avatar}>
            <Text style={Customerstyles.avatarText}>{booking.customerName.charAt(0)}</Text>
          </View>
          <View style={Customerstyles.customerInfo}>
            <Text style={Customerstyles.customerName}>{booking.customerName}</Text>
            <Text style={Customerstyles.customerPhone}>{booking.customerPhone}</Text>
          </View>
        </View>

        <View style={Customerstyles.actionRow}>
          <TouchableOpacity 
            style={Customerstyles.callButton}
            onPress={() => Alert.alert('Call', `Call ${booking.customerPhone}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Call', style: 'default' }
            ])}
          >
            <Ionicons name="call" size={16} color="white" />
            <Text style={Customerstyles.buttonText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={Customerstyles.emailButton}
            onPress={() => Alert.alert('Email', `Send email to ${booking.customerEmail}?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Email', style: 'default' }
            ])}
          >
            <Ionicons name="mail" size={16} color="white" />
            <Text style={Customerstyles.buttonText}>Email</Text>
          </TouchableOpacity>
        </View>
        </View>

        {/* Professional Details */}
        <View style={Prostyles.container}>
        <View style={Prostyles.header}>
        <Text style={Prostyles.title}>Professional Details</Text>
        {booking.professionalId && (
          <TouchableOpacity 
            style={Prostyles.viewProfile}
            onPress={() => navigation.navigate('AdminProfessionalDetails', { professionalId: booking.professionalId })}
          >
            <Text style={Prostyles.viewProfileText}>View Profile</Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </TouchableOpacity>
        )}
        </View>

        {booking.professionalName ? (
        <>
          <View style={Prostyles.professionalRow}>
            <View style={Prostyles.avatar}>
              <Text style={Prostyles.avatarText}>{booking.professionalName.charAt(0)}</Text>
            </View>
            <View style={Prostyles.professionalInfo}>
              <Text style={Prostyles.professionalName}>{booking.professionalName}</Text>
              <Text style={Prostyles.professionalPhone}>{booking.professionalPhone}</Text>
            </View>
          </View>

          <View style={Prostyles.actionRow}>
            <TouchableOpacity 
              style={Prostyles.callButton}
              onPress={() => Alert.alert('Call', `Call ${booking.professionalPhone}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', style: 'default' }
              ])}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text style={Prostyles.buttonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={Prostyles.reassignButton}
              onPress={() => setShowAssignModal(true)}
            >
              <MaterialIcons name="swap-horiz" size={16} color="white" />
              <Text style={Prostyles.buttonText}>Reassign</Text>
            </TouchableOpacity>
          </View>
        </>
        ) : (
        <View style={Prostyles.noProfessional}>
          <MaterialIcons name="person-outline" size={40} color="#9CA3AF" />
          <Text style={Prostyles.noProfessionalText}>No professional assigned</Text>
          <TouchableOpacity 
            style={Prostyles.assignButton}
            onPress={() => setShowAssignModal(true)}
          >
            <MaterialIcons name="person-add" size={18} color="white" />
            <Text style={Prostyles.assignButtonText}>Assign Professional</Text>
          </TouchableOpacity>
        </View>
        )}
        </View>


        {/* Service Details */}
       <View style={servicestyles.container}>
      <Text style={servicestyles.heading}>Service Details</Text>

      {booking.services.map((service, index) => (
        <View key={index} style={servicestyles.serviceItem}>
          <View>
            <Text style={servicestyles.serviceName}>{service.name}</Text>
            <Text style={servicestyles.serviceDuration}>{service.duration}</Text>
          </View>
          <Text style={servicestyles.servicePrice}>{service.price}</Text>
        </View>
      ))}

      <View style={servicestyles.section}>
        <View style={servicestyles.row}>
          <Text style={servicestyles.label}>Subtotal</Text>
          <Text style={servicestyles.value}>{booking.subtotal}</Text>
        </View>
        <View style={servicestyles.row}>
          <Text style={servicestyles.label}>Tax (18% GST)</Text>
          <Text style={servicestyles.value}>{booking.tax}</Text>
        </View>
        <View style={servicestyles.totalRow}>
          <Text style={servicestyles.totalLabel}>Total</Text>
          <Text style={servicestyles.totalValue}>{booking.total}</Text>
        </View>
      </View>

      <View style={servicestyles.section}>
        <View style={servicestyles.row}>
          <Text style={servicestyles.label}>Payment Method</Text>
          <Text style={servicestyles.value}>{booking.paymentMethod}</Text>
        </View>
      </View>
    </View>

        {/* Booking Timeline */}
        <View
  style={{
    backgroundColor: '#FFFFFF',        // bg-white
    marginHorizontal: 16,              // mx-4
    marginBottom: 16,                  // mb-4
    borderRadius: 12,                  // rounded-lg
    padding: 16,                       // p-4
    shadowColor: '#000',              // shadow-sm
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,                      // Android shadow
  }}
>
          <Text
  style={{
    color: '#1F2937',     // text-gray-800
    fontWeight: 'bold',   // font-bold
    fontSize: 18,         // text-lg
    marginBottom: 12,     // mb-3
  }}
>
  Booking Timeline
</Text>
          <View style={{ marginLeft: 24 }}>
            <TimelineItem 
              title="Booking Created" 
              time={new Date(booking.createdAt).toLocaleString()} 
              isActive={true}
              isLast={!booking.completedAt && !booking.cancelledAt}
            />
            
            {booking.status === 'ongoing' && (
              <TimelineItem 
                title="Service Started" 
                time="15 Aug 2023, 10:35 AM" 
                isActive={true}
                isLast={true}
              />
            )}
            
            {booking.completedAt && (
              <TimelineItem 
                title="Service Completed" 
                time={new Date(booking.completedAt).toLocaleString()} 
                isActive={true}
                isLast={true}
              />
            )}
            
            {booking.cancelledAt && (
              <TimelineItem 
                title="Booking Cancelled" 
                time={new Date(booking.cancelledAt).toLocaleString()} 
                isActive={true}
                isLast={true}
                isCancelled={true}
                reason={booking.cancelReason}
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginHorizontal: 16, marginBottom: 32 }}>
          {renderActionButtons()}
        </View>
      </ScrollView>

      {/* Modals... */}
          {/* Assign Professional Modal */}
      <Modal
      visible={showAssignModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAssignModal(false)}
      >
      <View style={Assignstyles.modalBackdrop}>
      <View style={Assignstyles.modalContainer}>
      {/* Header */}
      <View style={Assignstyles.modalHeader}>
        <Text style={Assignstyles.modalTitle}>Assign Professional</Text>
        <TouchableOpacity onPress={() => setShowAssignModal(false)}>
          <Ionicons name="close" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Scroll List */}
      <ScrollView style={Assignstyles.scrollArea}>
        {professionals.map((pro) => {
          const isSelected = selectedProfessionalId === pro.id;
          return (
            <TouchableOpacity
              key={pro.id}
              style={[
                Assignstyles.professionalCard,
                isSelected && Assignstyles.professionalCardSelected,
              ]}
              onPress={() => setSelectedProfessionalId(pro.id)}
            >
              <View style={Assignstyles.avatar}>
                <Text style={Assignstyles.avatarText}>{pro.name.charAt(0)}</Text>
              </View>
              <View style={Assignstyles.proInfo}>
                <Text style={Assignstyles.proName}>{pro.name}</Text>
                <View style={Assignstyles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={Assignstyles.ratingText}>{pro.rating}</Text>
                </View>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[
          Assignstyles.confirmButton,
          (assignLoading || !selectedProfessionalId) && Assignstyles.confirmButtonDisabled,
        ]}
        onPress={handleAssignProfessional}
        disabled={assignLoading || !selectedProfessionalId}
      >
        {assignLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <MaterialIcons name="check" size={20} color="white" />
            <Text style={Assignstyles.confirmText}>Confirm Assignment</Text>
          </>
        )}
      </TouchableOpacity>
      </View>
      </View>
      </Modal>


      {/* Cancel Booking Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <SafeAreaView style={Cancelstyles.modalBackdrop}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={Cancelstyles.modalContainer}
          >
            {/* Header */}
            <View style={Cancelstyles.modalHeader}>
              <Text style={Cancelstyles.modalTitle}>Cancel Booking</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text style={Cancelstyles.modalDescription}>Please provide a reason for cancellation:</Text>

            {/* Text Input */}
            <TextInput
              style={Cancelstyles.textInput}
              placeholder="Enter cancellation reason"
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                Cancelstyles.cancelButton,
                (!cancelReason.trim() || cancelLoading) && Cancelstyles.cancelButtonDisabled,
              ]}
              onPress={handleCancelBooking}
              disabled={cancelLoading || !cancelReason.trim()}
            >
              {cancelLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="cancel" size={20} color="white" />
                  <Text style={Cancelstyles.cancelButtonText}>Confirm Cancellation</Text>
                </>
              )}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      </SafeAreaView>
  );
};

// --- Sub-components ---
interface TimelineItemProps {
  title: string;
  time: string;
  isActive: boolean;
  isLast: boolean;
  isCancelled?: boolean;
  reason?: string | null;
}

const TimelineItem = ({ title, time, isActive, isLast, isCancelled, reason }: TimelineItemProps) => {
  const dotStyle = [
    timeLineItemstyles.dot,
    isActive ? (isCancelled ? timeLineItemstyles.bgRed : timeLineItemstyles.bgPrimary) : timeLineItemstyles.bgGray
  ];

  const lineStyle = [
    timeLineItemstyles.line,
    isActive ? (isCancelled ? timeLineItemstyles.bgRed : timeLineItemstyles.bgPrimary) : timeLineItemstyles.bgGray
  ];

  const titleStyle = [
    timeLineItemstyles.title,
    isCancelled ? timeLineItemstyles.textRed : timeLineItemstyles.textDefault
  ];

  return (
    <View style={timeLineItemstyles.container}>
      <View style={timeLineItemstyles.indicatorContainer}>
        <View style={dotStyle} />
        {!isLast && <View style={lineStyle} />}
      </View>
      <View style={timeLineItemstyles.content}>
        <Text style={titleStyle}>{title}</Text>
        <Text style={timeLineItemstyles.time}>{time}</Text>
        {reason && (
          <View style={timeLineItemstyles.reasonContainer}>
            <Text style={timeLineItemstyles.reasonText}>{reason}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
export default AdminBookingDetailsScreen;

// --- Consolidated Stylesheet ---
const styles = StyleSheet.create({
  // Screen & Layout
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    backgroundColor: '#F9FAFB',
    paddingBottom: 32,
  },
  centeredScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#4B5563',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Loading & Error States
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#1F2937',
  },
  errorSubtitle: {
    marginTop: 8,
    color: '#4B5563',
    textAlign: 'center',
  },
  primaryButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },

  // Status & Payment Badges
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  statusText: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusPendingBg: { backgroundColor: '#FEF3C7' },
  statusPendingText: { color: '#92400E' },
  statusOngoingBg: { backgroundColor: '#DBEAFE' },
  statusOngoingText: { color: '#1E40AF' },
  statusCompletedBg: { backgroundColor: '#D1FAE5' },
  statusCompletedText: { color: '#065F46' },
  statusCancelledBg: { backgroundColor: '#FEE2E2' },
  statusCancelledText: { color: '#991B1B' },
  statusDefaultBg: { backgroundColor: '#F3F4F6' },
  statusDefaultText: { color: '#1F2937' },
  
  paymentStatusText: {
    fontWeight: '500',
  },
  paymentPaid: { color: '#16A34A' },
  paymentPending: { color: '#D97706' },
  paymentFailed: { color: '#DC2626' },
  paymentDefault: { color: '#4B5563' },
  
  // Other styles from your original file would go here...
});
const timeLineItemstyles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  indicatorContainer: {
    alignItems: 'center'
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  line: {
    width: 1,
    height: 64
  },
  bgPrimary: {
    backgroundColor: '#3B82F6' // Use your app's primary color
  },
  bgGray: {
    backgroundColor: '#D1D5DB'
  },
  bgRed: {
    backgroundColor: '#EF4444'
  },
  content: {
    marginLeft: 16,
    paddingBottom: 24
  },
  title: {
    fontWeight: '500'
  },
  textDefault: {
    color: '#1F2937'
  },
  textRed: {
    color: '#DC2626'
  },
  time: {
    color: '#6B7280',
    fontSize: 12
  },
  reasonContainer: {
    marginTop: 8,
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8
  },
  reasonText: {
    color: '#991B1B',
    fontSize: 12
  }
});

const buttonstyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8
  },
  buttonPrimary: {
    backgroundColor: '#2563EB'
  },
  buttonRed: {
    backgroundColor: '#EF4444'
  },
  buttonGray: {
    backgroundColor: '#6B7280'
  },
  mr2: {
    marginRight: 8
  },
  ml2: {
    marginLeft: 8
  },

  // Status styles
  statusPendingBg: { backgroundColor: '#FEF3C7', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusPendingText: { color: '#92400E', fontWeight: '500', textTransform: 'capitalize' },
  statusOngoingBg: { backgroundColor: '#DBEAFE', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusOngoingText: { color: '#1E40AF', fontWeight: '500', textTransform: 'capitalize' },
  statusCompletedBg: { backgroundColor: '#D1FAE5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusCompletedText: { color: '#065F46', fontWeight: '500', textTransform: 'capitalize' },
  statusCancelledBg: { backgroundColor: '#FEE2E2', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusCancelledText: { color: '#991B1B', fontWeight: '500', textTransform: 'capitalize' },
  statusDefaultBg: { backgroundColor: '#F3F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999 },
  statusDefaultText: { color: '#1F2937', fontWeight: '500', textTransform: 'capitalize' },

  // Payment Status Colors
  paymentPaid: { color: '#16A34A', fontWeight: '500' },
  paymentPending: { color: '#D97706', fontWeight: '500' },
  paymentFailed: { color: '#DC2626', fontWeight: '500' },
  paymentDefault: { color: '#4B5563', fontWeight: '500' }
})
const Customerstyles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryText: {
    color: '#2563EB',
    marginRight: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  customerInfo: {
    marginLeft: 12,
  },
  customerName: {
    color: '#1F2937',
    fontWeight: '500',
  },
  customerPhone: {
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#10B981',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
});

const Prostyles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  viewProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewProfileText: {
    color: '#2563EB',
    marginRight: 4,
  },
  professionalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4B5563',
    fontWeight: '500',
  },
  professionalInfo: {
    marginLeft: 12,
  },
  professionalName: {
    color: '#1F2937',
    fontWeight: '500',
  },
  professionalPhone: {
    color: '#6B7280',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  callButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reassignButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
  noProfessional: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noProfessionalText: {
    color: '#6B7280',
    marginTop: 8,
  },
  assignButton: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
});

const Assignstyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#1F2937', // text-gray-800
    fontWeight: 'bold',
    fontSize: 18,
  },
  scrollArea: {
    maxHeight: 384, // max-h-96
  },
  professionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  professionalCardSelected: {
    backgroundColor: '#EFF6FF', // bg-blue-50
    borderWidth: 1,
    borderColor: '#BFDBFE', // border-blue-200
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB', // bg-gray-200
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#4B5563', // text-gray-600
    fontWeight: '500',
  },
  proInfo: {
    marginLeft: 12,
    flex: 1,
  },
  proName: {
    color: '#1F2937', // text-gray-800
    fontWeight: '500',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#4B5563', // text-gray-600
    marginLeft: 4,
  },
  confirmButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2563EB',
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF', // gray-400
  },
  confirmText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
});
const Cancelstyles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#1F2937', // text-gray-800
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalDescription: {
    color: '#4B5563', // text-gray-600
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    padding: 12,
    borderRadius: 12,
    color: '#1F2937', // text-gray-800
    minHeight: 100,
    textAlignVertical: 'top', // for Android multiline input
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF4444', // bg-red-500
  },
  cancelButtonDisabled: {
    backgroundColor: '#9CA3AF', // bg-gray-400
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 8,
  },
});

const servicestyles=StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, // mx-4
    marginBottom: 16, // mb-4
    borderRadius: 12, // rounded-lg
    padding: 16, // p-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1, // shadow-sm
  },
  heading: {
    color: '#1F2937', // text-gray-800
    fontWeight: 'bold',
    fontSize: 18, // text-lg
    marginBottom: 12, // mb-3
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12, // py-3
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // border-gray-100
  },
  serviceName: {
    color: '#1F2937', // text-gray-800
  },
  serviceDuration: {
    color: '#6B7280', // text-gray-500
    fontSize: 12, // text-sm
  },
  servicePrice: {
    color: '#1F2937', // text-gray-800
    fontWeight: '500', // font-medium
  },
  section: {
    marginTop: 16, // mt-4
    paddingTop: 12, // pt-3
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB', // border-gray-200
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8, // mb-2
  },
  label: {
    color: '#6B7280', // text-gray-600
  },
  value: {
    color: '#1F2937', // text-gray-800
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8, // mt-2
    paddingTop: 8, // pt-2
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    color: '#1F2937', // text-gray-800
    fontWeight: 'bold',
  },
  totalValue: {
    color: '#2563EB', // text-primary (blue-600)
    fontWeight: 'bold',
  },
});
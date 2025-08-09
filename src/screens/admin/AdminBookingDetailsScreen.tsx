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
  Image,StyleSheet
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

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
  services: Array<{
    name: string;
    price: string;
    duration: string;
  }>;
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
  photos: string[] | null;
  rating: number | null;
  review: string | null;
}

const AdminBookingDetailsScreen = () => {
  const navigation = useNavigation<AdminBookingDetailsScreenNavigationProp>();
  const route = useRoute<AdminBookingDetailsScreenRouteProp>();
  const { bookingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [professionals, setProfessionals] = useState<Array<{ id: string; name: string; rating: number }>>([]);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Mock data
  const mockBooking: BookingDetails = {
    id: 'BK-7845',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 9876543210',
    customerEmail: 'rahul.sharma@example.com',
    customerId: 'CUST-1234',
    professionalName: 'Rajesh Kumar',
    professionalPhone: '+91 9876543220',
    professionalId: 'PRO-001',
    services: [
      {
        name: 'Premium Wash',
        price: '₹800',
        duration: '45 mins'
      },
      {
        name: 'Polish',
        price: '₹400',
        duration: '30 mins'
      }
    ],
    date: '15 Aug 2023',
    time: '10:30 AM',
    address: '123 Main Street, Andheri East, Mumbai, Maharashtra 400069',
    status: 'ongoing',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    subtotal: '₹1,200',
    tax: '₹216',
    total: '₹1,416',
    specialInstructions: 'Please be careful with the side mirrors, they are custom made.',
    createdAt: '2023-08-14T18:30:00Z',
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    photos: null,
    rating: null,
    review: null
  };

  const mockProfessionals = [
    { id: 'PRO-001', name: 'Rajesh Kumar', rating: 4.8 },
    { id: 'PRO-002', name: 'Amit Singh', rating: 4.5 },
    { id: 'PRO-003', name: 'Vikram Patel', rating: 4.7 },
    { id: 'PRO-004', name: 'Sunil Verma', rating: 4.9 },
    { id: 'PRO-005', name: 'Deepak Sharma', rating: 4.6 }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setBooking(mockBooking);
      setProfessionals(mockProfessionals);
      setLoading(false);
      if (mockBooking.professionalId) {
        setSelectedProfessionalId(mockBooking.professionalId);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleAssignProfessional = () => {
    if (!selectedProfessionalId) {
      Alert.alert('Error', 'Please select a professional to assign');
      return;
    }

    setAssignLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPro = professionals.find(pro => pro.id === selectedProfessionalId);
      if (booking && selectedPro) {
        setBooking({
          ...booking,
          professionalId: selectedPro.id,
          professionalName: selectedPro.name,
          professionalPhone: '+91 9876543220' // Mock phone number
        });
      }
      setAssignLoading(false);
      setShowAssignModal(false);
      Alert.alert('Success', 'Professional assigned successfully');
    }, 1500);
  };

  const handleCancelBooking = () => {
    if (!cancelReason.trim()) {
      Alert.alert('Error', 'Please provide a reason for cancellation');
      return;
    }

    setCancelLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (booking) {
        setBooking({
          ...booking,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancelReason: cancelReason
        });
      }
      setCancelLoading(false);
      setShowCancelModal(false);
      Alert.alert('Success', 'Booking cancelled successfully');
    }, 1500);
  };

  const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return { container: buttonstyles.statusPendingBg, text: buttonstyles.statusPendingText };
    case 'ongoing':
      return { container: buttonstyles.statusOngoingBg, text: buttonstyles.statusOngoingText };
    case 'completed':
      return { container: buttonstyles.statusCompletedBg, text: buttonstyles.statusCompletedText };
    case 'cancelled':
      return { container: buttonstyles.statusCancelledBg, text: buttonstyles.statusCancelledText };
    default:
      return { container: buttonstyles.statusDefaultBg, text: buttonstyles.statusDefaultText };
  }
};


  const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return buttonstyles.paymentPaid;
    case 'pending': return buttonstyles.paymentPending;
    case 'failed': return buttonstyles.paymentFailed;
    default: return buttonstyles.paymentDefault;
  }
};


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
       <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB', // gray-50
      }}
    >
      <ActivityIndicator size="large" color="#2563EB" />
      <Text
        style={{
          marginTop: 16, // mt-4
          color: '#4B5563', // text-gray-600
        }}
      >
        Loading booking details...
      </Text>
    </View>
    );
  }

  if (!booking) {
    return (
       <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB', // Tailwind's gray-50
      }}
    >
      <MaterialIcons name="error-outline" size={48} color="#EF4444" />

      <Text
        style={{
          marginTop: 16, // mt-4
          color: '#1F2937', // Tailwind's gray-800
          fontWeight: '500', // font-medium
          fontSize: 18,
        }}
      >
        Booking Not Found
      </Text>

      <Text
        style={{
          marginTop: 8, // mt-2
          color: '#4B5563', // Tailwind's gray-600
          textAlign: 'center',
          paddingHorizontal: 24, // px-6
          fontSize: 14,
        }}
      >
        The booking you're looking for doesn't exist or has been removed.
      </Text>

      <TouchableOpacity
        style={{
          marginTop: 24, // mt-6
          backgroundColor: '#2563EB', // Tailwind's primary (blue-600)
          paddingHorizontal: 24, // px-6
          paddingVertical: 12, // py-3
          borderRadius: 12, // rounded-lg
        }}
        onPress={() => navigation.goBack()}
      >
        <Text
          style={{
            color: '#FFFFFF', // text-white
            fontWeight: '500', // font-medium
            fontSize: 16,
          }}
        >
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerText}>Booking Details</Text>
            <Text style={styles.headerSubText}>{booking.id}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={[styles.status, getStatusColor(booking.status)]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
            <Text style={[styles.paymentStatusText, getPaymentStatusColor(booking.paymentStatus)]}>
              {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'pending' ? 'Payment Pending' : 'Payment Failed'}
            </Text>
          </View>

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
      <View style={Cancelstyles.modalBackdrop}>
      <View style={Cancelstyles.modalContainer}>

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
      </View>
      </View>
      </Modal>

    </View>
  );
};

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

const styles =StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#2563EB', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16 },
  backButton: { marginRight: 12 },
  headerText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubText: { color: 'white', opacity: 0.8 },
  scrollView: { flex: 1 },
  card: { backgroundColor: 'white', margin: 16, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowBetweenMarginTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  rowMarginTop: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  timeText: { color: '#374151', marginLeft: 8 },
  addressText: { color: '#374151', marginLeft: 8, flex: 1 },
  status: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  statusText: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusPending: { backgroundColor: '#FDE68A' },
  paid: { color: '#10B981' },
  pending: { color: '#F59E0B' },
  failed: { color: '#EF4444' },
  instructions: { marginTop: 12, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },
  instructionsLabel: { color: '#6B7280', fontSize: 14 },
  instructionsText: { color: '#374151', marginTop: 4 },
  actionContainer: { marginHorizontal: 16, marginBottom: 32 },
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
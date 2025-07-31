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
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminBookingDetailsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;
type AdminBookingDetailsScreenRouteProp = RouteProp<AdminStackParamList, 'BookingDetails'>;

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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const renderActionButtons = () => {
    if (!booking) return null;

    switch (booking.status) {
      case 'pending':
        return (
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity 
              className="bg-primary py-3 rounded-lg flex-1 mr-2 flex-row justify-center items-center"
              onPress={() => setShowAssignModal(true)}
            >
              <MaterialIcons name="person-add" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                {booking.professionalId ? 'Reassign Professional' : 'Assign Professional'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-500 py-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
              onPress={() => setShowCancelModal(true)}
            >
              <MaterialIcons name="cancel" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'ongoing':
        return (
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity 
              className="bg-primary py-3 rounded-lg flex-1 mr-2 flex-row justify-center items-center"
              onPress={() => navigation.navigate('TrackBooking', { bookingId: booking.id })}
            >
              <MaterialIcons name="location-on" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Track Progress</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-500 py-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
              onPress={() => setShowCancelModal(true)}
            >
              <MaterialIcons name="cancel" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'completed':
        return (
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity 
              className="bg-primary py-3 rounded-lg flex-1 mr-2 flex-row justify-center items-center"
              onPress={() => Alert.alert('Success', 'Invoice sent to customer')}
            >
              <MaterialIcons name="receipt" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Send Invoice</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-500 py-3 rounded-lg flex-1 ml-2 flex-row justify-center items-center"
              onPress={() => navigation.navigate('CreateBooking', { customerId: booking.customerId })}
            >
              <MaterialIcons name="refresh" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Book Again</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'cancelled':
        return (
          <View className="flex-row justify-between mt-6">
            <TouchableOpacity 
              className="bg-primary py-3 rounded-lg flex-1 flex-row justify-center items-center"
              onPress={() => navigation.navigate('CreateBooking', { customerId: booking.customerId })}
            >
              <MaterialIcons name="refresh" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Book Again</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="mt-4 text-gray-800 font-medium">Booking Not Found</Text>
        <Text className="mt-2 text-gray-600 text-center px-6">The booking you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity 
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-xl font-bold">Booking Details</Text>
            <Text className="text-white opacity-80">{booking.id}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View className="bg-white m-4 rounded-lg shadow-sm p-4">
          <View className="flex-row justify-between items-center">
            <View className={`px-3 py-1.5 rounded-full ${getStatusColor(booking.status)}`}>
              <Text className="text-sm font-medium capitalize">{booking.status}</Text>
            </View>
            
            <Text className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
              {booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'pending' ? 'Payment Pending' : 'Payment Failed'}
            </Text>
          </View>

          <View className="flex-row justify-between items-center mt-4">
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{booking.date}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 ml-2">{booking.time}</Text>
            </View>
          </View>

          <View className="flex-row items-center mt-3">
            <Ionicons name="location-outline" size={16} color="#6B7280" />
            <Text className="text-gray-700 ml-2 flex-1">{booking.address}</Text>
          </View>

          {booking.specialInstructions ? (
            <View className="mt-3 bg-gray-50 p-3 rounded-lg">
              <Text className="text-gray-500 text-sm">Special Instructions:</Text>
              <Text className="text-gray-700 mt-1">{booking.specialInstructions}</Text>
            </View>
          ) : null}
        </View>

        {/* Customer Details */}
        <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Customer Details</Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => navigation.navigate('CustomerDetails', { customerId: booking.customerId })}
            >
              <Text className="text-primary mr-1">View Profile</Text>
              <Ionicons name="chevron-forward" size={16} color="#2563EB" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
              <Text className="text-gray-600 font-medium">{booking.customerName.charAt(0)}</Text>
            </View>
            <View className="ml-3">
              <Text className="text-gray-800 font-medium">{booking.customerName}</Text>
              <Text className="text-gray-500">{booking.customerPhone}</Text>
            </View>
          </View>

          <View className="flex-row mt-3">
            <TouchableOpacity 
              className="flex-1 mr-2 bg-green-500 py-2 rounded-lg flex-row justify-center items-center"
              onPress={() => Alert.alert('Call', `Call ${booking.customerPhone}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call', style: 'default' }
              ])}
            >
              <Ionicons name="call" size={16} color="white" />
              <Text className="text-white ml-2">Call</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 ml-2 bg-blue-500 py-2 rounded-lg flex-row justify-center items-center"
              onPress={() => Alert.alert('Email', `Send email to ${booking.customerEmail}?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Email', style: 'default' }
              ])}
            >
              <Ionicons name="mail" size={16} color="white" />
              <Text className="text-white ml-2">Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Professional Details */}
        <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm p-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-800 font-bold text-lg">Professional Details</Text>
            {booking.professionalId && (
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => navigation.navigate('ProfessionalDetails', { professionalId: booking.professionalId })}
              >
                <Text className="text-primary mr-1">View Profile</Text>
                <Ionicons name="chevron-forward" size={16} color="#2563EB" />
              </TouchableOpacity>
            )}
          </View>

          {booking.professionalName ? (
            <>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                  <Text className="text-gray-600 font-medium">{booking.professionalName.charAt(0)}</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-gray-800 font-medium">{booking.professionalName}</Text>
                  <Text className="text-gray-500">{booking.professionalPhone}</Text>
                </View>
              </View>

              <View className="flex-row mt-3">
                <TouchableOpacity 
                  className="flex-1 mr-2 bg-green-500 py-2 rounded-lg flex-row justify-center items-center"
                  onPress={() => Alert.alert('Call', `Call ${booking.professionalPhone}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', style: 'default' }
                  ])}
                >
                  <Ionicons name="call" size={16} color="white" />
                  <Text className="text-white ml-2">Call</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="flex-1 ml-2 bg-primary py-2 rounded-lg flex-row justify-center items-center"
                  onPress={() => setShowAssignModal(true)}
                >
                  <MaterialIcons name="swap-horiz" size={16} color="white" />
                  <Text className="text-white ml-2">Reassign</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View className="items-center py-4">
              <MaterialIcons name="person-outline" size={40} color="#9CA3AF" />
              <Text className="text-gray-500 mt-2">No professional assigned</Text>
              <TouchableOpacity 
                className="mt-4 bg-primary px-6 py-2 rounded-lg flex-row items-center"
                onPress={() => setShowAssignModal(true)}
              >
                <MaterialIcons name="person-add" size={18} color="white" />
                <Text className="text-white font-medium ml-2">Assign Professional</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Service Details */}
        <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Service Details</Text>
          
          {booking.services.map((service, index) => (
            <View key={index} className="flex-row justify-between items-center py-3 border-b border-gray-100">
              <View>
                <Text className="text-gray-800">{service.name}</Text>
                <Text className="text-gray-500 text-sm">{service.duration}</Text>
              </View>
              <Text className="text-gray-800 font-medium">{service.price}</Text>
            </View>
          ))}

          <View className="mt-4 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-800">{booking.subtotal}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Tax (18% GST)</Text>
              <Text className="text-gray-800">{booking.tax}</Text>
            </View>
            <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
              <Text className="text-gray-800 font-bold">Total</Text>
              <Text className="text-primary font-bold">{booking.total}</Text>
            </View>
          </View>

          <View className="mt-4 pt-3 border-t border-gray-200">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600">Payment Method</Text>
              <Text className="text-gray-800">{booking.paymentMethod}</Text>
            </View>
          </View>
        </View>

        {/* Booking Timeline */}
        <View className="bg-white mx-4 mb-4 rounded-lg shadow-sm p-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Booking Timeline</Text>
          
          <View className="ml-2">
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
        <View className="mx-4 mb-8">
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
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 font-bold text-lg">Assign Professional</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {professionals.map((pro) => (
                <TouchableOpacity 
                  key={pro.id}
                  className={`flex-row items-center p-3 mb-2 rounded-lg ${selectedProfessionalId === pro.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}
                  onPress={() => setSelectedProfessionalId(pro.id)}
                >
                  <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center">
                    <Text className="text-gray-600 font-medium">{pro.name.charAt(0)}</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-gray-800 font-medium">{pro.name}</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text className="text-gray-600 ml-1">{pro.rating}</Text>
                    </View>
                  </View>
                  {selectedProfessionalId === pro.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#2563EB" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity 
              className={`mt-4 py-3 rounded-lg flex-row justify-center items-center ${assignLoading || !selectedProfessionalId ? 'bg-gray-400' : 'bg-primary'}`}
              onPress={handleAssignProfessional}
              disabled={assignLoading || !selectedProfessionalId}
            >
              {assignLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Confirm Assignment</Text>
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
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-800 font-bold text-lg">Cancel Booking</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-600 mb-4">Please provide a reason for cancellation:</Text>

            <TextInput
              className="bg-gray-50 p-3 rounded-lg text-gray-800 min-h-[100px]"
              placeholder="Enter cancellation reason"
              multiline
              value={cancelReason}
              onChangeText={setCancelReason}
            />

            <TouchableOpacity 
              className={`mt-4 py-3 rounded-lg flex-row justify-center items-center ${cancelLoading || !cancelReason.trim() ? 'bg-gray-400' : 'bg-red-500'}`}
              onPress={handleCancelBooking}
              disabled={cancelLoading || !cancelReason.trim()}
            >
              {cancelLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="cancel" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">Confirm Cancellation</Text>
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
  return (
    <View className="flex-row">
      <View className="items-center">
        <View className={`w-4 h-4 rounded-full ${isActive ? (isCancelled ? 'bg-red-500' : 'bg-primary') : 'bg-gray-300'}`} />
        {!isLast && <View className={`w-0.5 h-16 ${isActive ? (isCancelled ? 'bg-red-500' : 'bg-primary') : 'bg-gray-300'}`} />}
      </View>
      <View className="ml-4 pb-6">
        <Text className={`font-medium ${isCancelled ? 'text-red-600' : 'text-gray-800'}`}>{title}</Text>
        <Text className="text-gray-500 text-sm">{time}</Text>
        {reason && (
          <View className="mt-2 bg-red-50 p-3 rounded-lg">
            <Text className="text-red-800 text-sm">{reason}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default AdminBookingDetailsScreen;
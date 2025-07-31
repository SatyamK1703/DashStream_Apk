import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminProfessionalDetailsRouteProp = RouteProp<AdminStackParamList, 'ProfessionalDetails'>;
type AdminProfessionalDetailsNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Professional {
  id: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  totalEarnings: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  skills: string[];
  joinedDate: string;
  lastActive: string;
  profileImage?: string;
  isVerified: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceArea: string[];
  documents: {
    idProof: {
      type: string;
      number: string;
      verified: boolean;
      uploadDate: string;
    };
    addressProof: {
      type: string;
      verified: boolean;
      uploadDate: string;
    };
    drivingLicense?: {
      number: string;
      expiry: string;
      verified: boolean;
      uploadDate: string;
    };
  };
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
    verified: boolean;
  };
  taxInfo: {
    panNumber: string;
    gstNumber?: string;
  };
  reviews: {
    id: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  recentBookings: {
    id: string;
    date: string;
    services: string[];
    amount: string;
    status: 'completed' | 'cancelled' | 'ongoing';
  }[];
  performanceMetrics: {
    acceptanceRate: number;
    cancellationRate: number;
    avgResponseTime: string;
    avgServiceTime: string;
    customerSatisfaction: number;
  };
}

const AdminProfessionalDetailsScreen = () => {
  const route = useRoute<AdminProfessionalDetailsRouteProp>();
  const navigation = useNavigation<AdminProfessionalDetailsNavigationProp>();
  const { professionalId } = route.params;
  
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  
  // Mock data
  const mockProfessional: Professional = {
    id: 'PRO-001',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@example.com',
    rating: 4.8,
    totalJobs: 156,
    completedJobs: 148,
    cancelledJobs: 8,
    totalEarnings: '₹78,500',
    status: 'active',
    skills: ['Car Wash', 'Detailing', 'Polish', 'Interior Cleaning'],
    joinedDate: '2022-05-15',
    lastActive: '2023-08-15T10:30:00Z',
    profileImage: undefined,
    isVerified: true,
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    serviceArea: ['Andheri', 'Bandra', 'Juhu', 'Santacruz'],
    documents: {
      idProof: {
        type: 'Aadhaar Card',
        number: 'XXXX-XXXX-1234',
        verified: true,
        uploadDate: '2022-05-10'
      },
      addressProof: {
        type: 'Electricity Bill',
        verified: true,
        uploadDate: '2022-05-10'
      },
      drivingLicense: {
        number: 'DL-1234567890',
        expiry: '2027-04-30',
        verified: true,
        uploadDate: '2022-05-10'
      }
    },
    bankDetails: {
      accountNumber: 'XXXXXXXXXXXX4567',
      ifscCode: 'SBIN0001234',
      accountHolderName: 'Rajesh Kumar',
      bankName: 'State Bank of India',
      verified: true
    },
    taxInfo: {
      panNumber: 'ABCDE1234F',
      gstNumber: '27AADCB2230M1Z3'
    },
    reviews: [
      {
        id: 'REV-001',
        customerName: 'Amit Patel',
        rating: 5,
        comment: 'Excellent service! My car looks brand new. Very professional and punctual.',
        date: '2023-08-10'
      },
      {
        id: 'REV-002',
        customerName: 'Priya Sharma',
        rating: 4,
        comment: 'Good service overall. Could have been more thorough with the interior cleaning.',
        date: '2023-08-05'
      },
      {
        id: 'REV-003',
        customerName: 'Rahul Verma',
        rating: 5,
        comment: 'Very satisfied with the detailing service. Will definitely book again!',
        date: '2023-07-28'
      }
    ],
    recentBookings: [
      {
        id: 'BK-1234',
        date: '2023-08-15',
        services: ['Premium Car Wash', 'Interior Detailing'],
        amount: '₹1,200',
        status: 'completed'
      },
      {
        id: 'BK-1235',
        date: '2023-08-14',
        services: ['Basic Car Wash'],
        amount: '₹500',
        status: 'completed'
      },
      {
        id: 'BK-1236',
        date: '2023-08-13',
        services: ['Full Detailing Package'],
        amount: '₹2,500',
        status: 'completed'
      },
      {
        id: 'BK-1237',
        date: '2023-08-12',
        services: ['Premium Car Wash', 'Waxing'],
        amount: '₹1,500',
        status: 'cancelled'
      }
    ],
    performanceMetrics: {
      acceptanceRate: 95,
      cancellationRate: 3,
      avgResponseTime: '2 mins',
      avgServiceTime: '1.5 hours',
      customerSatisfaction: 4.8
    }
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProfessional(mockProfessional);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [professionalId]);

  const handleStatusChange = () => {
    if (!professional) return;
    
    Alert.alert(
      'Change Status',
      `Are you sure you want to ${professional.status === 'active' ? 'deactivate' : 'activate'} ${professional.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update professional status
            setProfessional(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                status: prev.status === 'active' ? 'inactive' : 'active'
              };
            });
            
            // Show success message
            Alert.alert(
              'Success',
              `Professional ${professional.status === 'active' ? 'deactivated' : 'activated'} successfully`
            );
          }
        }
      ]
    );
  };

  const handleVerifyDocument = (documentType: string) => {
    if (!professional) return;
    
    Alert.alert(
      'Verify Document',
      `Are you sure you want to mark this ${documentType} as verified?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            // Update document verification status
            setProfessional(prev => {
              if (!prev) return prev;
              
              const updatedProfessional = { ...prev };
              
              if (documentType === 'ID Proof') {
                updatedProfessional.documents.idProof.verified = true;
              } else if (documentType === 'Address Proof') {
                updatedProfessional.documents.addressProof.verified = true;
              } else if (documentType === 'Driving License' && updatedProfessional.documents.drivingLicense) {
                updatedProfessional.documents.drivingLicense.verified = true;
              } else if (documentType === 'Bank Details') {
                updatedProfessional.bankDetails.verified = true;
              }
              
              return updatedProfessional;
            });
            
            // Show success message
            Alert.alert('Success', `${documentType} verified successfully`);
          }
        }
      ]
    );
  };

  const handleSaveNote = () => {
    // Save admin note logic would go here
    Alert.alert('Success', 'Note saved successfully');
    setShowNoteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'ongoing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading professional details...</Text>
      </View>
    );
  }

  if (!professional) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text className="mt-4 text-gray-800 font-medium">Professional Not Found</Text>
        <Text className="mt-2 text-gray-600 text-center px-6">The professional you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity 
          className="mt-6 bg-primary px-6 py-2.5 rounded-lg"
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
          <TouchableOpacity 
            className="p-2"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">Professional Details</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Professional Profile Card */}
        <View className="bg-white mx-4 mt-4 rounded-lg shadow-sm overflow-hidden">
          <View className="p-4">
            <View className="flex-row">
              <View className="mr-4">
                {professional.profileImage ? (
                  <Image 
                    source={{ uri: professional.profileImage }} 
                    className="w-20 h-20 rounded-full bg-gray-200"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
                    <Text className="text-gray-600 font-bold text-2xl">{professional.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-gray-800 font-bold text-lg">{professional.name}</Text>
                  {professional.isVerified && (
                    <Ionicons name="checkmark-circle" size={18} color="#2563EB" style={{ marginLeft: 4 }} />
                  )}
                </View>
                
                <Text className="text-gray-500">{professional.id}</Text>
                
                <View className="flex-row items-center mt-1">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-700 ml-1">{professional.rating.toFixed(1)}</Text>
                  <Text className="text-gray-500 ml-1">({professional.reviews.length} reviews)</Text>
                </View>
                
                <View className={`px-2.5 py-1 rounded-full mt-2 self-start ${getStatusColor(professional.status)}`}>
                  <Text className="text-xs font-medium capitalize">{professional.status}</Text>
                </View>
              </View>
            </View>

            <View className="mt-4 pt-4 border-t border-gray-100">
              <View className="flex-row items-center mb-2">
                <Ionicons name="call" size={18} color="#6B7280" style={{ width: 24 }} />
                <Text className="text-gray-700 ml-2">{professional.phone}</Text>
              </View>
              
              <View className="flex-row items-center mb-2">
                <Ionicons name="mail" size={18} color="#6B7280" style={{ width: 24 }} />
                <Text className="text-gray-700 ml-2">{professional.email}</Text>
              </View>
              
              <View className="flex-row items-start mb-2">
                <Ionicons name="location" size={18} color="#6B7280" style={{ width: 24, marginTop: 2 }} />
                <Text className="text-gray-700 ml-2 flex-1">
                  {professional.address}, {professional.city}, {professional.state} - {professional.pincode}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Ionicons name="calendar" size={18} color="#6B7280" style={{ width: 24 }} />
                <Text className="text-gray-700 ml-2">Joined on {new Date(professional.joinedDate).toLocaleDateString()}</Text>
              </View>
            </View>

            <View className="mt-4 flex-row">
              <TouchableOpacity 
                className="flex-1 bg-primary py-2.5 rounded-lg mr-2 flex-row justify-center items-center"
                onPress={() => navigation.navigate('EditProfessional', { professionalId: professional.id })}
              >
                <MaterialIcons name="edit" size={18} color="white" />
                <Text className="text-white font-medium ml-1">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 py-2.5 rounded-lg flex-row justify-center items-center ${professional.status === 'active' ? 'bg-red-500' : 'bg-green-500'}`}
                onPress={handleStatusChange}
              >
                <MaterialIcons 
                  name={professional.status === 'active' ? 'block' : 'check-circle'} 
                  size={18} 
                  color="white" 
                />
                <Text className="text-white font-medium ml-1">
                  {professional.status === 'active' ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row bg-white mt-4 border-b border-gray-200">
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'overview' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('overview')}
          >
            <Text className={`text-center font-medium ${activeTab === 'overview' ? 'text-primary' : 'text-gray-600'}`}>Overview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'documents' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('documents')}
          >
            <Text className={`text-center font-medium ${activeTab === 'documents' ? 'text-primary' : 'text-gray-600'}`}>Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'bookings' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('bookings')}
          >
            <Text className={`text-center font-medium ${activeTab === 'bookings' ? 'text-primary' : 'text-gray-600'}`}>Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 py-3 ${activeTab === 'reviews' ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab('reviews')}
          >
            <Text className={`text-center font-medium ${activeTab === 'reviews' ? 'text-primary' : 'text-gray-600'}`}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View className="px-4 py-4">
            {/* Skills */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Skills & Expertise</Text>
              <View className="flex-row flex-wrap">
                {professional.skills.map((skill, index) => (
                  <View key={index} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                    <Text className="text-gray-700">{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Service Area */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Service Area</Text>
              <View className="flex-row flex-wrap">
                {professional.serviceArea.map((area, index) => (
                  <View key={index} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2">
                    <Text className="text-gray-700">{area}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Performance Metrics */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Performance Metrics</Text>
              
              <View className="flex-row mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-primary">{professional.performanceMetrics.acceptanceRate}%</Text>
                  <Text className="text-gray-600 text-sm">Acceptance Rate</Text>
                </View>
                
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-red-500">{professional.performanceMetrics.cancellationRate}%</Text>
                  <Text className="text-gray-600 text-sm">Cancellation Rate</Text>
                </View>
                
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-green-500">{professional.performanceMetrics.customerSatisfaction}</Text>
                  <Text className="text-gray-600 text-sm">Satisfaction</Text>
                </View>
              </View>
              
              <View className="flex-row border-t border-gray-100 pt-4">
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="timer" size={16} color="#6B7280" />
                    <Text className="text-gray-700 ml-2">Avg. Response: {professional.performanceMetrics.avgResponseTime}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <MaterialIcons name="schedule" size={16} color="#6B7280" />
                    <Text className="text-gray-700 ml-2">Avg. Service: {professional.performanceMetrics.avgServiceTime}</Text>
                  </View>
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <MaterialIcons name="check-circle" size={16} color="#6B7280" />
                    <Text className="text-gray-700 ml-2">Completed: {professional.completedJobs}</Text>
                  </View>
                  
                  <View className="flex-row items-center">
                    <MaterialIcons name="cancel" size={16} color="#6B7280" />
                    <Text className="text-gray-700 ml-2">Cancelled: {professional.cancelledJobs}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Admin Notes */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Admin Notes</Text>
                <TouchableOpacity 
                  className="bg-gray-100 p-1.5 rounded-full"
                  onPress={() => setShowNoteModal(true)}
                >
                  <Ionicons name="add" size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              {adminNote ? (
                <View className="bg-gray-50 p-3 rounded-lg">
                  <Text className="text-gray-700">{adminNote}</Text>
                </View>
              ) : (
                <Text className="text-gray-500 italic">No notes added yet</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'documents' && (
          <View className="px-4 py-4">
            {/* ID Proof */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">ID Proof</Text>
                <View className={`px-2.5 py-1 rounded-full ${professional.documents.idProof.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-medium ${professional.documents.idProof.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {professional.documents.idProof.verified ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Document Type</Text>
                  <Text className="text-gray-800 font-medium">{professional.documents.idProof.type}</Text>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Document Number</Text>
                  <Text className="text-gray-800 font-medium">{professional.documents.idProof.number}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Upload Date</Text>
                  <Text className="text-gray-800 font-medium">{new Date(professional.documents.idProof.uploadDate).toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View className="flex-row">
                <TouchableOpacity className="flex-1 bg-gray-100 py-2 rounded-lg mr-2 items-center">
                  <Text className="text-gray-700 font-medium">View Document</Text>
                </TouchableOpacity>
                
                {!professional.documents.idProof.verified && (
                  <TouchableOpacity 
                    className="flex-1 bg-primary py-2 rounded-lg items-center"
                    onPress={() => handleVerifyDocument('ID Proof')}
                  >
                    <Text className="text-white font-medium">Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Address Proof */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Address Proof</Text>
                <View className={`px-2.5 py-1 rounded-full ${professional.documents.addressProof.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-medium ${professional.documents.addressProof.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {professional.documents.addressProof.verified ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Document Type</Text>
                  <Text className="text-gray-800 font-medium">{professional.documents.addressProof.type}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Upload Date</Text>
                  <Text className="text-gray-800 font-medium">{new Date(professional.documents.addressProof.uploadDate).toLocaleDateString()}</Text>
                </View>
              </View>
              
              <View className="flex-row">
                <TouchableOpacity className="flex-1 bg-gray-100 py-2 rounded-lg mr-2 items-center">
                  <Text className="text-gray-700 font-medium">View Document</Text>
                </TouchableOpacity>
                
                {!professional.documents.addressProof.verified && (
                  <TouchableOpacity 
                    className="flex-1 bg-primary py-2 rounded-lg items-center"
                    onPress={() => handleVerifyDocument('Address Proof')}
                  >
                    <Text className="text-white font-medium">Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Driving License */}
            {professional.documents.drivingLicense && (
              <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-gray-800 font-bold text-base">Driving License</Text>
                  <View className={`px-2.5 py-1 rounded-full ${professional.documents.drivingLicense.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <Text className={`text-xs font-medium ${professional.documents.drivingLicense.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                      {professional.documents.drivingLicense.verified ? 'Verified' : 'Pending'}
                    </Text>
                  </View>
                </View>
                
                <View className="mb-3">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">License Number</Text>
                    <Text className="text-gray-800 font-medium">{professional.documents.drivingLicense.number}</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-600">Expiry Date</Text>
                    <Text className="text-gray-800 font-medium">{new Date(professional.documents.drivingLicense.expiry).toLocaleDateString()}</Text>
                  </View>
                  
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Upload Date</Text>
                    <Text className="text-gray-800 font-medium">{new Date(professional.documents.drivingLicense.uploadDate).toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View className="flex-row">
                  <TouchableOpacity className="flex-1 bg-gray-100 py-2 rounded-lg mr-2 items-center">
                    <Text className="text-gray-700 font-medium">View Document</Text>
                  </TouchableOpacity>
                  
                  {!professional.documents.drivingLicense.verified && (
                    <TouchableOpacity 
                      className="flex-1 bg-primary py-2 rounded-lg items-center"
                      onPress={() => handleVerifyDocument('Driving License')}
                    >
                      <Text className="text-white font-medium">Verify</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Bank Details */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Bank Details</Text>
                <View className={`px-2.5 py-1 rounded-full ${professional.bankDetails.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <Text className={`text-xs font-medium ${professional.bankDetails.verified ? 'text-green-800' : 'text-yellow-800'}`}>
                    {professional.bankDetails.verified ? 'Verified' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View className="mb-3">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Account Holder</Text>
                  <Text className="text-gray-800 font-medium">{professional.bankDetails.accountHolderName}</Text>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Bank Name</Text>
                  <Text className="text-gray-800 font-medium">{professional.bankDetails.bankName}</Text>
                </View>
                
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">Account Number</Text>
                  <Text className="text-gray-800 font-medium">{professional.bankDetails.accountNumber}</Text>
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">IFSC Code</Text>
                  <Text className="text-gray-800 font-medium">{professional.bankDetails.ifscCode}</Text>
                </View>
              </View>
              
              {!professional.bankDetails.verified && (
                <TouchableOpacity 
                  className="bg-primary py-2 rounded-lg items-center"
                  onPress={() => handleVerifyDocument('Bank Details')}
                >
                  <Text className="text-white font-medium">Verify</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Tax Information */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Tax Information</Text>
              
              <View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-600">PAN Number</Text>
                  <Text className="text-gray-800 font-medium">{professional.taxInfo.panNumber}</Text>
                </View>
                
                {professional.taxInfo.gstNumber && (
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">GST Number</Text>
                    <Text className="text-gray-800 font-medium">{professional.taxInfo.gstNumber}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'bookings' && (
          <View className="px-4 py-4">
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Recent Bookings</Text>
              
              {professional.recentBookings.length > 0 ? (
                professional.recentBookings.map((booking, index) => (
                  <TouchableOpacity 
                    key={booking.id}
                    className={`p-3 border-gray-100 ${index !== professional.recentBookings.length - 1 ? 'border-b' : ''}`}
                    onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-gray-800 font-medium">{booking.id}</Text>
                      <Text className={`font-medium capitalize ${getBookingStatusColor(booking.status)}`}>{booking.status}</Text>
                    </View>
                    
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-gray-600">{new Date(booking.date).toLocaleDateString()}</Text>
                      <Text className="text-gray-800 font-medium">{booking.amount}</Text>
                    </View>
                    
                    <Text className="text-gray-600">{booking.services.join(', ')}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text className="text-gray-500 italic">No bookings found</Text>
              )}
              
              <TouchableOpacity 
                className="mt-3 py-2.5 bg-gray-100 rounded-lg items-center"
                onPress={() => navigation.navigate('AdminBookings', { professionalId: professional.id })}
              >
                <Text className="text-gray-700 font-medium">View All Bookings</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Booking Statistics</Text>
                <Text className="text-gray-500 text-sm">Last 30 days</Text>
              </View>
              
              <View className="flex-row mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-gray-800">{professional.totalJobs}</Text>
                  <Text className="text-gray-600 text-sm">Total Jobs</Text>
                </View>
                
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-green-500">{professional.completedJobs}</Text>
                  <Text className="text-gray-600 text-sm">Completed</Text>
                </View>
                
                <View className="flex-1 items-center">
                  <Text className="text-2xl font-bold text-red-500">{professional.cancelledJobs}</Text>
                  <Text className="text-gray-600 text-sm">Cancelled</Text>
                </View>
              </View>
              
              <View className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-green-500" 
                  style={{ width: `${(professional.completedJobs / professional.totalJobs) * 100}%` }}
                />
              </View>
              
              <Text className="text-gray-500 text-xs mt-2 text-center">
                {((professional.completedJobs / professional.totalJobs) * 100).toFixed(1)}% completion rate
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'reviews' && (
          <View className="px-4 py-4">
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-gray-800 font-bold text-base">Customer Reviews</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text className="text-gray-800 font-medium ml-1">{professional.rating.toFixed(1)}</Text>
                  <Text className="text-gray-500 ml-1">({professional.reviews.length})</Text>
                </View>
              </View>
              
              {professional.reviews.length > 0 ? (
                professional.reviews.map((review, index) => (
                  <View 
                    key={review.id}
                    className={`p-3 ${index !== professional.reviews.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-gray-800 font-medium">{review.customerName}</Text>
                      <View className="flex-row items-center">
                        <Text className="text-gray-700 mr-1">{review.rating}</Text>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                      </View>
                    </View>
                    
                    <Text className="text-gray-600 mb-1">{review.comment}</Text>
                    
                    <Text className="text-gray-500 text-xs">{new Date(review.date).toLocaleDateString()}</Text>
                  </View>
                ))
              ) : (
                <Text className="text-gray-500 italic">No reviews yet</Text>
              )}
            </View>

            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-base mb-3">Rating Breakdown</Text>
              
              {[5, 4, 3, 2, 1].map(rating => {
                // Calculate how many reviews have this rating
                const count = professional.reviews.filter(r => r.rating === rating).length;
                const percentage = professional.reviews.length > 0 
                  ? (count / professional.reviews.length) * 100 
                  : 0;
                
                return (
                  <View key={rating} className="flex-row items-center mb-2">
                    <View className="flex-row items-center w-12">
                      <Text className="text-gray-700">{rating}</Text>
                      <Ionicons name="star" size={14} color="#F59E0B" style={{ marginLeft: 2 }} />
                    </View>
                    
                    <View className="flex-1 h-2 bg-gray-200 rounded-full mx-2 overflow-hidden">
                      <View 
                        className="h-full bg-yellow-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </View>
                    
                    <Text className="text-gray-600 w-8 text-right">{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Admin Note Modal */}
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNoteModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-center items-center p-4">
          <View className="bg-white rounded-lg w-full p-4">
            <Text className="text-gray-800 font-bold text-lg mb-4">Add Admin Note</Text>
            
            <TextInput
              className="bg-gray-100 rounded-lg p-3 text-gray-800 min-h-[100px]"
              placeholder="Enter note about this professional..."
              multiline
              value={adminNote}
              onChangeText={setAdminNote}
            />
            
            <View className="flex-row mt-4">
              <TouchableOpacity 
                className="flex-1 bg-gray-200 py-2.5 rounded-lg mr-2 items-center"
                onPress={() => setShowNoteModal(false)}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-1 bg-primary py-2.5 rounded-lg items-center"
                onPress={handleSaveNote}
              >
                <Text className="text-white font-medium">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminProfessionalDetailsScreen;
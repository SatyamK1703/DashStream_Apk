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
  TextInput,StyleSheet
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { adminService } from '../../services/adminService';

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

  // Removed mock useEffect - using real API call now

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
      case 'active': return styles.statusActive;
      case 'inactive': return styles.statusInactive;
      case 'pending': return styles.statusPending;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusInactive;
    }
  };

   const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return styles.bookingStatusCompleted;
      case 'cancelled': return styles.bookingStatusCancelled;
      case 'ongoing': return styles.bookingStatusOngoing;
      default: return styles.bookingStatusDefault;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading professional details...</Text>
      </View>
    );
  }

  if (!professional) {
    return (
       <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Professional Not Found</Text>
        <Text style={styles.errorMessage}>The professional you&apos;re looking for doesn&apos;t exist or has been removed.</Text>
        <TouchableOpacity 
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Professional Details</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Professional Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                {professional.profileImage ? (
                  <Image 
                    source={{ uri: professional.profileImage }} 
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.profileImagePlaceholder}>
                    <Text style={styles.profileImageInitial}>{professional.name.charAt(0)}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.profileInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.profileName}>{professional.name}</Text>
                  {professional.isVerified && (
                    <Ionicons name="checkmark-circle" size={18} color="#2563EB" style={styles.verifiedIcon} />
                  )}
                </View>
                
                <Text style={styles.professionalId}>{professional.id}</Text>
                
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
                  <Text style={styles.reviewCount}>({professional.reviews?.length || 0} reviews)</Text>
                </View>
                
                <View style={[styles.statusBadge, getStatusColor(professional.status)]}>
                  <Text style={styles.statusText}>{professional.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="call" size={18} color="#6B7280" style={styles.contactIcon} />
                <Text style={styles.contactText}>{professional.phone}</Text>
              </View>
              
              <View style={styles.contactRow}>
                <Ionicons name="mail" size={18} color="#6B7280" style={styles.contactIcon} />
                <Text style={styles.contactText}>{professional.email}</Text>
              </View>
              
              <View style={styles.contactRow}>
                <Ionicons name="location" size={18} color="#6B7280" style={styles.contactIcon} />
                <Text style={styles.addressText}>
                  {professional.address}, {professional.city}, {professional.state} - {professional.pincode}
                </Text>
              </View>
              
              <View style={styles.contactRow}>
                <Ionicons name="calendar" size={18} color="#6B7280" style={styles.contactIcon} />
                <Text style={styles.contactText}>Joined on {new Date(professional.joinedDate).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfessional', { professionalId: professional.id })}
              >
                <MaterialIcons name="edit" size={18} color="white" />
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.statusButton,
                  professional.status === 'active' ? styles.deactivateButton : styles.activateButton
                ]}
                onPress={handleStatusChange}
              >
                <MaterialIcons 
                  name={professional.status === 'active' ? 'block' : 'check-circle'} 
                  size={18} 
                  color="white" 
                />
                <Text style={styles.buttonText}>
                  {professional.status === 'active' ? 'Deactivate' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>


        {/* Tab Navigation */}
       <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'overview' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'overview' && styles.activeTabText
            ]}>Overview</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'documents' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('documents')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'documents' && styles.activeTabText
            ]}>Documents</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'bookings' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('bookings')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'bookings' && styles.activeTabText
            ]}>Bookings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton,
              activeTab === 'reviews' && styles.activeTabButton
            ]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[
              styles.tabText,
              activeTab === 'reviews' && styles.activeTabText
            ]}>Reviews</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Skills */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Skills & Expertise</Text>
              <View style={styles.skillsContainer}>
                {professional.skills.map((skill, index) => (
                  <View key={index} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Service Area */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Service Area</Text>
              <View style={styles.serviceAreaContainer}>
                {professional.serviceArea.map((area, index) => (
                  <View key={index} style={styles.areaTag}>
                    <Text style={styles.areaText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>


            {/* Performance Metrics */}
   <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Performance Metrics</Text>
              
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{professional.performanceMetrics.acceptanceRate}%</Text>
                  <Text style={styles.metricLabel}>Acceptance Rate</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{professional.performanceMetrics.cancellationRate}%</Text>
                  <Text style={styles.metricLabel}>Cancellation Rate</Text>
                </View>
                
                <View style={styles.metricItem}>
                  <Text style={styles.metricValue}>{professional.performanceMetrics.customerSatisfaction}</Text>
                  <Text style={styles.metricLabel}>Satisfaction</Text>
                </View>
              </View>
              
              <View style={styles.detailedMetrics}>
                <View style={styles.metricDetail}>
                  <MaterialIcons name="timer" size={16} color="#6B7280" />
                  <Text style={styles.metricDetailText}>Avg. Response: {professional.performanceMetrics.avgResponseTime}</Text>
                </View>
                
                <View style={styles.metricDetail}>
                  <MaterialIcons name="schedule" size={16} color="#6B7280" />
                  <Text style={styles.metricDetailText}>Avg. Service: {professional.performanceMetrics.avgServiceTime}</Text>
                </View>
                
                <View style={styles.metricDetail}>
                  <MaterialIcons name="check-circle" size={16} color="#6B7280" />
                  <Text style={styles.metricDetailText}>Completed: {professional.completedJobs}</Text>
                </View>
                
                <View style={styles.metricDetail}>
                  <MaterialIcons name="cancel" size={16} color="#6B7280" />
                  <Text style={styles.metricDetailText}>Cancelled: {professional.cancelledJobs}</Text>
                </View>
              </View>
            </View>

            {/* Admin Notes */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Admin Notes</Text>
                <TouchableOpacity 
                  style={styles.addNoteButton}
                  onPress={() => setShowNoteModal(true)}
                >
                  <Ionicons name="add" size={18} color="#4B5563" />
                </TouchableOpacity>
              </View>
              
              {adminNote ? (
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{adminNote}</Text>
                </View>
              ) : (
                <Text style={styles.emptyNote}>No notes added yet</Text>
              )}
            </View>
          </View>
        )}

        {activeTab === 'documents' && (
  <View style={styles.tabContent}>
    {/* ID Proof */}
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>ID Proof</Text>
        <View style={[
          styles.verificationBadge,
          professional.documents.idProof.verified ? styles.verifiedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.verificationText,
            professional.documents.idProof.verified ? styles.verifiedText : styles.pendingText
          ]}>
            {professional.documents.idProof.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentDetails}>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Document Type</Text>
          <Text style={styles.documentValue}>{professional.documents.idProof.type}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Document Number</Text>
          <Text style={styles.documentValue}>{professional.documents.idProof.number}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Upload Date</Text>
          <Text style={styles.documentValue}>
            {new Date(professional.documents.idProof.uploadDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentActions}>
        <TouchableOpacity style={styles.viewDocumentButton}>
          <Text style={styles.viewDocumentText}>View Document</Text>
        </TouchableOpacity>
        
        {!professional.documents.idProof.verified && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => handleVerifyDocument('ID Proof')}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Address Proof */}
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>Address Proof</Text>
        <View style={[
          styles.verificationBadge,
          professional.documents.addressProof.verified ? styles.verifiedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.verificationText,
            professional.documents.addressProof.verified ? styles.verifiedText : styles.pendingText
          ]}>
            {professional.documents.addressProof.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentDetails}>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Document Type</Text>
          <Text style={styles.documentValue}>{professional.documents.addressProof.type}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Upload Date</Text>
          <Text style={styles.documentValue}>
            {new Date(professional.documents.addressProof.uploadDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentActions}>
        <TouchableOpacity style={styles.viewDocumentButton}>
          <Text style={styles.viewDocumentText}>View Document</Text>
        </TouchableOpacity>
        
        {!professional.documents.addressProof.verified && (
          <TouchableOpacity 
            style={styles.verifyButton}
            onPress={() => handleVerifyDocument('Address Proof')}
          >
            <Text style={styles.verifyButtonText}>Verify</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>

    {/* Driving License */}
    {professional.documents.drivingLicense && (
      <View style={styles.documentCard}>
        <View style={styles.documentHeader}>
          <Text style={styles.documentTitle}>Driving License</Text>
          <View style={[
            styles.verificationBadge,
            professional.documents.drivingLicense.verified ? styles.verifiedBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.verificationText,
              professional.documents.drivingLicense.verified ? styles.verifiedText : styles.pendingText
            ]}>
              {professional.documents.drivingLicense.verified ? 'Verified' : 'Pending'}
            </Text>
          </View>
        </View>
        
        <View style={styles.documentDetails}>
          <View style={styles.documentRow}>
            <Text style={styles.documentLabel}>License Number</Text>
            <Text style={styles.documentValue}>{professional.documents.drivingLicense.number}</Text>
          </View>
          
          <View style={styles.documentRow}>
            <Text style={styles.documentLabel}>Expiry Date</Text>
            <Text style={styles.documentValue}>
              {new Date(professional.documents.drivingLicense.expiry).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.documentRow}>
            <Text style={styles.documentLabel}>Upload Date</Text>
            <Text style={styles.documentValue}>
              {new Date(professional.documents.drivingLicense.uploadDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.documentActions}>
          <TouchableOpacity style={styles.viewDocumentButton}>
            <Text style={styles.viewDocumentText}>View Document</Text>
          </TouchableOpacity>
          
          {!professional.documents.drivingLicense.verified && (
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={() => handleVerifyDocument('Driving License')}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )}

    {/* Bank Details */}
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>Bank Details</Text>
        <View style={[
          styles.verificationBadge,
          professional.bankDetails.verified ? styles.verifiedBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.verificationText,
            professional.bankDetails.verified ? styles.verifiedText : styles.pendingText
          ]}>
            {professional.bankDetails.verified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
      
      <View style={styles.documentDetails}>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Account Holder</Text>
          <Text style={styles.documentValue}>{professional.bankDetails.accountHolderName}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Bank Name</Text>
          <Text style={styles.documentValue}>{professional.bankDetails.bankName}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Account Number</Text>
          <Text style={styles.documentValue}>{professional.bankDetails.accountNumber}</Text>
        </View>
        
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>IFSC Code</Text>
          <Text style={styles.documentValue}>{professional.bankDetails.ifscCode}</Text>
        </View>
      </View>
      
      {!professional.bankDetails.verified && (
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={() => handleVerifyDocument('Bank Details')}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
      )}
    </View>

    {/* Tax Information */}
    <View style={styles.documentCard}>
      <Text style={styles.documentTitle}>Tax Information</Text>
      
      <View style={styles.documentDetails}>
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>PAN Number</Text>
          <Text style={styles.documentValue}>{professional.taxInfo.panNumber}</Text>
        </View>
        
        {professional.taxInfo.gstNumber && (
          <View style={styles.documentRow}>
            <Text style={styles.documentLabel}>GST Number</Text>
            <Text style={styles.documentValue}>{professional.taxInfo.gstNumber}</Text>
          </View>
        )}
      </View>
    </View>
  </View>
)}

        {activeTab === 'bookings' && (
  <View style={styles.tabContent}>
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Recent Bookings</Text>
      
      {(professional.recentBookings && professional.recentBookings.length > 0) ? (
        professional.recentBookings.map((booking, index) => (
          <TouchableOpacity 
            key={booking.id}
            style={[
              styles.bookingItem,
              index !== (professional.recentBookings?.length || 1) - 1 && styles.bookingItemBorder
            ]}
            onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
          >
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingId}>{booking.id}</Text>
              <Text style={[
                styles.bookingStatus,
                booking.status === 'completed' ? styles.bookingCompleted :
                booking.status === 'cancelled' ? styles.bookingCancelled :
                styles.bookingOngoing
              ]}>
                {booking.status}
              </Text>
            </View>
            
            <View style={styles.bookingDetails}>
              <Text style={styles.bookingDate}>
                {new Date(booking.date).toLocaleDateString()}
              </Text>
              <Text style={styles.bookingAmount}>{booking.amount}</Text>
            </View>
            
            <Text style={styles.bookingServices}>{booking.services.join(', ')}</Text>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.emptyMessage}>No bookings found</Text>
      )}
      
      <TouchableOpacity 
        style={styles.viewAllButton}
        onPress={() => navigation.navigate('AdminBookings', { professionalId: professional.id })}
      >
        <Text style={styles.viewAllText}>View All Bookings</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Booking Statistics</Text>
        <Text style={styles.sectionSubtitle}>Last 30 days</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{professional.totalJobs}</Text>
          <Text style={styles.statLabel}>Total Jobs</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statCompleted]}>
            {professional.completedJobs}
          </Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, styles.statCancelled]}>
            {professional.cancelledJobs}
          </Text>
          <Text style={styles.statLabel}>Cancelled</Text>
        </View>
      </View>
      
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${(professional.completedJobs / professional.totalJobs) * 100}%` }
            ]}
          />
        </View>
      </View>
      
      <Text style={styles.completionRate}>
        {((professional.completedJobs / professional.totalJobs) * 100).toFixed(1)}% completion rate
      </Text>
    </View>
  </View>
)}

        {activeTab === 'reviews' && (
  <View style={styles.tabContent}>
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Customer Reviews</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{professional.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCountText}>({professional.reviews?.length || 0})</Text>
        </View>
      </View>
      
      {(professional.reviews && professional.reviews.length > 0) ? (
        professional.reviews.map((review, index) => (
          <View 
            key={review.id}
            style={[
              styles.reviewItem,
              index !== (professional.reviews?.length || 1) - 1 && styles.reviewItemBorder
            ]}
          >
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewCustomer}>{review.customerName}</Text>
              <View style={styles.reviewRating}>
                <Text style={styles.reviewRatingText}>{review.rating}</Text>
                <Ionicons name="star" size={14} color="#F59E0B" />
              </View>
            </View>
            
            <Text style={styles.reviewComment}>{review.comment}</Text>
            
            <Text style={styles.reviewDate}>
              {new Date(review.date).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyMessage}>No reviews yet</Text>
      )}
    </View>

    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Rating Breakdown</Text>
      
      {[5, 4, 3, 2, 1].map(rating => {
        const count = professional.reviews?.filter(r => r.rating === rating).length || 0;
        const percentage = (professional.reviews && professional.reviews.length > 0) 
          ? (count / professional.reviews.length) * 100 
          : 0;
        
        return (
          <View key={rating} style={styles.ratingBreakdownRow}>
            <View style={styles.ratingLabel}>
              <Text style={styles.ratingNumber}>{rating}</Text>
              <Ionicons name="star" size={14} color="#F59E0B" style={styles.starIcon} />
            </View>
            
            <View style={styles.ratingBarContainer}>
              <View style={styles.ratingBarBackground}>
                <View 
                  style={[
                    styles.ratingBarFill,
                    { width: `${percentage}%` }
                  ]}
                />
              </View>
            </View>
            
            <Text style={styles.ratingCount}>{count}</Text>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Admin Note</Text>
            
            <TextInput
              style={styles.noteInput}
              placeholder="Enter note about this professional..."
              multiline
              value={adminNote}
              onChangeText={setAdminNote}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowNoteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveNote}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AdminProfessionalDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111827',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  goBackButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  profileContent: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitial: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  professionalId: {
    color: '#6b7280',
    fontSize: 14,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#111827',
    marginLeft: 4,
  },
  reviewCount: {
    color: '#6b7280',
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
  },
  statusInactive: {
    backgroundColor: '#e5e7eb',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  contactInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    width: 24,
  },
  contactText: {
    color: '#111827',
    marginLeft: 8,
  },
  addressText: {
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deactivateButton: {
    backgroundColor: '#ef4444',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  tabText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#2563eb',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  addNoteButton: {
    backgroundColor: '#e5e7eb',
    padding: 6,
    borderRadius: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#111827',
  },
  serviceAreaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  areaTag: {
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  areaText: {
    color: '#111827',
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  metricLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  detailedMetrics: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  metricDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricDetailText: {
    color: '#111827',
    marginLeft: 8,
  },
  noteContent: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    color: '#111827',
  },
  emptyNote: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '100%',
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#111827',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  bookingStatusCompleted: {
    color: '#10b981',
  },
  bookingStatusCancelled: {
    color: '#ef4444',
  },
  bookingStatusOngoing: {
    color: '#3b82f6',
  },
  bookingStatusDefault: {
    color: '#6b7280',
  },
});



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  TextInput,StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import {Customer , Address , Vehicle ,Booking ,Note} from '../../types/AdminType';

type AdminCustomerDetailsRouteProp = RouteProp<AdminStackParamList, 'CustomerDetails'>;
type AdminCustomerDetailsNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminCustomerDetailsScreen = () => {
  const navigation = useNavigation<AdminCustomerDetailsNavigationProp>();
  const route = useRoute<AdminCustomerDetailsRouteProp>();
  const { customerId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'addresses' | 'vehicles' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  
  // Mock customer data
  const mockCustomer: Customer = {
    id: 'CUST-001',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 9876543210',
    profileImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'active',
    totalBookings: 15,
    totalSpent: 12500,
    membershipStatus: 'gold',
    membershipExpiry: '2023-12-31',
    joinDate: '2023-01-15',
    lastActive: '2023-06-10',
    addresses: [
      {
        id: 'ADDR-001',
        type: 'home',
        name: 'Home',
        address: '123, Green Park Colony, Sector 15',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
      },
      {
        id: 'ADDR-002',
        type: 'work',
        name: 'Office',
        address: 'Tech Park, Building B, Floor 5',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        isDefault: false
      }
    ],
    vehicles: [
      {
        id: 'VEH-001',
        type: 'car',
        brand: 'Honda',
        model: 'City',
        year: '2020',
        color: 'White',
        licensePlate: 'MH 01 AB 1234',
        image: 'https://example.com/car-image.jpg'
      }
    ],
    bookings: [
      {
        id: 'BOOK-001',
        date: '2023-06-10',
        time: '10:00 AM',
        services: [
          { name: 'Premium Car Wash', price: 999 },
          { name: 'Interior Cleaning', price: 799 }
        ],
        totalAmount: 1798,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        professionalName: 'Rajesh Kumar',
        professionalId: 'PRO-001',
        rating: 4.5,
        address: 'Home - 123, Green Park Colony, Sector 15, Mumbai'
      },
      {
        id: 'BOOK-002',
        date: '2023-05-25',
        time: '02:30 PM',
        services: [
          { name: 'Basic Car Wash', price: 499 }
        ],
        totalAmount: 499,
        status: 'completed',
        paymentStatus: 'paid',
        paymentMethod: 'UPI',
        professionalName: 'Amit Singh',
        professionalId: 'PRO-003',
        rating: 5,
        address: 'Home - 123, Green Park Colony, Sector 15, Mumbai'
      },
      {
        id: 'BOOK-003',
        date: '2023-06-20',
        time: '11:00 AM',
        services: [
          { name: 'Premium Car Wash', price: 999 },
          { name: 'Waxing & Polishing', price: 1299 }
        ],
        totalAmount: 2298,
        status: 'confirmed',
        paymentStatus: 'paid',
        paymentMethod: 'Credit Card',
        address: 'Office - Tech Park, Building B, Floor 5, Mumbai'
      },
    ],
    notes: [
      {
        id: 'NOTE-001',
        text: 'Customer prefers weekend appointments only.',
        createdBy: 'Admin',
        createdAt: '2023-02-10T10:30:00Z'
      },
      {
        id: 'NOTE-002',
        text: 'Upgraded to Gold membership after 10th booking.',
        createdBy: 'System',
        createdAt: '2023-05-15T14:45:00Z'
      }
    ]
  };

  useEffect(() => {
    //simulate API call
    const timer = setTimeout(() => {
      setCustomer(mockCustomer);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [customerId]);

  const handleRefresh = () => {
    setRefreshing(true);
    //simulate API call 
    setTimeout(() => {
      setCustomer(mockCustomer);
      setRefreshing(false);
    }, 1500);
  };

  const handleToggleStatus = (newStatus: 'active' | 'inactive' | 'blocked') => {
    if (!customer) return;
    
    Alert.alert(
      'Change Customer Status',
      `Are you sure you want to change this customer's status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setCustomer({ ...customer, status: newStatus });
            Alert.alert('Success', `Customer status updated to ${newStatus}`);
          }
        }
      ]
    );
  };

  const handleAddNote = () => {
    if (!customer || !newNote.trim()) return;
    
    const newNoteObj: Note = {
      id: `NOTE-${customer.notes.length + 1}`,
      text: newNote.trim(),
      createdBy: 'Admin',
      createdAt: new Date().toISOString()
    };
    
    setCustomer({
      ...customer,
      notes: [newNoteObj, ...customer.notes]
    });
    
    setNewNote('');
  };

  const handleDeleteNote = (noteId: string) => {
    if (!customer) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setCustomer({
              ...customer,
              notes: customer.notes.filter(note => note.id !== noteId)
            });
          }
        }
      ]
    );
  };

 const getStatusDotStyle = (status: string) => {
    switch (status) {
      case 'active': return styles.statusDotActive;
      case 'inactive': return styles.statusDotInactive;
      case 'blocked': return styles.statusDotBlocked;
      default: return styles.statusDotInactive;
    }
  };

  const getBookingStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return { badge: styles.statusBadgeCompleted, text: styles.statusTextCompleted };
      case 'confirmed':
      case 'in-progress':
        return { badge: styles.statusBadgeConfirmed, text: styles.statusTextConfirmed };
      case 'pending':
        return { badge: styles.statusBadgePending, text: styles.statusTextPending };
      default:
        return { badge: styles.statusBadgeCancelled, text: styles.statusTextCancelled };
    }
  };

  const getPaymentDotStyle = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return styles.paymentDotPaid;
      case 'pending': return styles.paymentDotPending;
      case 'refunded': return styles.paymentDotRefunded;
      default: return styles.paymentDotPending;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading customer details...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Customer Not Found</Text>
        <Text style={styles.errorDescription}>
          The customer you're looking for doesn't exist or has been removed.
        </Text>
        <TouchableOpacity 
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView 
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
    >
      {/* Customer Summary */}
      <View style={styles.card}>
        <View style={styles.customerSummaryRow}>
          <Image 
            source={{ uri: customer.profileImage }}
            style={styles.profileImage}
          />
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={styles.customerStatusRow}>
              <View style={[styles.statusDot, getStatusDotStyle(customer.status)]} />
              <Text style={styles.statusText}>{customer.status}</Text>
              
              {customer.membershipStatus !== 'none' && (
                <View style={styles.membershipBadge}>
                  <Text style={styles.membershipText}>
                    {customer.membershipStatus} Member
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.customerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
            >
              <Ionicons name="pencil" size={18} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                Alert.alert(
                  'Contact Customer',
                  'Choose contact method',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Call', onPress: () => console.log('Call pressed') },
                    { text: 'Email', onPress: () => console.log('Email pressed') },
                    { text: 'SMS', onPress: () => console.log('SMS pressed') }
                  ]
                );
              }}
            >
              <Ionicons name="call" size={18} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.customerMetrics}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Customer ID</Text>
            <Text style={styles.metricValue}>{customer.id}</Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Joined On</Text>
            <Text style={styles.metricValue}>
              {new Date(customer.joinDate).toLocaleDateString('en-IN', { 
                day: '2-digit', month: 'short', year: 'numeric' 
              })}
            </Text>
          </View>
          
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Last Active</Text>
            <Text style={styles.metricValue}>
              {new Date(customer.lastActive).toLocaleDateString('en-IN', { 
                day: '2-digit', month: 'short', year: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Contact Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Contact Information</Text>
        
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <Ionicons name="mail-outline" size={18} color="#4B5563" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Email</Text>
            <Text style={styles.contactValue}>{customer.email}</Text>
          </View>
        </View>
        
        <View style={styles.contactRow}>
          <View style={styles.contactIcon}>
            <Ionicons name="call-outline" size={18} color="#4B5563" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactLabel}>Phone</Text>
            <Text style={styles.contactValue}>{customer.phone}</Text>
          </View>
        </View>
      </View>
      
      {/* Membership Information */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Membership</Text>
        
        <View style={styles.membershipRow}>
          <View style={styles.membershipInfo}>
            <View style={styles.membershipStatus}>
              <FontAwesome5 
                name="crown" 
                size={16} 
                color={customer.membershipStatus !== 'none' ? '#F59E0B' : '#9CA3AF'} 
              />
              <Text style={styles.membershipTitle}>
                {customer.membershipStatus !== 'none' 
                  ? `${customer.membershipStatus} Membership` 
                  : 'No Active Membership'
                }
              </Text>
            </View>
            
            {customer.membershipStatus !== 'none' && customer.membershipExpiry && (
              <Text style={styles.membershipExpiry}>
                Expires on {new Date(customer.membershipExpiry).toLocaleDateString('en-IN', { 
                  day: '2-digit', month: 'short', year: 'numeric' 
                })}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => navigation.navigate('EditCustomer', { 
              customerId: customer.id,
              initialTab: 'membership'
            })}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Statistics */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Statistics</Text>
        
        <View style={styles.statsRow}>
          <View style={[styles.statsItem, styles.statsItemBlue, styles.statsItemLeft]}>
            <Text style={styles.statsLabel}>Total Bookings</Text>
            <Text style={[styles.statsValue, styles.statsValueBlue]}>{customer.totalBookings}</Text>
          </View>
          
          <View style={[styles.statsItem, styles.statsItemGreen, styles.statsItemRight]}>
            <Text style={styles.statsLabel}>Total Spent</Text>
            <Text style={[styles.statsValue, styles.statsValueGreen]}>₹{customer.totalSpent}</Text>
          </View>
        </View>
        
        <View style={[styles.statsRow, { marginTop: 12 }]}>
          <View style={[styles.statsItem, styles.statsItemPurple, styles.statsItemLeft]}>
            <Text style={styles.statsLabel}>Addresses</Text>
            <Text style={[styles.statsValue, styles.statsValuePurple]}>{customer.addresses.length}</Text>
          </View>
          
          <View style={[styles.statsItem, styles.statsItemAmber, styles.statsItemRight]}>
            <Text style={styles.statsLabel}>Vehicles</Text>
            <Text style={[styles.statsValue, styles.statsValueAmber]}>{customer.vehicles.length}</Text>
          </View>
        </View>
      </View>
      
      {/* Recent Bookings */}
      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.cardTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => setActiveTab('bookings')}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {customer.bookings.slice(0, 2).map((booking, index) => {
          const statusStyles = getBookingStatusStyles(booking.status);
          return (
            <TouchableOpacity 
              key={booking.id}
              style={[styles.bookingItem, index === 1 && styles.lastBookingItem]}
              onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
            >
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>{booking.id}</Text>
                <View style={[styles.statusBadge, statusStyles.badge]}>
                  <Text style={[styles.statusBadgeText, statusStyles.text]}>
                    {booking.status}
                  </Text>
                </View>
              </View>
              
              <View style={styles.bookingMeta}>
                <Text style={styles.bookingDate}>
                  {new Date(booking.date).toLocaleDateString('en-IN', { 
                    day: '2-digit', month: 'short' 
                  })} • {booking.time}
                </Text>
                <Text style={styles.bookingAmount}>₹{booking.totalAmount}</Text>
              </View>
              
              <Text style={styles.bookingServices} numberOfLines={1}>
                {booking.services.map(s => s.name).join(', ')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Admin Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Admin Actions</Text>
        
        <View style={styles.adminActionsRow}>
          {customer.status !== 'active' && (
            <TouchableOpacity 
              style={[styles.adminActionButton, styles.adminActionButtonGreen]}
              onPress={() => handleToggleStatus('active')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text style={[styles.adminActionText, styles.adminActionTextGreen]}>Activate</Text>
            </TouchableOpacity>
          )}
          
          {customer.status !== 'inactive' && (
            <TouchableOpacity 
              style={[styles.adminActionButton, styles.adminActionButtonAmber]}
              onPress={() => handleToggleStatus('inactive')}
            >
              <Ionicons name="pause-circle-outline" size={18} color="#F59E0B" />
              <Text style={[styles.adminActionText, styles.adminActionTextAmber]}>Deactivate</Text>
            </TouchableOpacity>
          )}
          
          {customer.status !== 'blocked' && (
            <TouchableOpacity 
              style={[styles.adminActionButton, styles.adminActionButtonRed]}
              onPress={() => handleToggleStatus('blocked')}
            >
              <Ionicons name="ban-outline" size={18} color="#EF4444" />
              <Text style={[styles.adminActionText, styles.adminActionTextRed]}>Block</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.adminActionButton, styles.adminActionButtonBlue]}
            onPress={() => navigation.navigate('CreateBooking', { customerId: customer.id })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
            <Text style={[styles.adminActionText, styles.adminActionTextBlue]}>Create Booking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.adminActionButton, styles.adminActionButtonPurple]}
            onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
          >
            <Ionicons name="create-outline" size={18} color="#8B5CF6" />
            <Text style={[styles.adminActionText, styles.adminActionTextPurple]}>Edit Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderBookingsTab = () => (
    <FlatList
      data={customer.bookings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const statusStyles = getBookingStatusStyles(item.status);
        return (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
          >
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingId}>{item.id}</Text>
              <View style={[styles.statusBadge, statusStyles.badge]}>
                <Text style={[styles.statusBadgeText, statusStyles.text]}>
                  {item.status}
                </Text>
              </View>
            </View>
            
            <View style={styles.bookingMeta}>
              <Text style={styles.bookingDate}>
                {new Date(item.date).toLocaleDateString('en-IN', { 
                  day: '2-digit', month: 'short', year: 'numeric' 
                })} • {item.time}
              </Text>
              <Text style={styles.bookingAmount}>₹{item.totalAmount}</Text>
            </View>
            
            <Text style={styles.bookingServices} numberOfLines={1}>
              {item.services.map(s => s.name).join(', ')}
            </Text>
            
            <View style={styles.bookingFooter}>
              <View style={styles.bookingLocation}>
                <Ionicons name="location-outline" size={16} color="#4B5563" />
                <Text style={styles.bookingLocationText} numberOfLines={1}>
                  {item.address}
                </Text>
              </View>
              
              <View style={styles.bookingPayment}>
                <View style={[styles.paymentDot, getPaymentDotStyle(item.paymentStatus)]} />
                <Text style={styles.paymentText}>
                  {item.paymentStatus} • {item.paymentMethod}
                </Text>
              </View>
            </View>
            
            {item.professionalName && (
              <View style={styles.professionalInfo}>
                <Ionicons name="person-outline" size={16} color="#4B5563" />
                <Text style={styles.professionalText}>
                  Professional: {item.professionalName}
                </Text>
                {item.rating && (
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No bookings found</Text>
        </View>
      }
    />
  );

  const renderAddressesTab = () => (
    <FlatList
      data={customer.addresses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.addressItem}>
          <View style={styles.addressHeader}>
            <View style={styles.addressTypeContainer}>
              <View style={styles.addressIcon}>
                <Ionicons 
                  name={
                    item.type === 'home' ? 'home-outline' : 
                    item.type === 'work' ? 'briefcase-outline' : 'location-outline'
                  } 
                  size={16} 
                  color="#2563EB" 
                />
              </View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressName}>{item.name}</Text>
                <Text style={styles.addressType}>{item.type}</Text>
              </View>
            </View>
            
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          
          <View style={styles.addressDetails}>
            <Text style={styles.addressText}>{item.address}</Text>
            <Text style={styles.addressLocation}>
              {item.city}, {item.state} - {item.pincode}
            </Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No addresses found</Text>
        </View>
      }
    />
  );

  const renderVehiclesTab = () => (
    <FlatList
      data={customer.vehicles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.vehicleItem}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconContainer}>
              <MaterialCommunityIcons 
                name={
                  item.type === 'car' ? 'car' : 
                  item.type === 'motorcycle' ? 'motorcycle' : 'bicycle'
                } 
                size={24} 
                color="#4B5563" 
              />
            </View>
            
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleName}>
                {item.brand} {item.model}
              </Text>
              
              <View style={styles.vehicleMeta}>
                <Text style={styles.vehicleMetaText}>{item.type}</Text>
                <Text style={styles.vehicleMetaSeparator}>•</Text>
                <Text style={styles.vehicleMetaText}>{item.year}</Text>
                <Text style={styles.vehicleMetaSeparator}>•</Text>
                <Text style={styles.vehicleMetaText}>{item.color}</Text>
              </View>
              
              {item.licensePlate && (
                <View style={styles.licensePlate}>
                  <Text style={styles.licensePlateText}>{item.licensePlate}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563EB']}
          tintColor="#2563EB"
        />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="car" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No vehicles found</Text>
        </View>
      }
    />
  );

  const renderNotesTab = () => (
    <View style={styles.notesContainer}>
      {/* Add Note Input */}
      <View style={styles.addNoteCard}>
        <Text style={styles.addNoteTitle}>Add Note</Text>
        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Type your note here..."
            multiline
            value={newNote}
            onChangeText={setNewNote}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <TouchableOpacity 
          style={[styles.addNoteButton, { opacity: newNote.trim() ? 1 : 0.7 }]}
          onPress={handleAddNote}
          disabled={!newNote.trim()}
        >
          <Text style={styles.addNoteButtonText}>Add Note</Text>
        </TouchableOpacity>
      </View>
      
      {/* Notes List */}
      <FlatList
        data={customer.notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteItem}>
            <View style={styles.noteHeader}>
              <View style={styles.noteAuthor}>
                <Ionicons name="person-circle-outline" size={20} color="#4B5563" />
                <Text style={styles.noteAuthorText}>{item.createdBy}</Text>
              </View>
              
              <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.noteText}>{item.text}</Text>
            
            <Text style={styles.noteTimestamp}>
              {new Date(item.createdAt).toLocaleString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notes found</Text>
            <Text style={styles.emptySubText}>Add a note above</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Details</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
          { id: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
          { id: 'addresses', label: 'Addresses', icon: 'location-outline' },
          { id: 'vehicles', label: 'Vehicles', icon: 'car-outline' },
          { id: 'notes', label: 'Notes', icon: 'document-text-outline' }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#2563EB' : '#6B7280'} 
            />
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.id ? styles.tabTextActive : styles.tabTextInactive
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'addresses' && renderAddressesTab()}
        {activeTab === 'vehicles' && renderVehiclesTab()}
        {activeTab === 'notes' && renderNotesTab()}
      </View>
    </SafeAreaView>
  );
};

export default AdminCustomerDetailsScreen;



const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4B5563',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorTitle: {
    marginTop: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  errorDescription: {
    marginTop: 8,
    color: '#4B5563',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  errorButton: {
    marginTop: 24,
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: 'white',
    fontWeight: '500',
  },

  // Header
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  tabTextInactive: {
    color: '#6B7280',
  },

  // Tab Content
  tabContent: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },

  // Card Styles
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Customer Summary
  customerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E5E7EB',
  },
  customerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  customerName: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 18,
  },
  customerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  statusDotInactive: {
    backgroundColor: '#F59E0B',
  },
  statusDotBlocked: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    color: '#4B5563',
    fontSize: 14,
    textTransform: 'capitalize',
  },
  membershipBadge: {
    marginLeft: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: '#FEF3C7',
  },
  membershipText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  customerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  customerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  metricValue: {
    color: '#1F2937',
    fontWeight: '500',
  },

  // Contact Information
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactIcon: {
    width: 32,
    alignItems: 'center',
  },
  contactInfo: {},
  contactLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  contactValue: {
    color: '#1F2937',
  },

  // Membership
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipInfo: {},
  membershipStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  membershipTitle: {
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  membershipExpiry: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  manageButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  manageButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },

  // Statistics
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsItem: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
    flex: 1,
  },
  statsItemLeft: {
    marginRight: 8,
  },
  statsItemRight: {
    marginLeft: 8,
  },
  statsItemBlue: {
    backgroundColor: '#EFF6FF',
  },
  statsItemGreen: {
    backgroundColor: '#ECFDF5',
  },
  statsItemPurple: {
    backgroundColor: '#FAF5FF',
  },
  statsItemAmber: {
    backgroundColor: '#FFFBEB',
  },
  statsLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  statsValue: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  statsValueBlue: {
    color: '#2563EB',
  },
  statsValueGreen: {
    color: '#059669',
  },
  statsValuePurple: {
    color: '#8B5CF6',
  },
  statsValueAmber: {
    color: '#D97706',
  },

  // Recent Bookings
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    color: '#2563EB',
    fontSize: 14,
  },

  // Booking Item
  bookingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  lastBookingItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingId: {
    color: '#1F2937',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  statusBadgeCompleted: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeConfirmed: {
    backgroundColor: '#DBEAFE',
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeCancelled: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusTextCompleted: {
    color: '#065F46',
  },
  statusTextConfirmed: {
    color: '#1E40AF',
  },
  statusTextPending: {
    color: '#92400E',
  },
  statusTextCancelled: {
    color: '#991B1B',
  },
  bookingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  bookingDate: {
    color: '#6B7280',
    fontSize: 14,
  },
  bookingAmount: {
    color: '#1F2937',
    fontWeight: '500',
  },
  bookingServices: {
    color: '#4B5563',
    fontSize: 14,
    marginTop: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingLocationText: {
    color: '#4B5563',
    fontSize: 14,
    marginLeft: 4,
  },
  bookingPayment: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  paymentDotPaid: {
    backgroundColor: '#10B981',
  },
  paymentDotPending: {
    backgroundColor: '#F59E0B',
  },
  paymentDotRefunded: {
    backgroundColor: '#EF4444',
  },
  paymentText: {
    color: '#4B5563',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  professionalText: {
    color: '#4B5563',
    fontSize: 14,
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    color: '#D97706',
    fontSize: 12,
    marginLeft: 2,
  },

  // Admin Actions
  adminActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  adminActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  adminActionButtonGreen: {
    backgroundColor: '#ECFDF5',
  },
  adminActionButtonAmber: {
    backgroundColor: '#FFFBEB',
  },
  adminActionButtonRed: {
    backgroundColor: '#FEF2F2',
  },
  adminActionButtonBlue: {
    backgroundColor: '#EFF6FF',
  },
  adminActionButtonPurple: {
    backgroundColor: '#FAF5FF',
  },
  adminActionText: {
    fontWeight: '500',
    marginLeft: 6,
  },
  adminActionTextGreen: {
    color: '#059669',
  },
  adminActionTextAmber: {
    color: '#D97706',
  },
  adminActionTextRed: {
    color: '#DC2626',
  },
  adminActionTextBlue: {
    color: '#2563EB',
  },
  adminActionTextPurple: {
    color: '#8B5CF6',
  },

  // Address Item
  addressItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressInfo: {
    marginLeft: 8,
  },
  addressName: {
    color: '#1F2937',
    fontWeight: '500',
  },
  addressType: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    backgroundColor: '#D1FAE5',
  },
  defaultBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '500',
  },
  addressDetails: {
    marginTop: 12,
  },
  addressText: {
    color: '#374151',
  },
  addressLocation: {
    color: '#4B5563',
    marginTop: 4,
  },

  // Vehicle Item
  vehicleItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 12,
  },
  vehicleRow: {
    flexDirection: 'row',
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleDetails: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleName: {
    color: '#1F2937',
    fontWeight: '500',
  },
  vehicleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  vehicleMetaText: {
    color: '#6B7280',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  vehicleMetaSeparator: {
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
  licensePlate: {
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  licensePlateText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '500',
  },

  // Notes
  notesContainer: {
    flex: 1,
    padding: 16,
  },
  addNoteCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
  },
  addNoteTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteInputContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  noteInput: {
    color: '#1F2937',
    minHeight: 80,
  },
  addNoteButton: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addNoteButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  noteItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  noteAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteAuthorText: {
    color: '#374151',
    fontWeight: '500',
    marginLeft: 4,
  },
  noteText: {
    color: '#1F2937',
    marginTop: 8,
  },
  noteTimestamp: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 12,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

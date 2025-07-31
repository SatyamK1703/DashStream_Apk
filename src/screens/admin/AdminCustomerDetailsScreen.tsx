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
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminCustomerDetailsRouteProp = RouteProp<AdminStackParamList, 'CustomerDetails'>;
type AdminCustomerDetailsNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  status: 'active' | 'inactive' | 'blocked';
  totalBookings: number;
  totalSpent: number;
  membershipStatus: 'none' | 'silver' | 'gold' | 'platinum';
  membershipExpiry?: string;
  joinDate: string;
  lastActive: string;
  addresses: Address[];
  vehicles: Vehicle[];
  bookings: Booking[];
  notes: Note[];
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface Vehicle {
  id: string;
  type: 'car' | 'motorcycle' | 'bicycle';
  brand: string;
  model: string;
  year: string;
  color: string;
  licensePlate?: string;
  image?: string;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  services: {
    name: string;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod: string;
  professionalName?: string;
  professionalId?: string;
  rating?: number;
  address: string;
}

interface Note {
  id: string;
  text: string;
  createdBy: string;
  createdAt: string;
}

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
    // Simulate API call
    const timer = setTimeout(() => {
      setCustomer(mockCustomer);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [customerId]);

  const handleRefresh = () => {
    setRefreshing(true);
    
    // Simulate API call
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
            // Update customer status
            setCustomer({ ...customer, status: newStatus });
            
            // Show success message
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

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading customer details...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text className="mt-4 text-gray-800 font-medium">Customer Not Found</Text>
        <Text className="mt-2 text-gray-600 text-center px-8">The customer you're looking for doesn't exist or has been removed.</Text>
        <TouchableOpacity 
          className="mt-6 bg-primary px-6 py-3 rounded-lg"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <ScrollView 
      className="flex-1"
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
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <View className="flex-row items-center">
          <Image 
            source={{ uri: customer.profileImage }}
            className="w-16 h-16 rounded-full bg-gray-200"
          />
          <View className="ml-4 flex-1">
            <Text className="text-gray-800 font-bold text-lg">{customer.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className={`w-2 h-2 rounded-full mr-1.5 ${
                customer.status === 'active' ? 'bg-green-500' : 
                customer.status === 'inactive' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <Text className="text-gray-600 text-sm capitalize">{customer.status}</Text>
              
              {customer.membershipStatus !== 'none' && (
                <View className="ml-3 px-2 py-0.5 rounded-full bg-amber-100">
                  <Text className="text-amber-800 text-xs font-medium capitalize">
                    {customer.membershipStatus} Member
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="p-2 rounded-full bg-gray-100 mr-2"
              onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
            >
              <Ionicons name="pencil" size={18} color="#4B5563" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-2 rounded-full bg-gray-100"
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
        
        <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Customer ID</Text>
            <Text className="text-gray-800 font-medium">{customer.id}</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Joined On</Text>
            <Text className="text-gray-800 font-medium">{new Date(customer.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          </View>
          
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Last Active</Text>
            <Text className="text-gray-800 font-medium">{new Date(customer.lastActive).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
          </View>
        </View>
      </View>
      
      {/* Contact Information */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Text className="text-gray-800 font-bold mb-3">Contact Information</Text>
        
        <View className="flex-row items-center mb-3">
          <View className="w-8 items-center">
            <Ionicons name="mail-outline" size={18} color="#4B5563" />
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Email</Text>
            <Text className="text-gray-800">{customer.email}</Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <View className="w-8 items-center">
            <Ionicons name="call-outline" size={18} color="#4B5563" />
          </View>
          <View>
            <Text className="text-gray-500 text-xs">Phone</Text>
            <Text className="text-gray-800">{customer.phone}</Text>
          </View>
        </View>
      </View>
      
      {/* Membership Information */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Text className="text-gray-800 font-bold mb-3">Membership</Text>
        
        <View className="flex-row justify-between items-center">
          <View>
            <View className="flex-row items-center">
              <FontAwesome5 name="crown" size={16} color={customer.membershipStatus !== 'none' ? '#F59E0B' : '#9CA3AF'} />
              <Text className="ml-2 text-gray-800 font-medium capitalize">
                {customer.membershipStatus !== 'none' ? `${customer.membershipStatus} Membership` : 'No Active Membership'}
              </Text>
            </View>
            
            {customer.membershipStatus !== 'none' && customer.membershipExpiry && (
              <Text className="text-gray-500 text-sm mt-1">
                Expires on {new Date(customer.membershipExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            className="bg-primary px-3 py-1.5 rounded-lg"
            onPress={() => navigation.navigate('EditCustomer', { 
              customerId: customer.id,
              initialTab: 'membership'
            })}
          >
            <Text className="text-white font-medium text-sm">Manage</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Statistics */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Text className="text-gray-800 font-bold mb-3">Statistics</Text>
        
        <View className="flex-row justify-between">
          <View className="items-center bg-blue-50 rounded-lg p-3 flex-1 mr-2">
            <Text className="text-gray-500 text-xs">Total Bookings</Text>
            <Text className="text-primary font-bold text-xl">{customer.totalBookings}</Text>
          </View>
          
          <View className="items-center bg-green-50 rounded-lg p-3 flex-1 ml-2">
            <Text className="text-gray-500 text-xs">Total Spent</Text>
            <Text className="text-green-600 font-bold text-xl">₹{customer.totalSpent}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between mt-3">
          <View className="items-center bg-purple-50 rounded-lg p-3 flex-1 mr-2">
            <Text className="text-gray-500 text-xs">Addresses</Text>
            <Text className="text-purple-600 font-bold text-xl">{customer.addresses.length}</Text>
          </View>
          
          <View className="items-center bg-amber-50 rounded-lg p-3 flex-1 ml-2">
            <Text className="text-gray-500 text-xs">Vehicles</Text>
            <Text className="text-amber-600 font-bold text-xl">{customer.vehicles.length}</Text>
          </View>
        </View>
      </View>
      
      {/* Recent Bookings */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-gray-800 font-bold">Recent Bookings</Text>
          <TouchableOpacity onPress={() => setActiveTab('bookings')}>
            <Text className="text-primary text-sm">View All</Text>
          </TouchableOpacity>
        </View>
        
        {customer.bookings.slice(0, 2).map((booking) => (
          <TouchableOpacity 
            key={booking.id}
            className="border-b border-gray-100 pb-3 mb-3 last:border-b-0 last:mb-0 last:pb-0"
            onPress={() => navigation.navigate('BookingDetails', { bookingId: booking.id })}
          >
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-800 font-medium">{booking.id}</Text>
              <View className={`px-2 py-0.5 rounded-full ${
                booking.status === 'completed' ? 'bg-green-100' : 
                booking.status === 'confirmed' || booking.status === 'in-progress' ? 'bg-blue-100' :
                booking.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs font-medium capitalize ${
                  booking.status === 'completed' ? 'text-green-800' : 
                  booking.status === 'confirmed' || booking.status === 'in-progress' ? 'text-blue-800' :
                  booking.status === 'pending' ? 'text-amber-800' : 'text-red-800'
                }`}>
                  {booking.status}
                </Text>
              </View>
            </View>
            
            <View className="flex-row justify-between mt-2">
              <Text className="text-gray-500 text-sm">
                {new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} • {booking.time}
              </Text>
              <Text className="text-gray-800 font-medium">₹{booking.totalAmount}</Text>
            </View>
            
            <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
              {booking.services.map(s => s.name).join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Admin Actions */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Text className="text-gray-800 font-bold mb-3">Admin Actions</Text>
        
        <View className="flex-row flex-wrap">
          {customer.status !== 'active' && (
            <TouchableOpacity 
              className="flex-row items-center bg-green-50 px-3 py-2 rounded-lg mr-2 mb-2"
              onPress={() => handleToggleStatus('active')}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#10B981" />
              <Text className="text-green-600 ml-1.5 font-medium">Activate</Text>
            </TouchableOpacity>
          )}
          
          {customer.status !== 'inactive' && (
            <TouchableOpacity 
              className="flex-row items-center bg-amber-50 px-3 py-2 rounded-lg mr-2 mb-2"
              onPress={() => handleToggleStatus('inactive')}
            >
              <Ionicons name="pause-circle-outline" size={18} color="#F59E0B" />
              <Text className="text-amber-600 ml-1.5 font-medium">Deactivate</Text>
            </TouchableOpacity>
          )}
          
          {customer.status !== 'blocked' && (
            <TouchableOpacity 
              className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg mr-2 mb-2"
              onPress={() => handleToggleStatus('blocked')}
            >
              <Ionicons name="ban-outline" size={18} color="#EF4444" />
              <Text className="text-red-600 ml-1.5 font-medium">Block</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg mr-2 mb-2"
            onPress={() => navigation.navigate('CreateBooking', { customerId: customer.id })}
          >
            <Ionicons name="add-circle-outline" size={18} color="#2563EB" />
            <Text className="text-primary ml-1.5 font-medium">Create Booking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center bg-purple-50 px-3 py-2 rounded-lg mb-2"
            onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })}
          >
            <Ionicons name="create-outline" size={18} color="#8B5CF6" />
            <Text className="text-purple-600 ml-1.5 font-medium">Edit Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderBookingsTab = () => (
    <FlatList
      data={customer.bookings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          className="bg-white rounded-lg shadow-sm p-4 mb-3"
          onPress={() => navigation.navigate('BookingDetails', { bookingId: item.id })}
        >
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-800 font-medium">{item.id}</Text>
            <View className={`px-2 py-0.5 rounded-full ${
              item.status === 'completed' ? 'bg-green-100' : 
              item.status === 'confirmed' || item.status === 'in-progress' ? 'bg-blue-100' :
              item.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs font-medium capitalize ${
                item.status === 'completed' ? 'text-green-800' : 
                item.status === 'confirmed' || item.status === 'in-progress' ? 'text-blue-800' :
                item.status === 'pending' ? 'text-amber-800' : 'text-red-800'
              }`}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500 text-sm">
              {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • {item.time}
            </Text>
            <Text className="text-gray-800 font-medium">₹{item.totalAmount}</Text>
          </View>
          
          <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
            {item.services.map(s => s.name).join(', ')}
          </Text>
          
          <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={16} color="#4B5563" />
              <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className={`w-2 h-2 rounded-full mr-1.5 ${
                item.paymentStatus === 'paid' ? 'bg-green-500' : 
                item.paymentStatus === 'pending' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <Text className="text-gray-600 text-xs capitalize">
                {item.paymentStatus} • {item.paymentMethod}
              </Text>
            </View>
          </View>
          
          {item.professionalName && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="person-outline" size={16} color="#4B5563" />
              <Text className="text-gray-600 text-sm ml-1">
                Professional: {item.professionalName}
              </Text>
              {item.rating && (
                <View className="flex-row items-center ml-2">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="text-amber-600 text-xs ml-0.5">{item.rating}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 16 }}
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
        <View className="items-center justify-center py-8">
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center">No bookings found</Text>
        </View>
      }
    />
  );

  const renderAddressesTab = () => (
    <FlatList
      data={customer.addresses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
                <Ionicons 
                  name={
                    item.type === 'home' ? 'home-outline' : 
                    item.type === 'work' ? 'briefcase-outline' : 'location-outline'
                  } 
                  size={16} 
                  color="#2563EB" 
                />
              </View>
              <View className="ml-2">
                <Text className="text-gray-800 font-medium">{item.name}</Text>
                <Text className="text-gray-500 text-xs capitalize">{item.type}</Text>
              </View>
            </View>
            
            {item.isDefault && (
              <View className="px-2 py-0.5 rounded-full bg-green-100">
                <Text className="text-green-800 text-xs font-medium">Default</Text>
              </View>
            )}
          </View>
          
          <View className="mt-3">
            <Text className="text-gray-700">{item.address}</Text>
            <Text className="text-gray-600 mt-1">
              {item.city}, {item.state} - {item.pincode}
            </Text>
          </View>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
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
        <View className="items-center justify-center py-8">
          <Ionicons name="location-outline" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center">No addresses found</Text>
        </View>
      }
    />
  );

  const renderVehiclesTab = () => (
    <FlatList
      data={customer.vehicles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <View className="flex-row">
            <View className="w-12 h-12 rounded-lg bg-gray-100 items-center justify-center">
              <MaterialCommunityIcons 
                name={
                  item.type === 'car' ? 'car' : 
                  item.type === 'motorcycle' ? 'motorcycle' : 'bicycle'
                } 
                size={24} 
                color="#4B5563" 
              />
            </View>
            
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-medium">
                {item.brand} {item.model}
              </Text>
              
              <View className="flex-row items-center mt-1">
                <Text className="text-gray-500 text-xs capitalize">{item.type}</Text>
                <Text className="text-gray-400 mx-1">•</Text>
                <Text className="text-gray-500 text-xs">{item.year}</Text>
                <Text className="text-gray-400 mx-1">•</Text>
                <Text className="text-gray-500 text-xs">{item.color}</Text>
              </View>
              
              {item.licensePlate && (
                <View className="bg-gray-100 self-start px-2 py-0.5 rounded mt-2">
                  <Text className="text-gray-700 text-xs font-medium">{item.licensePlate}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
      contentContainerStyle={{ padding: 16 }}
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
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons name="car" size={48} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center">No vehicles found</Text>
        </View>
      }
    />
  );

  const renderNotesTab = () => (
    <View className="flex-1 p-4">
      {/* Add Note Input */}
      <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <Text className="text-gray-800 font-bold mb-2">Add Note</Text>
        <View className="border border-gray-200 rounded-lg p-3">
          <TextInput
            className="text-gray-800 min-h-[80px]"
            placeholder="Type your note here..."
            multiline
            value={newNote}
            onChangeText={setNewNote}
          />
        </View>
        <TouchableOpacity 
          className="bg-primary self-end mt-3 px-4 py-2 rounded-lg"
          onPress={handleAddNote}
          disabled={!newNote.trim()}
          style={{ opacity: newNote.trim() ? 1 : 0.7 }}
        >
          <Text className="text-white font-medium">Add Note</Text>
        </TouchableOpacity>
      </View>
      
      {/* Notes List */}
      <FlatList
        data={customer.notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white rounded-lg shadow-sm p-4 mb-3">
            <View className="flex-row justify-between items-start">
              <View className="flex-row items-center">
                <Ionicons name="person-circle-outline" size={20} color="#4B5563" />
                <Text className="text-gray-700 font-medium ml-1">{item.createdBy}</Text>
              </View>
              
              <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
            
            <Text className="text-gray-800 mt-2">{item.text}</Text>
            
            <Text className="text-gray-500 text-xs mt-3">
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
          <View className="items-center justify-center py-8">
            <Ionicons name="document-text-outline" size={48} color="#D1D5DB" />
            <Text className="text-gray-500 mt-4 text-center">No notes found</Text>
            <Text className="text-gray-400 text-center">Add a note above</Text>
          </View>
        }
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2 rounded-full bg-white/20 mr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Customer Details</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: 'information-circle-outline' },
          { id: 'bookings', label: 'Bookings', icon: 'calendar-outline' },
          { id: 'addresses', label: 'Addresses', icon: 'location-outline' },
          { id: 'vehicles', label: 'Vehicles', icon: 'car-outline' },
          { id: 'notes', label: 'Notes', icon: 'document-text-outline' }
        ].map((tab) => (
          <TouchableOpacity 
            key={tab.id}
            className={`flex-1 py-3 items-center ${activeTab === tab.id ? 'border-b-2 border-primary' : ''}`}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.id ? '#2563EB' : '#6B7280'} 
            />
            <Text 
              className={`text-xs mt-1 ${activeTab === tab.id ? 'text-primary font-medium' : 'text-gray-500'}`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab Content */}
      <View className="flex-1">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'addresses' && renderAddressesTab()}
        {activeTab === 'vehicles' && renderVehiclesTab()}
        {activeTab === 'notes' && renderNotesTab()}
      </View>
    </View>
  );
};

export default AdminCustomerDetailsScreen;
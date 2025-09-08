import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch, 
  Alert, 
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { UserService } from '../../services/userService';
import { Customer, Address, Vehicle } from '../../types/UserType';

type ProfileScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const { isFullyAuthenticated } = useRequireAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data
  const fetchUserData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch addresses and vehicles in parallel
      const [addressesResponse, vehiclesResponse] = await Promise.all([
        UserService.getMyAddresses(),
        UserService.getMyVehicles()
      ]);

      setAddresses(addressesResponse.data.addresses || []);
      setVehicles(vehiclesResponse.data.vehicles || []);
      
      // Set customer data from auth context
      if (user) {
        setCustomerData(user as Customer);
      }
    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.response?.data?.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData(false);
    }, [fetchUserData])
  );

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
          }
        }
      ]
    );
  };

  const profileMenuItems = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => navigation.navigate('EditProfile')
    },
    {
      id: 'addresses',
      title: 'My Addresses',
      icon: 'location-outline',
      onPress: () => navigation.navigate('AddressList')
    },
    {
      id: 'vehicles',
      title: 'My Vehicles',
      icon: 'car-outline',
      onPress: () => navigation.navigate('VehicleList')
    },
    {
      id:'History',
      title:'Order History',
      icon:'time-outline',
      onPress:()=> navigation.navigate('OrderHistory')
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods')
    },
    {
      id: 'paymentHistory',
      title: 'Payment History',
      icon: 'receipt-outline',
      onPress: () => navigation.navigate('PaymentHistory')
    },
    {
      id: 'membership',
      title: 'Membership & Subscriptions',
      icon: 'star-outline',
      onPress: () => navigation.navigate('Membership')
    },
    {
      id: 'referrals',
      title: 'Refer & Earn',
      icon: 'gift-outline',
      onPress: () => navigation.navigate('ReferAndEarn')
    },
  ];

  const supportMenuItems = [
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => navigation.navigate('Support')
    },
    {
      id: 'faq',
      title: 'FAQ',
      icon: 'information-circle-outline',
      onPress: () => navigation.navigate('FAQ')
    },
    {
      id: 'about',
      title: 'About Us',
      icon: 'business-outline',
      onPress: () => navigation.navigate('AboutUs')
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-outline',
      onPress: () => navigation.navigate('PrivacyPolicy')
    },
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      onPress: () => navigation.navigate('TermsAndConditions')
    },
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={item.icon} size={20} color="#2563eb" />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scroll} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchUserData(true)}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.profileRow}
            onPress={() => navigation.navigate('EditProfile')}
          >
            {customerData?.profileImage ? (
              <Image 
                source={{ uri: customerData.profileImage }} 
                style={styles.profileImage} 
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Ionicons name="person" size={32} color="#6b7280" />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{customerData?.name || user?.name || 'User Name'}</Text>
              <Text style={styles.profileMeta}>{customerData?.phone || user?.phone || '+91 98765 43210'}</Text>
              <Text style={styles.profileMeta}>{customerData?.email || user?.email || 'user@example.com'}</Text>
              {customerData?.membershipStatus && customerData.membershipStatus !== 'none' && (
                <View style={styles.membershipBadge}>
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={styles.membershipText}>{customerData.membershipStatus.toUpperCase()}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        {customerData && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{customerData.totalBookings || 0}</Text>
                <Text style={styles.statLabel}>Total Bookings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>₹{customerData.totalSpent || 0}</Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{addresses.length}</Text>
                <Text style={styles.statLabel}>Addresses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{vehicles.length}</Text>
                <Text style={styles.statLabel}>Vehicles</Text>
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="notifications-outline" size={20} color="#2563eb" />
              </View>
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={notificationsEnabled ? '#2563eb' : '#f4f4f5'}
              onValueChange={setNotificationsEnabled}
              value={notificationsEnabled}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <View style={styles.menuIconContainer}>
                <Ionicons name="location-outline" size={20} color="#2563eb" />
              </View>
              <Text style={styles.settingText}>Location Services</Text>
            </View>
            <Switch
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={locationEnabled ? '#2563eb' : '#f4f4f5'}
              onValueChange={setLocationEnabled}
              value={locationEnabled}
            />
          </View>
        </View>

        {/* Profile Menu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Account</Text>
          {profileMenuItems.map(renderMenuItem)}
        </View>

        {/* Support Menu */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Support</Text>
          {supportMenuItems.map(renderMenuItem)}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={16} color="#b91c1c" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionRow}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitleContainer: {
  paddingLeft:4,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#1f2937'
  },
  scroll: {
    flex: 1
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937'
  },
  profileMeta: {
    color: '#6b7280'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingText: {
    color: '#1f2937',
    fontWeight: '600'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  menuText: {
    flex: 1,
    color: '#1f2937',
    fontWeight: '600'
  },
  logoutContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5'
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#b91c1c'
  },
  versionRow: {
    alignItems: 'center',
    paddingBottom: 32
  },
  versionText: {
    color: '#9ca3af',
    fontSize: 12
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280'
  },
  profileImagePlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start'
  },
  membershipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400e',
    marginLeft: 4
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  }
});
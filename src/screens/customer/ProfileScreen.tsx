import React, { useState, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserProfile, useNotificationPreferences } from '../../hooks';

type ProfileScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  
  // API hooks
  const {
    data: userProfile,
    loading: profileLoading,
    execute: fetchProfile,
    error: profileError,
  } = useUserProfile();

  const {
    preferences,
    loading: preferencesLoading,
    updatePreferences,
    refreshPreferences,
  } = useNotificationPreferences();

  const [localNotificationState, setLocalNotificationState] = useState(true);
  const [localLocationState, setLocalLocationState] = useState(true);
  
  // Update local state when preferences load
  useEffect(() => {
    if (preferences && typeof preferences === 'object') {
      // preferences may be shaped differently depending on backend
      setLocalNotificationState((preferences as any)?.push ?? false);
      // Location is typically handled by device permissions, but we can store preference
      setLocalLocationState(true);
    }
  }, [preferences]);

  // Load data on mount - run only once
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          fetchProfile(),
          refreshPreferences(),
        ]);
      } catch (e) {
        console.error('Failed to load profile data:', e);
      }
    })();
  }, []); // ✅ Empty dependency array - run only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Show alert if profile loading produced an error
  useEffect(() => {
    if (profileError) {
      console.error('Profile load error:', profileError);
      Alert.alert(
        'Error',
        typeof profileError === 'string'
          ? profileError
          : (profileError as any)?.message || 'Failed to load profile'
      );
    }
  }, [profileError]);

  const handleRefresh = () => {
    fetchProfile();
    refreshPreferences();
  };

  const handleNotificationToggle = async (value: boolean) => {
    setLocalNotificationState(value);
    
    if (preferences) {
      try {
        await updatePreferences({
          ...(preferences as any),
          push: value,
        });
      } catch (error) {
        // Revert on error
        console.error(error);
        setLocalNotificationState(!value);
        Alert.alert('Error', 'Failed to update notification preferences');
      }
    }
  };

  const handleLocationToggle = (value: boolean) => {
    setLocalLocationState(value);
   
  };

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
      id: 'history',
      title: 'Order History',
      icon: 'time-outline',
      onPress: () => navigation.navigate('OrderHistory')
    },
    {
      id: 'payments',
      title: 'Payment Methods',
      icon: 'card-outline',
      onPress: () => navigation.navigate('PaymentMethods')
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

  const handleMenuPress = (item: any) => {
    try {
      item.onPress();
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Unable to open this section. Please try again.');
    }
  };

  const renderMenuItem = (item: any) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.menuItem}
      onPress={() => handleMenuPress(item)}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={item.icon} size={20} color="#2563eb" />
      </View>
      <Text style={styles.menuText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

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
            refreshing={profileLoading || preferencesLoading}
            onRefresh={handleRefresh}
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
            {profileLoading ? (
              <View style={styles.profileImagePlaceholder}>
                <ActivityIndicator size="small" color="#2563eb" />
              </View>
            ) : (
              <Image 
                source={
                  userProfile?.profileImage?.url 
                    ? { uri: userProfile.profileImage.url }
                    : user?.profileImage || require('../../assets/images/image.png')
                } 
                style={styles.profileImage} 
                resizeMode="cover"
              />
            )}
            <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {userProfile?.name || user?.name || ''}
                    </Text>
                    <Text style={styles.profileMeta}>
                      {userProfile?.phone || user?.phone || ''}
                    </Text>
                    <Text style={styles.profileMeta}>
                      {userProfile?.email || user?.email || ''}
                    </Text>
              {userProfile && (userProfile as any).dateOfBirth && (
                  <Text style={styles.profileMeta}>
                    {new Date((userProfile as any).dateOfBirth as string).toLocaleDateString('en-IN')}
                  </Text>
                )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

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
            {(preferences === null || preferencesLoading) ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : (
              <Switch
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={localNotificationState ? '#2563eb' : '#f4f4f5'}
                onValueChange={handleNotificationToggle}
                value={localNotificationState}
                disabled={preferences === null || preferencesLoading}
              />
            )}
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
              thumbColor={localLocationState ? '#2563eb' : '#f4f4f5'}
              onValueChange={handleLocationToggle}
              value={localLocationState}
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
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center'
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
  }
});
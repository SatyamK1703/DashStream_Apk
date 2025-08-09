import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch, Alert,StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../context/AuthContext';

type ProfileScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

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
      onPress: () => navigation.navigate('AddAddress')
    },
    {
      id: 'vehicles',
      title: 'My Vehicles',
      icon: 'car-outline',
      onPress: () => navigation.navigate('AddVehicle')
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

  return (
   <View style={styles.container}>
    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Profile</Text>
    </View>

    <ScrollView style={styles.scroll}>
      {/* Profile Card */}
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.profileRow}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Image 
            source={user?.profileImage || require('../../assets/images/image.png')} 
            style={styles.profileImage} 
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User Name'}</Text>
            <Text style={styles.profileMeta}>{user?.phone || '+91 98765 43210'}</Text>
            <Text style={styles.profileMeta}>{user?.email || 'user@example.com'}</Text>
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
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
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
  </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { backgroundColor: '#fff', paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
  scroll: { flex: 1 },
  card: { backgroundColor: '#fff', padding: 16, marginBottom: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '700', color: '#1f2937' },
  profileMeta: { color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  settingLabel: { flexDirection: 'row', alignItems: 'center' },
  settingText: { color: '#1f2937', fontWeight: '700' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  menuIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  menuText: { flex: 1, color: '#1f2937', fontWeight: '700' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fca5a5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1.5,
    elevation: 1,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b91c1c',
    padding:8,
  },
  versionRow: { alignItems: 'center', paddingBottom: 32 },
  versionText: { color: '#9ca3af', fontSize: 12 },
});


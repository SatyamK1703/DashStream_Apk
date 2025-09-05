import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types and hooks for self-contained component
type ProStackParamList = {
  ProProfile: undefined;
  ProNotifications: undefined;
  ProEditProfile: undefined;
  ProServiceArea: undefined;
  ProDocuments: undefined;
  ProSkills: undefined;
  ProBankDetails: undefined;
  ProTaxInfo: undefined;
  ProLanguage: undefined;
  ProSupport: undefined;
  ProTerms: undefined;
};

const useAuth = () => ({
  user: { name: 'Rajesh Kumar', phone: '+91 9876543210', email: 'rajesh.kumar@example.com' },
  logout: async () => {
    console.log('Logging out...');
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
});

type ProProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const ProProfileScreen = () => {
  const navigation = useNavigation<ProProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          // In a real app, navigation would be handled by a root navigator listening to auth state
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle: string | null, onPress: () => void, rightContent?: React.ReactNode) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuIconContainer}>{icon}</View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {rightContent || <MaterialIcons name="chevron-right" size={24} color={colors.gray400} />}
    </TouchableOpacity>
  );

  if (isLoggingOut) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ProNotifications')}>
              <Ionicons name="notifications" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfoContainer}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <View style={styles.profileStatRow}>
                <Ionicons name="star" size={16} color={colors.amber400} />
                <Text style={styles.profileStatText}>4.8 • 142 jobs</Text>
              </View>
              <View style={styles.profileStatRow}>
                <MaterialIcons name="verified" size={16} color={colors.green500} />
                <Text style={styles.profileStatText}>Verified Professional</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityInfo}>
              <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.green500 : colors.red500 }]} />
              <Text style={styles.availabilityText}>{isAvailable ? 'Available for Jobs' : 'Unavailable'}</Text>
            </View>
            <Switch
              trackColor={{ false: colors.gray200, true: colors.blue200 }}
              thumbColor={isAvailable ? colors.primary : colors.gray400}
              onValueChange={setIsAvailable}
              value={isAvailable}
            />
          </View>

          {/* Menu Sections */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            {renderMenuItem(<Ionicons name="person" size={20} color={colors.primary} />, 'Edit Profile', 'Update your personal details', () => navigation.navigate('ProEditProfile'))}
            {renderMenuItem(<MaterialIcons name="location-on" size={20} color={colors.primary} />, 'Service Area', 'Bangalore South, Koramangala...', () => navigation.navigate('ProServiceArea'))}
            {renderMenuItem(<MaterialIcons name="verified" size={20} color={colors.primary} />, 'Verification & Documents', 'ID, Address & Certificates', () => navigation.navigate('ProDocuments'))}
            {renderMenuItem(<MaterialCommunityIcons name="certificate" size={20} color={colors.primary} />, 'Skills & Expertise', 'Car Wash, Interior Cleaning...', () => navigation.navigate('ProSkills'))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Settings</Text>
            {renderMenuItem(
              <Ionicons name="notifications" size={20} color={colors.primary} />, 'Notifications', null, () => {},
              <Switch trackColor={{ false: colors.gray200, true: colors.blue200 }} thumbColor={notificationsEnabled ? colors.primary : colors.gray400} onValueChange={setNotificationsEnabled} value={notificationsEnabled} />
            )}
            {renderMenuItem(<MaterialIcons name="language" size={20} color={colors.primary} />, 'Language', 'English', () => navigation.navigate('ProLanguage'))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>DashStream Professional</Text>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray800: '#1F2937', amber400: '#FBBF24', green500: '#22C55E', red500: '#EF4444', red600: '#DC2626',
  blue200: '#BFDBFE',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray500, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 32, paddingHorizontal: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: 'bold' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  profileInfoContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.white },
  profileTextContainer: { marginLeft: 16 },
  profileName: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  profileStatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  profileStatText: { color: colors.white, marginLeft: 8 },
  contentContainer: { paddingBottom: 32 },
  availabilityCard: { backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, marginTop: -24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availabilityInfo: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 12, height: 12, borderRadius: 6 },
  availabilityText: { color: colors.gray800, fontWeight: '500', marginLeft: 8 },
  card: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: 12, marginTop: 16, paddingHorizontal: 16, paddingTop: 16 },
  cardTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconContainer: { width: 40, alignItems: 'center' },
  menuTextContainer: { marginLeft: 12, flex: 1 },
  menuTitle: { color: colors.gray800, fontWeight: '500', fontSize: 16 },
  menuSubtitle: { color: colors.gray500, fontSize: 14, marginTop: 2 },
  logoutButton: { marginHorizontal: 16, marginTop: 24, paddingVertical: 16, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: colors.red600, fontWeight: '500', fontSize: 16 },
  footer: { alignItems: 'center', marginTop: 32 },
  footerText: { color: colors.gray400, fontSize: 12 },
});

export default ProProfileScreen;


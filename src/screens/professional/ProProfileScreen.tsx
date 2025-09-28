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
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Import proper types and hooks
import { ProStackParamList } from '../../app/routes/ProNavigator';
import { useAuth } from '../../context/AuthContext';
import { useProfessionalProfile, useProfessionalProfileActions } from '../../hooks/useProfessional';

type ProProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

interface ProfileItemProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  rightElement?: React.ReactNode;
}

const ProProfileScreen = () => {
  const navigation = useNavigation<ProProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  
  // Use professional profile hooks
  const { 
    data: profile, 
    isLoading: profileLoading, 
    execute: refreshProfile 
  } = useProfessionalProfile();
  
  const { 
    setAvailability, 
    updateStatus, 
    isLoading: actionLoading 
  } = useProfessionalProfileActions();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleAvailabilityToggle = async (value: boolean) => {
    try {
      await setAvailability(value);
      refreshProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          }
        }
      ]
    );
  };

  const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const ProfileItem: React.FC<ProfileItemProps> = ({ 
    icon, 
    title, 
    value, 
    onPress, 
    showArrow = true, 
    rightElement 
  }) => (
    <TouchableOpacity 
      style={styles.profileItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
      <View style={styles.profileItemRight}>
        {value && <Text style={styles.itemValue}>{value}</Text>}
        {rightElement}
        {showArrow && onPress && (
          <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
        )}
      </View>
    </TouchableOpacity>
  );

  if (profileLoading && !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ProEditProfile')}>
          <Ionicons name="create-outline" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={profileLoading} 
            onRefresh={refreshProfile} 
            colors={[colors.primary]} 
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ 
                uri: profile?.profileImage?.url || user?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg' 
              }}
              style={styles.profileImage}
            />
            <View style={[
              styles.statusDot, 
              { backgroundColor: profile?.isAvailable ? colors.success : colors.gray400 }
            ]} />
          </View>
          <Text style={styles.profileName}>{profile?.name || user?.name || 'Professional'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || user?.email}</Text>
          <Text style={styles.profilePhone}>{profile?.phone || user?.phone}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.ratingText}>
              {profile?.rating ? profile.rating.toFixed(1) : '4.8'} ({profile?.totalRatings || 0} reviews)
            </Text>
          </View>
        </View>

        {/* Availability */}
        <ProfileSection title="Availability">
          <View style={styles.availabilityContainer}>
            <View style={styles.availabilityLeft}>
              <MaterialCommunityIcons name="account-check" size={20} color={colors.success} />
              <Text style={styles.availabilityText}>Available for Jobs</Text>
            </View>
            <Switch
              value={profile?.isAvailable || false}
              onValueChange={handleAvailabilityToggle}
              trackColor={{ false: colors.gray300, true: colors.success }}
              thumbColor={profile?.isAvailable ? colors.white : colors.gray400}
              disabled={actionLoading}
            />
          </View>
          <Text style={styles.availabilitySubtext}>
            Status: {profile?.status || 'Active'}
          </Text>
        </ProfileSection>

        {/* Account Information */}
        <ProfileSection title="Account Information">
          <ProfileItem
            icon={<MaterialIcons name="person" size={20} color={colors.gray600} />}
            title="Personal Details"
            value="View & Edit"
            onPress={() => navigation.navigate('ProEditProfile')}
          />
          <ProfileItem
            icon={<MaterialCommunityIcons name="certificate" size={20} color={colors.success} />}
            title="Verification Status"
            value="Verified"
            onPress={() => navigation.navigate('ProVerification')}
          />
          <ProfileItem
            icon={<MaterialCommunityIcons name="tools" size={20} color={colors.primary} />}
            title="Skills & Services"
            value="Manage"
            onPress={() => navigation.navigate('ProSkills')}
          />
          <ProfileItem
            icon={<MaterialCommunityIcons name="map-marker" size={20} color={colors.amber} />}
            title="Service Areas"
            value="Configure"
            onPress={() => navigation.navigate('ProServiceArea')}
          />
        </ProfileSection>

        {/* Financial Information */}
        <ProfileSection title="Financial">
          <ProfileItem
            icon={<MaterialCommunityIcons name="bank" size={20} color={colors.blue} />}
            title="Bank Details"
            value="Manage"
            onPress={() => navigation.navigate('ProBankDetails')}
          />
          <ProfileItem
            icon={<MaterialIcons name="trending-up" size={20} color={colors.success} />}
            title="Earnings"
            value="View Report"
            onPress={() => navigation.navigate('ProEarnings')}
          />
        </ProfileSection>

        {/* Performance Stats */}
        <ProfileSection title="Performance">
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="briefcase" size={24} color={colors.primary} />
              <Text style={styles.statValue}>{profile?.totalJobs || 0}</Text>
              <Text style={styles.statLabel}>Total Jobs</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={24} color={colors.success} />
              <Text style={styles.statValue}>{profile?.completionRate || 98}%</Text>
              <Text style={styles.statLabel}>Completion Rate</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color={colors.warning} />
              <Text style={styles.statValue}>{profile?.rating?.toFixed(1) || '4.8'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </ProfileSection>

        {/* Settings & Support */}
        <ProfileSection title="Settings & Support">
          <ProfileItem
            icon={<Ionicons name="settings" size={20} color={colors.gray600} />}
            title="Settings"
            onPress={() => navigation.navigate('ProSettings')}
          />
          <ProfileItem
            icon={<MaterialIcons name="help" size={20} color={colors.gray600} />}
            title="Help & Support"
            onPress={() => {
              Alert.alert('Help & Support', 'For support, please call: +91 9876543210');
            }}
          />
          <ProfileItem
            icon={<MaterialIcons name="info" size={20} color={colors.gray600} />}
            title="About"
            onPress={() => {
              Alert.alert('About DashStream', 'Version 1.0.0\nBuilt with React Native');
            }}
          />
        </ProfileSection>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <MaterialIcons name="logout" size={20} color={colors.danger} />
            )}
            <Text style={styles.logoutText}>
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  amber: '#F59E0B',
  blue: '#3B82F6',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray600,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? 24 : 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: colors.white,
    paddingVertical: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.gray200,
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: 2,
  },
  profilePhone: {
    fontSize: 16,
    color: colors.gray600,
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray900,
  },
  profileItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontSize: 14,
    color: colors.gray500,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  availabilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availabilityText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray900,
  },
  availabilitySubtext: {
    fontSize: 14,
    color: colors.gray500,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.gray900,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
});

export default ProProfileScreen;
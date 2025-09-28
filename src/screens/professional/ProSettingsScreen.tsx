import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Platform,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import proper types and hooks
import { ProStackParamList } from '../../app/routes/ProNavigator';
import { useAuth } from '../../context/AuthContext';
import { useProfessionalProfile, useProfessionalProfileActions } from '../../hooks/useProfessional';

type ProSettingsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showBorder?: boolean;
}

const ProSettingsScreen = () => {
  const navigation = useNavigation<ProSettingsScreenNavigationProp>();
  const { user, logout } = useAuth();
  
  // Use professional profile hooks
  const { data: profile, isLoading: profileLoading, execute: refreshProfile } = useProfessionalProfile();
  const { updateProfile, setAvailability, updateStatus, isLoading: actionLoading } = useProfessionalProfileActions();
  
  // State for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
  const [paymentAlertsEnabled, setPaymentAlertsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoAcceptJobs, setAutoAcceptJobs] = useState(false);
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];

  const handleAvailabilityToggle = async (value: boolean) => {
    try {
      await setAvailability(value);
      Alert.alert('Success', `You are now ${value ? 'available' : 'unavailable'} for new jobs`);
      refreshProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability. Please try again.');
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus(newStatus);
      Alert.alert('Success', `Status updated to ${newStatus}`);
      refreshProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    }
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
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback');
      return;
    }
    
    // In a real app, you would send this to an API
    Alert.alert('Thank you!', 'Your feedback has been sent successfully.');
    setFeedbackText('');
    setShowFeedbackModal(false);
  };

  const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const SettingsItem: React.FC<SettingsItemProps> = ({ 
    icon, 
    title, 
    subtitle, 
    rightElement, 
    onPress, 
    showBorder = true 
  }) => (
    <TouchableOpacity 
      style={[styles.settingsItem, !showBorder && styles.noBorder]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
    </TouchableOpacity>
  );

  if (profileLoading && !profile) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Availability Settings */}
        <SettingsSection title="Availability">
          <SettingsItem
            icon={<MaterialCommunityIcons name="account-check" size={20} color={colors.green} />}
            title="Available for Jobs"
            subtitle={profile?.isAvailable ? "You are currently available" : "You are currently unavailable"}
            rightElement={
              <Switch
                value={profile?.isAvailable || false}
                onValueChange={handleAvailabilityToggle}
                trackColor={{ false: colors.gray300, true: colors.green }}
                thumbColor={profile?.isAvailable ? colors.white : colors.gray400}
                disabled={actionLoading}
              />
            }
          />
          <SettingsItem
            icon={<MaterialIcons name="work" size={20} color={colors.blue} />}
            title="Professional Status"
            subtitle={`Current status: ${profile?.status || 'Active'}`}
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => {
              Alert.alert(
                'Update Status',
                'Choose your professional status',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Active', onPress: () => handleStatusUpdate('active') },
                  { text: 'Busy', onPress: () => handleStatusUpdate('busy') },
                  { text: 'Break', onPress: () => handleStatusUpdate('break') }
                ]
              );
            }}
            showBorder={false}
          />
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Ionicons name="notifications" size={20} color={colors.primary} />}
            title="Push Notifications"
            subtitle="Receive app notifications"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={notificationsEnabled ? colors.white : colors.gray400}
              />
            }
          />
          <SettingsItem
            icon={<MaterialCommunityIcons name="briefcase-clock" size={20} color={colors.amber} />}
            title="Job Alerts"
            subtitle="New job notifications"
            rightElement={
              <Switch
                value={jobAlertsEnabled}
                onValueChange={setJobAlertsEnabled}
                trackColor={{ false: colors.gray300, true: colors.amber }}
                thumbColor={jobAlertsEnabled ? colors.white : colors.gray400}
              />
            }
          />
          <SettingsItem
            icon={<MaterialIcons name="payment" size={20} color={colors.green} />}
            title="Payment Alerts"
            subtitle="Payment and earnings notifications"
            rightElement={
              <Switch
                value={paymentAlertsEnabled}
                onValueChange={setPaymentAlertsEnabled}
                trackColor={{ false: colors.gray300, true: colors.green }}
                thumbColor={paymentAlertsEnabled ? colors.white : colors.gray400}
              />
            }
            showBorder={false}
          />
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="App Settings">
          <SettingsItem
            icon={<Ionicons name="location" size={20} color={colors.red} />}
            title="Location Services"
            subtitle="Allow location access for job tracking"
            rightElement={
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: colors.gray300, true: colors.red }}
                thumbColor={locationEnabled ? colors.white : colors.gray400}
              />
            }
          />
          <SettingsItem
            icon={<Ionicons name="moon" size={20} color={colors.purple} />}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: colors.gray300, true: colors.purple }}
                thumbColor={darkModeEnabled ? colors.white : colors.gray400}
              />
            }
          />
          <SettingsItem
            icon={<Ionicons name="language" size={20} color={colors.blue} />}
            title="Language"
            subtitle={language}
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => setShowLanguageModal(true)}
            showBorder={false}
          />
        </SettingsSection>

        {/* Account Settings */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<MaterialIcons name="edit" size={20} color={colors.gray600} />}
            title="Edit Profile"
            subtitle="Update your profile information"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => navigation.navigate('ProEditProfile')}
          />
          <SettingsItem
            icon={<MaterialIcons name="security" size={20} color={colors.gray600} />}
            title="Privacy & Security"
            subtitle="Manage your privacy settings"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => {
              // Navigate to privacy settings or show privacy options
              Alert.alert('Privacy & Security', 'Privacy settings will be available in the next update.');
            }}
          />
          <SettingsItem
            icon={<MaterialCommunityIcons name="bank" size={20} color={colors.gray600} />}
            title="Bank Details"
            subtitle="Manage payment information"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => navigation.navigate('ProBankDetails')}
            showBorder={false}
          />
        </SettingsSection>

        {/* Support & About */}
        <SettingsSection title="Support & About">
          <SettingsItem
            icon={<MaterialIcons name="help" size={20} color={colors.gray600} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => {
              // Navigate to help or contact support
              Alert.alert('Help & Support', 'For support, please call: +91 9876543210');
            }}
          />
          <SettingsItem
            icon={<MaterialIcons name="feedback" size={20} color={colors.gray600} />}
            title="Send Feedback"
            subtitle="Help us improve the app"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => setShowFeedbackModal(true)}
          />
          <SettingsItem
            icon={<MaterialIcons name="info" size={20} color={colors.gray600} />}
            title="About"
            subtitle="App version and information"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => {
              Alert.alert('About DashStream', 'Version 1.0.0\nBuilt with React Native');
            }}
          />
          <SettingsItem
            icon={<MaterialIcons name="policy" size={20} color={colors.gray600} />}
            title="Terms & Privacy Policy"
            subtitle="Read our terms and privacy policy"
            rightElement={<Ionicons name="chevron-forward" size={20} color={colors.gray400} />}
            onPress={() => {
              // Navigate to terms and privacy policy
              Alert.alert('Terms & Privacy', 'Terms and Privacy Policy will be available in the next update.');
            }}
            showBorder={false}
          />
        </SettingsSection>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={20} color={colors.red} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <ScrollView style={styles.languageList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={styles.languageItem}
                  onPress={() => {
                    setLanguage(lang);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageText, language === lang && styles.selectedLanguage]}>
                    {lang}
                  </Text>
                  {language === lang && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Share your thoughts, suggestions, or report issues..."
              placeholderTextColor={colors.gray400}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalSecondaryButton}
                onPress={() => setShowFeedbackModal(false)}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={handleSendFeedback}
              >
                <Text style={styles.modalPrimaryText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  red: '#EF4444',
  green: '#10B981',
  blue: '#3B82F6',
  amber: '#F59E0B',
  purple: '#8B5CF6',
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
  section: {
    marginTop: 24,
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
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    minHeight: 60,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  settingsItemLeft: {
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
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray900,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  rightElement: {
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.red,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
    textAlign: 'center',
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  languageText: {
    fontSize: 16,
    color: colors.gray700,
  },
  selectedLanguage: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.gray900,
    minHeight: 120,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSecondaryButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
  },
  modalPrimaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default ProSettingsScreen;
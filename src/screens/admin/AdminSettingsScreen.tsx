import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAuth } from '../../context/AuthContext';

type AdminSettingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminSettingsScreen = () => {
  const navigation = useNavigation<AdminSettingsScreenNavigationProp>();
  const { logout } = useAuth();
  
  // State variables
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Languages available in the app
  const languages = [
    { id: 'en', name: 'English' },
    { id: 'hi', name: 'Hindi' },
    { id: 'ta', name: 'Tamil' },
    { id: 'te', name: 'Telugu' },
    { id: 'kn', name: 'Kannada' },
    { id: 'ml', name: 'Malayalam' }
  ];
  
  // Handle logout
  const handleLogout = () => {
    setShowLogoutConfirmation(false);
    logout();
  };
  
  // Handle feedback submission
  const handleFeedbackSubmit = () => {
    if (feedbackText.trim().length === 0) {
      Alert.alert('Error', 'Please enter your feedback before submitting');
      return;
    }
    
    // Simulate API call to submit feedback
    setTimeout(() => {
      Alert.alert(
        'Thank You',
        'Your feedback has been submitted successfully!',
        [{ text: 'OK', onPress: () => {
          setFeedbackText('');
          setShowFeedbackModal(false);
        }}]
      );
    }, 1000);
  };
  
  // Handle language selection
  const selectLanguage = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    
    // Simulate language change
    Alert.alert('Language Changed', `App language has been changed to ${language}`);
  };
  
  // Settings sections with their respective items
  const settingsSections = [
    {
      title: 'App Preferences',
      icon: <Ionicons name="settings-outline" size={22} color="#333" />,
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          icon: <Ionicons name="notifications-outline" size={22} color="#555" />,
          type: 'toggle',
          value: notificationsEnabled,
          onToggle: () => setNotificationsEnabled(!notificationsEnabled),
        },
        {
          id: 'darkMode',
          title: 'Dark Mode',
          icon: <Ionicons name="moon-outline" size={22} color="#555" />,
          type: 'toggle',
          value: darkModeEnabled,
          onToggle: () => setDarkModeEnabled(!darkModeEnabled),
        },
        {
          id: 'language',
          title: 'Language',
          icon: <Ionicons name="language-outline" size={22} color="#555" />,
          type: 'navigate',
          value: selectedLanguage,
          onPress: () => setShowLanguageModal(true),
        },
        {
          id: 'autoBackup',
          title: 'Auto Backup',
          icon: <Ionicons name="cloud-upload-outline" size={22} color="#555" />,
          type: 'toggle',
          value: autoBackupEnabled,
          onToggle: () => setAutoBackupEnabled(!autoBackupEnabled),
        },
      ],
    },
    {
      title: 'Account & Security',
      icon: <MaterialIcons name="security" size={22} color="#333" />,
      items: [
        {
          id: 'changePassword',
          title: 'Change Password',
          icon: <MaterialIcons name="lock-outline" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => navigation.navigate('AdminProfile'),
        },
        {
          id: 'twoFactorAuth',
          title: 'Two-Factor Authentication',
          icon: <MaterialIcons name="verified-user" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => navigation.navigate('AdminProfile'),
        },
        {
          id: 'privacySettings',
          title: 'Privacy Settings',
          icon: <MaterialIcons name="privacy-tip" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Privacy Settings', 'This feature will be available soon.'),
        },
      ],
    },
    {
      title: 'Support & Feedback',
      icon: <MaterialIcons name="help-outline" size={22} color="#333" />,
      items: [
        {
          id: 'helpCenter',
          title: 'Help Center',
          icon: <MaterialIcons name="help" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Help Center', 'This feature will be available soon.'),
        },
        {
          id: 'sendFeedback',
          title: 'Send Feedback',
          icon: <MaterialIcons name="feedback" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => setShowFeedbackModal(true),
        },
        {
          id: 'rateApp',
          title: 'Rate App',
          icon: <MaterialIcons name="star-rate" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Rate App', 'This feature will redirect you to the app store.'),
        },
        {
          id: 'termsOfService',
          title: 'Terms of Service',
          icon: <MaterialIcons name="description" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Terms of Service', 'This feature will be available soon.'),
        },
        {
          id: 'privacyPolicy',
          title: 'Privacy Policy',
          icon: <MaterialIcons name="policy" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Privacy Policy', 'This feature will be available soon.'),
        },
      ],
    },
    {
      title: 'Data & Storage',
      icon: <MaterialIcons name="storage" size={22} color="#333" />,
      items: [
        {
          id: 'dataUsage',
          title: 'Data Usage',
          icon: <MaterialIcons name="data-usage" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => Alert.alert('Data Usage', 'This feature will be available soon.'),
        },
        {
          id: 'clearCache',
          title: 'Clear Cache',
          icon: <MaterialIcons name="cleaning-services" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => {
            Alert.alert(
              'Clear Cache',
              'Are you sure you want to clear the app cache?',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'Clear', 
                  style: 'destructive',
                  onPress: () => Alert.alert('Success', 'Cache cleared successfully!')
                }
              ]
            );
          },
        },
      ],
    },
    {
      title: 'About',
      icon: <Ionicons name="information-circle-outline" size={22} color="#333" />,
      items: [
        {
          id: 'appVersion',
          title: 'App Version',
          icon: <Ionicons name="code-slash-outline" size={22} color="#555" />,
          type: 'info',
          value: 'v1.0.0',
        },
        {
          id: 'checkUpdates',
          title: 'Check for Updates',
          icon: <Ionicons name="refresh-outline" size={22} color="#555" />,
          type: 'navigate',
          onPress: () => {
            Alert.alert('Check for Updates', 'Checking for updates...', [{ text: 'OK' }]);
            setTimeout(() => {
              Alert.alert('Up to Date', 'You are using the latest version of the app.');
            }, 1500);
          },
        },
      ],
    },
  ];
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => navigation.navigate('AdminNotifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      {/* Settings List */}
      <ScrollView style={styles.scrollView}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.icon}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.settingItem}
                onPress={item.type === 'navigate' ? item.onPress : undefined}
                activeOpacity={item.type === 'toggle' ? 1 : 0.7}
              >
                <View style={styles.settingItemLeft}>
                  {item.icon}
                  <Text style={styles.settingItemTitle}>{item.title}</Text>
                </View>
                
                <View style={styles.settingItemRight}>
                  {item.type === 'toggle' && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#D1D1D6', true: '#4CAF50' }}
                      thumbColor={item.value ? '#FFFFFF' : '#FFFFFF'}
                    />
                  )}
                  
                  {item.type === 'navigate' && (
                    <View style={styles.navigateContainer}>
                      {item.value && <Text style={styles.settingValue}>{item.value}</Text>}
                      <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
                    </View>
                  )}
                  
                  {item.type === 'info' && (
                    <Text style={styles.settingValue}>{item.value}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setShowLogoutConfirmation(true)}
        >
          <MaterialIcons name="logout" size={22} color="#E53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        
        {/* Version and Copyright */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>DashStream Admin v1.0.0</Text>
          <Text style={styles.footerText}>© 2023 DashStream. All rights reserved.</Text>
        </View>
      </ScrollView>
      
      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageList}>
              {languages.map((language) => (
                <TouchableOpacity 
                  key={language.id} 
                  style={[styles.languageItem, selectedLanguage === language.name && styles.selectedLanguageItem]}
                  onPress={() => selectLanguage(language.name)}
                >
                  <Text style={[styles.languageName, selectedLanguage === language.name && styles.selectedLanguageName]}>
                    {language.name}
                  </Text>
                  {selectedLanguage === language.name && (
                    <Ionicons name="checkmark" size={22} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Feedback Modal */}
      <Modal
        visible={showFeedbackModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Feedback</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.feedbackLabel}>Tell us what you think about the app:</Text>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={6}
              placeholder="Your feedback helps us improve the app..."
              value={feedbackText}
              onChangeText={setFeedbackText}
            />
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={handleFeedbackSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.confirmationTitle}>Logout</Text>
            <Text style={styles.confirmationText}>Are you sure you want to logout?</Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={[styles.confirmationButton, styles.cancelButton]}
                onPress={() => setShowLogoutConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmationButton, styles.logoutConfirmButton]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutConfirmText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  notificationButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTitle: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
  },
  settingItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: '#888888',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#E53935',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  languageList: {
    paddingVertical: 8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedLanguageItem: {
    backgroundColor: '#F5F5F5',
  },
  languageName: {
    fontSize: 16,
    color: '#333333',
  },
  selectedLanguageName: {
    fontWeight: '500',
    color: '#4CAF50',
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#555555',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    fontSize: 15,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmationModal: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  confirmationText: {
    fontSize: 15,
    color: '#555555',
    marginBottom: 20,
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  logoutConfirmButton: {
    backgroundColor: '#E53935',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AdminSettingsScreen;
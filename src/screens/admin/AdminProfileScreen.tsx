import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAuth } from '../../context/AuthContext';

type AdminProfileScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminProfileScreen = () => {
  const navigation = useNavigation<AdminProfileScreenNavigationProp>();
  
  
  // State variables
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const { user} = useAuth();
  
  // Profile data
  const [profileData, setProfileData] = useState({
    id: 'ADM001',
    name: 'John Doe',
    email: 'admin@dashstream.com',
    phone: '+91 9876543210',
    role: 'Super Admin',
    joinDate: 'Jan 15, 2023',
    lastActive: 'Today at 10:30 AM',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    address: '123 Admin Street, Tech Park, Bangalore - 560001',
    permissions: [
      'Manage Professionals',
      'Manage Customers',
      'Manage Bookings',
      'Manage Services',
      'Manage Payments',
      'View Reports',
      'System Settings'
    ]
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // Handle profile image selection
  const pickImage = async () => {
    if (!isEditing) return;
    
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileData(prev => ({
        ...prev,
        profileImage: result.assets[0].uri
      }));
    }
  };
  
  // Handle profile data changes
  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle password data changes
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle save profile
  const handleSaveProfile = () => {
    if (!profileData.name.trim() || !profileData.email.trim() || !profileData.phone.trim()) {
      Alert.alert('Error', 'Name, email and phone number are required');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // Phone validation (basic)
    const phoneRegex = /^\+?[0-9\s]{10,15}$/;
    if (!phoneRegex.test(profileData.phone.replace(/\s/g, ''))) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    }, 1500);
  };
  
  // Handle password update
  const handleUpdatePassword = () => {
    // Validate password fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      Alert.alert('Error', 'All password fields are required');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }
    
    // Simulate API call to update password
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      Alert.alert('Success', 'Password updated successfully');
    }, 1500);
  };
  
  // Handle two-factor authentication setup
  const handleSetupTwoFactor = () => {
    if (twoFactorEnabled) {
      // Disable two-factor authentication
      Alert.alert(
        'Disable 2FA',
        'Are you sure you want to disable two-factor authentication? This will make your account less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: () => {
              setIsSaving(true);
              setTimeout(() => {
                setTwoFactorEnabled(false);
                setIsSaving(false);
                setShowTwoFactorModal(false);
                Alert.alert('Success', 'Two-factor authentication has been disabled');
              }, 1000);
            }
          }
        ]
      );
      return;
    }
    

    // Validate verification code
    if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return;
    }
    
    // Simulate API call to enable two-factor authentication
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setTwoFactorEnabled(true);
      setShowTwoFactorModal(false);
      setVerificationCode('');
      Alert.alert('Success', 'Two-factor authentication has been enabled');
    }, 1500);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
        </View>
        
        {isEditing ? (
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.headerButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, styles.saveButton]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setIsEditing(true)}
          >
            <MaterialIcons name="edit" size={20} color="#4CAF50" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <View style={styles.profileImageContainer}>
              <Image 
                source={{ uri: profileData.profileImage }}
                style={styles.profileImage}
              />
              {isEditing && (
                <View style={styles.editImageButton}>
                  <MaterialIcons name="camera-alt" size={18} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileInfo}>
            {isEditing ? (
              <TextInput
                style={styles.nameInput}
                value={profileData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                placeholder="Full Name"
              />
            ) : (
              <Text style={styles.profileName}>{profileData.name}</Text>
            )}
            
            <View style={styles.roleContainer}>
              <Text style={styles.roleText}>{profileData.role}</Text>
            </View>
            
            <Text style={styles.idText}>ID: {profileData.id}</Text>
          </View>
        </View>
        
        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <MaterialIcons name="email" size={20} color="#555" />
              <Text style={styles.fieldLabel}>Email</Text>
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profileData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                placeholder="Email Address"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.email}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <MaterialIcons name="phone" size={20} color="#555" />
              <Text style={styles.fieldLabel}>Phone</Text>
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profileData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.phone}</Text>
            )}
          </View>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <MaterialIcons name="location-on" size={20} color="#555" />
              <Text style={styles.fieldLabel}>Address</Text>
            </View>
            
            {isEditing ? (
              <TextInput
                style={styles.fieldInput}
                value={profileData.address}
                onChangeText={(text) => handleInputChange('address', text)}
                placeholder="Address"
                multiline
              />
            ) : (
              <Text style={styles.fieldValue}>{profileData.address}</Text>
            )}
          </View>
        </View>
        
        {/* Account Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <MaterialIcons name="date-range" size={20} color="#555" />
              <Text style={styles.fieldLabel}>Joined</Text>
            </View>
            <Text style={styles.fieldValue}>{profileData.joinDate}</Text>
          </View>
          
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabelContainer}>
              <MaterialIcons name="access-time" size={20} color="#555" />
              <Text style={styles.fieldLabel}>Last Active</Text>
            </View>
            <Text style={styles.fieldValue}>{profileData.lastActive}</Text>
          </View>
        </View>
        
        {/* Security Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Settings</Text>
          
          <TouchableOpacity 
            style={styles.securityItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.securityItemLeft}>
              <MaterialIcons name="lock" size={20} color="#555" />
              <Text style={styles.securityItemText}>Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.securityItem}
            onPress={() => setShowTwoFactorModal(true)}
          >
            <View style={styles.securityItemLeft}>
              <MaterialIcons name="security" size={20} color="#555" />
              <Text style={styles.securityItemText}>Two-Factor Authentication</Text>
            </View>
            <View style={styles.securityItemRight}>
              <Text style={[styles.statusText, twoFactorEnabled ? styles.enabledText : styles.disabledText]}>
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Text>
              <MaterialIcons name="chevron-right" size={24} color="#BBBBBB" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Permissions</Text>
          
          <View style={styles.permissionsContainer}>
            {profileData.permissions.map((permission, index) => (
              <View key={index} style={styles.permissionItem}>
                <MaterialIcons name="check-circle" size={18} color="#4CAF50" />
                <Text style={styles.permissionText}>{permission}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Current Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                  placeholder="Enter current password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>New Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.newPassword}
                  onChangeText={(text) => handlePasswordChange('newPassword', text)}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.passwordField}>
                <Text style={styles.passwordLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.passwordInput}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity 
                style={styles.updatePasswordButton}
                onPress={handleUpdatePassword}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.updatePasswordButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Two-Factor Authentication Modal */}
      <Modal
        visible={showTwoFactorModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTwoFactorModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Two-Factor Authentication</Text>
              <TouchableOpacity onPress={() => setShowTwoFactorModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              {twoFactorEnabled ? (
                <>
                  <View style={styles.twoFactorStatusContainer}>
                    <MaterialIcons name="security" size={40} color="#4CAF50" />
                    <Text style={styles.twoFactorStatusText}>Two-factor authentication is enabled</Text>
                    <Text style={styles.twoFactorDescription}>
                      Your account is protected with an additional layer of security. When you sign in, you'll need to provide a verification code from your authentication app.
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.disableTwoFactorButton}
                    onPress={handleSetupTwoFactor}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.disableTwoFactorButtonText}>Disable Two-Factor Authentication</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.twoFactorStatusContainer}>
                    <MaterialIcons name="security" size={40} color="#888888" />
                    <Text style={styles.twoFactorStatusText}>Two-factor authentication is disabled</Text>
                    <Text style={styles.twoFactorDescription}>
                      Add an extra layer of security to your account. In addition to your password, you'll need to enter a verification code when you sign in.
                    </Text>
                  </View>
                  
                  <View style={styles.qrCodeContainer}>
                    <Image 
                      source={{ uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=otpauth://totp/DashStream:admin@dashstream.com?secret=JBSWY3DPEHPK3PXP&issuer=DashStream' }}
                      style={styles.qrCode}
                    />
                    <Text style={styles.qrCodeText}>Scan this QR code with your authenticator app</Text>
                  </View>
                  
                  <View style={styles.verificationCodeContainer}>
                    <Text style={styles.verificationCodeLabel}>Enter verification code from your authenticator app</Text>
                    <TextInput
                      style={styles.verificationCodeInput}
                      value={verificationCode}
                      onChangeText={setVerificationCode}
                      placeholder="6-digit code"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.enableTwoFactorButton}
                    onPress={handleSetupTwoFactor}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.enableTwoFactorButtonText}>Enable Two-Factor Authentication</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  editButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 4,
    marginBottom: 8,
    width: 200,
  },
  roleContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  idText: {
    fontSize: 14,
    color: '#888888',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#555555',
    marginLeft: 8,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 15,
    color: '#333333',
    paddingLeft: 28,
  },
  fieldInput: {
    fontSize: 15,
    color: '#333333',
    paddingLeft: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    paddingVertical: 4,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityItemText: {
    fontSize: 15,
    color: '#333333',
    marginLeft: 12,
  },
  securityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginRight: 8,
  },
  enabledText: {
    color: '#4CAF50',
  },
  disabledText: {
    color: '#888888',
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
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
  modalBody: {
    padding: 16,
  },
  passwordField: {
    marginBottom: 16,
  },
  passwordLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333333',
  },
  updatePasswordButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 8,
  },
  updatePasswordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  twoFactorStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  twoFactorStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 12,
    marginBottom: 8,
  },
  twoFactorDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrCode: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  qrCodeText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  verificationCodeContainer: {
    marginBottom: 20,
  },
  verificationCodeLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  verificationCodeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    letterSpacing: 8,
  },
  enableTwoFactorButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  enableTwoFactorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  disableTwoFactorButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  disableTwoFactorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminProfileScreen;
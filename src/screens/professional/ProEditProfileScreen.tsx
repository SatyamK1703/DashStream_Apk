import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Import proper types and hooks
import { ProStackParamList } from '../../app/routes/ProNavigator';
import { useAuth } from '../../store';
import { useProfessionalProfile, useProfessionalProfileActions } from '../../hooks/useProfessional';

type ProEditProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const ProEditProfileScreen = () => {
  const navigation = useNavigation<ProEditProfileScreenNavigationProp>();
  const { user } = useAuth();

  // Use professional profile hooks
  const { data: profile, isLoading: profileLoading, execute: refreshProfile } = useProfessionalProfile();
  const { updateProfile, isLoading: updateLoading } = useProfessionalProfileActions();

  const [name, setName] = useState(profile?.name || user?.name || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || user?.phone || '');
  const [profileImage, setProfileImage] = useState(profile?.profileImage || 'https://randomuser.me/api/portraits/men/32.jpg');
  const [bio, setBio] = useState(profile?.bio || '');
  const [experience, setExperience] = useState(profile?.experience || '');
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; bio?: string }>({});

  // Update form fields when profile data is loaded
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setProfileImage(profile.profileImage || '');
      setBio(profile.bio || '');
      setExperience(profile.experience || '');
    }
  }, [profile]);

  const validateInputs = () => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    if (!name.trim()) { newErrors.name = 'Name is required'; isValid = false; }
    if (!email.trim()) { newErrors.email = 'Email is required'; isValid = false; }
    else if (!emailRegex.test(email)) { newErrors.email = 'Please enter a valid email'; isValid = false; }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSaveProfile = async () => {
    if (!validateInputs()) return;
    
    try {
      await updateProfile({
        name,
        email,
        phone,
        profileImage,
        bio,
        experience,
      });
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      refreshProfile(); // Refresh profile data
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const permission = source === 'camera' ? ImagePicker.requestCameraPermissionsAsync : ImagePicker.requestMediaLibraryPermissionsAsync;
    const { status } = await permission();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', `We need ${source} permissions to continue.`);
      return;
    }

    const result = await (source === 'camera' ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync)({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      { text: 'Take Photo', onPress: () => pickImage('camera') },
      { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.screen}>
      <View style={styles.flex1}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        <ScrollView style={styles.flex1} contentContainerStyle={styles.contentContainer}>
          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            <View>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              <TouchableOpacity style={styles.editIconContainer} onPress={showImagePickerOptions}>
                <MaterialIcons name="edit" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.changePhotoButton} onPress={showImagePickerOptions}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields Card */}
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput style={[styles.input, errors.name && styles.inputError]} value={name} onChangeText={setName} placeholder="Enter your full name" />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={[styles.input, errors.email && styles.inputError]} value={email} onChangeText={setEmail} placeholder="Enter your email address" keyboardType="email-address" autoCapitalize="none" />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={[styles.input, styles.disabledInput]} value={phone} editable={false} />
              <Text style={styles.helperText}>Phone number cannot be changed. Contact support for assistance.</Text>
            </View>
          </View>

          {/* Additional Info Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Professional Information</Text>
            <Text style={styles.infoText}>To update skills or service area, please visit the respective sections in your profile.</Text>
            <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('ProSkills')}>
              <Text style={styles.outlineButtonText}>Update Skills & Expertise</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.outlineButton, { marginTop: 12 }]} onPress={() => navigation.navigate('ProServiceArea')}>
              <Text style={styles.outlineButtonText}>Update Service Area</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Save Button Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.primaryButton, updateLoading && styles.buttonDisabled]} onPress={handleSaveProfile} disabled={updateLoading}>
            {updateLoading ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.primaryButtonText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray800: '#1F2937',
  red500: '#EF4444',
};

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex1: { flex: 1, backgroundColor: colors.gray50 },
  contentContainer: { padding: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  profileImageSection: { alignItems: 'center', marginBottom: 24 },
  profileImage: { width: 96, height: 96, borderRadius: 48 },
  editIconContainer: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  changePhotoButton: { marginTop: 8 },
  changePhotoText: { color: colors.primary, fontWeight: '500' },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  inputGroup: { marginBottom: 16 },
  label: { color: colors.gray700, marginBottom: 4, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: colors.gray300, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.gray800 },
  inputError: { borderColor: colors.red500 },
  disabledInput: { backgroundColor: colors.gray50 },
  errorText: { color: colors.red500, fontSize: 12, marginTop: 4 },
  helperText: { color: colors.gray500, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  infoText: { color: colors.gray500, marginBottom: 16, lineHeight: 20 },
  outlineButton: { paddingVertical: 12, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, alignItems: 'center' },
  outlineButtonText: { color: colors.primary, fontWeight: '500' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.gray200, backgroundColor: colors.white },
  primaryButton: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  buttonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  primaryButtonText: { color: colors.white, fontWeight: '500' },
});

export default ProEditProfileScreen;

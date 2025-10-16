import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../store';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const EditProfileScreen = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || null,
  });
  const [errors, setErrors] = useState({ name: '', email: '', phone: '' });

  const validateForm = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', phone: '' };
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Only send fields that changed to the API
      const payload: any = {};
      if (formData.name !== user?.name) payload.name = formData.name;
      if (formData.email !== user?.email) payload.email = formData.email;
      if (formData.profileImage && !formData.profileImage.startsWith('http')) payload.profileImage = formData.profileImage;

      await updateUserProfile(payload);
      Alert.alert('Success', 'Your profile has been updated successfully', [
        { text: 'OK' },
      ]);
    } catch {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to grant camera roll permissions to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'You need to grant camera permissions to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormData(prev => ({ ...prev, profileImage: result.assets[0].uri }));
    }
  };

  const showImageOptions = () => {
    Alert.alert('Change Profile Picture', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Gallery', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Updating profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.flexContainer}
      >
        <View style={styles.flexContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>
            <View style={styles.backButton} /> {/* Empty view for balance */}
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageWrapper}>
              <TouchableOpacity onPress={showImageOptions}>
                <View>
                  <Image
                    source={formData.profileImage ? { uri: formData.profileImage } : require('../../assets/images/image.png')}
                    style={styles.profileImage}
                    resizeMode="cover"
                  />
                  <View style={styles.cameraIconWrapper}>
                    <Ionicons name="camera" size={16} color="#fff" />
                  </View>
                </View>
              </TouchableOpacity>
              <Text style={styles.changePicText}>Change Profile Picture</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.errorBorder]}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.errorBorder]}
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={text => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={[styles.input, errors.phone && styles.errorBorder]}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChangeText={text => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  flexContainer: { 
    flex: 1 
  },
  loadingContainer: { 
    flex: 1, 
    backgroundColor: '#fff', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 16, 
    color: '#4b5563' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: 16, 
    paddingBottom: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderColor: '#e5e7eb' 
  },
  backButton: { 
    width: 40, // Fixed width for balance
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1f2937',
    textAlign: 'center',
  },
  scrollContent: { 
    padding: 16 
  },
  imageWrapper: { 
    alignItems: 'center', 
    marginBottom: 24 
  },
  profileImage: { 
    width: 96, 
    height: 96, 
    borderRadius: 48 
  },
  cameraIconWrapper: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#2563eb', 
    borderRadius: 9999, 
    padding: 4 
  },
  changePicText: { 
    color: '#2563eb', 
    fontWeight: '500', 
    marginTop: 8 
  },
  inputGroup: { 
    marginBottom: 16 
  },
  label: { 
    color: '#374151', 
    marginBottom: 4, 
    fontWeight: '500' 
  },
  input: { 
    backgroundColor: '#f9fafb', 
    padding: 16, 
    borderRadius: 12, 
    color: '#1f2937' 
  },
  errorBorder: { 
    borderColor: '#ef4444', 
    borderWidth: 1 
  },
  errorText: { 
    color: '#ef4444', 
    marginTop: 4 
  },
  saveButton: { 
    backgroundColor: '#2563eb', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 24 
  },
  saveButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
});

export default EditProfileScreen;
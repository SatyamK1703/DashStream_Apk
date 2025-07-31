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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProEditProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const ProEditProfileScreen = () => {
  const navigation = useNavigation<ProEditProfileScreenNavigationProp>();
  const { user, updateUserProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || 'Rajesh Kumar');
  const [email, setEmail] = useState(user?.email || 'rajesh.kumar@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 9876543210');
  const [profileImage, setProfileImage] = useState('https://randomuser.me/api/portraits/men/32.jpg');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{name?: string; email?: string; phone?: string}>({});
  
  const validateInputs = () => {
    const newErrors: {name?: string; email?: string; phone?: string} = {};
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }
    
    // Validate phone
    const phoneRegex = /^\+?[0-9\s]{10,15}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSaveProfile = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await updateUserProfile({
        name,
        email,
        phone,
        profileImage
      });
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      // Request permissions first
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera permissions to take a photo');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need gallery permissions to select a photo');
          return;
        }
      }
      
      // Launch camera or image picker
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => pickImage('camera') },
        { text: 'Choose from Gallery', onPress: () => pickImage('gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };
  
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="bg-primary pt-12 pb-4 px-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Edit Profile</Text>
          </View>
        </View>
        
        <ScrollView className="flex-1 p-4">
          {/* Profile Image */}
          <View className="items-center mb-6">
            <View className="relative">
              <Image 
                source={{ uri: profileImage }}
                className="w-24 h-24 rounded-full"
              />
              <TouchableOpacity 
                className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-white"
                onPress={showImagePickerOptions}
              >
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              className="mt-2"
              onPress={showImagePickerOptions}
            >
              <Text className="text-primary font-medium">Change Photo</Text>
            </TouchableOpacity>
          </View>
          
          {/* Form Fields */}
          <View className="bg-white rounded-xl p-4 shadow-sm">
            <View className="mb-4">
              <Text className="text-gray-700 mb-1 font-medium">Full Name</Text>
              <TextInput
                className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-800`}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
              {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1 font-medium">Email Address</Text>
              <TextInput
                className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-800`}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1 font-medium">Phone Number</Text>
              <TextInput
                className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-800`}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                editable={false} // Phone number is typically not editable after registration
              />
              {errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
              <Text className="text-gray-500 text-xs mt-1">Phone number cannot be changed. Contact support for assistance.</Text>
            </View>
          </View>
          
          {/* Additional Information */}
          <View className="bg-white rounded-xl p-4 shadow-sm mt-4">
            <Text className="text-gray-800 font-bold text-lg mb-2">Professional Information</Text>
            <Text className="text-gray-500 mb-4">
              To update your professional details like skills, experience, and service area, please visit the respective sections in your profile.
            </Text>
            
            <TouchableOpacity 
              className="py-3 border border-primary rounded-lg items-center mb-3"
              onPress={() => navigation.navigate('ProSkills')}
            >
              <Text className="text-primary font-medium">Update Skills & Expertise</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="py-3 border border-primary rounded-lg items-center"
              onPress={() => navigation.navigate('ProServiceArea')}
            >
              <Text className="text-primary font-medium">Update Service Area</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
        {/* Save Button */}
        <View className="p-4 border-t border-gray-200 bg-white">
          <TouchableOpacity 
            className={`py-3 rounded-lg items-center ${isLoading ? 'bg-primary/70' : 'bg-primary'}`}
            onPress={handleSaveProfile}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-medium">Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProEditProfileScreen;
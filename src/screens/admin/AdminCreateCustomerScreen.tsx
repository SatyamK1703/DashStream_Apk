import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminCreateCustomerNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profileImage: string | null;
  status: 'active' | 'inactive';
  sendCredentials: boolean;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const AdminCreateCustomerScreen = () => {
  const navigation = useNavigation<AdminCreateCustomerNavigationProp>();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    status: 'active',
    sendCredentials: true,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showAddressSection, setShowAddressSection] = useState(false);
  
  const updateFormData = (key: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear error when user types
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: undefined
      }));
    }
  };
  
  const updateAddress = (key: keyof FormData['address'], value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value
      }
    }));
  };
  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to select a profile image.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      updateFormData('profileImage', result.assets[0].uri);
    }
  };
  
  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Validate phone
    const phoneRegex = /^[0-9+\s]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate address if shown
    if (showAddressSection) {
      if (!formData.address.line1.trim()) {
        newErrors.address = 'Address line 1 is required';
      } else if (!formData.address.city.trim()) {
        newErrors.address = 'City is required';
      } else if (!formData.address.state.trim()) {
        newErrors.address = 'State is required';
      } else if (!formData.address.pincode.trim()) {
        newErrors.address = 'Pincode is required';
      } else if (!/^\d{6}$/.test(formData.address.pincode)) {
        newErrors.address = 'Please enter a valid 6-digit pincode';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        `Customer ${formData.name} has been created successfully${formData.sendCredentials ? ' and credentials have been sent' : ''}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 2000);
  };
  
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setFormData(prev => ({
      ...prev,
      password,
      confirmPassword: password
    }));
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
              onPress={() => navigation.goBack()}
              className="p-2 rounded-full bg-white/20"
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-xl font-bold ml-4">Create New Customer</Text>
          </View>
        </View>
        
        <ScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Profile Image Section */}
          <View className="items-center mt-6">
            <TouchableOpacity 
              onPress={pickImage}
              className="w-24 h-24 rounded-full bg-gray-200 justify-center items-center overflow-hidden"
            >
              {formData.profileImage ? (
                <View className="w-full h-full">
                  <Image 
                    source={{ uri: formData.profileImage }}
                    className="w-full h-full"
                  />
                  <View className="absolute bottom-0 right-0 bg-primary p-1 rounded-full">
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                  <View className="absolute bottom-0 right-0 bg-primary p-1 rounded-full">
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm mt-2">Upload Profile Picture</Text>
          </View>
          
          {/* Form */}
          <View className="px-4 mt-6">
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold mb-4">Basic Information</Text>
              
              {/* Name */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Full Name <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className={`border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-gray-800`}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                />
                {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
              </View>
              
              {/* Email */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Email <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-gray-800`}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                />
                {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
              </View>
              
              {/* Phone */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Phone Number <Text className="text-red-500">*</Text></Text>
                <TextInput
                  className={`border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-gray-800`}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                />
                {errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
              </View>
              
              {/* Status */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Account Status</Text>
                <View className="flex-row mt-2">
                  {['active', 'inactive'].map((status) => (
                    <TouchableOpacity 
                      key={status}
                      className={`flex-row items-center mr-4 px-3 py-2 rounded-lg ${formData.status === status ? 'bg-primary/10' : 'bg-gray-100'}`}
                      onPress={() => updateFormData('status', status)}
                    >
                      <View className={`w-4 h-4 rounded-full border-2 ${formData.status === status ? 'border-primary' : 'border-gray-400'} justify-center items-center`}>
                        {formData.status === status && (
                          <View className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </View>
                      <Text className={`ml-2 ${formData.status === status ? 'text-primary font-medium' : 'text-gray-600'} capitalize`}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            
            {/* Password Section */}
            <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-gray-800 font-bold">Account Password</Text>
                <TouchableOpacity 
                  className="bg-gray-100 px-3 py-1.5 rounded-lg"
                  onPress={generateRandomPassword}
                >
                  <Text className="text-gray-700 text-sm">Generate Random</Text>
                </TouchableOpacity>
              </View>
              
              {/* Password */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Password <Text className="text-red-500">*</Text></Text>
                <View className="relative">
                  <TextInput
                    className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-gray-800 pr-10`}
                    placeholder="Enter password"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                  />
                  <View className="absolute right-3 top-2.5">
                    <Ionicons name="eye-off" size={20} color="#9CA3AF" />
                  </View>
                </View>
                {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
              </View>
              
              {/* Confirm Password */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Confirm Password <Text className="text-red-500">*</Text></Text>
                <View className="relative">
                  <TextInput
                    className={`border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 text-gray-800 pr-10`}
                    placeholder="Confirm password"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                  />
                  <View className="absolute right-3 top-2.5">
                    <Ionicons name="eye-off" size={20} color="#9CA3AF" />
                  </View>
                </View>
                {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>}
              </View>
              
              {/* Send Credentials */}
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-600">Send login credentials to customer</Text>
                <Switch
                  value={formData.sendCredentials}
                  onValueChange={(value) => updateFormData('sendCredentials', value)}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={formData.sendCredentials ? '#2563EB' : '#F3F4F6'}
                />
              </View>
            </View>
            
            {/* Address Section Toggle */}
            <TouchableOpacity 
              className="bg-white rounded-lg shadow-sm p-4 mb-4 flex-row justify-between items-center"
              onPress={() => setShowAddressSection(!showAddressSection)}
            >
              <View className="flex-row items-center">
                <MaterialIcons name="location-on" size={20} color="#4B5563" />
                <Text className="text-gray-800 font-bold ml-2">Add Address</Text>
              </View>
              <Ionicons 
                name={showAddressSection ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#4B5563" 
              />
            </TouchableOpacity>
            
            {/* Address Form */}
            {showAddressSection && (
              <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
                {/* Address Line 1 */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-1">Address Line 1 <Text className="text-red-500">*</Text></Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                    placeholder="House/Flat No., Building Name"
                    value={formData.address.line1}
                    onChangeText={(value) => updateAddress('line1', value)}
                  />
                </View>
                
                {/* Address Line 2 */}
                <View className="mb-4">
                  <Text className="text-gray-600 mb-1">Address Line 2</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                    placeholder="Street, Area, Landmark"
                    value={formData.address.line2}
                    onChangeText={(value) => updateAddress('line2', value)}
                  />
                </View>
                
                {/* City & State */}
                <View className="flex-row mb-4">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-600 mb-1">City <Text className="text-red-500">*</Text></Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                      placeholder="City"
                      value={formData.address.city}
                      onChangeText={(value) => updateAddress('city', value)}
                    />
                  </View>
                  
                  <View className="flex-1 ml-2">
                    <Text className="text-gray-600 mb-1">State <Text className="text-red-500">*</Text></Text>
                    <TextInput
                      className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                      placeholder="State"
                      value={formData.address.state}
                      onChangeText={(value) => updateAddress('state', value)}
                    />
                  </View>
                </View>
                
                {/* Pincode */}
                <View className="mb-2">
                  <Text className="text-gray-600 mb-1">Pincode <Text className="text-red-500">*</Text></Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-800"
                    placeholder="6-digit pincode"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.address.pincode}
                    onChangeText={(value) => updateAddress('pincode', value)}
                  />
                </View>
                
                {errors.address && <Text className="text-red-500 text-xs mt-1">{errors.address}</Text>}
              </View>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity
              className="bg-primary py-3 rounded-lg mt-4"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-center">Create Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdminCreateCustomerScreen;
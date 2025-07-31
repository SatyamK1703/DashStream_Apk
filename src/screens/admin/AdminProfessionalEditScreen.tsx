import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';

type AdminProfessionalEditRouteProp = RouteProp<AdminStackParamList, 'EditProfessional'>;
type AdminProfessionalEditNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface Professional {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  skills: string[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceArea: string[];
  isVerified: boolean;
}

const AdminProfessionalEditScreen = () => {
  const route = useRoute<AdminProfessionalEditRouteProp>();
  const navigation = useNavigation<AdminProfessionalEditNavigationProp>();
  const { professionalId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'pending' | 'rejected'>('active');
  const [isVerified, setIsVerified] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [serviceAreaInput, setServiceAreaInput] = useState('');
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  
  // Mock data
  const mockProfessional: Professional = {
    id: 'PRO-001',
    name: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@example.com',
    status: 'active',
    skills: ['Car Wash', 'Detailing', 'Polish', 'Interior Cleaning'],
    isVerified: true,
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    serviceArea: ['Andheri', 'Bandra', 'Juhu', 'Santacruz'],
  };

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setProfessional(mockProfessional);
      
      // Initialize form state
      setName(mockProfessional.name);
      setPhone(mockProfessional.phone);
      setEmail(mockProfessional.email);
      setStatus(mockProfessional.status);
      setIsVerified(mockProfessional.isVerified);
      setAddress(mockProfessional.address);
      setCity(mockProfessional.city);
      setState(mockProfessional.state);
      setPincode(mockProfessional.pincode);
      setSkills(mockProfessional.skills);
      setServiceAreas(mockProfessional.serviceArea);
      
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [professionalId]);

  const handleAddSkill = () => {
    if (skillInput.trim() === '') return;
    
    setSkills(prev => [...prev, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddServiceArea = () => {
    if (serviceAreaInput.trim() === '') return;
    
    setServiceAreas(prev => [...prev, serviceAreaInput.trim()]);
    setServiceAreaInput('');
  };

  const handleRemoveServiceArea = (index: number) => {
    setServiceAreas(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }
    
    // Start saving
    setSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      
      // Show success message
      Alert.alert(
        'Success',
        'Professional details updated successfully',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1500);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard all changes?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-gray-600">Loading professional details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50"
    >
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="p-2"
            onPress={handleCancel}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">Edit Professional</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Basic Information */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-gray-800 font-bold text-base mb-4">Basic Information</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Name</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={name}
                onChangeText={setName}
                placeholder="Enter name"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Phone Number</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Email</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Status</Text>
              <View className="flex-row flex-wrap">
                {['active', 'inactive', 'pending', 'rejected'].map((statusOption) => (
                  <TouchableOpacity 
                    key={statusOption}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${status === statusOption ? 'bg-primary' : 'bg-gray-200'}`}
                    onPress={() => setStatus(statusOption as any)}
                  >
                    <Text className={`font-medium capitalize ${status === statusOption ? 'text-white' : 'text-gray-700'}`}>
                      {statusOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-700">Verified Professional</Text>
              <Switch
                value={isVerified}
                onValueChange={setIsVerified}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isVerified ? '#2563EB' : '#F3F4F6'}
              />
            </View>
          </View>

          {/* Address Information */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-gray-800 font-bold text-base mb-4">Address Information</Text>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">Address</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={address}
                onChangeText={setAddress}
                placeholder="Enter address"
                multiline
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">City</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={city}
                onChangeText={setCity}
                placeholder="Enter city"
              />
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-700 mb-1">State</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={state}
                onChangeText={setState}
                placeholder="Enter state"
              />
            </View>
            
            <View>
              <Text className="text-gray-700 mb-1">Pincode</Text>
              <TextInput
                className="bg-gray-100 rounded-lg p-3 text-gray-800"
                value={pincode}
                onChangeText={setPincode}
                placeholder="Enter pincode"
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Skills */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-gray-800 font-bold text-base mb-4">Skills & Expertise</Text>
            
            <View className="flex-row mb-3">
              <TextInput
                className="flex-1 bg-gray-100 rounded-lg p-3 text-gray-800 mr-2"
                value={skillInput}
                onChangeText={setSkillInput}
                placeholder="Add a skill"
              />
              <TouchableOpacity 
                className="bg-primary px-4 rounded-lg justify-center"
                onPress={handleAddSkill}
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap">
              {skills.map((skill, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                  <Text className="text-gray-700">{skill}</Text>
                  <TouchableOpacity 
                    className="ml-1"
                    onPress={() => handleRemoveSkill(index)}
                  >
                    <Ionicons name="close-circle" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Service Areas */}
          <View className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <Text className="text-gray-800 font-bold text-base mb-4">Service Areas</Text>
            
            <View className="flex-row mb-3">
              <TextInput
                className="flex-1 bg-gray-100 rounded-lg p-3 text-gray-800 mr-2"
                value={serviceAreaInput}
                onChangeText={setServiceAreaInput}
                placeholder="Add a service area"
              />
              <TouchableOpacity 
                className="bg-primary px-4 rounded-lg justify-center"
                onPress={handleAddServiceArea}
              >
                <Text className="text-white font-medium">Add</Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row flex-wrap">
              {serviceAreas.map((area, index) => (
                <View key={index} className="bg-gray-100 rounded-full px-3 py-1.5 mr-2 mb-2 flex-row items-center">
                  <Text className="text-gray-700">{area}</Text>
                  <TouchableOpacity 
                    className="ml-1"
                    onPress={() => handleRemoveServiceArea(index)}
                  >
                    <Ionicons name="close-circle" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row mb-6">
            <TouchableOpacity 
              className="flex-1 bg-gray-200 py-3 rounded-lg mr-2 items-center"
              onPress={handleCancel}
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-1 bg-primary py-3 rounded-lg items-center"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium">Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AdminProfessionalEditScreen;
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
  Image,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
type AdminCreateCustomerNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface FormData {
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  status: 'active' | 'inactive';
  sendCredentials: boolean;
  address: {
    line1: string;
    line2: string;
    landmark:string;
    city: string;
    pincode: string;
  };
}

const AdminCreateCustomerScreen = () => {
  const navigation = useNavigation<AdminCreateCustomerNavigationProp>();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
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

  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    newErrors.email = 'Email is required';
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }

  const phoneRegex = /^[0-9+\s]{10,15}$/;
  if (!formData.phone.trim()) {
    newErrors.phone = 'Phone number is required';
  } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
    newErrors.phone = 'Please enter a valid phone number';
  }

  // ✅ Address validation only if section is open
  if (showAddressSection) {
    if (!formData.address.line1.trim()) {
      newErrors.address = 'Address line 1 is required';
    } else if (!formData.address.city.trim()) {
      newErrors.address = 'City is required';
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
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    ><SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Customer</Text>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          {/* Profile Image Section */}
          <View style={styles.profileImageContainer}>
            <TouchableOpacity 
              onPress={pickImage}
              style={styles.profileImageButton}
            >
              {formData.profileImage ? (
                <View style={styles.profileImageContainer2}>
                  <Image 
                    source={{ uri: formData.profileImage }}
                    style={styles.profileImage}
                  />
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </View>
              ) : (
                <>
                  <Ionicons name="person" size={40} color="#9CA3AF" />
                  <View style={styles.cameraIconContainer}>
                    <Ionicons name="camera" size={14} color="white" />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.profileImageText}>Upload Profile Picture</Text>
          </View>
          
          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Full Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.name && styles.textInputError
                  ]}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
              
              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Email <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.email && styles.textInputError
                  ]}
                  placeholder="Enter email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Phone Number <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.phone && styles.textInputError
                  ]}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
              
              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Status</Text>
                <View style={styles.statusContainer}>
                  {['active', 'inactive'].map((status) => (
                    <TouchableOpacity 
                      key={status}
                      style={[
                        styles.statusOption,
                        formData.status === status 
                          ? styles.statusOptionActive 
                          : styles.statusOptionInactive
                      ]}
                      onPress={() => updateFormData('status', status)}
                    >
                      <View style={[
                        styles.radioButton,
                        formData.status === status 
                          ? styles.radioButtonActive 
                          : styles.radioButtonInactive
                      ]}>
                        {formData.status === status && (
                          <View style={styles.radioButtonInner} />
                        )}
                      </View>
                      <Text style={[
                        styles.statusText,
                        formData.status === status 
                          ? styles.statusTextActive 
                          : styles.statusTextInactive
                      ]}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            {/* Address Section Toggle */}
            <TouchableOpacity 
              style={styles.addressToggle}
              onPress={() => setShowAddressSection(!showAddressSection)}
            >
              <View style={styles.addressToggleLeft}>
                <MaterialIcons name="location-on" size={20} color="#4B5563" />
                <Text style={styles.addressToggleText}>Add Address</Text>
              </View>
              <Ionicons 
                name={showAddressSection ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#4B5563" 
              />
            </TouchableOpacity>
            
            {/* Address Form */}
            {showAddressSection && (
              <View style={styles.formSection}>
                {/* Address Line 1 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Address Line 1 <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="House/Flat No., Building Name"
                    value={formData.address.line1}
                    onChangeText={(value) => updateAddress('line1', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                {/* Address Line 2 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address Line 2</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Street, Area, Landmark"
                    value={formData.address.line2}
                    onChangeText={(value) => updateAddress('line2', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                {/* City & State */}
                <View style={styles.addressRow}>
                  <View style={styles.addressInputLeft}>
                    <Text style={styles.inputLabel}>
                      City <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="City"
                      value={formData.address.city}
                      onChangeText={(value) => updateAddress('city', value)}
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                
                {/* Pincode */}
                <View style={styles.addressInputGroup}>
                  <Text style={styles.inputLabel}>
                    Pincode <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="6-digit pincode"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.address.pincode}
                    onChangeText={(value) => updateAddress('pincode', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
              </View>
            )}
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Customer</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default AdminCreateCustomerScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea:{
    flex:1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },

  // ScrollView
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },

  // Profile Image Section
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  profileImageButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImageContainer2: {
    width: '100%',
    height: '100%',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    padding: 4,
    borderRadius: 50,
  },
  profileImageText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
  },

  // Form
  formContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginBottom: 16,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#4B5563',
    marginBottom: 4,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#1F2937',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },

  // Status Radio Buttons
  statusContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  statusOptionInactive: {
    backgroundColor: '#F3F4F6',
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#2563EB',
  },
  radioButtonInactive: {
    borderColor: '#9CA3AF',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  statusText: {
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  statusTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  statusTextInactive: {
    color: '#4B5563',
  },

  // Password Section
  passwordSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  generateButtonText: {
    color: '#374151',
    fontSize: 14,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 10,
  },

  // Switch Container
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    color: '#4B5563',
  },

  // Address Toggle
  addressToggle: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressToggleText: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Address Form
  addressRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addressInputLeft: {
    flex: 1,
    marginRight: 8,
  },
  addressInputRight: {
    flex: 1,
    marginLeft: 8,
  },
  addressInputGroup: {
    marginBottom: 8,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


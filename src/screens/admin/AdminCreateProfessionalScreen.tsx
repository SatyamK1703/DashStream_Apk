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
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';


type AdminCreateProfessionalNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  profileImage: string | null;
  status: 'active' | 'inactive' | 'pending';
  sendCredentials: boolean;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
  };
  skills: string[];
  serviceAreas: string[];
  experience: string;
  vehicleInfo: {
    type: string;
    number: string;
  };
}

const AdminCreateProfessionalScreen = () => {
  const navigation = useNavigation<AdminCreateProfessionalNavigationProp>();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    status: 'pending',
    sendCredentials: true,
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    skills: [],
    serviceAreas: [],
    experience: '',
    vehicleInfo: {
      type: 'bike',
      number: ''
    }
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [showSkillsSection, setShowSkillsSection] = useState(false);
  const [showServiceAreasSection, setShowServiceAreasSection] = useState(false);
  
  // Mock data for skills and service areas
  const availableSkills = [
    { id: '1', name: 'Basic Car Wash' },
    { id: '2', name: 'Premium Car Wash' },
    { id: '3', name: 'Interior Cleaning' },
    { id: '4', name: 'Exterior Detailing' },
    { id: '5', name: 'Full Detailing' },
    { id: '6', name: 'Bike Wash' },
    { id: '7', name: 'Engine Cleaning' },
    { id: '8', name: 'Polishing' },
    { id: '9', name: 'Waxing' },
    { id: '10', name: 'Ceramic Coating' },
  ];
  
  const availableServiceAreas = [
    { id: '1', name: 'Andheri East', city: 'Mumbai' },
    { id: '2', name: 'Andheri West', city: 'Mumbai' },
    { id: '3', name: 'Bandra', city: 'Mumbai' },
    { id: '4', name: 'Juhu', city: 'Mumbai' },
    { id: '5', name: 'Powai', city: 'Mumbai' },
    { id: '6', name: 'Worli', city: 'Mumbai' },
    { id: '7', name: 'Malad', city: 'Mumbai' },
    { id: '8', name: 'Goregaon', city: 'Mumbai' },
    { id: '9', name: 'Borivali', city: 'Mumbai' },
    { id: '10', name: 'Dadar', city: 'Mumbai' },
  ];
  
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
  
  const updateVehicleInfo = (key: keyof FormData['vehicleInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleInfo: {
        ...prev.vehicleInfo,
        [key]: value
      }
    }));
  };
  
  const toggleSkill = (skillName: string) => {
    setFormData(prev => {
      if (prev.skills.includes(skillName)) {
        return {
          ...prev,
          skills: prev.skills.filter(s => s !== skillName)
        };
      } else {
        return {
          ...prev,
          skills: [...prev.skills, skillName]
        };
      }
    });
  };
  
  const toggleServiceArea = (areaName: string) => {
    setFormData(prev => {
      if (prev.serviceAreas.includes(areaName)) {
        return {
          ...prev,
          serviceAreas: prev.serviceAreas.filter(a => a !== areaName)
        };
      } else {
        return {
          ...prev,
          serviceAreas: [...prev.serviceAreas, areaName]
        };
      }
    });
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
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
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
    
    if (formData.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill';
    }
    
    if (formData.serviceAreas.length === 0) {
      newErrors.serviceAreas = 'Please select at least one service area';
    }
    
    if (!formData.experience.trim()) {
      newErrors.experience = 'Experience is required';
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = 'Please enter a valid experience in years';
    }
    
    if (!formData.vehicleInfo.number.trim()) {
      newErrors.vehicleInfo = 'Vehicle number is required';
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
        `Professional ${formData.name} has been created successfully${formData.sendCredentials ? ' and credentials have been sent' : ''}.`,
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
      style={styles.container}
    >
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
            <Text style={styles.headerTitle}>Create New Professional</Text>
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
                <View style={styles.profileImageWrapper}>
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
              
              {/* Experience */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Experience (Years) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors.experience && styles.textInputError
                  ]}
                  placeholder="Enter years of experience"
                  keyboardType="number-pad"
                  value={formData.experience}
                  onChangeText={(value) => updateFormData('experience', value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.experience && <Text style={styles.errorText}>{errors.experience}</Text>}
              </View>
              
              {/* Status */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Status</Text>
                <View style={styles.statusContainer}>
                  {['pending', 'active', 'inactive'].map((status) => (
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
              
              {/* Vehicle Information */}
              <View style={styles.vehicleInfoContainer}>
                <Text style={styles.vehicleInfoLabel}>Vehicle Information</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Vehicle Type</Text>
                  <View style={styles.vehicleTypeContainer}>
                    {['bike', 'car', 'scooter'].map((type) => (
                      <TouchableOpacity 
                        key={type}
                        style={[
                          styles.vehicleTypeOption,
                          formData.vehicleInfo.type === type 
                            ? styles.vehicleTypeOptionActive 
                            : styles.vehicleTypeOptionInactive
                        ]}
                        onPress={() => updateVehicleInfo('type', type)}
                      >
                        <FontAwesome5 
                          name={type === 'bike' ? 'motorcycle' : type === 'car' ? 'car' : 'scooter'} 
                          size={14} 
                          color={formData.vehicleInfo.type === type ? '#2563EB' : '#4B5563'} 
                        />
                        <Text style={[
                          styles.vehicleTypeText,
                          formData.vehicleInfo.type === type 
                            ? styles.vehicleTypeTextActive 
                            : styles.vehicleTypeTextInactive
                        ]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View>
                  <Text style={styles.inputLabel}>
                    Vehicle Number <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      errors.vehicleInfo && styles.textInputError
                    ]}
                    placeholder="Enter vehicle number"
                    autoCapitalize="characters"
                    value={formData.vehicleInfo.number}
                    onChangeText={(value) => updateVehicleInfo('number', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.vehicleInfo && <Text style={styles.errorText}>{errors.vehicleInfo}</Text>}
                </View>
              </View>
            </View>
            
            {/* Password Section */}
            <View style={styles.formSection}>
              <View style={styles.passwordSectionHeader}>
                <Text style={styles.sectionTitle}>Account Password</Text>
                <TouchableOpacity 
                  style={styles.generateButton}
                  onPress={generateRandomPassword}
                >
                  <Text style={styles.generateButtonText}>Generate Random</Text>
                </TouchableOpacity>
              </View>
              
              {/* Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      errors.password && styles.textInputError
                    ]}
                    placeholder="Enter password"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <View style={styles.eyeIcon}>
                    <Ionicons name="eye-off" size={20} color="#9CA3AF" />
                  </View>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
              
              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Confirm Password <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      errors.confirmPassword && styles.textInputError
                    ]}
                    placeholder="Confirm password"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <View style={styles.eyeIcon}>
                    <Ionicons name="eye-off" size={20} color="#9CA3AF" />
                  </View>
                </View>
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
              </View>
              
              {/* Send Credentials */}
              <View style={styles.switchContainer}>
                <Text style={styles.switchText}>Send login credentials to professional</Text>
                <Switch
                  value={formData.sendCredentials}
                  onValueChange={(value) => updateFormData('sendCredentials', value)}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={formData.sendCredentials ? '#2563EB' : '#F3F4F6'}
                />
              </View>
            </View>
            
            {/* Skills Section Toggle */}
            <TouchableOpacity 
              style={styles.sectionToggle}
              onPress={() => setShowSkillsSection(!showSkillsSection)}
            >
              <View style={styles.sectionToggleLeft}>
                <MaterialIcons name="handyman" size={20} color="#4B5563" />
                <Text style={styles.sectionToggleText}>Skills & Services</Text>
              </View>
              <Ionicons 
                name={showSkillsSection ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#4B5563" 
              />
            </TouchableOpacity>
            
            {/* Skills Form */}
            {showSkillsSection && (
              <View style={styles.formSection}>
                <Text style={styles.selectionDescription}>
                  Select skills and services this professional can provide <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                
                <View style={styles.skillsContainer}>
                  {availableSkills.map((skill) => (
                    <TouchableOpacity 
                      key={skill.id}
                      style={[
                        styles.skillChip,
                        formData.skills.includes(skill.name) 
                          ? styles.skillChipActive 
                          : styles.skillChipInactive
                      ]}
                      onPress={() => toggleSkill(skill.name)}
                    >
                      <Text style={[
                        styles.skillChipText,
                        formData.skills.includes(skill.name) && styles.skillChipTextActive
                      ]}>
                        {skill.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {errors.skills && <Text style={styles.errorText}>{errors.skills}</Text>}
              </View>
            )}
            
            {/* Service Areas Section Toggle */}
            <TouchableOpacity 
              style={styles.sectionToggle}
              onPress={() => setShowServiceAreasSection(!showServiceAreasSection)}
            >
              <View style={styles.sectionToggleLeft}>
                <MaterialIcons name="location-on" size={20} color="#4B5563" />
                <Text style={styles.sectionToggleText}>Service Areas</Text>
              </View>
              <Ionicons 
                name={showServiceAreasSection ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#4B5563" 
              />
            </TouchableOpacity>
            
            {/* Service Areas Form */}
            {showServiceAreasSection && (
              <View style={styles.formSection}>
                <Text style={styles.selectionDescription}>
                  Select areas where this professional will provide services <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                
                <View style={styles.skillsContainer}>
                  {availableServiceAreas.map((area) => (
                    <TouchableOpacity 
                      key={area.id}
                      style={[
                        styles.areaChip,
                        formData.serviceAreas.includes(area.name) 
                          ? styles.areaChipActive 
                          : styles.areaChipInactive
                      ]}
                      onPress={() => toggleServiceArea(area.name)}
                    >
                      <Text style={[
                        styles.areaChipTextMain,
                        formData.serviceAreas.includes(area.name) && styles.areaChipTextMainActive
                      ]}>
                        {area.name}
                      </Text>
                      <Text style={styles.areaChipTextSub}>{area.city}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {errors.serviceAreas && <Text style={styles.errorText}>{errors.serviceAreas}</Text>}
              </View>
            )}
            
            {/* Address Section Toggle */}
            <TouchableOpacity 
              style={styles.sectionToggle}
              onPress={() => setShowAddressSection(!showAddressSection)}
            >
              <View style={styles.sectionToggleLeft}>
                <MaterialIcons name="home" size={20} color="#4B5563" />
                <Text style={styles.sectionToggleText}>Residential Address</Text>
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
                  
                  <View style={styles.addressInputRight}>
                    <Text style={styles.inputLabel}>
                      State <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="State"
                      value={formData.address.state}
                      onChangeText={(value) => updateAddress('state', value)}
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
                <Text style={styles.submitButtonText}>Create Professional</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AdminCreateProfessionalScreen;


 const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Header
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: 48,
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
  profileImageWrapper: {
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
    flexWrap: 'wrap',
    marginTop: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
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

  // Vehicle Information
  vehicleInfoContainer: {
    marginBottom: 16,
  },
  vehicleInfoLabel: {
    color: '#4B5563',
    fontWeight: '500',
    marginBottom: 8,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 12,
  },
  vehicleTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  vehicleTypeOptionActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  vehicleTypeOptionInactive: {
    backgroundColor: '#F3F4F6',
  },
  vehicleTypeText: {
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  vehicleTypeTextActive: {
    color: '#2563EB',
    fontWeight: '500',
  },
  vehicleTypeTextInactive: {
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

  // Section Toggle
  sectionToggle: {
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
  sectionToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionToggleText: {
    color: '#1F2937',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  // Skills and Service Areas
  selectionDescription: {
    color: '#4B5563',
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  skillChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: '#2563EB',
  },
  skillChipInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  skillChipText: {
    color: '#374151',
  },
  skillChipTextActive: {
    color: '#2563EB',
  },
  areaChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  areaChipActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: '#2563EB',
  },
  areaChipInactive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  areaChipTextMain: {
    color: '#374151',
  },
  areaChipTextMainActive: {
    color: '#2563EB',
  },
  areaChipTextSub: {
    fontSize: 12,
    color: '#6B7280',
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

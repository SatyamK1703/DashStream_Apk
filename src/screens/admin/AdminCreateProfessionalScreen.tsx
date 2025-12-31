
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
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // 1. Import SafeAreaView
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { adminService } from '../../services/adminService';


type AdminCreateProfessionalNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface FormData {
  name: string;
  email: string;
  phone: string;
  profileImage: string | null;
  status: 'active' | 'inactive' | 'pending';
  sendCredentials: boolean;
  address: {
    type: 'home' | 'work' | 'other';
    name: string;
    address: string;
    landmark: string;
    city: string;
    pincode: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  skills: string[];
  serviceAreas: string[];
  experience: string;
  vehicleInfo: {
    type: string;
  };
}

const AdminCreateProfessionalScreen = () => {
  const navigation = useNavigation<AdminCreateProfessionalNavigationProp>();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    profileImage: null,
    status: 'pending',
    sendCredentials: true,
    address: {
      type: 'home',
      name: '',
      address: '',
      landmark: '',
      city: '',
      pincode: '',
      country: 'IN',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    skills: [],
    serviceAreas: [],
    experience: '',
    vehicleInfo: {
      type: 'bike',
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
  ];
  
  const availableServiceAreas = [
    { id: '1', name: 'Ara', city: 'Bihar' },
    { id: '2', name: 'Gaya', city: 'Bihar' },
    { id: '3', name: 'Buxar', city: 'Bihar' },
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
  
  const updateAddress = <K extends keyof FormData['address']>(
    key: K,
    value: FormData['address'][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));

    if (errors.address) {
      setErrors((prev) => ({
        ...prev,
        address: undefined,
      }));
    }
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
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
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
    // Basic validation logic, can be expanded
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    
    try {
      // Validate required fields for professional creation
      if (!formData.skills.length) {
        setErrors(prev => ({ ...prev, skills: 'At least one skill is required' }));
        setLoading(false);
        return;
      }
      
      if (!formData.serviceAreas.length) {
        setErrors(prev => ({ ...prev, serviceAreas: 'At least one service area is required' }));
        setLoading(false);
        return;
      }
      
      // Prepare data according to backend requirements
      const professionalData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.phone.substring(0, 6), // Simple default password using first 6 digits of phone
        status: formData.status,
        address: {
          type: formData.address.type,
          name: formData.address.name || formData.name + "'s Address",
          address: formData.address.address,
          landmark: formData.address.landmark,
          city: formData.address.city,
          pincode: formData.address.pincode,
          country: formData.address.country,
          coordinates: formData.address.coordinates
        },
        skills: formData.skills,
        serviceAreas: formData.serviceAreas,
        experience: formData.experience,
        vehicleInfo: formData.vehicleInfo,
        profileImage: formData.profileImage,
        sendCredentials: formData.sendCredentials
      };
      
      // Log the request for debugging
      if (__DEV__) {
        console.log('Creating professional with data:', JSON.stringify(professionalData, null, 2));
      }
      
      // Call the admin service to create a professional
      const response = await adminService.createProfessional(professionalData);
      
      if (response && (response.success || response.status === 'success')) {
        Alert.alert(
          'Success',
          `Professional ${formData.name} created successfully.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', response?.message || 'Failed to create professional');
      }
    } catch (error: any) {
      console.error('Create professional error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create professional. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* 2. New white header with centered title */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Professional</Text>
            <View style={styles.headerButton} />{/* Placeholder for balance */}
        </View>
        
        <ScrollView 
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
                <Image 
                  source={{ uri: formData.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={60} color="#9CA3AF" />
              )}
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileImageText}>Upload Profile Picture</Text>
          </View>
          
          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              {/* Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name <Text style={styles.requiredAsterisk}>*</Text></Text>
                <TextInput
                  style={[styles.textInput, errors.name && styles.textInputError]}
                  placeholder="Enter full name"
                  value={formData.name}
                  onChangeText={(value) => updateFormData('name', value)}
                  placeholderTextColor="#9CA3AF"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>
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
              {/* Other input fields... */}

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
                    Address<Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="House/Flat No., Building Name"
                    value={formData.address.address}
                    onChangeText={(value) => updateAddress('address', value)}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                
                {/* Address Line 2 */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>landmark</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Street, Area, Landmark"
                    value={formData.address.landmark}
                    onChangeText={(value) => updateAddress('landmark', value)}
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
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Create Professional</Text>
              )}
            </TouchableOpacity>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AdminCreateProfessionalScreen;

// 3. Consolidated Stylesheet
const styles = StyleSheet.create({
  // Main Containers
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  flexContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
    backgroundColor: '#F9FAFB',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Profile Image Section
  profileImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileImageButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 50,
  },
  profileImageText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },

  // Form
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },

  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#374151',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
     backgroundColor: 'rgba(37, 99, 235, 0.1)',   },
   statusOptionInactive: {
     backgroundColor: '#F3F4F6',
   },
   radioButton: {
     width: 16,
     height: 16,
     borderRadius: 8,
     borderWidth: 2,
     justifyContent: 'center',
     alignItems: 'center',   },
  radioButtonActive: {     borderColor: '#2563EB',   },
  radioButtonInactive: {     borderColor: '#9CA3AF',   },   radioButtonInner: {     width: 8,     height: 8,     borderRadius: 4,
    backgroundColor: '#2563EB',   },
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

      //Switch Container
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    switchText: {
      color: '#4B5563',
    },

      //Section Toggle
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

      //Skills and Service Areas
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

      //Address Form
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
});

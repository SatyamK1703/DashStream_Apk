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
  Platform,
  StyleSheet, // Import StyleSheet
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
// Removed MaterialIcons as it was not used
import apiService from '../../services/apiService';

// Local route params for this screen only
type EditProfessionalParamList = {
  EditProfessional: { professionalId: string };
};

type AdminProfessionalEditRouteProp = RouteProp<EditProfessionalParamList, 'EditProfessional'>;
type AdminProfessionalEditNavigationProp = NativeStackNavigationProp<EditProfessionalParamList>;

// Interface for the professional's data structure
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

  // State for loading and saving indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professional, setProfessional] = useState<Professional | null>(null);

  // Form state for all editable fields
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

  // Function to fetch professional data from API

  // Effect to fetch and populate professional data on component mount
  useEffect(() => {
    fetchProfessionalData();
  }, [professionalId]);
  
  // Function to fetch professional data from API
  const fetchProfessionalData = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`/admin/professionals/${professionalId}`);
      
      if (response.data && response.data.professional) {
        const fetchedProfessional = response.data.professional;
        setProfessional(fetchedProfessional);
        
        // Initialize form state with fetched data
        setName(fetchedProfessional.name);
        setPhone(fetchedProfessional.phone);
        setEmail(fetchedProfessional.email);
        setStatus(fetchedProfessional.status);
        setIsVerified(fetchedProfessional.isVerified);
        setAddress(fetchedProfessional.address);
        setCity(fetchedProfessional.city);
        setState(fetchedProfessional.state);
        setPincode(fetchedProfessional.pincode);
        setSkills(fetchedProfessional.skills);
        setServiceAreas(fetchedProfessional.serviceArea);
      }
    } catch (error) {
      console.error('Error fetching professional details:', error);
      Alert.alert('Error', 'Failed to load professional details');
    } finally {
      setLoading(false);
    }
  };

  // Handlers for adding and removing skills
  const handleAddSkill = () => {
    if (skillInput.trim() === '') return;
    setSkills(prev => [...prev, skillInput.trim()]);
    setSkillInput('');
  };

  const handleRemoveSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  // Handlers for adding and removing service areas
  const handleAddServiceArea = () => {
    if (serviceAreaInput.trim() === '') return;
    setServiceAreas(prev => [...prev, serviceAreaInput.trim()]);
    setServiceAreaInput('');
  };

  const handleRemoveServiceArea = (index: number) => {
    setServiceAreas(prev => prev.filter((_, i) => i !== index));
  };

  // Handler to save changes
  const handleSave = async () => {
    if (!name.trim() || !phone.trim() || !email.trim()) {
      Alert.alert('Error', 'Name, Phone, and Email are required');
      return;
    }
    
    setSaving(true);
    try {
      const updatedProfessional = {
        name,
        phone,
        email,
        status,
        isVerified,
        address,
        city,
        state,
        pincode,
        skills,
        serviceArea: serviceAreas
      };
      
      await apiService.put(`/admin/professionals/${professionalId}`, updatedProfessional);
      
      Alert.alert(
        'Success',
        'Professional details updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error updating professional:', error);
      Alert.alert('Error', 'Failed to update professional details');
    } finally {
      setSaving(false);
    }
  };

  // Handler to cancel editing and show a confirmation dialog
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

  // Loading state UI
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading professional details...</Text>
      </View>
    );
  }

  // Main component UI
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
            <Ionicons name="arrow-back" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Professional</Text>
        </View>
      </View>

      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Basic Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter name" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter email" keyboardType="email-address" autoCapitalize="none" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.tagContainer}>
                {['active', 'inactive', 'pending', 'rejected'].map((statusOption) => (
                  <TouchableOpacity 
                    key={statusOption}
                    style={[
                      styles.statusButton,
                      { backgroundColor: status === statusOption ? colors.primary : colors.gray200 }
                    ]}
                    onPress={() => setStatus(statusOption as any)}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      { color: status === statusOption ? colors.white : colors.gray700 }
                    ]}>
                      {statusOption}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Verified Professional</Text>
              <Switch
                value={isVerified}
                onValueChange={setIsVerified}
                trackColor={{ false: colors.gray300, true: colors.primaryLight }}
                thumbColor={isVerified ? colors.primary : colors.gray100}
              />
            </View>
          </View>

          {/* Address Information Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Address Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput style={[styles.input, styles.multilineInput]} value={address} onChangeText={setAddress} placeholder="Enter address" multiline />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Enter city" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>State</Text>
              <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="Enter state" />
            </View>
            <View>
              <Text style={styles.label}>Pincode</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder="Enter pincode" keyboardType="number-pad" />
            </View>
          </View>

          {/* Skills & Expertise Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Skills & Expertise</Text>
            <View style={styles.addTagRow}>
              <TextInput style={styles.tagInput} value={skillInput} onChangeText={setSkillInput} placeholder="Add a skill" />
              <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                  <TouchableOpacity style={styles.removeTagButton} onPress={() => handleRemoveSkill(index)}>
                    <Ionicons name="close-circle" size={16} color={colors.gray500} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Service Areas Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Areas</Text>
            <View style={styles.addTagRow}>
              <TextInput style={styles.tagInput} value={serviceAreaInput} onChangeText={setServiceAreaInput} placeholder="Add a service area" />
              <TouchableOpacity style={styles.addButton} onPress={handleAddServiceArea}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagContainer}>
              {serviceAreas.map((area, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{area}</Text>
                  <TouchableOpacity style={styles.removeTagButton} onPress={() => handleRemoveServiceArea(index)}>
                    <Ionicons name="close-circle" size={16} color={colors.gray500} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Color palette for consistency
const colors = {
  primary: '#2563EB',
  primaryLight: '#93C5FD',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
};

// StyleSheet for all the component's styles
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray600,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 48, // Adjust for status bar
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  cardTitle: {
    color: colors.gray800,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: colors.gray700,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: 12,
    color: colors.gray800,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  statusButtonText: {
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  addTagRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: 12,
    color: colors.gray800,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.gray100,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: colors.gray700,
  },
  removeTagButton: {
    marginLeft: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray200,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.gray800,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});

export default AdminProfessionalEditScreen;
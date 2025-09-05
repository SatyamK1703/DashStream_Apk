import React, { useState, useEffect } from 'react';
import {
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

// ... your type definitions and constants stay the same
interface AddressData {
  id?: string;
  type: 'home' | 'work' | 'other';
  name: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

const AddAddressScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const route = useRoute<RouteProp<CustomerStackParamList, 'AddAddress'>>();
  const editMode = route.params?.addressId !== undefined;
  const addressToEdit = route.params?.addressData;

  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(addressToEdit?.type || 'home');
  const [name, setName] = useState(addressToEdit?.name || '');
  const [address, setAddress] = useState(addressToEdit?.address || '');
  const [landmark, setLandmark] = useState(addressToEdit?.landmark || '');
  const [city, setCity] = useState(addressToEdit?.city || '');
  const [state, setState] = useState(addressToEdit?.state || '');
  const [pincode, setPincode] = useState(addressToEdit?.pincode || '');
  const [isDefault, setIsDefault] = useState(addressToEdit?.isDefault || false);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Chandigarh', 'Puducherry'
  ];
    useEffect(() => {
    const fetchCurrentLocation = async () => {
      setTimeout(() => {
        setCurrentLocation('123 Main Street, Mumbai, Maharashtra, 400001');
      }, 1000);
    };

    fetchCurrentLocation();
  }, []);

  const useCurrentLocation = () => {
    if (currentLocation) {
      setAddress('123 Main Street');
      setCity('Mumbai');
      setState('Maharashtra');
      setPincode('400001');
    } else {
      Alert.alert('Location not available', 'Please try again later.');
    }
  };

  const validateForm = () => {
    if (!name.trim()) return Alert.alert('Error', 'Please enter a name for this address'), false;
    if (!address.trim()) return Alert.alert('Error', 'Please enter the address'), false;
    if (!city.trim()) return Alert.alert('Error', 'Please enter the city'), false;
    if (!state.trim()) return Alert.alert('Error', 'Please select a state'), false;
    if (!pincode.trim() || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
      return Alert.alert('Error', 'Please enter a valid 6-digit pincode'), false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setLoading(true);
    //apicall
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        editMode ? 'Address updated successfully' : 'Address added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.flexWhite}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {editMode ? 'Edit Address' : 'Add New Address'}
              </Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.currentLocationBtn}
              onPress={useCurrentLocation}
            >
              <Ionicons name="location-outline" size={20} color="#2563eb" />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            {/* Address Type Selector */}
            <Text style={styles.label}>Address Type</Text>
            <View style={styles.addressTypeRow}>
              {['home', 'work', 'other'].map((type, index) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.addressTypeButton,
                    addressType === type && styles.addressTypeActive,
                    index === 0 && styles.roundedLeft,
                    index === 2 && styles.roundedRight,
                  ]}
                  onPress={() => setAddressType(type as 'home' | 'work' | 'other')}
                >
                  <View style={styles.centered}>
                    <Ionicons
                      name={
                        type === 'home'
                          ? 'home-outline'
                          : type === 'work'
                          ? 'briefcase-outline'
                          : 'location-outline'
                      }
                      size={24}
                      color={addressType === type ? '#fff' : '#6b7280'}
                    />
                    <Text
                      style={[
                        styles.typeText,
                        addressType === type && styles.typeTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              value={name}
              onChangeText={setName}
            />

            {/* Address */}
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="House/Flat No., Building, Street"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Landmark */}
            <Text style={styles.label}>Landmark (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Near Post Office"
              value={landmark}
              onChangeText={setLandmark}
            />

            {/* City */}
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Mumbai"
              value={city}
              onChangeText={setCity}
            />

            {/* State */}
            <Text style={styles.label}>State</Text>
            <View style={{ marginBottom: 16 }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.stateScroll}
              >
                {indianStates.map((stateName) => (
                  <TouchableOpacity
                    key={stateName}
                    style={[
                      styles.stateChip,
                      state === stateName && styles.stateChipActive,
                    ]}
                    onPress={() => setState(stateName)}
                  >
                    <Text
                      style={[
                        styles.stateChipText,
                        state === stateName && styles.stateChipTextActive,
                      ]}
                    >
                      {stateName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {!indianStates.includes(state) && state !== '' && (
                <TextInput
                  style={styles.input}
                  placeholder="Enter state name"
                  value={state}
                  onChangeText={setState}
                />
              )}
            </View>

            {/* Pincode */}
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 400001"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
            />

            {/* Default Address Toggle */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Set as default address</Text>
              <Switch
                trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                thumbColor={isDefault ? '#2563eb' : '#f4f4f5'}
                ios_backgroundColor="#d1d5db"
                onValueChange={setIsDefault}
                value={isDefault}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editMode ? 'Update Address' : 'Save Address'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddAddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  flexWhite: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // ... rest of your styles unchanged
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  currentLocationText: {
    marginLeft: 8,
    color: '#2563EB',
    fontWeight: '500',
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  addressTypeRow: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  addressTypeButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  addressTypeActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  roundedLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  roundedRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  centered: {
    alignItems: 'center',
  },
  typeText: {
    marginTop: 4,
    color: '#374151',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    color: '#1F2937',
    marginBottom: 16,
  },
  textarea: {
    height: 90,
  },
  stateScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stateChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  stateChipActive: {
    backgroundColor: '#3B82F6',
  },
  stateChipText: {
    color: '#374151',
  },
  stateChipTextActive: {
    color: '#FFFFFF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,StyleSheet
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import * as ImagePicker from 'expo-image-picker';

type AddVehicleScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type AddVehicleScreenRouteProp = RouteProp<CustomerStackParamList, 'AddVehicle'>;

type VehicleType = 'car' | 'motorcycle' | 'bicycle';

const AddVehicleScreen = () => {
  const navigation = useNavigation<AddVehicleScreenNavigationProp>();
  const route = useRoute<AddVehicleScreenRouteProp>();
  const editMode = route.params?.vehicleId !== undefined;
  const vehicleToEdit = route.params?.vehicleData;

  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicleToEdit?.type || 'car');
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [year, setYear] = useState(vehicleToEdit?.year || '');
  const [color, setColor] = useState(vehicleToEdit?.color || '');
  const [licensePlate, setLicensePlate] = useState(vehicleToEdit?.licensePlate || '');
  const [vehicleImage, setVehicleImage] = useState<string | null>(vehicleToEdit?.image || null);
  const [loading, setLoading] = useState(false);

  // Popular car brands in India
  const popularCarBrands = [
    'Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia',
    'MG', 'Volkswagen', 'Skoda', 'Ford', 'Renault', 'Nissan', 'Other'
  ];

  // Popular motorcycle brands in India
  const popularMotorcycleBrands = [
    'Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Suzuki',
    'KTM', 'Jawa', 'Triumph', 'Harley-Davidson', 'Other'
  ];

  // Popular bicycle brands
  const popularBicycleBrands = [
    'Hero', 'Firefox', 'Hercules', 'Atlas', 'Avon', 'BSA', 'Montra',
    'Trek', 'Giant', 'Cannondale', 'Specialized', 'Other'
  ];

  const getBrandsForType = () => {
    switch (vehicleType) {
      case 'car':
        return popularCarBrands;
      case 'motorcycle':
        return popularMotorcycleBrands;
      case 'bicycle':
        return popularBicycleBrands;
      default:
        return [];
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload a vehicle image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setVehicleImage(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!brand) {
      Alert.alert('Error', 'Please select a brand');
      return false;
    }
    if (!model) {
      Alert.alert('Error', 'Please enter a model');
      return false;
    }
    if (vehicleType !== 'bicycle' && !licensePlate) {
      Alert.alert('Error', 'Please enter a license plate number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      if (editMode) {
        Alert.alert(
          'Success',
          'Vehicle updated successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(
          'Success',
          'Vehicle added successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    }, 1500);
  };

  return (
   <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editMode ? 'Edit Vehicle' : 'Add Vehicle'}
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Vehicle Type */}
          <Text style={styles.label}>Vehicle Type</Text>
          <View style={styles.row}>
            {['car', 'motorcycle', 'bicycle'].map((type, idx) => {
              const isSelected = vehicleType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.vehicleOption,
                    idx === 0 && styles.roundLeft,
                    idx === 2 && styles.roundRight,
                    isSelected && styles.selectedVehicleOption,
                  ]}
                  onPress={() => setVehicleType(type)}
                >
                  <View style={styles.center}>
                    <Ionicons
                      name={type === 'car' ? 'car-outline' : 'bicycle-outline'}
                      size={24}
                      color={isSelected ? '#fff' : '#6b7280'}
                    />
                    <Text style={[styles.vehicleText, isSelected && styles.selectedText]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Vehicle Image */}
          <Text style={styles.label}>Vehicle Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {vehicleImage ? (
              <Image
                source={{ uri: vehicleImage }}
                style={styles.vehicleImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.center}>
                <Ionicons name="camera-outline" size={40} color="#9ca3af" />
                <Text style={styles.placeholder}>Tap to add a photo</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Brand */}
          <Text style={styles.label}>Brand</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {getBrandsForType().map((brandName) => (
              <TouchableOpacity
                key={brandName}
                style={[
                  styles.chip,
                  brand === brandName && styles.chipSelected
                ]}
                onPress={() => setBrand(brandName)}
              >
                <Text style={brand === brandName ? styles.chipTextSelected : styles.chipText}>
                  {brandName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Model */}
          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Swift, Activa, Mountain Bike"
            value={model}
            onChangeText={setModel}
          />

          {/* Year */}
          <Text style={styles.label}>Year (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2022"
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            maxLength={4}
          />

          {/* Color */}
          <Text style={styles.label}>Color (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Red, Blue, Silver"
            value={color}
            onChangeText={setColor}
          />

          {/* License Plate */}
          {vehicleType !== 'bicycle' && (
            <>
              <Text style={styles.label}>License Plate Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. MH01AB1234"
                value={licensePlate}
                onChangeText={setLicensePlate}
                autoCapitalize="characters"
              />
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>
                {editMode ? 'Update Vehicle' : 'Add Vehicle'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white'
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  scroll: { padding: 16 },
  label: { fontWeight: '500', color: '#374151', marginBottom: 8 },
  row: { flexDirection: 'row', marginBottom: 24 },
  vehicleOption: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb'
  },
  roundLeft: { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
  roundRight: { borderTopRightRadius: 12, borderBottomRightRadius: 12 },
  selectedVehicleOption: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  center: { alignItems: 'center' },
  vehicleText: { marginTop: 4, color: '#374151' },
  selectedText: { color: '#fff' },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  vehicleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  placeholder: { color: '#6b7280', marginTop: 8 },
  chipScroll: { marginBottom: 16 },
  chip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#f3f4f6'
  },
  chipSelected: { backgroundColor: '#2563eb' },
  chipText: { color: '#374151' },
  chipTextSelected: { color: '#ffffff' },
  input: {
    backgroundColor: 'white',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    color: '#1f2937',
    marginBottom: 16
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8
  },
  submitText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18
  }
});

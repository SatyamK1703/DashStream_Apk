import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import * as ImagePicker from 'expo-image-picker';
import { vehicleService } from '../../services/vehicleService';

type AddVehicleScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type AddVehicleScreenRouteProp = RouteProp<CustomerStackParamList, 'AddVehicle'>;
type VehicleType = 'car' | 'motorcycle' | 'bicycle';

type FormErrors = {
  brand?: string;
  model?: string;
  licensePlate?: string;
};

const getIconForType = (type: VehicleType) => {
  if (type === 'car') return 'car-sport-outline';
  if (type === 'motorcycle') return 'rocket-outline';
  return 'bicycle-outline';
};

const getBrandsForType = (type: VehicleType) => {
  const popularCarBrands = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'Other'];
  const popularMotorcycleBrands = ['Hero', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'Yamaha', 'Other'];
  const popularBicycleBrands = ['Hero', 'Firefox', 'Hercules', 'Atlas', 'Avon', 'Other'];

  switch (type) {
    case 'car': return popularCarBrands;
    case 'motorcycle': return popularMotorcycleBrands;
    case 'bicycle': return popularBicycleBrands;
    default: return [];
  }
};

const yearOptions = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

const AddVehicleScreen = () => {
  const navigation = useNavigation<AddVehicleScreenNavigationProp>();
  const route = useRoute<AddVehicleScreenRouteProp>();
  // const insets = useSafeAreaInsets();
  const editMode = route.params?.vehicleId !== undefined;
  const vehicleToEdit = route.params?.vehicleData;

  const [vehicleType, setVehicleType] = useState<VehicleType>(vehicleToEdit?.type || 'car');
  const [brand, setBrand] = useState(vehicleToEdit?.brand || '');
  const [model, setModel] = useState(vehicleToEdit?.model || '');
  const [year, setYear] = useState(vehicleToEdit?.year || new Date().getFullYear().toString());
  const [licensePlate, setLicensePlate] = useState(vehicleToEdit?.licensePlate || '');
  const [vehicleImage, setVehicleImage] = useState<string | null>(vehicleToEdit?.image || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [isFocused, setIsFocused] = useState({
    brand: false,
    model: false,
    licensePlate: false
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const brandInputRef = useRef<TextInput>(null);
  const modelInputRef = useRef<TextInput>(null);
  const licenseInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera permissions to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setVehicleImage(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!brand.trim()) newErrors.brand = 'Please select a brand.';
    if (!model.trim()) newErrors.model = 'Model cannot be empty.';
    if (vehicleType !== 'bicycle' && !licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Build payload
      const payload: any = {
        type: vehicleType,
        make: brand,
        model,
        year: Number(year),
        color: 'unspecified',
        licensePlate: licensePlate || undefined,
      };

      // If there's an image, upload it using FormData via httpClient
      if (vehicleImage && vehicleImage.startsWith('file') || vehicleImage?.startsWith('content') || vehicleImage?.startsWith('http') === false) {
        const filename = vehicleImage.split('/').pop() || 'vehicle.jpg';
        const match = filename.match(/\.(\w+)$/);
        const ext = match ? match[1].toLowerCase() : 'jpg';
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        const formData = new FormData();
        // @ts-ignore
        formData.append('image', { uri: vehicleImage, name: filename, type: mime });
        // Upload image first via vehicle/create endpoint if backend supports multipart with create
        // For edit mode, backend may expect separate image endpoint — we optimistically attach image in payload
        // Add indicator that image was uploaded in payload (backend should provide image URL in response)
        payload['imageForm'] = formData;
      }

      if (editMode && route.params?.vehicleId) {
        await vehicleService.updateVehicle(route.params.vehicleId, payload);
        Alert.alert('Success', 'Vehicle updated successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        await vehicleService.createVehicle(payload);
        Alert.alert('Success', 'Vehicle added successfully', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch {
      Alert.alert('Error', 'Failed to save vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandChange = (text: string) => {
    setBrand(text);
    setErrors({...errors, brand: undefined});
    
    if (text) {
      const allBrands = getBrandsForType(vehicleType);
      const filtered = allBrands.filter(b => b.toLowerCase().includes(text.toLowerCase()));
      setBrandSuggestions(filtered);
      
      // Animate suggestions appearing
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setBrandSuggestions([]));
    }
  };

  const selectBrandSuggestion = (selectedBrand: string) => {
    setBrand(selectedBrand);
    setBrandSuggestions([]);
    modelInputRef.current?.focus();
  };

  const handleFocus = (field: keyof typeof isFocused) => {
    setIsFocused({...isFocused, [field]: true});
  };

  const handleBlur = (field: keyof typeof isFocused) => {
    setIsFocused({...isFocused, [field]: false});
  };

  const renderYearPicker = () => {
    return (
      <Modal
        visible={showYearPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowYearPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>Select Year</Text>
          <FlatList
            data={yearOptions}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.pickerItem}
                onPress={() => {
                  setYear(item.toString());
                  setShowYearPicker(false);
                }}
              >
                <Text style={[styles.pickerItemText, item.toString() === year && styles.selectedPickerItem]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMode ? 'Edit Vehicle' : 'Add New Vehicle'}</Text>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.typeSelectorContainer}>
              {(['car', 'motorcycle', 'bicycle'] as VehicleType[]).map((type) => {
                const isSelected = vehicleType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
                    onPress={() => {
                      setVehicleType(type);
                      // Clear brand suggestions when type changes
                      setBrand('');
                      setBrandSuggestions([]);
                    }}
                  >
                    <Ionicons 
                      name={getIconForType(type)} 
                      size={28} 
                      color={isSelected ? '#2563eb' : '#4B5563'} 
                    />
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={showImageOptions}>
              {vehicleImage ? (
                <>
                  <Image source={{ uri: vehicleImage }} style={styles.vehicleImage} resizeMode="cover" />
                  <View style={styles.imageEditIcon}>
                    <Ionicons name="camera-outline" size={20} color="#FFF" />
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                  <Text style={styles.imagePlaceholderText}>Add Vehicle Photo</Text>
                  <Text style={styles.imageSubText}>Tap to take a photo or choose from gallery</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            
            <Text style={styles.label}>Brand</Text>
            <TextInput
              ref={brandInputRef}
              style={[
                styles.input, 
                isFocused.brand && styles.inputFocused,
                errors.brand && styles.inputError
              ]}
              placeholder="Start typing a brand name..."
              value={brand}
              onChangeText={handleBrandChange}
              onFocus={() => handleFocus('brand')}
              onBlur={() => handleBlur('brand')}
              returnKeyType="next"
              onSubmitEditing={() => modelInputRef.current?.focus()}
            />
            {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}

            {brandSuggestions.length > 0 && (
              <Animated.View style={[styles.suggestionsContainer, { opacity: fadeAnim }]}>
                <FlatList
                  data={brandSuggestions}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.suggestionItem} 
                      onPress={() => selectBrandSuggestion(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyboardShouldPersistTaps="always"
                />
              </Animated.View>
            )}

            <Text style={styles.label}>Model</Text>
            <TextInput
              ref={modelInputRef}
              style={[
                styles.input, 
                isFocused.model && styles.inputFocused,
                errors.model && styles.inputError
              ]}
              placeholder="e.g., Swift, Classic 350"
              value={model}
              onChangeText={(text) => {
                setModel(text);
                setErrors({...errors, model: undefined});
              }}
              onFocus={() => handleFocus('model')}
              onBlur={() => handleBlur('model')}
              returnKeyType={vehicleType !== 'bicycle' ? 'next' : 'done'}
              onSubmitEditing={() => {
                if (vehicleType !== 'bicycle') {
                  licenseInputRef.current?.focus();
                } else {
                  Keyboard.dismiss();
                }
              }}
            />
            {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}

            <Text style={styles.label}>Year</Text>
            <TouchableOpacity 
              style={styles.pickerInput}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={styles.pickerText}>{year}</Text>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>

            {vehicleType !== 'bicycle' && (
              <>
                <Text style={styles.label}>License Plate Number</Text>
                <TextInput
                  ref={licenseInputRef}
                  style={[
                    styles.input, 
                    isFocused.licensePlate && styles.inputFocused,
                    errors.licensePlate && styles.inputError
                  ]}
                  placeholder="e.g., MH 12 AB 3456"
                  value={licensePlate}
                  onChangeText={(text) => {
                    setLicensePlate(text);
                    setErrors({...errors, licensePlate: undefined});
                  }}
                  onFocus={() => handleFocus('licensePlate')}
                  onBlur={() => handleBlur('licensePlate')}
                  autoCapitalize="characters"
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                {errors.licensePlate && <Text style={styles.errorText}>{errors.licensePlate}</Text>}
              </>
            )}

            {/* Submit button is now inside the ScrollView with proper styling */}
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity 
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
                onPress={handleSubmit} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.submitText}>{editMode ? 'Update Vehicle' : 'Add Vehicle'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderYearPicker()}
    </SafeAreaView>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { 
    marginRight: 16,
    padding: 4,
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827' 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 8, 
    marginTop: 16 
  },
  typeSelectorContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12 
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeOptionSelected: { 
    borderColor: '#2563eb', 
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  typeText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#4B5563', 
    marginTop: 8 
  },
  typeTextSelected: { 
    color: '#2563eb',
    fontWeight: '600'
  },
  imagePicker: {
    height: 180,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imagePlaceholder: { 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: 16
  },
  imagePlaceholderText: { 
    color: '#111827', 
    marginTop: 8, 
    fontWeight: '600',
    fontSize: 16
  },
  imageSubText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center'
  },
  vehicleImage: { 
    width: '100%', 
    height: '100%' 
  },
  imageEditIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#111827', 
    marginTop: 32, 
    borderTopWidth: 1, 
    borderTopColor: '#E5E7EB', 
    paddingTop: 24 
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: { 
    color: '#EF4444', 
    marginTop: 6, 
    marginLeft: 4, 
    fontSize: 14 
  },
  pickerInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerText: { 
    fontSize: 16, 
    color: '#111827' 
  },
  submitButtonContainer: {
    marginTop: 32,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#2563eb',
    shadowColor: '#9CA3AF',
  },
  submitText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    maxHeight: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    padding: 16,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedPickerItem: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ServiceFormData {
  id?: string;
  title: string;
  description: string;
  longDescription: string;
  price: string;
  discountPrice: string;
  category: string;
  image: string | null;
  banner: string | null;
  duration: string;
  vehicleType: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  tags: string[];
}

interface AddEditServiceModalProps {
  visible: boolean;
  isEditing: boolean;
  formData: ServiceFormData;
  onClose: () => void;
  onSubmit: (service: any) => void;
}

const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  visible,
  isEditing,
  formData: initialFormData,
  onClose,
  onSubmit,
}) => {
  const defaultFormData: ServiceFormData = {
    title: '',
    description: '',
    longDescription: '',
    price: '',
    discountPrice: '',
    category: 'car wash', // Default to 'car wash' as per backend model
    image: null,
    banner: null,
    duration: '',
    vehicleType: 'Both',
    isActive: true,
    isPopular: false,
    features: [],
    tags: []
  };
  
  const [formData, setFormData] = useState<ServiceFormData>({
    ...defaultFormData,
    ...initialFormData
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setFormData({
      ...defaultFormData,
      ...initialFormData
    });
    setFormErrors({});
  }, [visible, initialFormData]);

  const updateFormData = (key: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const pickImage = async (field: 'image' | 'banner') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateFormData(field, result.assets[0].uri);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateFormData('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    updateFormData('features', (formData.features || []).filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim()) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    updateFormData('tags', formData.tags.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (
      formData.discountPrice.trim() &&
      (isNaN(Number(formData.discountPrice)) || Number(formData.discountPrice) <= 0)
    ) {
      newErrors.discountPrice = 'Please enter a valid discounted price';
    }
    if (
      formData.discountPrice.trim() &&
      Number(formData.discountPrice) >= Number(formData.price)
    ) {
      newErrors.discountPrice = 'Discount must be less than price';
    }
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!formData.image) newErrors.image = 'Service image is required';
    if (!formData.banner) newErrors.banner = 'Banner image is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (formData.features.length === 0) newErrors.features = 'Add at least one feature';

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const serviceToSubmit = {
      id: formData.id || `${Date.now()}`,
      title: formData.title,
      description: formData.description,
      longDescription: formData.longDescription,
      price: Number(formData.price),
      discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
      category: formData.category,
      image: formData.image || 'https://via.placeholder.com/300x200', // Provide default image if empty
      banner: formData.banner || 'https://via.placeholder.com/600x300', // Provide default banner if empty
      duration: formData.duration, // Keep as string as per model
      vehicleType: formData.vehicleType || 'Both',
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      features: formData.features || [],
      tags: formData.tags || [],
    };
    onSubmit(serviceToSubmit);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlayTouchable}
        activeOpacity={1}
        onPress={onClose}
      >
        <SafeAreaView edges={['bottom']} style={styles.modalSafeArea}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              style={styles.modalContentContainer}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{isEditing ? 'Edit Service' : 'Add Service'}</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color="#4B5563" />
                  </TouchableOpacity>
                </View>
                
                  <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Image Picker */}
              {['image', 'banner'].map((field) => (
                <View style={styles.inputGroup} key={field}>
                  <Text style={styles.label}>
                    {field === 'image' ? 'Service Image' : 'Banner Image'}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={() => pickImage(field as 'image' | 'banner')} style={styles.imagePicker}>
                    {formData[field as 'image' | 'banner'] ? (
                      <Image source={{ uri: formData[field as 'image' | 'banner']! }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                        <Text style={styles.imagePickerText}>Tap to select image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {formErrors[field as keyof ServiceFormData] && (
                    <Text style={styles.errorText}>{formErrors[field as keyof ServiceFormData]}</Text>
                  )}
                </View>
              ))}

              {/* Title */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                  style={[styles.textInput, formErrors.title && styles.textInputError]}
                  placeholder="Enter service title"
                  value={formData.title}
                  onChangeText={(value) => updateFormData('title', value)}
                />
                {formErrors.title && <Text style={styles.errorText}>{formErrors.title}</Text>}
              </View>

              {/* Description & Long Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineTextInput, formErrors.description && styles.textInputError]}
                  multiline
                  placeholder="Enter short description"
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                />
                {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Long Description</Text>
                <TextInput
                  style={[styles.textInput, styles.multilineTextInput]}
                  multiline
                  placeholder="Enter detailed description"
                  value={formData.longDescription}
                  onChangeText={(value) => updateFormData('longDescription', value)}
                />
              </View>

              {/* Category */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <View style={styles.categoryContainer}>
                  {[
                    { id: 'car wash', name: 'Car Wash' },
                    { id: 'bike wash', name: 'Bike Wash' },
                    { id: 'detailing', name: 'Detailing' },
                    { id: 'maintenance', name: 'Maintenance' },
                    { id: 'customization', name: 'Customization' },
                    { id: 'other', name: 'Other' }
                  ].map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        formData.category === category.id
                          ? styles.categoryChipSelected
                          : styles.categoryChipUnselected,
                      ]}
                      onPress={() => updateFormData('category', category.id)}
                    >
                      <Text
                        style={
                          formData.category === category.id
                            ? styles.categoryTextSelected
                            : styles.categoryTextUnselected
                        }
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.category && <Text style={styles.errorText}>{formErrors.category}</Text>}
              </View>

              {/* Price & Discount */}
              <View style={styles.priceContainer}>
                <View style={[styles.priceInputWrapper, styles.priceInputWrapperLeft]}>
                  <Text style={styles.label}>Price (₹) *</Text>
                  <TextInput
                    style={[styles.textInput, formErrors.price && styles.textInputError]}
                    keyboardType="numeric"
                    placeholder="Enter price"
                    value={formData.price}
                    onChangeText={(value) => updateFormData('price', value)}
                  />
                  {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
                </View>
                <View style={[styles.priceInputWrapper, styles.priceInputWrapperRight]}>
                  <Text style={styles.label}>Discount Price (₹)</Text>
                  <TextInput
                    style={[styles.textInput, formErrors.discountPrice && styles.textInputError]}
                    keyboardType="numeric"
                    placeholder="Optional"
                    value={formData.discountPrice}
                    onChangeText={(value) => updateFormData('discountPrice', value)}
                  />
                  {formErrors.discountPrice && <Text style={styles.errorText}>{formErrors.discountPrice}</Text>}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Duration *</Text>
                <TextInput
                  style={[styles.textInput, formErrors.duration && styles.textInputError]}
                  placeholder="e.g., 45 mins"
                  value={formData.duration}
                  onChangeText={(value) => updateFormData('duration', value)}
                />
                <Text style={styles.helperText}>Format: "45 mins" or "1 hour"</Text>
                {formErrors.duration && <Text style={styles.errorText}>{formErrors.duration}</Text>}
              </View>

              {/* Vehicle Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={styles.categoryContainer}>
                  {['2 Wheeler', '4 Wheeler', 'Both'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.categoryChip,
                        formData.vehicleType === type
                          ? styles.categoryChipSelected
                          : styles.categoryChipUnselected,
                      ]}
                      onPress={() => updateFormData('vehicleType', type)}
                    >
                      <Text
                        style={
                          formData.vehicleType === type
                            ? styles.categoryTextSelected
                            : styles.categoryTextUnselected
                        }
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Active & Popular Switches */}
              <View style={styles.inputGroup}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.label}>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => updateFormData('isActive', value)}
                  />
                </View>
                <View style={styles.toggleContainer}>
                  <Text style={styles.label}>Mark as Popular</Text>
                  <Switch
                    value={formData.isPopular}
                    onValueChange={(value) => updateFormData('isPopular', value)}
                  />
                </View>
              </View>

              {/* Features */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Features *</Text>
                <View style={styles.featureTagInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.featureTagInput]}
                    placeholder="Add a feature"
                    value={newFeature}
                    onChangeText={setNewFeature}
                  />
                  <TouchableOpacity
                    style={[styles.addButton, !newFeature.trim() && { opacity: 0.5 }]}
                    onPress={addFeature}
                    disabled={!newFeature.trim()}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                {formData.features.map((feature, index) => (
                  <View key={index} style={styles.itemListItem}>
                    <Text style={styles.itemText}>• {feature}</Text>
                    <TouchableOpacity onPress={() => removeFeature(index)}>
                      <Ionicons name="close-circle" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                {formErrors.features && <Text style={styles.errorText}>{formErrors.features}</Text>}
              </View>

              {/* Tags */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tags</Text>
                <View style={styles.featureTagInputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.featureTagInput]}
                    placeholder="Add a tag"
                    value={newTag}
                    onChangeText={setNewTag}
                  />
                  <TouchableOpacity
                    style={[styles.addButton, !newTag.trim() && { opacity: 0.5 }]}
                    onPress={addTag}
                    disabled={!newTag.trim()}
                  >
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.tagListContainer}>
                  {formData.tags.map((tag, index) => (
                    <View key={index} style={styles.tagListItem}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(index)}>
                        <Ionicons name="close-circle" size={16} color="#4B5563" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Service' : 'Add Service'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

export default AddEditServiceModal;
const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  modalOverlay: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
},

modalSafeArea: {
  flex: 1,
  justifyContent: 'flex-end',
},

modalContainer: {
  height: '70%', // Only bottom 70% of the screen
  backgroundColor: 'white',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden',
},
modalOverlayTouchable: {
  flex: 1,
  justifyContent: 'flex-end',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalContentContainer: {
  height: '70%',
  backgroundColor: '#fff',
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  overflow: 'hidden',
},

  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontWeight: '500', color: '#374151', marginBottom: 8 },
  requiredAsterisk: { color: '#EF4444' },
  imagePicker: { height: 180, backgroundColor: '#F3F4F6', borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePreview: { width: '100%', height: '100%' },
  imagePickerPlaceholder: { alignItems: 'center' },
  imagePickerText: { color: '#6B7280', marginTop: 6 },
  textInput: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#1F2937' },
  textInputError: { borderColor: '#EF4444' },
  multilineTextInput: { minHeight: 80, textAlignVertical: 'top' },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  categoryChipSelected: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: '#2563EB' },
  categoryChipUnselected: { backgroundColor: '#F9FAFB', borderColor: '#D1D5DB' },
  categoryTextSelected: { color: '#2563EB' },
  categoryTextUnselected: { color: '#374151' },
  priceContainer: { flexDirection: 'row' },
  priceInputWrapper: { flex: 1 },
  priceInputWrapperLeft: { marginRight: 8 },
  priceInputWrapperRight: { marginLeft: 8 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  featureTagInputContainer: { flexDirection: 'row', alignItems: 'center' },
  featureTagInput: { flex: 1, marginRight: 8 },
  addButton: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  addButtonText: { color: 'white', fontWeight: '500' },
  itemListItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  itemText: { color: '#1F2937' },
  tagListContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  tagListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 8, marginBottom: 8 },
  tagText: { marginRight: 4, color: '#4B5563' },
  submitButton: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  submitButtonText: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 16 },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  helperText: { color: '#6B7280', fontSize: 12, marginTop: 4 },
});

import React, { useState, useEffect, useMemo } from 'react';
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
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Import API utilities
import httpClient from '../../services/httpClient';
import { API_ENDPOINTS } from '../../config/config';

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
  onSubmit?: (service: any) => void;
  onSuccess?: () => void;
}

const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  visible,
  isEditing,
  formData: initialFormData,
  onClose,
  onSubmit,
  onSuccess,
}) => {
  const defaultFormData: ServiceFormData = useMemo(
    () => ({
      title: '',
      description: '',
      longDescription: '',
      price: '',
      discountPrice: '',
      category: 'car wash',
      image: '',
      banner: '',
      duration: '',
      vehicleType: 'Both',
      isActive: true,
      isPopular: false,
      features: [],
      tags: [],
    }),
    []
  );

  const [formData, setFormData] = useState<ServiceFormData>({
    ...defaultFormData,
    ...initialFormData,
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({ ...defaultFormData, ...initialFormData });
    setFormErrors({});
  }, [visible, initialFormData]);

  const updateFormData = (key: keyof ServiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const fd = new FormData();
      fd.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'service-image.jpg',
      } as any);

      const response = await httpClient.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return response.data.data?.url || response.data.url || uri;
    } catch (error) {
      console.warn('Image upload failed, using local URI:', error);
      return uri;
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
      const localUri = result.assets[0].uri;
      updateFormData(field, localUri);

      try {
        const uploadedUri = await uploadImage(localUri);
        updateFormData(field, uploadedUri);
      } catch (error) {
        console.warn('Background image upload failed:', error);
      }
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateFormData('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    updateFormData(
      'features',
      formData.features.filter((_, i) => i !== index)
    );
  };

  const addTag = () => {
    if (newTag.trim()) {
      updateFormData('tags', [...formData.tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    updateFormData(
      'tags',
      formData.tags.filter((_, i) => i !== index)
    );
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
    if (formData.discountPrice.trim() && Number(formData.discountPrice) >= Number(formData.price)) {
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

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const serviceData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        longDescription: formData.longDescription.trim(),
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        category: formData.category,
        image: formData.image || 'https://via.placeholder.com/300x200',
        banner: formData.banner || 'https://via.placeholder.com/600x300',
        duration: formData.duration.trim(),
        vehicleType: formData.vehicleType || 'Both',
        isActive: formData.isActive,
        isPopular: formData.isPopular,
        features: formData.features,
        tags: formData.tags,
      };

      let response;
      if (isEditing && formData.id) {
        response = await httpClient.patch(API_ENDPOINTS.SERVICES.UPDATE(formData.id), serviceData);
        Alert.alert('Success', 'Service updated successfully!');
      } else {
        response = await httpClient.post(API_ENDPOINTS.SERVICES.CREATE, serviceData);
        Alert.alert('Success', 'Service created successfully!');
      }

      onSuccess?.();
      onSubmit?.(response.data.data?.service || response.data.service);
      onClose();
    } catch (error: any) {
      console.error('Service submission error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{isEditing ? 'Edit Service' : 'Add Service'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form */}
            <KeyboardAwareScrollView
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid
              extraScrollHeight={20}
              keyboardShouldPersistTaps="handled">
              {/* Image Picker */}
              {['image', 'banner'].map((field) => (
                <View style={styles.inputGroup} key={field}>
                  <Text style={styles.label}>
                    {field === 'image' ? 'Service Image' : 'Banner Image'}{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => pickImage(field as 'image' | 'banner')}
                    style={styles.imagePicker}>
                    {formData[field as 'image' | 'banner'] ? (
                      <Image
                        source={{ uri: formData[field as 'image' | 'banner']! }}
                        style={styles.imagePreview}
                      />
                    ) : (
                      <View style={styles.imagePickerPlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                        <Text style={styles.imagePickerText}>Tap to select image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {formErrors[field as keyof ServiceFormData] && (
                    <Text style={styles.errorText}>
                      {formErrors[field as keyof ServiceFormData]}
                    </Text>
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
                  style={[
                    styles.textInput,
                    styles.multilineTextInput,
                    formErrors.description && styles.textInputError,
                  ]}
                  multiline
                  placeholder="Enter short description"
                  value={formData.description}
                  onChangeText={(value) => updateFormData('description', value)}
                />
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
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
                    { id: 'other', name: 'Other' },
                  ].map((category) => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryChip,
                        formData.category === category.id
                          ? styles.categoryChipSelected
                          : styles.categoryChipUnselected,
                      ]}
                      onPress={() => updateFormData('category', category.id)}>
                      <Text
                        style={
                          formData.category === category.id
                            ? styles.categoryTextSelected
                            : styles.categoryTextUnselected
                        }>
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
                  {formErrors.discountPrice && (
                    <Text style={styles.errorText}>{formErrors.discountPrice}</Text>
                  )}
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
                <Text style={styles.helperText}>
                  Format: &quot;45 mins&quot; or &quot;1 hour&quot;
                </Text>
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
                      onPress={() => updateFormData('vehicleType', type)}>
                      <Text
                        style={
                          formData.vehicleType === type
                            ? styles.categoryTextSelected
                            : styles.categoryTextUnselected
                        }>
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
                    disabled={!newFeature.trim()}>
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
                    disabled={!newTag.trim()}>
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

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <View style={styles.submitButtonContent}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={[styles.submitButtonText, { marginLeft: 8 }]}>
                      {isEditing ? 'Updating...' : 'Creating...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitButtonText}>
                    {isEditing ? 'Update Service' : 'Add Service'}
                  </Text>
                )}
              </TouchableOpacity>
            </KeyboardAwareScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default AddEditServiceModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#D9534F',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212529',
    backgroundColor: '#F8F9FA',
  },
  textInputError: {
    borderColor: '#D9534F',
  },
  multilineTextInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 4,
  },
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginTop: 6,
  },
  imagePicker: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderStyle: 'dashed',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#6C757D',
    marginTop: 8,
    fontSize: 14,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  categoryChipSelected: {
    backgroundColor: '#007BFF',
    borderColor: '#007BFF',
  },
  categoryChipUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CED4DA',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  categoryTextUnselected: {
    color: '#495057',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputWrapperLeft: {
    marginRight: 10,
  },
  priceInputWrapperRight: {
    marginLeft: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  featureTagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTagInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  itemListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  itemText: {
    color: '#212529',
    fontSize: 16,
  },
  tagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 6,
    color: '#495057',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6C757D',
    opacity: 0.8,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

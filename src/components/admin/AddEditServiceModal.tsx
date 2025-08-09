import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, FlatList, TextInput, Image, Switch, Alert,StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  discountedPrice?: number;
  category: string;
  image: string;
  duration: number;
  isActive: boolean;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
  features: string[];
  tags: string[];
}

interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  discountedPrice: string;
  category: string;
  image: string | null;
  duration: string;
  isActive: boolean;
  isPopular: boolean;
  features: string[];
  tags: string[];
}

interface Category {
  id: string;
  name: string;
}

interface AddEditServiceModalProps {
  visible: boolean;
  isEditing: boolean;
  formData: ServiceFormData;
  onClose: () => void;
  onSubmit: (service: Service) => void;
  categories: Category[];
}

const AddEditServiceModal: React.FC<AddEditServiceModalProps> = ({
  visible,
  isEditing,
  formData: initialFormData,
  onClose,
  onSubmit,
  categories
}) => {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [newFeature, setNewFeature] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // Reset form data and errors when modal visibility or initial data changes
    setFormData(initialFormData);
    setFormErrors({});
  }, [visible, initialFormData]);

  const updateFormData = (key: keyof ServiceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors(prev => ({ ...prev, [key]: undefined }));
    }
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
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateFormData('image', result.assets[0].uri);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateFormData('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    updateFormData('features', formData.features.filter((_, i) => i !== index));
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
    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (formData.discountedPrice.trim() && (isNaN(Number(formData.discountedPrice)) || Number(formData.discountedPrice) <= 0)) {
        newErrors.discountedPrice = 'Please enter a valid discounted price';
    }
    if (formData.discountedPrice.trim() && Number(formData.discountedPrice) >= Number(formData.price)) {
        newErrors.discountedPrice = 'Discounted price must be less than regular price';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Please enter a valid duration';
    }
    if (!formData.image) newErrors.image = 'Service image is required';
    if (formData.features.length === 0) newErrors.features = 'At least one feature is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    const serviceToSubmit: Service = {
      id: formData.id || `${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : undefined,
      category: formData.category,
      image: formData.image || '',
      duration: Number(formData.duration),
      isActive: formData.isActive,
      isPopular: formData.isPopular,
      createdAt: isEditing ? formData.id! : new Date().toISOString(), // This needs to be handled better
      updatedAt: new Date().toISOString(),
      features: formData.features,
      tags: formData.tags,
    };
    onSubmit(serviceToSubmit);
  };

  const renderForm = () => (
    <View style={styles.formContent}>
      {/* Image Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Service Image <Text style={styles.requiredAsterisk}>*</Text></Text>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={styles.imagePreview} resizeMode="cover" />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
              <Text style={styles.imagePickerText}>Tap to select image</Text>
            </View>
          )}
        </TouchableOpacity>
        {formErrors.image && <Text style={styles.errorText}>{formErrors.image}</Text>}
      </View>
      
      {/* Name, Description, Category, etc. */}
      {/* Name */}
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Service Name <Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
              style={[styles.textInput, formErrors.name && styles.textInputError]}
              placeholder="Enter service name"
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
          />
          {formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
      </View>
      
      {/* Description */}
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Description <Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
              style={[styles.textInput, styles.multilineTextInput, formErrors.description && styles.textInputError]}
              placeholder="Enter service description"
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
          />
          {formErrors.description && <Text style={styles.errorText}>{formErrors.description}</Text>}
      </View>
      
      {/* Category */}
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Category <Text style={styles.requiredAsterisk}>*</Text></Text>
          <View style={styles.categoryContainer}>
              {categories.map((category) => (
                  <TouchableOpacity
                      key={category.id}
                      style={[
                          styles.categoryChip,
                          formData.category === category.id ? styles.categoryChipSelected : styles.categoryChipUnselected
                      ]}
                      onPress={() => updateFormData('category', category.id)}
                  >
                      <Text style={formData.category === category.id ? styles.categoryTextSelected : styles.categoryTextUnselected}>
                          {category.name}
                      </Text>
                  </TouchableOpacity>
              ))}
          </View>
      </View>

      {/* Price & Discounted Price */}
      <View style={styles.priceContainer}>
          <View style={[styles.priceInputWrapper, styles.priceInputWrapperLeft]}>
              <Text style={styles.label}>Price (₹) <Text style={styles.requiredAsterisk}>*</Text></Text>
              <TextInput
                  style={[styles.textInput, formErrors.price && styles.textInputError]}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(value) => updateFormData('price', value)}
              />
              {formErrors.price && <Text style={styles.errorText}>{formErrors.price}</Text>}
          </View>
          <View style={[styles.priceInputWrapper, styles.priceInputWrapperRight]}>
              <Text style={styles.label}>Discounted Price (₹)</Text>
              <TextInput
                  style={[styles.textInput, formErrors.discountedPrice && styles.textInputError]}
                  placeholder="Optional"
                  keyboardType="numeric"
                  value={formData.discountedPrice}
                  onChangeText={(value) => updateFormData('discountedPrice', value)}
              />
              {formErrors.discountedPrice && <Text style={styles.errorText}>{formErrors.discountedPrice}</Text>}
          </View>
      </View>
      
      {/* Duration */}
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes) <Text style={styles.requiredAsterisk}>*</Text></Text>
          <TextInput
              style={[styles.textInput, formErrors.duration && styles.textInputError]}
              placeholder="Enter duration in minutes"
              keyboardType="numeric"
              value={formData.duration}
              onChangeText={(value) => updateFormData('duration', value)}
          />
          {formErrors.duration && <Text style={styles.errorText}>{formErrors.duration}</Text>}
      </View>

      {/* Toggles (Active & Popular) */}
      <View style={styles.inputGroup}>
          <View style={styles.toggleContainer}>
              <Text style={styles.label}>Active</Text>
              <Switch
                  value={formData.isActive}
                  onValueChange={(value) => updateFormData('isActive', value)}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={formData.isActive ? '#2563EB' : '#F3F4F6'}
              />
          </View>
          <View style={styles.toggleContainer}>
              <Text style={styles.label}>Mark as Popular</Text>
              <Switch
                  value={formData.isPopular}
                  onValueChange={(value) => updateFormData('isPopular', value)}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={formData.isPopular ? '#2563EB' : '#F3F4F6'}
              />
          </View>
      </View>

      {/* Features */}
      <View style={styles.inputGroup}>
          <Text style={styles.label}>Features <Text style={styles.requiredAsterisk}>*</Text></Text>
          <View style={styles.featureTagInputContainer}>
              <TextInput
                  style={[styles.textInput, styles.featureTagInput]}
                  placeholder="Add a feature"
                  value={newFeature}
                  onChangeText={setNewFeature}
              />
              <TouchableOpacity style={styles.addButton} onPress={addFeature}>
                  <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
          </View>
          {formData.features.length > 0 ? (
              <View style={styles.itemListContainer}>
                  {formData.features.map((feature, index) => (
                      <View key={index} style={styles.itemListItem}>
                          <View style={styles.itemListItemContent}>
                              <View style={styles.featureDot} />
                              <Text style={styles.itemText}>{feature}</Text>
                          </View>
                          <TouchableOpacity onPress={() => removeFeature(index)}>
                              <Ionicons name="close-circle" size={18} color="#EF4444" />
                          </TouchableOpacity>
                      </View>
                  ))}
              </View>
          ) : (
              <Text style={styles.emptyListText}>No features added yet</Text>
          )}
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
              <TouchableOpacity style={styles.addButton} onPress={addTag}>
                  <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
          </View>
          {formData.tags.length > 0 ? (
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
          ) : (
              <Text style={styles.emptyListText}>No tags added yet</Text>
          )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
              {isEditing ? 'Update Service' : 'Add Service'}
          </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={[1]} // To make the content scrollable
            keyExtractor={() => 'form-scroll'}
            renderItem={renderForm}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AddEditServiceModal;


const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
    fontSize: 20,
  },
  formContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#374151',
    fontWeight: '500',
    marginBottom: 8,
  },
  requiredAsterisk: {
    color: '#EF4444',
  },
  imagePicker: {
    height: 192,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
  },
  imagePickerText: {
    color: '#6B7280',
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1F2937',
  },
  textInputError: {
    borderColor: '#EF4444',
  },
  multilineTextInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderColor: '#2563EB',
  },
  categoryChipUnselected: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  categoryTextSelected: {
    color: '#2563EB',
  },
  categoryTextUnselected: {
    color: '#374151',
  },
  priceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priceInputWrapper: {
    flex: 1,
  },
  priceInputWrapperLeft: {
    marginRight: 8,
  },
  priceInputWrapperRight: {
    marginLeft: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTagInput: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  itemListContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  itemListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemListItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 8,
  },
  itemText: {
    color: '#374151',
  },
  tagListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#374151',
    marginRight: 4,
  },
  tagListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyListText: {
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

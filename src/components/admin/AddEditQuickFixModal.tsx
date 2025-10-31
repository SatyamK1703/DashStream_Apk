import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as ImagePicker from 'expo-image-picker';
import { useCreateQuickFix, useUpdateQuickFix } from '../../hooks/useQuickFixes';
import httpClient from '../../services/httpClient';

interface QuickFixFormData {
  _id?: string;
  label: string;
  image: string;
  isActive?: boolean;
}

interface AddEditQuickFixModalProps {
  visible: boolean;
  isEditing: boolean;
  formData: QuickFixFormData;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEditQuickFixModal: React.FC<AddEditQuickFixModalProps> = ({
  visible,
  isEditing,
  formData: initialFormData,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<QuickFixFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof QuickFixFormData, string>>>({});

  const { execute: createQuickFix, loading: isCreating } = useCreateQuickFix();
  const { execute: updateQuickFix, loading: isUpdating } = useUpdateQuickFix();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    setFormData(initialFormData);
    setFormErrors({});
  }, [visible, initialFormData]);

  const updateFormData = (key: keyof QuickFixFormData, value: any) => {
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
        name: 'quickfix-image.jpg',
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
      const localUri = result.assets[0].uri;
      updateFormData('image', localUri);

      try {
        const uploadedUri = await uploadImage(localUri);
        updateFormData('image', uploadedUri);
      } catch (error) {
        console.warn('Background image upload failed:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof QuickFixFormData, string>> = {};
    if (!formData.label.trim()) newErrors.label = 'Label is required';
    if (!formData.image.trim()) newErrors.image = 'Image is required';
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return;

    try {
      const { _id, ...data } = formData;
      if (isEditing && _id) {
        await updateQuickFix({ id: _id, data });
        Alert.alert('Success', 'Quick fix updated successfully!');
      } else {
        await createQuickFix(data);
        Alert.alert('Success', 'Quick fix created successfully!');
      }
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Quick fix submission error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView edges={['bottom']} style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>{isEditing ? 'Edit Quick Fix' : 'Add Quick Fix'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>

            <KeyboardAwareScrollView
              contentContainerStyle={styles.scrollContent}
              enableOnAndroid
              extraScrollHeight={20}
              keyboardShouldPersistTaps="handled">
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Image *</Text>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                  {formData.image ? (
                    <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePickerPlaceholder}>
                      <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                      <Text style={styles.imagePickerText}>Tap to select image</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {formErrors.image && <Text style={styles.errorText}>{formErrors.image}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Label *</Text>
                <TextInput
                  style={[styles.textInput, formErrors.label && styles.textInputError]}
                  placeholder="Enter quick fix label"
                  value={formData.label}
                  onChangeText={(value) => updateFormData('label', value)}
                />
                {formErrors.label && <Text style={styles.errorText}>{formErrors.label}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.label}>Active</Text>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => updateFormData('isActive', value)}
                  />
                </View>
              </View>

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
                    {isEditing ? 'Update Quick Fix' : 'Add Quick Fix'}
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
  errorText: {
    color: '#D9534F',
    fontSize: 12,
    marginTop: 6,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
});

export default AddEditQuickFixModal;

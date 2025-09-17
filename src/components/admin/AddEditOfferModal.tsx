import React, { useState,useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';


import { useCreateOffer, useUpdateOffer } from '../../hooks/adminOffers';
import httpClient from '../../services/httpClient';

interface ImageField {
  localUri: string | null;
  remoteUrl?: string;
  isUploading: boolean;
}

interface AddEditOfferModalProps {
  visible: boolean;
  isEditing: boolean;
  formData?: any;
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEditOfferModal: React.FC<AddEditOfferModalProps> = ({
  visible,
  isEditing,
  formData,
  onClose,
  onSuccess,
}) => {
  // const [offerForm, setOfferForm] = useState({
  //   title: formData?.title || '',
  //   description: formData?.description || '',
  //   discount: formData?.discount?.toString() || '',
  //   discountType: formData?.discountType || 'percentage',
  //   validFrom: formData?.validFrom ? new Date(formData.validFrom) : new Date(),
  //   validUntil: formData?.validUntil ? new Date(formData.validUntil) : new Date(),
  //   offerCode: formData?.offerCode || '',
  //   minOrderAmount: formData?.minOrderAmount?.toString() || '0',
  //   maxDiscountAmount: formData?.maxDiscountAmount?.toString() || '',
  //   isPromo: formData?.isPromo || false,
  //   isActive: formData?.isActive ?? true,
  //   terms: formData?.terms || '',
  //   image: formData?.image
  //     ? { localUri: formData.image, remoteUrl: formData.image, isUploading: false }
  //     : { localUri: null, isUploading: false },
  // });
  const [offerForm, setOfferForm] = useState({
  title: '',
  description: '',
  discount: '',
  discountType: 'percentage',
  validFrom: new Date(),
  validUntil: new Date(),
  offerCode: '',
  minOrderAmount: '0',
  maxDiscountAmount: '',
  isPromo: false,
  isActive: true,
  terms: '',
  image: { localUri: null, isUploading: false },
});

useEffect(() => {
  if (visible) {
    if (isEditing && formData) {
      setOfferForm({
        title: formData?.title || '',
        description: formData?.description || '',
        discount: formData?.discount?.toString() || '',
        discountType: formData?.discountType || 'percentage',
        validFrom: formData?.validFrom ? new Date(formData.validFrom) : new Date(),
        validUntil: formData?.validUntil ? new Date(formData.validUntil) : new Date(),
        offerCode: formData?.offerCode || '',
        minOrderAmount: formData?.minOrderAmount?.toString() || '0',
        maxDiscountAmount: formData?.maxDiscountAmount?.toString() || '',
        isPromo: formData?.isPromo || false,
        isActive: formData?.isActive ?? true,
        terms: formData?.terms || '',
        image: formData?.image
          ? { localUri: formData.image, remoteUrl: formData.image, isUploading: false }
          : { localUri: null, isUploading: false },
      });
    } else {
      // reset to blank when adding new
      setOfferForm({
        title: '',
        description: '',
        discount: '',
        discountType: 'percentage',
        validFrom: new Date(),
        validUntil: new Date(),
        offerCode: '',
        minOrderAmount: '0',
        maxDiscountAmount: '',
        isPromo: false,
        isActive: true,
        terms: '',
        image: { localUri: null, isUploading: false },
      });
    }
  }
}, [visible, isEditing, formData]);

  const { execute: createOffer, loading: createLoading } = useCreateOffer();
  const { execute: updateOffer, loading: updateLoading } = useUpdateOffer();

  const updateForm = (field: string, value: any) => {
    setOfferForm((prev) => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const compressed = await ImageManipulator.manipulateAsync(uri, [], { compress: 0.7 });
    const fileType = uri.split('.').pop() || 'jpg';

    const form = new FormData();
    form.append('image', {
      uri: compressed.uri,
      type: `image/${fileType}`,
      name: `offer-image.${fileType}`,
    } as any);

    const response = await httpClient.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data?.url || response.data.url;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera roll access is needed to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      updateForm('image', { localUri, isUploading: true });

      try {
        const remoteUrl = await uploadImage(localUri);
        updateForm('image', { localUri, remoteUrl, isUploading: false });
      } catch (error) {
        console.error('Image upload failed:', error);
        Alert.alert('Upload failed', 'Could not upload image. Please try again.');
        updateForm('image', { localUri, isUploading: false });
      }
    }
  };

  const ensureUploaded = async (field: ImageField): Promise<string | null> => {
    if (field.remoteUrl) return field.remoteUrl;
    if (field.localUri && !field.remoteUrl) return await uploadImage(field.localUri);
    return null;
  };

  const handleSubmit = async () => {
    try {
      if (!offerForm.title || !offerForm.description) {
        Alert.alert('Validation', 'Title and description are required');
        return;
      }
      if (offerForm.isPromo && !offerForm.offerCode) {
        Alert.alert('Validation', 'Promo offers must have an offer code');
        return;
      }
      if (offerForm.image.isUploading) {
        Alert.alert('Please wait', 'Image is still uploading.');
        return;
      }

      const imageUrl = offerForm.image.localUri
        ? await ensureUploaded(offerForm.image)
        : null;

      const payload = {
        ...offerForm,
        image: imageUrl,
        discount: Number(offerForm.discount),
        minOrderAmount: Number(offerForm.minOrderAmount),
        maxDiscountAmount: offerForm.maxDiscountAmount
          ? Number(offerForm.maxDiscountAmount)
          : null,
      };

      if (isEditing && formData?._id) {
        await updateOffer(formData._id, payload);
        Alert.alert('Success', 'Offer updated successfully');
      } else {
        await createOffer(payload);
        Alert.alert('Success', 'Offer created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Offer save error:', err);
      Alert.alert('Error', 'Failed to save offer');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Offer' : 'Add Offer'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.textInput}
                value={offerForm.title}
                onChangeText={(v) => updateForm('title', v)}
                placeholder="Enter offer title"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.multiline]}
                multiline
                value={offerForm.description}
                onChangeText={(v) => updateForm('description', v)}
                placeholder="Enter offer description"
              />
            </View>

            {/* Image Upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Offer Image</Text>
              {offerForm.image.localUri && (
                <View>
                  <Image
                    source={{ uri: offerForm.image.localUri }}
                    style={{
                      width: '100%',
                      height: 150,
                      borderRadius: 10,
                      marginBottom: 8,
                    }}
                    resizeMode="cover"
                  />
                  {offerForm.image.isUploading && (
                    <ActivityIndicator
                      style={{ position: 'absolute', top: '45%', left: '45%' }}
                      size="large"
                      color="#2563EB"
                    />
                  )}
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  offerForm.image.isUploading && { opacity: 0.6 },
                ]}
                onPress={pickImage}
                disabled={offerForm.image.isUploading}
              >
                <Text style={styles.uploadButtonText}>
                  {offerForm.image.localUri ? 'Change Image' : 'Upload Image'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Discount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Discount *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={offerForm.discount}
                onChangeText={(v) => updateForm('discount', v)}
                placeholder="e.g. 20"
              />
            </View>

            {/* Discount Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Discount Type</Text>
              <View style={styles.row}>
                {['percentage', 'fixed'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      offerForm.discountType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => updateForm('discountType', type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        offerForm.discountType === type &&
                          styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Validity */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valid From</Text>
              <DateTimePicker
                value={offerForm.validFrom}
                mode="date"
                onChange={(_, date) => date && updateForm('validFrom', date)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valid Until</Text>
              <DateTimePicker
                value={offerForm.validUntil}
                mode="date"
                onChange={(_, date) => date && updateForm('validUntil', date)}
              />
            </View>

            {/* Promo Toggle */}
            <View style={styles.inputGroupRow}>
              <Text style={styles.label}>Promo Offer</Text>
              <Switch
                value={offerForm.isPromo}
                onValueChange={(val) => updateForm('isPromo', val)}
              />
            </View>

            {/* Offer Code if Promo */}
            {offerForm.isPromo && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Offer Code *</Text>
                <TextInput
                  style={styles.textInput}
                  value={offerForm.offerCode}
                  onChangeText={(v) => updateForm('offerCode', v.toUpperCase())}
                  placeholder="Enter promo code"
                />
              </View>
            )}

            {/* Active Toggle */}
            <View style={styles.inputGroupRow}>
              <Text style={styles.label}>Active</Text>
              <Switch
                value={offerForm.isActive}
                onValueChange={(val) => updateForm('isActive', val)}
              />
            </View>

            {/* Terms */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Terms</Text>
              <TextInput
                style={[styles.textInput, styles.multiline]}
                multiline
                value={offerForm.terms}
                onChangeText={(v) => updateForm('terms', v)}
                placeholder="Add terms & conditions"
              />
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (createLoading || updateLoading || offerForm.image.isUploading) && {
                  opacity: 0.7,
                },
              ]}
              onPress={handleSubmit}
              disabled={createLoading || updateLoading || offerForm.image.isUploading}
            >
              <Text style={styles.submitButtonText}>
                {createLoading || updateLoading
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Offer'
                  : 'Add Offer'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddEditOfferModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputGroupRow: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },
  uploadButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeButtonActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#2563EB',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

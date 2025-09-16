import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { useCreateOffer, useUpdateOffer } from '../../hooks/adminOffers';
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
  onSuccess
}) => {
  const [offerForm, setOfferForm] = useState({
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
    terms: formData?.terms || '',
  });

  const { execute: createOffer, loading: createLoading } = useCreateOffer();
  const { execute: updateOffer, loading: updateLoading } = useUpdateOffer();

  const updateForm = (field: string, value: any) => {
    setOfferForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!offerForm.title || !offerForm.description) {
        Alert.alert('Validation', 'Title and description are required');
        return;
      }

      const payload = {
        ...offerForm,
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
      <View style={styles.overlay}>
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

          <ScrollView contentContainerStyle={styles.scrollContent}>
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
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={createLoading || updateLoading}
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
      </View>
    </Modal>
  );
};

export default AddEditOfferModal;
export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  scrollContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#444',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#444',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

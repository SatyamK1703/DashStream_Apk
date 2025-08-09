import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// or 'react-native-vector-icons/Ionicons'

interface Props {
  visible: boolean;
  isEditing: boolean;
  formData: any;
  formErrors: any;
  newFeature: string;
  newTag: string;
  categories: any[];
  onClose: () => void;
  pickImage: () => void;
  updateFormData: (field: string, value: any) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
  addTag: () => void;
  removeTag: (index: number) => void;
  handleSubmitForm: () => void;
}

const ServiceFormModal: React.FC<Props> = ({
  visible,
  isEditing,
  formData,
  formErrors,
  newFeature,
  newTag,
  categories,
  onClose,
  pickImage,
  updateFormData,
  addFeature,
  removeFeature,
  addTag,
  removeTag,
  handleSubmitForm,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Service' : 'Add New Service'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <FlatList
            data={[1]}
            keyExtractor={() => 'form'}
            renderItem={() => (
              <View style={styles.formContainer}>
                {/* IMAGE PICKER */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Service Image <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity onPress={pickImage} style={styles.imageBox}>
                    {formData.image ? (
                      <Image source={{ uri: formData.image }} style={styles.image} />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                        <Text style={styles.placeholderText}>Tap to select image</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {formErrors.image && <Text style={styles.error}>{formErrors.image}</Text>}
                </View>

                {/* NAME */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Service Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, formErrors.name && styles.inputError]}
                    value={formData.name}
                    placeholder="Enter service name"
                    onChangeText={(value) => updateFormData('name', value)}
                  />
                  {formErrors.name && <Text style={styles.error}>{formErrors.name}</Text>}
                </View>

                {/* ... continue with other fields just like the above pattern ... */}

                {/* SUBMIT */}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmitForm}>
                  <Text style={styles.submitText}>{isEditing ? 'Update Service' : 'Add Service'}</Text>
                </TouchableOpacity>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </View>
    </Modal>
  );
};

export default ServiceFormModal;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  imageBox: {
    height: 192,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTestimonials, useCreateTestimonial, useDeleteTestimonial } from '../../hooks';
import httpClient from '../../services/httpClient';

interface ImageField {
  localUri: string | null;
  remoteUrl?: string;
  isUploading: boolean;
}

const AdminInstagramScreen = () => {
  const navigation = useNavigation();

  const { data: testimonialsData, loading, refresh } = useTestimonials();
  const { execute: createTestimonial } = useCreateTestimonial();
  const { execute: deleteTestimonial } = useDeleteTestimonial();

  const testimonials = testimonialsData?.data || [];

  const [newTestimonial, setNewTestimonial] = useState({
    name: '',
    instagramUrl: '',
    thumbnail: { localUri: null, remoteUrl: '', isUploading: false } as ImageField,
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!newTestimonial.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!newTestimonial.instagramUrl.trim()) {
      newErrors.instagramUrl = 'Instagram URL is required';
    } else if (!newTestimonial.instagramUrl.includes('instagram.com')) {
      newErrors.instagramUrl = 'Please enter a valid Instagram URL';
    }

    if (!newTestimonial.thumbnail.remoteUrl && !newTestimonial.thumbnail.localUri) {
      newErrors.thumbnail = 'Thumbnail is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      setNewTestimonial(prev => ({
        ...prev,
        thumbnail: { localUri, remoteUrl: '', isUploading: false }
      }));
      if (errors.thumbnail) setErrors({ ...errors, thumbnail: '' });
    }
  };

  const handleAddTestimonial = async () => {
    if (!validateForm()) {
      return;
    }
    if (!newTestimonial.name || !newTestimonial.instagramUrl || !newTestimonial.thumbnail.localUri) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      // Create FormData for submission
      const formData = new FormData();
      formData.append('name', newTestimonial.name.trim());
      formData.append('instagramUrl', newTestimonial.instagramUrl.trim());

      // Add the compressed image file
      if (newTestimonial.thumbnail.localUri) {
        const compressed = await ImageManipulator.manipulateAsync(newTestimonial.thumbnail.localUri, [], { compress: 0.7 });
        const fileType = newTestimonial.thumbnail.localUri.split('.').pop() || 'jpg';
        formData.append('thumbnail', {
          uri: compressed.uri,
          type: `image/${fileType}`,
          name: `testimonial-thumbnail.${fileType}`,
        } as any);
      }

      await createTestimonial(formData);
      setNewTestimonial({
        name: '',
        instagramUrl: '',
        thumbnail: { localUri: null, remoteUrl: '', isUploading: false }
      });
      refresh(); // Refresh the list
      Alert.alert('Success', 'Testimonial added successfully');
    } catch (error) {
      console.error('Error adding testimonial:', error);
      Alert.alert('Error', error?.message || 'Failed to add testimonial');
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this testimonial?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTestimonial(id);
            refresh();
            Alert.alert('Success', 'Testimonial deleted successfully');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete testimonial');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Instagram Testimonials</Text>
        <View />
      </View>

      <ScrollView style={styles.content}>
        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text>Loading testimonials...</Text>
          </View>
        )}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Add New Testimonial</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            placeholder="Customer Name"
            value={newTestimonial.name}
            onChangeText={(text) => {
              setNewTestimonial({ ...newTestimonial, name: text });
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          <TextInput
            style={[styles.input, errors.instagramUrl && styles.inputError]}
            placeholder="Instagram Post URL"
            value={newTestimonial.instagramUrl}
            onChangeText={(text) => {
              setNewTestimonial({ ...newTestimonial, instagramUrl: text });
              if (errors.instagramUrl) setErrors({ ...errors, instagramUrl: '' });
            }}
          />
          {errors.instagramUrl && <Text style={styles.errorText}>{errors.instagramUrl}</Text>}
           <View style={styles.thumbnailContainer}>
             <Text style={styles.thumbnailLabel}>Thumbnail Image</Text>
             <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
               {newTestimonial.thumbnail.localUri ? (
                 <Image source={{ uri: newTestimonial.thumbnail.localUri }} style={styles.thumbnailPreview} />
               ) : (
                 <View style={styles.imagePickerPlaceholder}>
                   <Ionicons name="camera" size={24} color="#666" />
                   <Text style={styles.imagePickerText}>Select Image</Text>
                 </View>
               )}
             </TouchableOpacity>
             {errors.thumbnail && <Text style={styles.errorText}>{errors.thumbnail}</Text>}
           </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTestimonial}>
            <Text style={styles.addButtonText}>Add Testimonial</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.list}>
          <Text style={styles.sectionTitle}>Existing Testimonials</Text>
          {testimonials.map((item) => (
            <View key={item.id} style={styles.testimonialItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUrl} numberOfLines={1}>{item.instagramUrl}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteTestimonial(item.id)}>
                <Ionicons name="trash" size={20} color="#E53935" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#2D3748' },
  content: { flex: 1 },
  form: { padding: 16, backgroundColor: '#fff', margin: 16, borderRadius: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
   addButton: {
     backgroundColor: '#2563EB',
     padding: 12,
     borderRadius: 8,
     alignItems: 'center',
   },
   addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
   thumbnailContainer: { marginBottom: 12 },
   thumbnailLabel: { fontSize: 16, color: '#2D3748', marginBottom: 8 },
   imagePicker: {
     borderWidth: 1,
     borderColor: '#E2E8F0',
     borderRadius: 8,
     height: 120,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#F8FAFC',
     position: 'relative',
   },
   imagePickerPlaceholder: { alignItems: 'center' },
   imagePickerText: { color: '#666', marginTop: 8 },
   thumbnailPreview: { width: '100%', height: '100%', borderRadius: 8 },

  list: { padding: 16 },
  testimonialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  itemUrl: { fontSize: 14, color: '#718096', marginTop: 4 },
  loading: { padding: 20, alignItems: 'center' },
});

export default AdminInstagramScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

// Mock types for self-contained component
type ProStackParamList = {
  ProVerification: undefined;
};

type ProVerificationScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface VerificationDocument {
  id: string;
  type: 'id' | 'address' | 'license' | 'selfie';
  status: 'pending' | 'verified' | 'rejected' | 'not_uploaded';
  uploadDate?: string;
  rejectionReason?: string;
  imageUri?: string;
}

const ProVerificationScreen = () => {
  const navigation = useNavigation<ProVerificationScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);

  useEffect(() => {
    const mockDocs: VerificationDocument[] = [
      { id: '1', type: 'id', status: 'verified', uploadDate: '2023-10-15', imageUri: 'https://placehold.co/600x400/a7f3d0/14532d?text=ID+Proof' },
      { id: '2', type: 'address', status: 'pending', uploadDate: '2023-10-15', imageUri: 'https://placehold.co/600x400/fef3c7/92400e?text=Address+Proof' },
      { id: '3', type: 'license', status: 'rejected', uploadDate: '2023-10-10', rejectionReason: 'Image is blurry. Please upload a clearer one.', imageUri: 'https://placehold.co/600x400/fee2e2/991b1b?text=License' },
      { id: '4', type: 'selfie', status: 'not_uploaded' },
    ];
    setTimeout(() => {
      setDocuments(mockDocs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getDocumentTypeName = (type: VerificationDocument['type']) => ({
    id: 'Identity Proof',
    address: 'Address Proof',
    license: 'Driving License',
    selfie: 'Selfie with ID',
  }[type]);

  const handleUploadDocument = async (documentId: string) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to upload documents.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocuments(prev => prev.map(doc => doc.id === documentId ? { ...doc, imageUri: result.assets[0].uri, status: 'pending', rejectionReason: undefined } : doc));
    }
  };

  const handleSubmitVerification = () => {
    if (documents.some(doc => doc.status === 'not_uploaded')) {
      Alert.alert('Missing Documents', 'Please upload all required documents before submitting.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert('Verification Submitted', 'Your documents are under review. This may take 1-2 business days.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading verification status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>Why Verification?</Text>
            <Text style={styles.infoText}>Verification builds trust with customers and ensures the quality of our professional network.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Required Documents</Text>
        {documents.map(doc => {
          const statusInfo = {
            verified: { text: 'Verified', color: colors.green600, icon: 'verified' },
            pending: { text: 'Pending', color: colors.amber600, icon: 'pending' },
            rejected: { text: 'Rejected', color: colors.red600, icon: 'error' },
            not_uploaded: { text: 'Not Uploaded', color: colors.gray500, icon: 'upload-file' },
          }[doc.status];

          return (
            <View key={doc.id} style={styles.card}>
              <View style={styles.docHeader}>
                <Text style={styles.docTitle}>{getDocumentTypeName(doc.type)}</Text>
                <View style={styles.statusBadge}>
                  <MaterialIcons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
                </View>
              </View>
              {doc.rejectionReason && (
                <View style={styles.rejectionReasonContainer}>
                  <Text style={styles.rejectionReasonText}><Text style={{ fontWeight: 'bold' }}>Reason: </Text>{doc.rejectionReason}</Text>
                </View>
              )}
              {doc.imageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: doc.imageUri }} style={styles.docImage} resizeMode="cover" />
                  <TouchableOpacity style={styles.reuploadButton} onPress={() => handleUploadDocument(doc.id)}>
                    <Ionicons name="refresh" size={16} color={colors.primary} />
                    <Text style={styles.reuploadButtonText}>Re-upload</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadPlaceholder} onPress={() => handleUploadDocument(doc.id)}>
                  <Ionicons name="cloud-upload-outline" size={28} color={colors.gray600} />
                  <Text style={styles.uploadPlaceholderText}>Tap to upload document</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} onPress={handleSubmitVerification} disabled={isSubmitting}>
          {isSubmitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitButtonText}>Submit for Verification</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB',
  gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937',
  green100: '#D1FAE5', green600: '#059669', red50: '#FEF2F2', red100: '#FEE2E2', red600: '#DC2626',
  amber100: '#FEF3C7', amber600: '#D97706',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray600, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  infoCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  infoTextContainer: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray800 },
  infoText: { color: colors.gray600, marginTop: 4, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.gray800, marginTop: 24, marginBottom: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  docTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray800, flex: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 4, fontWeight: '500' },
  rejectionReasonContainer: { marginTop: 8, padding: 12, backgroundColor: colors.red50, borderRadius: 8 },
  rejectionReasonText: { color: colors.red600 },
  imageContainer: { marginTop: 12 },
  docImage: { width: '100%', height: 180, borderRadius: 8 },
  reuploadButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-end', marginTop: 12 },
  reuploadButtonText: { color: colors.primary, fontWeight: '500', marginLeft: 8 },
  uploadPlaceholder: { marginTop: 12, paddingVertical: 40, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.gray300, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  uploadPlaceholderText: { color: colors.gray600, marginTop: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
  submitButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  submitButtonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  submitButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default ProVerificationScreen;

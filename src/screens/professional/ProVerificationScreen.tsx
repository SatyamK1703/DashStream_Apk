import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProVerificationScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface VerificationDocument {
  id: string;
  type: 'id' | 'address' | 'license' | 'selfie';
  status: 'pending' | 'verified' | 'rejected' | 'not_uploaded';
  uploadDate?: string;
  verificationDate?: string;
  rejectionReason?: string;
  imageUri?: string;
}

const ProVerificationScreen = () => {
  const navigation = useNavigation<ProVerificationScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock verification status
  const [verificationStatus, setVerificationStatus] = useState<
    'not_started' | 'in_progress' | 'verified' | 'rejected'
  >('in_progress');
  
  // Mock documents data
  const [documents, setDocuments] = useState<VerificationDocument[]>([
    {
      id: '1',
      type: 'id',
      status: 'verified',
      uploadDate: '2023-10-15',
      verificationDate: '2023-10-17',
      imageUri: 'https://example.com/id-card.jpg' // This would be a local URI in a real app
    },
    {
      id: '2',
      type: 'address',
      status: 'pending',
      uploadDate: '2023-10-15',
      imageUri: 'https://example.com/address-proof.jpg'
    },
    {
      id: '3',
      type: 'license',
      status: 'rejected',
      uploadDate: '2023-10-10',
      rejectionReason: 'Document is not clearly visible. Please upload a clearer image.',
      imageUri: 'https://example.com/license.jpg'
    },
    {
      id: '4',
      type: 'selfie',
      status: 'not_uploaded'
    }
  ]);
  
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Request camera and media library permissions
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'Camera and media library permissions are needed for document verification.',
            [{ text: 'OK' }]
          );
        }
      }
    })();
  }, []);
  
  // Calculate overall verification status based on documents
  useEffect(() => {
    const allDocuments = documents.length;
    const uploadedDocuments = documents.filter(doc => doc.status !== 'not_uploaded').length;
    const verifiedDocuments = documents.filter(doc => doc.status === 'verified').length;
    const rejectedDocuments = documents.filter(doc => doc.status === 'rejected').length;
    
    if (uploadedDocuments === 0) {
      setVerificationStatus('not_started');
    } else if (verifiedDocuments === allDocuments) {
      setVerificationStatus('verified');
    } else if (rejectedDocuments > 0) {
      setVerificationStatus('rejected');
    } else {
      setVerificationStatus('in_progress');
    }
  }, [documents]);
  
  const getDocumentTypeName = (type: VerificationDocument['type']) => {
    switch (type) {
      case 'id': return 'Identity Proof';
      case 'address': return 'Address Proof';
      case 'license': return 'Driving License';
      case 'selfie': return 'Selfie with ID';
      default: return '';
    }
  };
  
  const getDocumentTypeDescription = (type: VerificationDocument['type']) => {
    switch (type) {
      case 'id': 
        return 'Upload your Aadhaar card, PAN card, Voter ID, or Passport';
      case 'address': 
        return 'Upload utility bill, bank statement, or rental agreement';
      case 'license': 
        return 'Upload your valid driving license (front and back)';
      case 'selfie': 
        return 'Take a selfie holding your ID card for verification';
      default: 
        return '';
    }
  };
  
  const getDocumentStatusColor = (status: VerificationDocument['status']) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'pending': return 'text-amber-600';
      case 'rejected': return 'text-red-600';
      case 'not_uploaded': return 'text-gray-500';
      default: return 'text-gray-600';
    }
  };
  
  const getDocumentStatusIcon = (status: VerificationDocument['status']) => {
    switch (status) {
      case 'verified':
        return <MaterialIcons name="verified" size={16} color="#10B981" />;
      case 'pending':
        return <MaterialIcons name="pending" size={16} color="#F59E0B" />;
      case 'rejected':
        return <MaterialIcons name="error" size={16} color="#EF4444" />;
      case 'not_uploaded':
        return <MaterialIcons name="upload-file" size={16} color="#6B7280" />;
      default:
        return null;
    }
  };
  
  const getVerificationStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <View className="flex-row items-center bg-green-100 px-3 py-1 rounded-full">
            <MaterialIcons name="verified" size={16} color="#10B981" />
            <Text className="text-green-600 font-medium ml-1">Verified</Text>
          </View>
        );
      case 'in_progress':
        return (
          <View className="flex-row items-center bg-amber-100 px-3 py-1 rounded-full">
            <MaterialIcons name="pending" size={16} color="#F59E0B" />
            <Text className="text-amber-600 font-medium ml-1">In Progress</Text>
          </View>
        );
      case 'rejected':
        return (
          <View className="flex-row items-center bg-red-100 px-3 py-1 rounded-full">
            <MaterialIcons name="error" size={16} color="#EF4444" />
            <Text className="text-red-600 font-medium ml-1">Action Required</Text>
          </View>
        );
      case 'not_started':
        return (
          <View className="flex-row items-center bg-gray-100 px-3 py-1 rounded-full">
            <MaterialIcons name="info" size={16} color="#6B7280" />
            <Text className="text-gray-600 font-medium ml-1">Not Started</Text>
          </View>
        );
      default:
        return null;
    }
  };
  
  const handleUploadDocument = async (documentId: string) => {
    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    };
    
    Alert.alert(
      'Upload Document',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchCameraAsync(options);
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                updateDocumentImage(documentId, result.assets[0].uri);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to take photo. Please try again.');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync(options);
              
              if (!result.canceled && result.assets && result.assets.length > 0) {
                updateDocumentImage(documentId, result.assets[0].uri);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to pick image. Please try again.');
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };
  
  const updateDocumentImage = (documentId: string, imageUri: string) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              imageUri, 
              status: 'pending', 
              uploadDate: new Date().toISOString().split('T')[0],
              rejectionReason: undefined
            } 
          : doc
      )
    );
  };
  
  const handleSubmitVerification = () => {
    const notUploadedDocs = documents.filter(doc => doc.status === 'not_uploaded');
    
    if (notUploadedDocs.length > 0) {
      const docNames = notUploadedDocs.map(doc => getDocumentTypeName(doc.type)).join(', ');
      Alert.alert(
        'Missing Documents',
        `Please upload all required documents: ${docNames}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Verification Submitted',
        'Your documents have been submitted for verification. This process typically takes 1-2 business days.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading verification status...</Text>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Verification</Text>
          {getVerificationStatusBadge()}
        </View>
      </View>
      
      {/* Info Card */}
      <View className="bg-white mx-4 rounded-xl shadow-sm p-4 -mt-2">
        <View className="flex-row items-start">
          <MaterialCommunityIcons name="shield-check" size={24} color="#2563EB" />
          <View className="ml-3 flex-1">
            <Text className="text-gray-800 font-bold text-lg">Why Verification?</Text>
            <Text className="text-gray-600 mt-1">
              Verification helps build trust with customers and ensures the quality of our professional network. Verified professionals receive more job opportunities and higher ratings.
            </Text>
          </View>
        </View>
      </View>
      
      <ScrollView className="flex-1 mx-4 mt-4 mb-20">
        {/* Documents Section */}
        <Text className="text-gray-800 font-bold text-lg mb-2">Required Documents</Text>
        
        {documents.map((document) => (
          <View 
            key={document.id}
            className="bg-white rounded-xl shadow-sm p-4 mb-4"
          >
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-gray-800 font-bold">{getDocumentTypeName(document.type)}</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {getDocumentTypeDescription(document.type)}
                </Text>
              </View>
              
              <View className="flex-row items-center">
                {getDocumentStatusIcon(document.status)}
                <Text className={`ml-1 ${getDocumentStatusColor(document.status)}`}>
                  {document.status.charAt(0).toUpperCase() + document.status.slice(1).replace('_', ' ')}
                </Text>
              </View>
            </View>
            
            {document.status === 'rejected' && document.rejectionReason && (
              <View className="mt-2 p-3 bg-red-50 rounded-lg">
                <Text className="text-red-600 text-sm">
                  <Text className="font-bold">Reason: </Text>
                  {document.rejectionReason}
                </Text>
              </View>
            )}
            
            {document.imageUri ? (
              <View className="mt-3">
                <Image 
                  source={{ uri: document.imageUri }}
                  className="w-full h-48 rounded-lg"
                  resizeMode="cover"
                />
                
                <View className="flex-row justify-between items-center mt-3">
                  {document.uploadDate && (
                    <Text className="text-gray-500 text-sm">
                      Uploaded: {new Date(document.uploadDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  )}
                  
                  <TouchableOpacity 
                    className="flex-row items-center bg-primary/10 px-3 py-1.5 rounded-lg"
                    onPress={() => handleUploadDocument(document.id)}
                  >
                    <Ionicons name="refresh" size={16} color="#2563EB" />
                    <Text className="text-primary font-medium ml-1 text-sm">Re-upload</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                className="mt-3 py-3 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                onPress={() => handleUploadDocument(document.id)}
              >
                <Ionicons name="cloud-upload-outline" size={28} color="#6B7280" />
                <Text className="text-gray-600 mt-2">Tap to upload document</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {/* Verification Process */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-3">Verification Process</Text>
          
          <View className="flex-row mb-4">
            <View className="items-center mr-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold">1</Text>
              </View>
              <View className="w-1 h-16 bg-gray-200 mt-1" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Upload Documents</Text>
              <Text className="text-gray-600 mt-1">
                Upload clear photos of all required documents. Ensure all information is clearly visible.
              </Text>
            </View>
          </View>
          
          <View className="flex-row mb-4">
            <View className="items-center mr-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold">2</Text>
              </View>
              <View className="w-1 h-16 bg-gray-200 mt-1" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Verification Review</Text>
              <Text className="text-gray-600 mt-1">
                Our team will review your documents within 1-2 business days. You'll be notified once the review is complete.
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="items-center mr-3">
              <View className="w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-white font-bold">3</Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 font-medium">Start Working</Text>
              <Text className="text-gray-600 mt-1">
                Once verified, you can start accepting jobs. Your verified status will be displayed to customers.
              </Text>
            </View>
          </View>
        </View>
        
        {/* Privacy Notice */}
        <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <Text className="text-gray-800 font-bold text-lg mb-2">Privacy Notice</Text>
          <Text className="text-gray-600">
            Your documents are securely stored and only used for verification purposes. We follow strict data protection protocols and never share your personal information with third parties.
          </Text>
        </View>
      </ScrollView>
      
      {/* Submit Button */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity 
          className={`py-3 rounded-lg items-center ${isSubmitting ? 'bg-primary/70' : 'bg-primary'}`}
          onPress={handleSubmitVerification}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white font-medium">
              {verificationStatus === 'not_started' || verificationStatus === 'rejected' 
                ? 'Submit for Verification' 
                : 'Update Verification'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProVerificationScreen;
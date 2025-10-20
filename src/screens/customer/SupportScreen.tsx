import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Changed import
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Assuming these are defined elsewhere in your project
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../store';
type SupportScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;
type SupportOption = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap; // Use keyof for type safety
  description: string;
  action: 'call' | 'email' | 'chat' | 'faq';
  value: string;
};

import { useSupportStore } from '../../store/useSupportStore';

const SupportScreen = () => {
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [message, setMessage] = useState('');
  const { submitting, submitQuestion } = useSupportStore();
  const [submitted, setSubmitted] = useState(false);

  // Animation for the success message
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const supportOptions: SupportOption[] = [
    { id: '1', title: 'Call Us', icon: 'call-outline', description: 'Speak with our team', action: 'call', value: '+919876543210' },
    { id: '2', title: 'Email Us', icon: 'mail-open-outline', description: 'Get a response soon', action: 'email', value: 'support@example.com' },
    { id: '3', title: 'Live Chat', icon: 'chatbubbles-outline', description: 'Chat in real-time', action: 'chat', value: 'chat' },
    { id: '4', title: 'Visit FAQ', icon: 'help-circle-outline', description: 'Find quick answers', action: 'faq', value: 'faq' }
  ];

  const issueTypes = [
    { id: 'booking', label: 'Booking' },
    { id: 'payment', label: 'Payment' },
    { id: 'service', label: 'Service Quality' },
    { id: 'app', label: 'App Issues' },
    { id: 'professional', label: 'Professional' },
    { id: 'other', label: 'Other' },
  ];

  const showSuccessMessage = () => {
    setSubmitted(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setSubmitted(false);
        setSelectedIssue('');
        setMessage('');
      });
    }, 3000);
  };

  const handleSupportOptionPress = (option: SupportOption) => {
    switch (option.action) {
      case 'call':
        const phoneNumber = `tel:${option.value}`;
        Linking.canOpenURL(phoneNumber)
          .then(supported => {
            if (supported) {
              Linking.openURL(phoneNumber);
            } else {
              // You can use a custom modal here instead of Alert
              console.log('Phone number is not available');
            }
          })
          .catch(err => console.error('An error occurred', err));
        break;
      case 'email':
        const emailUrl = `mailto:${option.value}?subject=Support Request - ${user?.name || 'Customer'}&body=User ID: ${user?.id || 'Not available'}\n\nIssue: ${selectedIssue}\n\nDetails:\n${message}`;
        Linking.openURL(emailUrl);
        break;
      case 'chat':
        // Replace with navigation to a real chat screen
        console.log('Live Chat Pressed');
        break;
      case 'faq':
        navigation.navigate('FAQ');
        break;
    }
  };

  const handleSubmit = async () => {
    if (!selectedIssue || !message.trim()) {
      console.log('Validation failed');
      return;
    }

    try {
      await submitQuestion({ issueType: selectedIssue, message });
      showSuccessMessage();
    } catch (error) {
      // The store will handle the error state, but you might want to show an alert here
      console.error('Failed to submit question:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}> {/* Added edges prop for better control */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={26} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Support Center</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Support Options */}
            <Text style={styles.sectionTitle}>How can we help you?</Text>
            <View style={styles.optionGrid}>
              {supportOptions.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() => handleSupportOptionPress(option)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.optionIconWrapper, {backgroundColor: '#e0e7ff'}]}>
                    <Ionicons name={option.icon} size={28} color="#2563eb" />
                  </View>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Contact Form */}
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Send us a message </Text>
              {submitted ? (
                <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
                  <Ionicons name="checkmark-circle" size={56} color="#10b981" />
                  <Text style={styles.successTitle}>Message Sent!</Text>
                  <Text style={styles.successText}>Our team will get back to you shortly.</Text>
                </Animated.View>
              ) : (
                <>
                  <Text style={styles.label}>What&#39;s the issue about?</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.issueRow}>
                    {issueTypes.map(issue => (
                      <TouchableOpacity
                        key={issue.id}
                        style={[styles.issueBtn, selectedIssue === issue.id && styles.issueBtnActive]}
                        onPress={() => setSelectedIssue(issue.id)}
                      >
                        <Text style={[styles.issueText, selectedIssue === issue.id && styles.issueTextActive]}>{issue.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.label}>Can you describe it?</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Please provide as much detail as possible..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    value={message}
                    onChangeText={setMessage}
                    textAlignVertical="top"
                  />

                  <TouchableOpacity style={[styles.submitBtn, (submitting || !selectedIssue || !message.trim()) && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={submitting || !selectedIssue || !message.trim()}>
                    {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Send Message</Text>}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scrollContent: { paddingBottom: 40 },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backBtn: {
    padding: 8,
    marginLeft: -8, // To make the touch area larger
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerPlaceholder: {
      width: 32, // to balance the back button
  },

  // Section Title Styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },

  // Support Options Grid
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  optionIconWrapper: {
    padding: 14,
    borderRadius: 999, // A large number for a perfect circle
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  optionDesc: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    height: 30, // To ensure cards have same height
  },

  // Form Styles
  formContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  issueRow: {
    paddingBottom: 16,
  },
  issueBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  issueBtnActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  issueText: {
    color: '#374151',
    fontWeight: '500',
  },
  issueTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    minHeight: 140,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    lineHeight: 24,
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  submitBtnDisabled: {
      backgroundColor: '#93c5fd',
      elevation: 0,
      shadowOpacity: 0,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Success Message Styles
  successBox: {
    backgroundColor: '#d1fae5',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    minHeight: 250, // To match form height roughly
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 20,
    color: '#065f46',
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SupportScreen;
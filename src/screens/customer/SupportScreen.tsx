import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  KeyboardAvoidingView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import { useAuth } from '../../context/AuthContext';

type SupportScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

type SupportOption = {
  id: string;
  title: string;
  icon: string;
  description: string;
  action: 'call' | 'email' | 'chat' | 'faq';
  value: string;
};

const SupportScreen = () => {
  const navigation = useNavigation<SupportScreenNavigationProp>();
  const { user } = useAuth();
  const [selectedIssue, setSelectedIssue] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const supportOptions: SupportOption[] = [
    { id: '1', title: 'Call Us', icon: 'call-outline', description: 'Speak directly with our customer support team', action: 'call', value: '+91 9876543210' },
    { id: '2', title: 'Email Support', icon: 'mail-outline', description: 'Send us an email and we\'ll respond within 24 hours', action: 'email', value: 'support@dashstream.com' },
    { id: '3', title: 'Live Chat', icon: 'chatbubble-ellipses-outline', description: 'Chat with our support team in real-time', action: 'chat', value: 'chat' },
    { id: '4', title: 'FAQ', icon: 'help-circle-outline', description: 'Find answers to frequently asked questions', action: 'faq', value: 'faq' }
  ];

  const issueTypes = [
    { id: 'booking', label: 'Booking Issues' },
    { id: 'payment', label: 'Payment Problems' },
    { id: 'service', label: 'Service Quality' },
    { id: 'app', label: 'App Technical Issues' },
    { id: 'professional', label: 'Professional Behavior' },
    { id: 'other', label: 'Other Issues' },
  ];

  const handleSupportOptionPress = (option: SupportOption) => {
    switch (option.action) {
      case 'call':
        const phoneNumber = Platform.OS === 'android' ? `tel:${option.value}` : `telprompt:${option.value}`;
        Linking.canOpenURL(phoneNumber)
          .then(supported => supported ? Linking.openURL(phoneNumber) : Alert.alert('Phone number is not available'))
          .catch(err => console.error('An error occurred', err));
        break;
      case 'email':
        Linking.openURL(`mailto:${option.value}?subject=Support Request - ${user?.name || 'Customer'}&body=User ID: ${user?.id || 'Not available'}\n\n`);
        break;
      case 'chat':
        Alert.alert('Live Chat', 'Live chat feature will be available soon!');
        break;
      case 'faq':
        navigation.navigate('FAQ');
        break;
    }
  };

  const handleSubmit = async () => {
    if (!selectedIssue) return Alert.alert('Error', 'Please select an issue type');
    if (!message.trim()) return Alert.alert('Error', 'Please describe your issue');

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setSelectedIssue('');
        setMessage('');
      }, 3000);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Customer Support</Text>
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
          {/* Support Options */}
          <Text style={styles.sectionTitle}>How can we help you?</Text>
          <View style={styles.optionGrid}>
            {supportOptions.map(option => (
              <TouchableOpacity 
                key={option.id}
                style={styles.optionCard}
                onPress={() => handleSupportOptionPress(option)}
              >
                <View style={styles.optionIconWrapper}>
                  <Ionicons name={option.icon as any} size={22} color="#2563eb" />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDesc}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Send us a message</Text>
            {submitted ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                <Text style={styles.successTitle}>Thank you for your message!</Text>
                <Text style={styles.successText}>We'll get back to you as soon as possible.</Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>What issue are you facing?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.issueRow}>
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

                <Text style={styles.label}>Describe your issue</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Please provide details about your issue..."
                  multiline
                  value={message}
                  onChangeText={setMessage}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
                  {submitting ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Submit</Text>}
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Business Hours</Text>
            <Text style={styles.infoText}>Mon - Sat: 8:00 AM - 8:00 PM</Text>
            <Text style={styles.infoText}>Sunday: 10:00 AM - 6:00 PM</Text>
            <Text style={styles.infoLabel}>© 2023 DashStream Car Wash Services</Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  backBtn: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', paddingHorizontal: 16, marginBottom: 16 },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 16 },
  optionCard: {
  width: '48%',
  backgroundColor: '#fff',
  borderRadius: 16,
  padding: 16,
  marginBottom: 16,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 8,
  elevation: 4,
  alignItems: 'center',
}
,
  optionIconWrapper: { backgroundColor: '#dbeafe', padding: 12, borderRadius: 50, marginBottom: 8 },
  optionTitle: { fontWeight: '600', color: '#111827', textAlign: 'center' },
  optionDesc: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 4 },
  formContainer: { padding: 16, backgroundColor: '#f3f4f6', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  formTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, color: '#111827' },
  label: { fontWeight: '500', color: '#374151', marginBottom: 8 },
  issueRow: { marginBottom: 16 },
issueBtn: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 20,
  backgroundColor: '#e5e7eb',
  marginRight: 8,
  marginBottom: 8,
},
issueBtnActive: {
  backgroundColor: '#2563eb',
  shadowColor: '#2563eb',
  shadowOpacity: 0.2,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
},

  issueText: { color: '#374151' },
  issueTextActive: { color: '#fff' },
  textArea: {
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#d1d5db',
  borderRadius: 14,
  padding: 14,
  minHeight: 120,
  fontSize: 14,
  color: '#111827',
  marginBottom: 16,
},

 submitBtn: {
  backgroundColor: '#2563eb',
  paddingVertical: 14,
  borderRadius: 999,
  alignItems: 'center',
},
submitText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,
},

 successBox: {
  backgroundColor: '#ecfdf5',
  padding: 20,
  borderRadius: 16,
  alignItems: 'center',
  shadowColor: '#10b981',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
},

  successTitle: { color: '#047857', fontWeight: '600', marginTop: 8, textAlign: 'center' },
  successText: { color: '#10b981', textAlign: 'center', marginTop: 4 },
  infoSection: { padding: 16, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  infoText: { fontWeight: '500', color: '#374151', marginBottom: 4, textAlign: 'center' },
});

export default SupportScreen;

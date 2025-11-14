import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.container}>
          <Text style={styles.lastUpdated}>Last updated: October 2025</Text>

          {/* Sections */}
          {SECTIONS.map((section, index) => (
            <View key={index} style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{section.title}</Text>

              {section.paragraph && <Text style={styles.paragraph}>{section.paragraph}</Text>}

              {section.points &&
                section.points.map((point, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={styles.bulletDot} />
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
            </View>
          ))}

          {/* Contact */}
          <View style={[styles.sectionCard, { marginBottom: 20 }]}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.paragraph}>For privacy-related concerns:</Text>

            <Text style={styles.contact}>privacy@dashstream.com</Text>
            <Text style={styles.contact}>+91 12345 67890</Text>
            <Text style={styles.contact}>123 Tech Park, Bangalore, Karnataka 560001, India</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const SECTIONS = [
  {
    title: 'Information We Collect',
    paragraph:
      'We collect information provided by you such as your name, email address, phone number, payment details, and preferences.',
  },
  {
    title: 'How We Use Your Information',
    points: [
      'Provide, maintain, and improve our services',
      'Process transactions and send confirmations',
      'Send alerts and support messages',
      'Respond to queries and comments',
      'Share updates, offers, and relevant communications',
    ],
  },
  {
    title: 'Information Sharing',
    points: [
      'With service professionals for fulfilling bookings',
      'With payment gateways for secure transactions',
      'When legally required or to protect our rights',
      'With your explicit consent',
    ],
  },
  {
    title: 'Data Security',
    paragraph:
      'We implement industry-standard measures to secure your data, although no online method is fully risk-free.',
  },
  {
    title: 'Location Information',
    paragraph:
      'Location data is used to enhance service relevance. You can disable this permission anytime.',
  },
  {
    title: 'Cookies & Tracking',
    paragraph:
      'Cookies help improve your experience. You may configure cookie preferences in your browser.',
  },
  {
    title: 'Third-Party Services',
    paragraph:
      'Our app may link to external services. Their privacy practices are outside our control.',
  },
  {
    title: 'Children’s Privacy',
    paragraph:
      'The platform is not intended for children under 13. We do not knowingly collect their data.',
  },
  {
    title: 'Data Retention',
    paragraph:
      'Your information is retained only as long as necessary to deliver our services or comply with legal requirements.',
  },
  {
    title: 'Your Rights',
    points: [
      'Access your data',
      'Update or correct information',
      'Request account deletion',
      'Opt out of marketing messages',
    ],
  },
  {
    title: 'Policy Updates',
    paragraph: 'We may revise this policy periodically. Changes will be reflected in this section.',
  },
];

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    marginTop: 2,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 10,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  contact: {
    fontSize: 14,
    color: '#2563EB',
    marginTop: 4,
    fontWeight: '500',
  },
});

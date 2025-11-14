import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsAndConditions = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Terms & Conditions</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last updated • October 2024</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using this application, you agree to be bound by these Terms and
            Conditions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You agree to use the app only for lawful purposes and not to violate any applicable laws
            or regulations.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, designs, logos, and trademarks are the intellectual property of their
            respective owners.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Limitations of Liability</Text>
          <Text style={styles.paragraph}>
            We are not liable for any damages that may occur from your use of the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these terms at any time. Continued use of the app means you accept any
            changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.paragraph}>
            For questions regarding these terms, contact us at support@example.com.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  backButton: {
    padding: 6,
    marginRight: 8,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 20,
  },

  lastUpdated: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  paragraph: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
});

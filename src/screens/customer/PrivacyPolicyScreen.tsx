import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type PrivacyPolicyScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last updated: January 2024</Text>

          <Text style={styles.sectionTitle}>1. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information you provide directly to us, such as when you create an account, 
            book services, or contact us. This may include your name, email address, phone number, 
            address, payment information, and service preferences.
          </Text>

          <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
          <Text style={styles.bulletPoint}>• Process transactions and send related information</Text>
          <Text style={styles.bulletPoint}>• Send technical notices and support messages</Text>
          <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
          <Text style={styles.bulletPoint}>• Communicate about services, offers, and events</Text>

          <Text style={styles.sectionTitle}>3. Information Sharing</Text>
          <Text style={styles.paragraph}>
            We may share your information in the following situations:
          </Text>
          <Text style={styles.bulletPoint}>• With service professionals to fulfill your bookings</Text>
          <Text style={styles.bulletPoint}>• With payment processors to process transactions</Text>
          <Text style={styles.bulletPoint}>• When required by law or to protect our rights</Text>
          <Text style={styles.bulletPoint}>• With your consent or at your direction</Text>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate security measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of 
            transmission over the Internet is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>5. Location Information</Text>
          <Text style={styles.paragraph}>
            We may collect location information to provide location-based services, such as 
            finding nearby service professionals. You can disable location sharing in your 
            device settings at any time.
          </Text>

          <Text style={styles.sectionTitle}>6. Cookies and Similar Technologies</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar technologies to collect information about your use of 
            our services and to improve your experience. You can control cookie settings 
            through your browser.
          </Text>

          <Text style={styles.sectionTitle}>7. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            Our app may contain links to third-party websites or integrate with third-party 
            services. We are not responsible for the privacy practices of these third parties.
          </Text>

          <Text style={styles.sectionTitle}>8. Children&#39;s Privacy</Text>
          <Text style={styles.paragraph}>
            Our services are not intended for children under 13. We do not knowingly collect 
            personal information from children under 13.
          </Text>

          <Text style={styles.sectionTitle}>9. Data Retention</Text>
          <Text style={styles.paragraph}>
            We retain your personal information for as long as necessary to provide our services 
            and fulfill the purposes outlined in this policy, unless a longer retention period 
            is required by law.
          </Text>

          <Text style={styles.sectionTitle}>10. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <Text style={styles.bulletPoint}>• Access your personal information</Text>
          <Text style={styles.bulletPoint}>• Update or correct your information</Text>
          <Text style={styles.bulletPoint}>• Delete your account and personal information</Text>
          <Text style={styles.bulletPoint}>• Opt out of marketing communications</Text>

          <Text style={styles.sectionTitle}>11. Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any 
            material changes by posting the new policy in the app and updating the &quot;Last updated&quot; date.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>Email: privacy@dashstream.com</Text>
          <Text style={styles.contactInfo}>Phone: +91 12345 67890</Text>
          <Text style={styles.contactInfo}>
            Address: 123 Tech Park, Bangalore, Karnataka 560001, India
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  backButton: {
    marginRight: 12
  },
  headerTitleContainer: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  scroll: {
    flex: 1
  },
  content: {
    padding: 16
  },
  lastUpdated: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 24,
    marginBottom: 12
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 12
  },
  bulletPoint: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 6,
    marginLeft: 8
  },
  contactInfo: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2563eb',
    marginBottom: 6,
    fontWeight: '500'
  }
});
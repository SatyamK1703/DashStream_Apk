import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type FAQScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

const FAQScreen = () => {
  const navigation = useNavigation<FAQScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const faqCategories = [
    { id: 'all', name: 'All' },
    { id: 'booking', name: 'Booking' },
    { id: 'services', name: 'Services' },
    { id: 'payment', name: 'Payment' },
    { id: 'cancellation', name: 'Cancellation' },
    { id: 'account', name: 'Account' },
  ];

  const faqData: FAQItem[] = [
    {
      id: '1',
      question: 'How do I book a car wash service?',
      answer: 'You can book a car wash service by selecting your preferred service from the home screen, choosing your vehicle type, selecting a date and time slot, and confirming your booking details. Payment can be made online or at the time of service.',
      category: 'booking',
    },
    {
      id: '2',
      question: 'What types of services do you offer?',
      answer: 'We offer a range of services including Basic Wash, Premium Wash, Interior Cleaning, Exterior Detailing, Full Detailing, and specialized services like Engine Bay Cleaning, Headlight Restoration, and more. You can view all services on the home screen.',
      category: 'services',
    },
    {
      id: '3',
      question: 'How do I pay for the services?',
      answer: 'We accept various payment methods including credit/debit cards, UPI, mobile wallets, and cash on delivery. You can choose your preferred payment method during checkout.',
      category: 'payment',
    },
    {
      id: '4',
      question: 'Can I reschedule my booking?',
      answer: 'Yes, you can reschedule your booking up to 2 hours before the scheduled time. Go to the Bookings tab, select the booking you want to reschedule, and tap on the "Reschedule" button.',
      category: 'booking',
    },
    {
      id: '5',
      question: 'What is your cancellation policy?',
      answer: 'You can cancel your booking up to 2 hours before the scheduled time for a full refund. Cancellations made within 2 hours of the scheduled time will incur a 50% cancellation fee. To cancel, go to the Bookings tab, select the booking, and tap on "Cancel Booking".',
      category: 'cancellation',
    },
    {
      id: '6',
      question: 'How long does a typical car wash take?',
      answer: 'The duration depends on the service you choose. A Basic Wash typically takes 30-45 minutes, Premium Wash takes 45-60 minutes, and Full Detailing can take 2-3 hours. The estimated duration is displayed when you select a service.',
      category: 'services',
    },
    {
      id: '7',
      question: 'Do I need to be present during the service?',
      answer: 'It depends on the location. For services at your home or office, you dont need to be present as long as the professional has access to your vehicle. For services at our partner locations, you can drop off your vehicle and pick it up once the service is completed.',
      category: 'services',
    },
    {
      id: '8',
      question: 'How do I track my booking?',
      answer: 'You can track your booking in real-time through the app. Once a professional is assigned to your booking, you can see their location, estimated time of arrival, and current status of your service.',
      category: 'booking',
    },
    {
      id: '9',
      question: 'What if I am not satisfied with the service?',
      answer: 'Customer satisfaction is our priority. If you are not satisfied with the service, you can report the issue through the app within 24 hours of service completion. Our customer support team will address your concerns and offer appropriate solutions, which may include a re-service or partial/full refund.',
      category: 'services',
    },
    {
      id: '10',
      question: 'How do I update my profile information?',
      answer: 'You can update your profile information by going to the Profile tab and tapping on "Edit Profile". Here you can update your name, email, phone number, and profile picture.',
      category: 'account',
    },
    {
      id: '11',
      question: 'Can I save multiple addresses?',
      answer: 'Yes, you can save multiple addresses in your profile. Go to Profile > My Addresses to add, edit, or delete addresses. You can select from these saved addresses when booking a service.',
      category: 'account',
    },
    {
      id: '12',
      question: 'What is the membership program?',
      answer: 'Our membership program offers exclusive benefits like discounted rates, priority booking, free add-on services, and more. We offer different membership tiers to suit your needs. Go to Profile > Membership & Subscriptions to view available plans and subscribe.',
      category: 'account',
    },
    {
      id: '13',
      question: 'How do I get a refund for a cancelled service?',
      answer: 'Refunds for cancelled services are processed automatically to the original payment method. The refund typically takes 3-5 business days to reflect in your account, depending on your bank\'s processing time.',
      category: 'payment',
    },
    {
      id: '14',
      question: 'Do you offer emergency services?',
      answer: 'Yes, we offer emergency services for situations like accidental spills or urgent cleaning needs. However, emergency services may have an additional charge and are subject to professional availability in your area.',
      category: 'services',
    },
    {
      id: '15',
      question: 'How do I apply a promo code?',
      answer: 'You can apply a promo code during checkout. On the checkout page, you will find a "Apply Promo Code" section where you can enter your code and apply it to get the discount.',
      category: 'payment',
    },
  ];

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleContactSupport = () => {
    navigation.navigate('Support');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerText}>FAQ</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQ"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabContent}
      >
        {faqCategories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.tab,
              activeCategory === category.id ? styles.tabActive : styles.tabInactive,
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Text
              style={
                activeCategory === category.id ? styles.tabTextActive : styles.tabTextInactive
              }
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView style={styles.faqList}>
        <View style={styles.faqWrapper}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map(faq => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqCard,
                  expandedId === faq.id ? styles.faqCardActive : styles.faqCardInactive,
                ]}
                onPress={() => toggleExpand(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#4b5563"
                  />
                </View>
                {expandedId === faq.id && (
                  <View style={styles.faqAnswerWrapper}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No FAQs found matching your search</Text>
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                <Text style={styles.clearFilterText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Support */}
          <View style={styles.supportWrapper}>
            <Text style={styles.supportText}>Couldn't find what you're looking for?</Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: { marginRight: 16 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  searchWrapper: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, color: '#1f2937' },
  tabScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  tabContent: { paddingHorizontal: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderRadius: 999 },
  tabActive: { backgroundColor: '#2563eb' },
  tabInactive: { backgroundColor: '#f3f4f6' },
  tabTextActive: { color: '#fff', fontWeight: '500' },
  tabTextInactive: { color: '#374151', fontWeight: '500' },
  faqList: { flex: 1 },
  faqWrapper: { padding: 16 },
  faqCard: { marginBottom: 16, borderRadius: 16, overflow: 'hidden' },
  faqCardActive: { borderWidth: 1, borderColor: '#2563eb', backgroundColor: '#f9fafb' },
  faqCardInactive: { borderWidth: 1, borderColor: '#f3f4f6', backgroundColor: '#f9fafb' },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: { flex: 1, fontWeight: '600', color: '#1f2937' },
  faqAnswerWrapper: { padding: 16, paddingTop: 0, backgroundColor: '#fff' },
  faqAnswer: { color: '#4b5563', lineHeight: 20 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#9ca3af',
  },
  clearFilterButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  clearFilterText: { color: '#fff', fontWeight: '500' },
  supportWrapper: {
    marginTop: 24,
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
  },
  supportText: { textAlign: 'center', color: '#1f2937', fontWeight: '500', marginBottom: 8 },
  supportButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  supportButtonText: { color: '#fff', fontWeight: '500' },
});

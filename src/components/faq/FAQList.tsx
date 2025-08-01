import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';

type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

interface FAQListProps {
  searchQuery: string;
  activeCategory: string;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  navigation: NativeStackNavigationProp<CustomerStackParamList>;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (id: string) => void;
  initialCategory?: string; 
}


const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I book a car wash service?',
    answer:
      'You can book a car wash service by selecting your preferred service from the home screen...',
    category: 'booking',
  },
  {
    id: '2',
    question: 'What types of services do you offer?',
    answer:
      'We offer a range of services including Basic Wash, Premium Wash, Interior Cleaning...',
    category: 'services',
  },
  {
    id: '3',
    question: 'How do I pay for the services?',
    answer:
      'We accept various payment methods including credit/debit cards, UPI...',
    category: 'payment',
  },
  {
    id: '4',
    question: 'Can I reschedule my booking?',
    answer:
      'Yes, you can reschedule your booking up to 2 hours before the scheduled time...',
    category: 'booking',
  },
  {
    id: '5',
    question: 'What is your cancellation policy?',
    answer:
      'You can cancel your booking up to 2 hours before the scheduled time for a full refund...',
    category: 'cancellation',
  },
  {
    id:'6',
    question: 'How does the membership work?',
    answer:
      'Our membership gives you access to a set number of services at discounted rates. You can book services anytime during your membership period.',
    category:'membership',
  },
  {
    id:'7',
    question: 'Can I cancel my membership?',
    answer:
      "Yes, you can cancel your membership anytime. You'll continue to have access until the end of your current billing period.",
    category:'membership',
  },
  {
    id:'8',
    question: 'Can I upgrade my plan?',
    answer:
      'Yes, you can upgrade your plan anytime. The remaining value of your current plan will be prorated and applied to your new plan.',
    category:'membership'
  },
  // Add the remaining FAQ items if needed
];

const FAQList: React.FC<FAQListProps> = ({
  searchQuery,
  activeCategory,
  expandedId,
  setExpandedId,
  navigation,
  setSearchQuery,
  setActiveCategory,
  initialCategory,
}) => {
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    // const matchesCategory =
    //   activeCategory === 'all' || faq.category === activeCategory;
    const matchesCategory =
  (initialCategory ? faq.category === initialCategory : true) &&
  (activeCategory === 'all' || faq.category === activeCategory);


    return matchesSearch && matchesCategory;
  });

  return (
    <ScrollView style={styles.faqList}>
      <View >
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map(faq => (
            <TouchableOpacity
              key={faq.id}
              style={[
                styles.faqCard,
                expandedId === faq.id
                  ? styles.faqCardActive
                  : styles.faqCardInactive,
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
      </View>
    </ScrollView>
  );
};

export default FAQList;

const styles = StyleSheet.create({
  faqList: { flex: 1 },
  faqCard: {
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff',
  },
  faqCardActive: {
    borderColor: '#2563eb',
    borderWidth: 1.2,
  },
  faqCardInactive: {
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestion: {
    flex: 1,
    fontWeight: '600',
    fontSize: 16,
    color: '#1f2937',
  },
  faqAnswerWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
    color: '#9ca3af',
  },
  clearFilterButton: {
    marginTop: 20,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  supportWrapper: {
    marginTop: 32,
    backgroundColor: '#eff6ff',
    padding: 20,
    borderRadius: 16,
  },
  supportText: {
    textAlign: 'center',
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  supportButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

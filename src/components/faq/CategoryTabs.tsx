import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (id: string) => void;
}

const faqCategories: Category[] = [
  { id: 'all', name: 'All' },
  { id: 'booking', name: 'Booking' },
  { id: 'services', name: 'Services' },
  { id: 'payment', name: 'Payment' },
  { id: 'cancellation', name: 'Cancellation' },
  { id: 'account', name: 'Account' },
];

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  setActiveCategory,
}) => {
  return (
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
              activeCategory === category.id
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default CategoryTabs;
const styles = StyleSheet.create({
  tabScroll: {
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  tabContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    height: 40, // FIXED height for all tabs
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  tabActive: {
    backgroundColor: '#2563eb',
    
  },
  tabInactive: {
    backgroundColor: '#f3f4f6',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 18,
  },
  tabTextInactive: {
    color: '#6b7280',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 18,
  },
});


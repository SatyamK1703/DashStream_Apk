import React from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';

interface CategoryTabsProps {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ tabs, selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => {
          const isActive = selected === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                isActive ? styles.activeTab : styles.inactiveTab
              ]}
              onPress={() => onSelect(tab)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tabText,
                isActive ? styles.activeTabText : styles.inactiveTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  tabItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: '#2563eb', // Yellow
  },
  inactiveTab: {
    backgroundColor: '#F3F4F6', // Light gray
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff', // Almost black
    fontWeight: '700',
  },
  inactiveTabText: {
    color: '#6B7280', // Gray-500
  },
});

export default CategoryTabs;

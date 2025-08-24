import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import Header from '../../components/faq/Header';
import SearchBar from '../../components/faq/SearchBar';
import CategoryTabs from '../../components/faq/CategoryTabs';
import FAQList from '../../components/faq/FAQList';
import ContactSupport from '~/components/faq/ContactSupport';
import { SafeAreaView } from 'react-native-safe-area-context';

const FAQScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>FAQ & Support</Text>
          </View>
          <View style={styles.backButton} /> {/* Empty view for balance */}
        </View>
        
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <ScrollView style={styles.wrapper} contentContainerStyle={{ paddingBottom: 32 }}>
          <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          <FAQList
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            navigation={navigation}
            setSearchQuery={setSearchQuery}
            setActiveCategory={setActiveCategory}
          />
          <ContactSupport navigation={navigation} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  container: { 
    flex: 1, 
    backgroundColor: '#f9fafb' 
  },
  // Custom Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb'
  },
  backButton: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#000'
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center'
  },
  wrapper: {
    padding: 16
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
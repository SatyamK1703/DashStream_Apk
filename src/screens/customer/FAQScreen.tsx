import React, { useState } from 'react';
import { View, ScrollView, StyleSheet ,Text,TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../../app/routes/CustomerNavigator';
import Header from '../../components/faq/Header';
import SearchBar from '../../components/faq/SearchBar';
import CategoryTabs from '../../components/faq/CategoryTabs';
import FAQList from '../../components/faq/FAQList';
import ContactSupport from '~/components/faq/ContactSupport';



const FAQScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<CustomerStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  return (
      <View style={styles.container}>
        <Header navigation={navigation} />
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

   
  );
};

export default FAQScreen;

const styles = StyleSheet.create({
  
  wrapper:{padding:16},
  container: { flex: 1, backgroundColor: '#f9fafb' },
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

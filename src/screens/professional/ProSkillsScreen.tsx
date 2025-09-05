import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types for self-contained component
type ProStackParamList = {
  ProSkills: undefined;
};

type ProSkillsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Skill {
  id: string;
  name: string;
  isSelected: boolean;
  category: string;
  experoence?:number;
  level?:'Beginner'|'Intermediate'|'Expert';
}

interface Certificate {
  id: string;
  name: string;
  issuer: string;
  date: string;
  isVerified: boolean;
}

const ProSkillsScreen = () => {
  const navigation = useNavigation<ProSkillsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'certificates'>('skills');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  useEffect(() => {
    const mockSkills: Skill[] = [
      { id: '1', name: 'Exterior Washing', isSelected: true, category: 'Car Wash',  level: 'Expert' },
    { id: '2', name: 'Interior Cleaning', isSelected: true, category: 'Car Wash',  level: 'Expert' },
    { id: '3', name: 'Polishing', isSelected: true, category: 'Car Wash',  level: 'Intermediate' },
    { id: '4', name: 'Waxing', isSelected: true, category: 'Car Wash',  level: 'Intermediate' },
    { id: '5', name: 'Ceramic Coating', isSelected: false, category: 'Car Wash',  level: 'Beginner' },
    { id: '6', name: 'Engine Bay Cleaning', isSelected: true, category: 'Car Wash', level: 'Expert' },
    { id: '7', name: 'Headlight Restoration', isSelected: false, category: 'Car Wash' },
    { id: '8', name: 'Undercarriage Cleaning', isSelected: false, category: 'Car Wash' },
    
    // Bike Wash Skills
    { id: '9', name: 'Motorcycle Washing', isSelected: true, category: 'Bike Wash',  level: 'Expert' },
    { id: '10', name: 'Chain Cleaning & Lubrication', isSelected: true, category: 'Bike Wash',  level: 'Expert' },
    { id: '11', name: 'Bike Detailing', isSelected: true, category: 'Bike Wash',  level: 'Intermediate' },
    
    // Detailing Skills
    { id: '12', name: 'Paint Correction', isSelected: false, category: 'Detailing' },
    { id: '13', name: 'Leather Treatment', isSelected: true, category: 'Detailing',  level: 'Intermediate' },
    { id: '14', name: 'Upholstery Cleaning', isSelected: true, category: 'Detailing',  level: 'Intermediate' },
    { id: '15', name: 'Glass Treatment', isSelected: true, category: 'Detailing', level: 'Expert' },
    ];
    const mockCerts: Certificate[] = [
      { id: '1', name: 'Professional Car Detailing', issuer: 'Auto Detailing Association', date: '2021-05-15', isVerified: true },
      { id: '2', name: 'Advanced Ceramic Coating', issuer: 'Auto Care Academy', date: '2022-02-10', isVerified: true },
    ];
    setTimeout(() => {
      setSkills(mockSkills);
      setCertificates(mockCerts);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const skillsByCategory = filteredSkills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const selectedSkills = skills.filter(skill => skill.isSelected);

  const toggleSkillSelection = (id: string) => {
    setSkills(prev => prev.map(skill => (skill.id === id ? { ...skill, isSelected: !skill.isSelected } : skill)));
  };

  const handleSaveChanges = () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Error', 'Please select at least one skill.');
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Alert.alert('Success', 'Your skills have been updated.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }, 1500);
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills & Expertise</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'skills' && styles.activeTab]} onPress={() => setActiveTab('skills')}>
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>Skills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'certificates' && styles.activeTab]} onPress={() => setActiveTab('certificates')}>
          <Text style={[styles.tabText, activeTab === 'certificates' && styles.activeTabText]}>Certificates</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'skills' && (
          <>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.gray400} />
              <TextInput style={styles.searchInput} placeholder="Search skills..." value={searchQuery} onChangeText={setSearchQuery} />
              {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={colors.gray400} /></TouchableOpacity> : null}
            </View>
            {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
              <View key={category} style={styles.categoryContainer}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.card}>
                  {categorySkills.map((skill, index) => (
                    <TouchableOpacity key={skill.id} style={[styles.skillItem, index === categorySkills.length - 1 && styles.lastSkillItem]} onPress={() => toggleSkillSelection(skill.id)}>
                      <Text style={styles.skillName}>{skill.name}</Text>
                      <View style={[styles.checkbox, skill.isSelected && styles.checkboxSelected]}>
                        {skill.isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
        {activeTab === 'certificates' && (
            <View style={styles.card}>
                {certificates.map((cert, index) => (
                    <View key={cert.id} style={[styles.skillItem, index === certificates.length - 1 && styles.lastSkillItem]}>
                        <View style={styles.certInfo}>
                            <Text style={styles.skillName}>{cert.name}</Text>
                            <Text style={styles.certIssuer}>{cert.issuer}</Text>
                        </View>
                        <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={16} color={colors.green600} />
                            <Text style={styles.verifiedText}>Verified</Text>
                        </View>
                    </View>
                ))}
            </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} onPress={handleSaveChanges} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray300: '#D1D5DB',
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937', green600: '#16A34A',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray600, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.gray600, fontWeight: '500' },
  activeTabText: { color: colors.primary },
  scrollContainer: { padding: 16, paddingBottom: 100 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 8, height: 44, color: colors.gray800 },
  categoryContainer: { marginBottom: 16 },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', color: colors.gray800, marginBottom: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  skillItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  lastSkillItem: { borderBottomWidth: 0 },
  skillName: { fontSize: 16, color: colors.gray800, fontWeight: '500' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
  saveButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  saveButtonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  certInfo: { flex: 1 },
  certIssuer: { fontSize: 14, color: colors.gray500, marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(22, 163, 74, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  verifiedText: { color: colors.green600, marginLeft: 4, fontSize: 12, fontWeight: '500' },
});

export default ProSkillsScreen;

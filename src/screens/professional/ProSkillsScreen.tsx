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
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Import proper types and hooks
import { ProStackParamList } from '../../../app/routes/ProfessionalNavigator';
import { useProfessionalProfile } from '../../hooks/useProfessional';
import { useApi } from '../../hooks/useApi';
import httpClient from '../../services/httpClient';

type ProSkillsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface Skill {
  id: string;
  name: string;
  isSelected: boolean;
  category: string;
  experience?: number; // in years
  level?: 'Beginner' | 'Intermediate' | 'Expert';
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
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'skills' | 'certificates'>('skills');
  const [yearsOfExperience, setYearsOfExperience] = useState(3);

  // Use professional profile hooks
  const { data: profile } = useProfessionalProfile();
  
  // Skills API hook
  const { 
    data: skillsData, 
    isLoading: skillsLoading, 
    execute: refreshSkills 
  } = useApi(
    () => httpClient.get('/professionals/skills'),
    { showErrorAlert: false }
  );

  // Certificates API hook
  const { 
    data: certificatesData, 
    isLoading: certificatesLoading, 
    execute: refreshCertificates 
  } = useApi(
    () => httpClient.get('/professionals/certificates'),
    { showErrorAlert: false }
  );

  const skills = skillsData?.skills || [];
  const certificates = certificatesData?.certificates || [];
  const isLoading = skillsLoading || certificatesLoading;

  // Initialize experience from profile
  useEffect(() => {
    if (profile?.experience) {
      setYearsOfExperience(profile.experience);
    }
  }, [profile]);

  const filteredSkills = skills.filter((skill: Skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedSkills = skills.filter((skill: Skill) => skill.isSelected);
  const skillsByCategory = filteredSkills.reduce((acc: { [key: string]: Skill[] }, skill: Skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const toggleSkillSelection = async (skillId: string) => {
    try {
      const skill = skills.find((s: Skill) => s.id === skillId);
      if (!skill) return;

      await httpClient.patch(`/professionals/skills/${skillId}`, {
        isSelected: !skill.isSelected
      });
      
      refreshSkills(); // Refresh the skills data
    } catch (error) {
      Alert.alert('Error', 'Failed to update skill. Please try again.');
    }
  };

  const updateSkillLevel = async (skillId: string, level: string) => {
    try {
      await httpClient.patch(`/professionals/skills/${skillId}`, { level });
      refreshSkills();
    } catch (error) {
      Alert.alert('Error', 'Failed to update skill level. Please try again.');
    }
  };

  const handleSaveExperience = async () => {
    setIsSaving(true);
    try {
      await httpClient.patch('/professionals/profile', {
        experience: yearsOfExperience
      });
      Alert.alert('Success', 'Experience updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update experience. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCertificate = () => {
    Alert.alert(
      'Add Certificate',
      'Certificate management will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  const renderSkillItem = (skill: Skill) => (
    <View key={skill.id} style={styles.skillItem}>
      <TouchableOpacity 
        style={styles.skillHeader}
        onPress={() => toggleSkillSelection(skill.id)}
      >
        <View style={styles.skillInfo}>
          <Text style={[styles.skillName, skill.isSelected && styles.selectedSkillName]}>
            {skill.name}
          </Text>
          {skill.experience && (
            <Text style={styles.skillExperience}>
              {skill.experience} years experience
            </Text>
          )}
        </View>
        <View style={styles.skillActions}>
          {skill.level && (
            <View style={[
              styles.levelBadge,
              skill.level === 'Expert' && styles.expertBadge,
              skill.level === 'Intermediate' && styles.intermediateBadge,
              skill.level === 'Beginner' && styles.beginnerBadge,
            ]}>
              <Text style={styles.levelText}>{skill.level}</Text>
            </View>
          )}
          <View style={[
            styles.checkbox,
            skill.isSelected && styles.checkedBox
          ]}>
            {skill.isSelected && (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {skill.isSelected && (
        <View style={styles.skillDetails}>
          <Text style={styles.levelLabel}>Skill Level:</Text>
          <View style={styles.levelButtons}>
            {['Beginner', 'Intermediate', 'Expert'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  skill.level === level && styles.activeLevelButton
                ]}
                onPress={() => updateSkillLevel(skill.id, level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  skill.level === level && styles.activeLevelButtonText
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderCertificateItem = (certificate: Certificate) => (
    <View key={certificate.id} style={styles.certificateItem}>
      <View style={styles.certificateHeader}>
        <MaterialIcons 
          name="verified" 
          size={20} 
          color={certificate.isVerified ? colors.success : colors.gray400} 
        />
        <View style={styles.certificateInfo}>
          <Text style={styles.certificateName}>{certificate.name}</Text>
          <Text style={styles.certificateIssuer}>{certificate.issuer}</Text>
          <Text style={styles.certificateDate}>{certificate.date}</Text>
        </View>
        <View style={styles.certificateStatus}>
          <Text style={[
            styles.statusText,
            certificate.isVerified ? styles.verifiedText : styles.pendingText
          ]}>
            {certificate.isVerified ? 'Verified' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSkillsTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Years of Experience</Text>
        <View style={styles.experienceContainer}>
          <View style={styles.experienceInput}>
            <TextInput
              style={styles.experienceText}
              value={yearsOfExperience.toString()}
              onChangeText={(text) => setYearsOfExperience(parseInt(text) || 0)}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.experienceLabel}>years</Text>
          </View>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveExperience}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Skills Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Selected Skills ({selectedSkills.length})
        </Text>
        {selectedSkills.length > 0 ? (
          <View style={styles.selectedSkillsContainer}>
            {selectedSkills.map((skill: Skill) => (
              <View key={skill.id} style={styles.selectedSkillChip}>
                <Text style={styles.selectedSkillText}>{skill.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noSkillsText}>No skills selected</Text>
        )}
      </View>

      {/* Search */}
      <View style={styles.section}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search skills..."
            placeholderTextColor={colors.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Skills by Category */}
      {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.categoryTitle}>{category}</Text>
          <View style={styles.skillsGrid}>
            {(categorySkills as Skill[]).map(renderSkillItem)}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCertificatesTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Certificates</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCertificate}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        
        {certificates.length > 0 ? (
          <View style={styles.certificatesContainer}>
            {certificates.map(renderCertificateItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="school" size={48} color={colors.gray300} />
            <Text style={styles.emptyStateText}>No certificates added yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your professional certificates to build trust with customers
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Skills & Certificates</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'skills' && styles.activeTab]}
          onPress={() => setActiveTab('skills')}
        >
          <Text style={[styles.tabText, activeTab === 'skills' && styles.activeTabText]}>
            Skills
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'certificates' && styles.activeTab]}
          onPress={() => setActiveTab('certificates')}
        >
          <Text style={[styles.tabText, activeTab === 'certificates' && styles.activeTabText]}>
            Certificates
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'skills' ? renderSkillsTab() : renderCertificatesTab()}
    </SafeAreaView>
  );
};

const colors = {
  primary: '#2563EB',
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  blue: '#3B82F6',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 16,
    color: colors.gray600,
    fontSize: 16,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'android' ? 24 : 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray500,
  },
  activeTabText: {
    color: colors.primary,
  },
  tabContent: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray900,
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 12,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  experienceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    marginRight: 12,
  },
  experienceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray900,
    marginRight: 8,
    minWidth: 30,
    textAlign: 'center',
  },
  experienceLabel: {
    fontSize: 16,
    color: colors.gray600,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedSkillChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedSkillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '500',
  },
  noSkillsText: {
    color: colors.gray500,
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.gray900,
  },
  skillsGrid: {
    gap: 8,
  },
  skillItem: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray900,
  },
  selectedSkillName: {
    color: colors.primary,
  },
  skillExperience: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  skillActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertBadge: {
    backgroundColor: colors.success,
  },
  intermediateBadge: {
    backgroundColor: colors.warning,
  },
  beginnerBadge: {
    backgroundColor: colors.gray400,
  },
  levelText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedBox: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  skillDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    padding: 12,
    backgroundColor: colors.gray50,
  },
  levelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: 8,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  activeLevelButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray600,
  },
  activeLevelButtonText: {
    color: colors.white,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  certificatesContainer: {
    gap: 12,
  },
  certificateItem: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
  },
  certificateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  certificateInfo: {
    flex: 1,
  },
  certificateName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  certificateIssuer: {
    fontSize: 14,
    color: colors.gray600,
    marginTop: 2,
  },
  certificateDate: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  certificateStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedText: {
    color: colors.success,
  },
  pendingText: {
    color: colors.warning,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray600,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default ProSkillsScreen;
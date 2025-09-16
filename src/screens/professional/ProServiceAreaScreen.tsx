import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Import proper types and hooks
import { ProStackParamList } from '../../../app/routes/ProfessionalNavigator';
import { useProfessionalProfile } from '../../hooks/useProfessional';
import { useApi } from '../../hooks/useApi';
import httpClient from '../../services/httpClient';

type ProServiceAreaScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

interface AreaItem {
  id: string;
  name: string;
  isSelected: boolean;
  distance: number;
  estimatedJobs: number;
}

const ProServiceAreaScreen = () => {
  const navigation = useNavigation<ProServiceAreaScreenNavigationProp>();
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxDistance, setMaxDistance] = useState(15);
  const [autoAcceptJobs, setAutoAcceptJobs] = useState(false);

  // Use professional profile hooks
  const { data: profile } = useProfessionalProfile();
  
  // Service areas API hook
  const { 
    data: serviceAreasData, 
    isLoading, 
    execute: refreshServiceAreas 
  } = useApi(
    () => httpClient.get('/professionals/service-areas'),
    { showErrorAlert: false }
  );

  const availableAreas = serviceAreasData?.areas || [];

  // Initialize settings from profile/service areas data
  useEffect(() => {
    if (serviceAreasData?.settings) {
      setMaxDistance(serviceAreasData.settings.maxDistance || 15);
      setAutoAcceptJobs(serviceAreasData.settings.autoAcceptJobs || false);
    }
  }, [serviceAreasData]);

  const filteredAreas = availableAreas
    .filter(area => area.name.toLowerCase().includes(searchQuery.toLowerCase()) && area.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  const selectedAreas = availableAreas.filter(area => area.isSelected);
  const totalEstimatedJobs = selectedAreas.reduce((total, area) => total + area.estimatedJobs, 0);

  const toggleAreaSelection = async (id: string) => {
    try {
      const area = availableAreas.find(a => a.id === id);
      if (!area) return;

      await httpClient.patch(`/professionals/service-areas/${id}`, {
        isSelected: !area.isSelected
      });
      
      refreshServiceAreas(); // Refresh the data
    } catch (error) {
      Alert.alert('Error', 'Failed to update service area. Please try again.');
    }
  };

  const handleSaveChanges = async () => {
    if (selectedAreas.length === 0) {
      Alert.alert('Error', 'Please select at least one service area.');
      return;
    }
    
    setIsSaving(true);
    try {
      await httpClient.patch('/professionals/service-settings', {
        maxDistance,
        autoAcceptJobs,
        selectedAreas: selectedAreas.map(area => area.id)
      });
      
      Alert.alert('Success', 'Service areas updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update service areas. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading service areas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Service Area</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Your Service Areas</Text>
            <View style={styles.summaryBadge}><Text style={styles.summaryBadgeText}>{selectedAreas.length} Selected</Text></View>
          </View>
          <View style={styles.summaryDetailRow}>
            <FontAwesome5 name="briefcase" size={14} color={colors.gray600} />
            <Text style={styles.summaryDetailText}>Estimated {totalEstimatedJobs} jobs per week</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.gray400} />
            <TextInput style={styles.searchInput} placeholder="Search areas..." value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={20} color={colors.gray400} /></TouchableOpacity> : null}
          </View>
          <Text style={styles.label}>Maximum Distance: {maxDistance} km</Text>
          {/* A proper slider component would be better here */}
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>{filteredAreas.length} Areas Available</Text>
          {filteredAreas.length > 0 ? (
            <View style={styles.card}>
              {filteredAreas.map((area, index) => (
                <TouchableOpacity key={area.id} style={[styles.areaItem, index === filteredAreas.length - 1 && styles.lastAreaItem]} onPress={() => toggleAreaSelection(area.id)}>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaName}>{area.name}</Text>
                    <View style={styles.areaDetails}>
                      <MaterialIcons name="location-on" size={14} color={colors.gray500} />
                      <Text style={styles.areaDetailText}>{area.distance} km away</Text>
                      <View style={styles.dotSeparator} />
                      <FontAwesome5 name="briefcase" size={12} color={colors.gray500} />
                      <Text style={styles.areaDetailText}>~{area.estimatedJobs} jobs/week</Text>
                    </View>
                  </View>
                  <View style={[styles.checkbox, area.isSelected && styles.checkboxSelected]}>
                    {area.isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="location-off" size={40} color={colors.gray400} />
              <Text style={styles.emptyText}>No areas found</Text>
            </View>
          )}
        </View>
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
  gray400: '#9CA3AF', gray500: '#6B7280', gray600: '#4B5563', gray800: '#1F2937',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray600, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  scrollContainer: { paddingBottom: 100 },
  summaryCard: { backgroundColor: colors.white, margin: 16, borderRadius: 12, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, marginTop: -8 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 18, fontWeight: 'bold', color: colors.gray800 },
  summaryBadge: { backgroundColor: 'rgba(37, 99, 235, 0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  summaryBadgeText: { color: colors.primary, fontWeight: '500' },
  summaryDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  summaryDetailText: { color: colors.gray600, marginLeft: 8 },
  card: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.gray100, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  searchInput: { flex: 1, marginLeft: 8, height: 44, color: colors.gray800 },
  label: { color: colors.gray800, fontWeight: '500', marginBottom: 8 },
  listContainer: { marginHorizontal: 16 },
  listHeader: { color: colors.gray800, fontWeight: '500', marginBottom: 8 },
  areaItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  lastAreaItem: { borderBottomWidth: 0 },
  areaInfo: { flex: 1 },
  areaName: { fontSize: 16, fontWeight: '500', color: colors.gray800 },
  areaDetails: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  areaDetailText: { color: colors.gray500, fontSize: 12, marginLeft: 4 },
  dotSeparator: { width: 4, height: 4, backgroundColor: colors.gray300, borderRadius: 2, marginHorizontal: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: colors.gray300, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  emptyContainer: { backgroundColor: colors.white, borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyText: { color: colors.gray500, marginTop: 8, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.gray200 },
  saveButton: { paddingVertical: 14, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  saveButtonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  saveButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default ProServiceAreaScreen;

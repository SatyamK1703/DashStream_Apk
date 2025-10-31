import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdminStackParamList } from '../../../app/routes/AdminNavigator';
import { useAuth } from '../../store';

type AdminSettingsScreenNavigationProp = NativeStackNavigationProp<AdminStackParamList>;

const AdminSettingsScreen = () => {
  const navigation = useNavigation<AdminSettingsScreenNavigationProp>();
  const { logout } = useAuth();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  // ✅ Configure header with custom back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: { backgroundColor: '#fff' },
      headerTitle: 'Settings',
      headerTitleAlign: 'center',
      headerTintColor: '#000',
      headerLeft: () => (
        <TouchableOpacity style={{ paddingHorizontal: 12 }} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleLogout = () => {
    setShowLogoutConfirmation(false);
    logout();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* User Profile */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => navigation.navigate('AdminProfile')}>
          <View style={styles.settingItemLeft}>
            <Ionicons name="person-circle-outline" size={26} color="#4e73df" />
            <View>
              <Text style={styles.settingItemTitle}>User Profile</Text>
              <Text style={styles.settingItemSubtitle}>View & edit your details</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#CBD5E0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => navigation.navigate('AdminOffer')}>
          <View style={styles.settingItemLeft}>
            <FontAwesome5 name="tags" size={22} color="#38A169" />
            <View>
              <Text style={styles.settingItemTitle}>Offers </Text>
              <Text style={styles.settingItemSubtitle}>Manage your offers</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#CBD5E0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => navigation.navigate('AdminQuestion')}>
          <View style={styles.settingItemLeft}>
            <FontAwesome5 name="question" size={22} color="#38A169" />
            <View>
              <Text style={styles.settingItemTitle}>Question</Text>
              <Text style={styles.settingItemSubtitle}>Customer Question </Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#CBD5E0" />
        </TouchableOpacity>

        {/* Set Services Area */}
        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => navigation.navigate('AdminServicesArea')}>
          <View style={styles.settingItemLeft}>
            <FontAwesome5 name="map-marker-alt" size={22} color="#38A169" />
            <View>
              <Text style={styles.settingItemTitle}>Set Services Area</Text>
              <Text style={styles.settingItemSubtitle}>Manage your working locations</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#CBD5E0" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingCard}
          onPress={() => navigation.navigate('AdminQuickFix')}>
          <View style={styles.settingItemLeft}>
            <FontAwesome5 name="tools" size={22} color="#38A169" />
            <View>
              <Text style={styles.settingItemTitle}>Quick Fix Service</Text>
              <Text style={styles.settingItemSubtitle}>Common issues/problems</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={28} color="#CBD5E0" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutCard} onPress={() => setShowLogoutConfirmation(true)}>
          <MaterialIcons name="logout" size={24} color="#E53935" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={showLogoutConfirmation}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLogoutConfirmation(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.confirmationModal}>
              <Text style={styles.confirmationTitle}>Logout</Text>
              <Text style={styles.confirmationText}>Are you sure you want to logout?</Text>

              <View style={styles.confirmationButtons}>
                <TouchableOpacity
                  style={[styles.confirmationButton, styles.cancelButton]}
                  onPress={() => setShowLogoutConfirmation(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.confirmationButton, styles.logoutConfirmButton]}
                  onPress={handleLogout}>
                  <Text style={styles.logoutConfirmText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // ✅ so header and background match
  },
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingItemTitle: { fontSize: 16, fontWeight: '600', color: '#2D3748' },
  settingItemSubtitle: { fontSize: 13, color: '#718096' },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    marginHorizontal: 16,
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53935',
    marginLeft: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  confirmationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },
  confirmationText: { fontSize: 15, color: '#4A5568', marginBottom: 20 },
  confirmationButtons: { flexDirection: 'row', justifyContent: 'flex-end' },
  confirmationButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 12,
  },
  cancelButton: { backgroundColor: '#EDF2F7' },
  cancelButtonText: { color: '#2D3748', fontSize: 14, fontWeight: '500' },
  logoutConfirmButton: { backgroundColor: '#E53935' },
  logoutConfirmText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});

export default AdminSettingsScreen;

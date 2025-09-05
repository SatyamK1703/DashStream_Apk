import React, {useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

// Mock types and hooks for self-contained component
type ProStackParamList = {
  ProSettings: undefined;
  Support: undefined;
};

const useAuth = () => ({
  logout: async () => {
    console.log('Logging out...');
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
});

type ProSettingsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const ProSettingsScreen = () => {
  const navigation = useNavigation<ProSettingsScreenNavigationProp>();
  const { logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [language, setLanguage] = useState('English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim().length < 10) {
      Alert.alert('Error', 'Please provide more detailed feedback.');
      return;
    }
    Alert.alert('Thank You!', 'Your feedback has been submitted.', [
      { text: 'OK', onPress: () => setShowFeedbackModal(false) },
    ]);
  };

  const SettingsSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );

  const SettingsItem = ({ icon, title, subtitle, rightElement, onPress, showBorder = true }: { icon: React.ReactNode, title: string, subtitle?: string, rightElement?: React.ReactNode, onPress?: () => void, showBorder?: boolean }) => (
    <TouchableOpacity style={[styles.itemContainer, showBorder && styles.itemBorder]} onPress={onPress} disabled={!onPress}>
      <View style={styles.itemContent}>
        <View style={styles.itemIcon}>{icon}</View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement || (onPress && <Ionicons name="chevron-forward" size={20} color={colors.gray400} />)}
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView>
        <SettingsSection title="App Preferences">
          <SettingsItem icon={<Ionicons name="notifications" size={22} color={colors.primary} />} title="Notifications" rightElement={<Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.gray300, true: colors.blue200 }} thumbColor={notificationsEnabled ? colors.primary : colors.gray400} />} />
          <SettingsItem icon={<Ionicons name="location" size={22} color={colors.green500} />} title="Location Services" rightElement={<Switch value={locationEnabled} onValueChange={setLocationEnabled} trackColor={{ false: colors.gray300, true: colors.green200 }} thumbColor={locationEnabled ? colors.green500 : colors.gray400} />} />
          <SettingsItem icon={<MaterialIcons name="language" size={22} color={colors.purple500} />} title="Language" subtitle={language} onPress={() => setShowLanguageModal(true)} showBorder={false} />
        </SettingsSection>

        <SettingsSection title="Support & Feedback">
          <SettingsItem icon={<MaterialIcons name="help-outline" size={22} color={colors.primary} />} title="Help Center" onPress={() => navigation.navigate('Support')} />
          <SettingsItem icon={<MaterialIcons name="feedback" size={22} color={colors.purple500} />} title="Send Feedback" onPress={() => setShowFeedbackModal(true)} showBorder={false} />
        </SettingsSection>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            {languages.map(lang => (
              <TouchableOpacity key={lang} style={styles.languageOption} onPress={() => { setLanguage(lang); setShowLanguageModal(false); }}>
                <Text style={styles.languageText}>{lang}</Text>
                {language === lang && <Ionicons name="checkmark" size={22} color={colors.primary} />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowLanguageModal(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Feedback Modal */}
      <Modal visible={showFeedbackModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Feedback</Text>
            <TextInput style={styles.feedbackInput} multiline placeholder="Your feedback helps us improve..." value={feedbackText} onChangeText={setFeedbackText} />
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitFeedback}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFeedbackModal(false)}>
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray200: '#E5E7EB', gray300: '#D1D5DB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray800: '#1F2937', red500: '#EF4444', blue200: '#BFDBFE', green200: '#A7F3D0', green500: '#22C55E',
  purple500: '#8B5CF6',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  sectionContainer: { marginTop: 24 },
  sectionTitle: { paddingHorizontal: 16, color: colors.gray500, fontSize: 14, fontWeight: '500', marginBottom: 8, textTransform: 'uppercase' },
  sectionCard: { backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16, overflow: 'hidden' },
  itemContainer: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  itemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  itemIcon: { width: 24, alignItems: 'center', marginRight: 16 },
  itemTextContainer: { flex: 1 },
  itemTitle: { color: colors.gray800, fontSize: 16, fontWeight: '500' },
  itemSubtitle: { color: colors.gray500, fontSize: 14, marginTop: 2 },
  logoutContainer: { paddingHorizontal: 16, paddingVertical: 24 },
  logoutButton: { backgroundColor: colors.red500, paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  logoutButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  languageOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  languageText: { fontSize: 16 },
  closeButton: { marginTop: 16, padding: 12, alignItems: 'center' },
  closeButtonText: { color: colors.primary, fontSize: 16 },
  feedbackInput: { borderWidth: 1, borderColor: colors.gray300, borderRadius: 8, padding: 12, height: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  submitButtonText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});

export default ProSettingsScreen;

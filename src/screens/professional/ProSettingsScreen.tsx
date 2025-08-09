// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Switch,
//   ScrollView,
//   Alert,
//   Modal,
//   TextInput
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { useAuth } from '../../context/AuthContext';
// import { ProStackParamList } from '../../../app/routes/ProNavigator';

// type ProSettingsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// interface SettingsSectionProps {
//   title: string;
//   children: React.ReactNode;
// }

// interface SettingsItemProps {
//   icon: React.ReactNode;
//   title: string;
//   subtitle?: string;
//   rightElement?: React.ReactNode;
//   onPress?: () => void;
//   showBorder?: boolean;
// }

// const ProSettingsScreen = () => {
//   const navigation = useNavigation<ProSettingsScreenNavigationProp>();
//   const { logout } = useAuth();
  
//   // State for settings
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true);
//   const [paymentAlertsEnabled, setPaymentAlertsEnabled] = useState(true);
//   const [locationEnabled, setLocationEnabled] = useState(true);
//   const [darkModeEnabled, setDarkModeEnabled] = useState(false);
//   const [autoAcceptJobs, setAutoAcceptJobs] = useState(false);
//   const [language, setLanguage] = useState('English');
//   const [showLanguageModal, setShowLanguageModal] = useState(false);
//   const [showFeedbackModal, setShowFeedbackModal] = useState(false);
//   const [feedbackText, setFeedbackText] = useState('');
  
//   const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi', 'Gujarati'];
  
//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Logout', 
//           style: 'destructive',
//           onPress: () => logout()
//         }
//       ]
//     );
//   };
  
//   const handleSubmitFeedback = () => {
//     if (feedbackText.trim().length < 10) {
//       Alert.alert('Error', 'Please provide more detailed feedback (at least 10 characters)');
//       return;
//     }
    
//     // Simulate API call to submit feedback
//     Alert.alert(
//       'Thank You!',
//       'Your feedback has been submitted successfully. We appreciate your input to help us improve.',
//       [{ text: 'OK', onPress: () => {
//         setFeedbackText('');
//         setShowFeedbackModal(false);
//       }}]
//     );
//   };
  
//   const handleRateApp = () => {
//     Alert.alert(
//       'Rate DashStream Pro',
//       'You\'ll be redirected to the app store to rate our app.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Continue', onPress: () => {
//           // In a real app, this would use Linking to open the app store
//           Alert.alert('Success', 'Thank you for rating our app!');
//         }}
//       ]
//     );
//   };
  
//   const handleClearCache = () => {
//     Alert.alert(
//       'Clear Cache',
//       'This will clear all cached data. The app may take longer to load next time.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Clear', 
//           onPress: () => {
//             // Simulate clearing cache
//             Alert.alert('Success', 'Cache cleared successfully');
//           }
//         }
//       ]
//     );
//   };

//   return (
//     <View className="flex-1 bg-gray-50">
//       {/* Header */}
//       <View className="bg-primary pt-12 pb-4 px-4">
//         <View className="flex-row items-center">
//           <TouchableOpacity
//             className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={20} color="white" />
//           </TouchableOpacity>
//           <Text className="text-white text-xl font-bold ml-4">Settings</Text>
//         </View>
//       </View>
      
//       <ScrollView className="flex-1">
//         {/* App Preferences */}
//         <SettingsSection title="App Preferences">
//           <SettingsItem
//             icon={<Ionicons name="notifications" size={22} color="#2563EB" />}
//             title="Notifications"
//             rightElement={
//               <Switch
//                 value={notificationsEnabled}
//                 onValueChange={setNotificationsEnabled}
//                 trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
//                 thumbColor={notificationsEnabled ? '#2563EB' : '#9CA3AF'}
//               />
//             }
//           />
          
//           {notificationsEnabled && (
//             <>
//               <SettingsItem
//                 icon={<View className="w-6" />}
//                 title="Job Alerts"
//                 subtitle="Receive alerts for new jobs and updates"
//                 rightElement={
//                   <Switch
//                     value={jobAlertsEnabled}
//                     onValueChange={setJobAlertsEnabled}
//                     trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
//                     thumbColor={jobAlertsEnabled ? '#2563EB' : '#9CA3AF'}
//                   />
//                 }
//               />
              
//               <SettingsItem
//                 icon={<View className="w-6" />}
//                 title="Payment Alerts"
//                 subtitle="Receive alerts for payments and earnings"
//                 rightElement={
//                   <Switch
//                     value={paymentAlertsEnabled}
//                     onValueChange={setPaymentAlertsEnabled}
//                     trackColor={{ false: '#D1D5DB', true: '#BFDBFE' }}
//                     thumbColor={paymentAlertsEnabled ? '#2563EB' : '#9CA3AF'}
//                   />
//                 }
//                 showBorder={false}
//               />
//             </>
//           )}
          
//           <SettingsItem
//             icon={<Ionicons name="location" size={22} color="#10B981" />}
//             title="Location Services"
//             subtitle="Allow app to access your location"
//             rightElement={
//               <Switch
//                 value={locationEnabled}
//                 onValueChange={setLocationEnabled}
//                 trackColor={{ false: '#D1D5DB', true: '#D1FAE5' }}
//                 thumbColor={locationEnabled ? '#10B981' : '#9CA3AF'}
//               />
//             }
//           />
          
//           <SettingsItem
//             icon={<MaterialCommunityIcons name="theme-light-dark" size={22} color="#6366F1" />}
//             title="Dark Mode"
//             subtitle="Switch between light and dark theme"
//             rightElement={
//               <Switch
//                 value={darkModeEnabled}
//                 onValueChange={setDarkModeEnabled}
//                 trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
//                 thumbColor={darkModeEnabled ? '#6366F1' : '#9CA3AF'}
//               />
//             }
//           />
          
//           <SettingsItem
//             icon={<MaterialCommunityIcons name="auto-fix" size={22} color="#F59E0B" />}
//             title="Auto-Accept Jobs"
//             subtitle="Automatically accept jobs in your service area"
//             rightElement={
//               <Switch
//                 value={autoAcceptJobs}
//                 onValueChange={setAutoAcceptJobs}
//                 trackColor={{ false: '#D1D5DB', true: '#FEF3C7' }}
//                 thumbColor={autoAcceptJobs ? '#F59E0B' : '#9CA3AF'}
//               />
//             }
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="language" size={22} color="#8B5CF6" />}
//             title="Language"
//             subtitle={language}
//             onPress={() => setShowLanguageModal(true)}
//             showBorder={false}
//           />
//         </SettingsSection>
        
//         {/* Account & Security */}
//         <SettingsSection title="Account & Security">
//           <SettingsItem
//             icon={<MaterialIcons name="security" size={22} color="#EF4444" />}
//             title="Change Password"
//             onPress={() => Alert.alert('Feature', 'Change password functionality will be implemented soon.')}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="verified-user" size={22} color="#10B981" />}
//             title="Two-Factor Authentication"
//             subtitle="Add an extra layer of security"
//             rightElement={
//               <Switch
//                 value={false}
//                 onValueChange={() => Alert.alert('Feature', '2FA will be implemented soon.')}
//                 trackColor={{ false: '#D1D5DB', true: '#D1FAE5' }}
//                 thumbColor={'#9CA3AF'}
//               />
//             }
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="privacy-tip" size={22} color="#6366F1" />}
//             title="Privacy Settings"
//             onPress={() => Alert.alert('Feature', 'Privacy settings will be implemented soon.')}
//             showBorder={false}
//           />
//         </SettingsSection>
        
//         {/* Support & Feedback */}
//         <SettingsSection title="Support & Feedback">
//           <SettingsItem
//             icon={<MaterialIcons name="help-outline" size={22} color="#2563EB" />}
//             title="Help Center"
//             onPress={() => navigation.navigate('Support')}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="feedback" size={22} color="#8B5CF6" />}
//             title="Send Feedback"
//             onPress={() => setShowFeedbackModal(true)}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="star-rate" size={22} color="#F59E0B" />}
//             title="Rate the App"
//             onPress={handleRateApp}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="description" size={22} color="#6B7280" />}
//             title="Terms of Service"
//             onPress={() => Alert.alert('Terms of Service', 'Terms of service will be displayed here.')}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="privacy-tip" size={22} color="#6B7280" />}
//             title="Privacy Policy"
//             onPress={() => Alert.alert('Privacy Policy', 'Privacy policy will be displayed here.')}
//             showBorder={false}
//           />
//         </SettingsSection>
        
//         {/* Data & Storage */}
//         <SettingsSection title="Data & Storage">
//           <SettingsItem
//             icon={<MaterialIcons name="storage" size={22} color="#6B7280" />}
//             title="Storage Usage"
//             subtitle="12.5 MB used"
//             onPress={() => Alert.alert('Storage', 'Detailed storage information will be displayed here.')}
//           />
          
//           <SettingsItem
//             icon={<MaterialIcons name="cleaning-services" size={22} color="#EF4444" />}
//             title="Clear Cache"
//             subtitle="Free up space by clearing cached data"
//             onPress={handleClearCache}
//             showBorder={false}
//           />
//         </SettingsSection>
        
//         {/* App Info */}
//         <SettingsSection title="App Info">
//           <SettingsItem
//             icon={<MaterialIcons name="info" size={22} color="#2563EB" />}
//             title="Version"
//             subtitle="DashStream Pro v1.0.0"
//             showBorder={false}
//           />
//         </SettingsSection>
        
//         {/* Logout Button */}
//         <View className="px-4 py-6">
//           <TouchableOpacity
//             className="bg-red-500 py-3 rounded-lg items-center"
//             onPress={handleLogout}
//           >
//             <Text className="text-white font-medium text-base">Logout</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
      
//       {/* Language Selection Modal */}
//       <Modal
//         visible={showLanguageModal}
//         transparent
//         animationType="slide"
//       >
//         <View className="flex-1 justify-end bg-black/50">
//           <View className="bg-white rounded-t-3xl">
//             <View className="p-4 border-b border-gray-200">
//               <Text className="text-xl font-bold text-center">Select Language</Text>
//               <TouchableOpacity
//                 className="absolute right-4 top-4"
//                 onPress={() => setShowLanguageModal(false)}
//               >
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView className="max-h-96">
//               {languages.map((lang, index) => (
//                 <TouchableOpacity
//                   key={lang}
//                   className={`p-4 flex-row items-center justify-between ${index < languages.length - 1 ? 'border-b border-gray-200' : ''}`}
//                   onPress={() => {
//                     setLanguage(lang);
//                     setShowLanguageModal(false);
//                   }}
//                 >
//                   <Text className="text-base">{lang}</Text>
//                   {language === lang && (
//                     <Ionicons name="checkmark" size={22} color="#2563EB" />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
      
//       {/* Feedback Modal */}
//       <Modal
//         visible={showFeedbackModal}
//         transparent
//         animationType="slide"
//       >
//         <View className="flex-1 justify-end bg-black/50">
//           <View className="bg-white rounded-t-3xl">
//             <View className="p-4 border-b border-gray-200">
//               <Text className="text-xl font-bold text-center">Send Feedback</Text>
//               <TouchableOpacity
//                 className="absolute right-4 top-4"
//                 onPress={() => {
//                   setShowFeedbackModal(false);
//                   setFeedbackText('');
//                 }}
//               >
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
            
//             <View className="p-4">
//               <Text className="text-gray-700 mb-2">Tell us what you think about the app:</Text>
//               <TextInput
//                 className="border border-gray-300 rounded-lg p-3 h-32 text-base"
//                 multiline
//                 placeholder="Your feedback helps us improve..."
//                 value={feedbackText}
//                 onChangeText={setFeedbackText}
//                 textAlignVertical="top"
//               />
              
//               <TouchableOpacity
//                 className="bg-primary py-3 rounded-lg items-center mt-4"
//                 onPress={handleSubmitFeedback}
//               >
//                 <Text className="text-white font-medium text-base">Submit Feedback</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const SettingsSection = ({ title, children }: SettingsSectionProps) => (
//   <View className="mt-6">
//     <Text className="px-4 text-gray-500 text-sm uppercase font-medium mb-1">{title}</Text>
//     <View className="bg-white rounded-lg mx-4 overflow-hidden">
//       {children}
//     </View>
//   </View>
// );

// const SettingsItem = ({ 
//   icon, 
//   title, 
//   subtitle, 
//   rightElement, 
//   onPress,
//   showBorder = true
// }: SettingsItemProps) => (
//   <TouchableOpacity
//     className={`flex-row items-center p-4 ${showBorder ? 'border-b border-gray-200' : ''}`}
//     onPress={onPress}
//     disabled={!onPress}
//   >
//     <View className="w-8 items-center mr-3">
//       {icon}
//     </View>
//     <View className="flex-1">
//       <Text className="text-gray-800 font-medium">{title}</Text>
//       {subtitle && <Text className="text-gray-500 text-sm mt-0.5">{subtitle}</Text>}
//     </View>
//     {rightElement ? (
//       rightElement
//     ) : onPress ? (
//       <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//     ) : null}
//   </TouchableOpacity>
// );

// export default ProSettingsScreen;



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

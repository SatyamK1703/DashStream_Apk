// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   Switch,
//   Alert,
//   ActivityIndicator
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
// import { useAuth } from '../../context/AuthContext';
// import { ProStackParamList } from '../../../app/routes/ProNavigator';

// type ProProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// const ProProfileScreen = () => {
//   const navigation = useNavigation<ProProfileScreenNavigationProp>();
//   const { user, logout } = useAuth();
//   const [isLoggingOut, setIsLoggingOut] = useState(false);
//   const [isAvailable, setIsAvailable] = useState(true);
//   const [notificationsEnabled, setNotificationsEnabled] = useState(true);
//   const [locationEnabled, setLocationEnabled] = useState(true);
  
//   // Mock professional data
//   const professionalData = {
//     id: 'PRO123456',
//     name: user?.name || 'Rajesh Kumar',
//     phone: user?.phone || '+91 9876543210',
//     email: user?.email || 'rajesh.kumar@example.com',
//     profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
//     rating: 4.8,
//     totalJobs: 142,
//     completionRate: 98,
//     skills: ['Car Wash', 'Interior Cleaning', 'Polishing', 'Detailing'],
//     experience: '3 years',
//     joinedDate: 'May 2020',
//     accountStatus: 'Active',
//     verificationStatus: 'Verified',
//     bankDetails: {
//       accountNumber: 'XXXX XXXX 1234',
//       bankName: 'HDFC Bank',
//       ifscCode: 'HDFC0001234'
//     },
//     documents: [
//       { type: 'ID Proof', status: 'verified', expiryDate: '2025-05-15' },
//       { type: 'Address Proof', status: 'verified', expiryDate: null },
//       { type: 'Professional Certificate', status: 'verified', expiryDate: '2024-12-31' }
//     ],
//     serviceArea: 'Bangalore South, Koramangala, HSR Layout, Indiranagar'
//   };
  
//   const handleLogout = () => {
//     Alert.alert(
//       'Logout',
//       'Are you sure you want to logout?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Logout', 
//           style: 'destructive',
//           onPress: async () => {
//             setIsLoggingOut(true);
//             try {
//               await logout();
//               // Navigation will be handled by RootNavigator based on auth state
//             } catch (error) {
//               Alert.alert('Error', 'Failed to logout. Please try again.');
//               setIsLoggingOut(false);
//             }
//           }
//         }
//       ]
//     );
//   };
  
//   const handleAvailabilityToggle = (value: boolean) => {
//     setIsAvailable(value);
//     // In a real app, this would update the professional's availability status on the server
//     Alert.alert(
//       value ? 'You are now Available' : 'You are now Unavailable',
//       value 
//         ? 'You will receive new job requests.' 
//         : 'You will not receive new job requests until you turn availability back on.'
//     );
//   };
  
//   const renderProfileHeader = () => (
//     <View className="bg-primary pt-12 pb-6 px-4">
//       <View className="flex-row justify-between items-center mb-4">
//         <Text className="text-white text-xl font-bold">My Profile</Text>
//         <TouchableOpacity 
//           className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
//           onPress={() => navigation.navigate('ProNotifications')}
//         >
//           <Ionicons name="notifications" size={20} color="white" />
//         </TouchableOpacity>
//       </View>
      
//       <View className="flex-row items-center">
//         <Image 
//           source={{ uri: professionalData.profileImage }}
//           className="w-20 h-20 rounded-full border-2 border-white"
//         />
//         <View className="ml-4">
//           <Text className="text-white text-lg font-bold">{professionalData.name}</Text>
//           <View className="flex-row items-center mt-1">
//             <Ionicons name="star" size={16} color="#F59E0B" />
//             <Text className="text-white ml-1">{professionalData.rating} • {professionalData.totalJobs} jobs</Text>
//           </View>
//           <View className="flex-row items-center mt-1">
//             <MaterialIcons name="verified" size={16} color="#10B981" />
//             <Text className="text-white ml-1">Verified Professional</Text>
//           </View>
//         </View>
//       </View>
//     </View>
//   );
  
//   const renderAvailabilityCard = () => (
//     <View className="bg-white rounded-xl mx-4 p-4 shadow-sm -mt-5">
//       <View className="flex-row justify-between items-center">
//         <View className="flex-row items-center">
//           <View className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
//           <Text className="text-gray-800 font-medium ml-2">
//             {isAvailable ? 'Available for Jobs' : 'Unavailable'}
//           </Text>
//         </View>
//         <Switch
//           trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
//           thumbColor={isAvailable ? '#2563EB' : '#9CA3AF'}
//           onValueChange={handleAvailabilityToggle}
//           value={isAvailable}
//         />
//       </View>
      
//       <Text className="text-gray-500 text-sm mt-2">
//         {isAvailable 
//           ? 'You are currently visible to customers and can receive new job requests.' 
//           : 'You are currently not visible to customers and will not receive new job requests.'}
//       </Text>
//     </View>
//   );
  
//   const renderMenuItem = (
//     icon: React.ReactNode,
//     title: string,
//     subtitle: string | null = null,
//     onPress: () => void,
//     rightContent: React.ReactNode | null = null
//   ) => (
//     <TouchableOpacity 
//       className="flex-row items-center justify-between py-4 border-b border-gray-100"
//       onPress={onPress}
//     >
//       <View className="flex-row items-center">
//         <View className="w-10 items-center">
//           {icon}
//         </View>
//         <View className="ml-3">
//           <Text className="text-gray-800 font-medium">{title}</Text>
//           {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
//         </View>
//       </View>
//       {rightContent || (
//         <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
//       )}
//     </TouchableOpacity>
//   );
  
//   if (isLoggingOut) {
//     return (
//       <View className="flex-1 items-center justify-center bg-white">
//         <ActivityIndicator size="large" color="#2563EB" />
//         <Text className="text-gray-600 mt-4">Logging out...</Text>
//       </View>
//     );
//   }
  
//   return (
//     <View className="flex-1 bg-gray-50">
//       {renderProfileHeader()}
      
//       {renderAvailabilityCard()}
      
//       <ScrollView className="flex-1 mt-4">
//         <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4">
//           <Text className="text-gray-800 font-bold text-lg mb-2">Personal Information</Text>
          
//           {renderMenuItem(
//             <Ionicons name="person" size={20} color="#2563EB" />,
//             'Edit Profile',
//             'Update your personal details',
//             () => navigation.navigate('ProEditProfile')
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="location-on" size={20} color="#2563EB" />,
//             'Service Area',
//             professionalData.serviceArea,
//             () => navigation.navigate('ProServiceArea')
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="verified" size={20} color="#2563EB" />,
//             'Verification & Documents',
//             'ID, Address & Professional Certificates',
//             () => navigation.navigate('ProDocuments')
//           )}
          
//           {renderMenuItem(
//             <MaterialCommunityIcons name="certificate" size={20} color="#2563EB" />,
//             'Skills & Expertise',
//             professionalData.skills.join(', '),
//             () => navigation.navigate('ProSkills')
//           )}
//         </View>
        
//         <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4">
//           <Text className="text-gray-800 font-bold text-lg mb-2">Payment & Banking</Text>
          
//           {renderMenuItem(
//             <MaterialIcons name="account-balance" size={20} color="#2563EB" />,
//             'Bank Account',
//             `${professionalData.bankDetails.bankName} - ${professionalData.bankDetails.accountNumber}`,
//             () => navigation.navigate('ProBankDetails')
//           )}
          
//           {renderMenuItem(
//             <FontAwesome5 name="file-invoice" size={18} color="#2563EB" />,
//             'Tax Information',
//             'PAN Card & GST Details',
//             () => navigation.navigate('ProTaxInfo')
//           )}
//         </View>
        
//         <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4">
//           <Text className="text-gray-800 font-bold text-lg mb-2">App Settings</Text>
          
//           {renderMenuItem(
//             <Ionicons name="notifications" size={20} color="#2563EB" />,
//             'Notifications',
//             'Manage your notification preferences',
//             () => {},
//             <Switch
//               trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
//               thumbColor={notificationsEnabled ? '#2563EB' : '#9CA3AF'}
//               onValueChange={setNotificationsEnabled}
//               value={notificationsEnabled}
//             />
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="location-on" size={20} color="#2563EB" />,
//             'Location Services',
//             'Allow app to access your location',
//             () => {},
//             <Switch
//               trackColor={{ false: '#E5E7EB', true: '#BFDBFE' }}
//               thumbColor={locationEnabled ? '#2563EB' : '#9CA3AF'}
//               onValueChange={setLocationEnabled}
//               value={locationEnabled}
//             />
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="language" size={20} color="#2563EB" />,
//             'Language',
//             'English',
//             () => navigation.navigate('ProLanguage')
//           )}
//         </View>
        
//         <View className="bg-white mx-4 rounded-xl shadow-sm p-4 mb-4">
//           <Text className="text-gray-800 font-bold text-lg mb-2">Support</Text>
          
//           {renderMenuItem(
//             <MaterialIcons name="help" size={20} color="#2563EB" />,
//             'Help & Support',
//             'Get help with your account',
//             () => navigation.navigate('ProSupport')
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="policy" size={20} color="#2563EB" />,
//             'Terms & Policies',
//             'Privacy policy, terms of service',
//             () => navigation.navigate('ProTerms')
//           )}
          
//           {renderMenuItem(
//             <MaterialIcons name="star" size={20} color="#2563EB" />,
//             'Rate the App',
//             'Tell us what you think',
//             () => {
//               // In a real app, this would open the app store rating page
//               Alert.alert('Rate Us', 'This would open the app store rating page.');
//             }
//           )}
//         </View>
        
//         <TouchableOpacity 
//           className="mx-4 my-6 py-4 bg-red-50 rounded-xl items-center"
//           onPress={handleLogout}
//         >
//           <Text className="text-red-600 font-medium">Logout</Text>
//         </TouchableOpacity>
        
//         <View className="items-center mb-8">
//           <Text className="text-gray-400 text-sm">DashStream Professional</Text>
//           <Text className="text-gray-400 text-sm">Version 1.0.0</Text>
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default ProProfileScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types and hooks for self-contained component
type ProStackParamList = {
  ProProfile: undefined;
  ProNotifications: undefined;
  ProEditProfile: undefined;
  ProServiceArea: undefined;
  ProDocuments: undefined;
  ProSkills: undefined;
  ProBankDetails: undefined;
  ProTaxInfo: undefined;
  ProLanguage: undefined;
  ProSupport: undefined;
  ProTerms: undefined;
};

const useAuth = () => ({
  user: { name: 'Rajesh Kumar', phone: '+91 9876543210', email: 'rajesh.kumar@example.com' },
  logout: async () => {
    console.log('Logging out...');
    return new Promise(resolve => setTimeout(resolve, 1000));
  },
});

type ProProfileScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

const ProProfileScreen = () => {
  const navigation = useNavigation<ProProfileScreenNavigationProp>();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
          setIsLoggingOut(true);
          await logout();
          // In a real app, navigation would be handled by a root navigator listening to auth state
          setIsLoggingOut(false);
        },
      },
    ]);
  };

  const renderMenuItem = (icon: React.ReactNode, title: string, subtitle: string | null, onPress: () => void, rightContent?: React.ReactNode) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <View style={styles.menuIconContainer}>{icon}</View>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuSubtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>
      </View>
      {rightContent || <MaterialIcons name="chevron-right" size={24} color={colors.gray400} />}
    </TouchableOpacity>
  );

  if (isLoggingOut) {
    return (
      <View style={styles.centeredScreen}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('ProNotifications')}>
              <Ionicons name="notifications" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfoContainer}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.profileImage} />
            <View style={styles.profileTextContainer}>
              <Text style={styles.profileName}>{user?.name}</Text>
              <View style={styles.profileStatRow}>
                <Ionicons name="star" size={16} color={colors.amber400} />
                <Text style={styles.profileStatText}>4.8 • 142 jobs</Text>
              </View>
              <View style={styles.profileStatRow}>
                <MaterialIcons name="verified" size={16} color={colors.green500} />
                <Text style={styles.profileStatText}>Verified Professional</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityInfo}>
              <View style={[styles.availabilityDot, { backgroundColor: isAvailable ? colors.green500 : colors.red500 }]} />
              <Text style={styles.availabilityText}>{isAvailable ? 'Available for Jobs' : 'Unavailable'}</Text>
            </View>
            <Switch
              trackColor={{ false: colors.gray200, true: colors.blue200 }}
              thumbColor={isAvailable ? colors.primary : colors.gray400}
              onValueChange={setIsAvailable}
              value={isAvailable}
            />
          </View>

          {/* Menu Sections */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            {renderMenuItem(<Ionicons name="person" size={20} color={colors.primary} />, 'Edit Profile', 'Update your personal details', () => navigation.navigate('ProEditProfile'))}
            {renderMenuItem(<MaterialIcons name="location-on" size={20} color={colors.primary} />, 'Service Area', 'Bangalore South, Koramangala...', () => navigation.navigate('ProServiceArea'))}
            {renderMenuItem(<MaterialIcons name="verified" size={20} color={colors.primary} />, 'Verification & Documents', 'ID, Address & Certificates', () => navigation.navigate('ProDocuments'))}
            {renderMenuItem(<MaterialCommunityIcons name="certificate" size={20} color={colors.primary} />, 'Skills & Expertise', 'Car Wash, Interior Cleaning...', () => navigation.navigate('ProSkills'))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>App Settings</Text>
            {renderMenuItem(
              <Ionicons name="notifications" size={20} color={colors.primary} />, 'Notifications', null, () => {},
              <Switch trackColor={{ false: colors.gray200, true: colors.blue200 }} thumbColor={notificationsEnabled ? colors.primary : colors.gray400} onValueChange={setNotificationsEnabled} value={notificationsEnabled} />
            )}
            {renderMenuItem(<MaterialIcons name="language" size={20} color={colors.primary} />, 'Language', 'English', () => navigation.navigate('ProLanguage'))}
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>DashStream Professional</Text>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const colors = {
  primary: '#2563EB', white: '#FFFFFF', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray400: '#9CA3AF',
  gray500: '#6B7280', gray800: '#1F2937', amber400: '#FBBF24', green500: '#22C55E', red500: '#EF4444', red600: '#DC2626',
  blue200: '#BFDBFE',
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray500, marginTop: 16 },
  header: { backgroundColor: colors.primary, paddingTop: Platform.OS === 'android' ? 24 : 48, paddingBottom: 32, paddingHorizontal: 16 },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { color: colors.white, fontSize: 22, fontWeight: 'bold' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  profileInfoContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.white },
  profileTextContainer: { marginLeft: 16 },
  profileName: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
  profileStatRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  profileStatText: { color: colors.white, marginLeft: 8 },
  contentContainer: { paddingBottom: 32 },
  availabilityCard: { backgroundColor: colors.white, borderRadius: 12, marginHorizontal: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, marginTop: -24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  availabilityInfo: { flexDirection: 'row', alignItems: 'center' },
  availabilityDot: { width: 12, height: 12, borderRadius: 6 },
  availabilityText: { color: colors.gray800, fontWeight: '500', marginLeft: 8 },
  card: { backgroundColor: colors.white, marginHorizontal: 16, borderRadius: 12, marginTop: 16, paddingHorizontal: 16, paddingTop: 16 },
  cardTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  menuItemContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIconContainer: { width: 40, alignItems: 'center' },
  menuTextContainer: { marginLeft: 12, flex: 1 },
  menuTitle: { color: colors.gray800, fontWeight: '500', fontSize: 16 },
  menuSubtitle: { color: colors.gray500, fontSize: 14, marginTop: 2 },
  logoutButton: { marginHorizontal: 16, marginTop: 24, paddingVertical: 16, backgroundColor: '#FEF2F2', borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: colors.red600, fontWeight: '500', fontSize: 16 },
  footer: { alignItems: 'center', marginTop: 32 },
  footerText: { color: colors.gray400, fontSize: 12 },
});

export default ProProfileScreen;


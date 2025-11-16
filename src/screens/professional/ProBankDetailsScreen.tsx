// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Switch,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet, // Import StyleSheet
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// // Import proper types and hooks
// import ProNavigator from '../../../app/routes/ProNavigator';
// import { useProfessionalProfile, useProfessionalProfileActions } from '../../hooks/useProfessional';
// import { useApi } from '../../hooks/useApi';
// import httpClient from '../../services/httpClient';

// type ProBankDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// // Interface for a single bank account
// interface BankAccount {
//   id: string;
//   accountHolderName: string;
//   accountNumber: string;
//   ifscCode: string;
//   bankName: string;
//   accountType: 'savings' | 'current';
//   isDefault: boolean;
//   isVerified: boolean;
// }

// // Interface for tax information
// interface TaxInformation {
//   panNumber: string;
//   gstNumber?: string;
//   isGstRegistered: boolean;
// }

// const ProBankDetailsScreen = () => {
//   const navigation = useNavigation<ProBankDetailsScreenNavigationProp>();
//   const [isSaving, setIsSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState<'bank' | 'tax'>('bank');

//   // Use professional profile hooks
//   const {
//     data: profile,
//     isLoading: profileLoading,
//     execute: refreshProfile,
//   } = useProfessionalProfile();

//   // Bank details API hook
//   const {
//     data: bankDetails,
//     isLoading: bankLoading,
//     execute: refreshBankDetails,
//   } = useApi(() => httpClient.get('/professionals/bank-details'), { showErrorAlert: false });

//   // Bank account form state
//   const [accountHolderName, setAccountHolderName] = useState('');
//   const [accountNumber, setAccountNumber] = useState('');
//   const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
//   const [ifscCode, setIfscCode] = useState('');
//   const [bankName, setBankName] = useState('');
//   const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
//   const [isDefault, setIsDefault] = useState(true);

//   // Tax information form state
//   const [panNumber, setPanNumber] = useState('');
//   const [gstNumber, setGstNumber] = useState('');
//   const [isGstRegistered, setIsGstRegistered] = useState(false);

//   const isLoading = profileLoading || bankLoading;

//   // Initialize form with existing data
//   useEffect(() => {
//     if (bankDetails?.bankAccount) {
//       const account = bankDetails.bankAccount;
//       setAccountHolderName(account.accountHolderName || '');
//       setAccountNumber(account.accountNumber || '');
//       setConfirmAccountNumber(account.accountNumber || '');
//       setIfscCode(account.ifscCode || '');
//       setBankName(account.bankName || '');
//       setAccountType(account.accountType || 'savings');
//       setIsDefault(account.isDefault || true);
//     }

//     if (bankDetails?.taxInfo) {
//       const tax = bankDetails.taxInfo;
//       setPanNumber(tax.panNumber || '');
//       setGstNumber(tax.gstNumber || '');
//       setIsGstRegistered(tax.isGstRegistered || false);
//     }
//   }, [bankDetails]);

//   // Helper function to reset the bank form fields
//   const resetBankForm = () => {
//     setAccountHolderName('');
//     setAccountNumber('');
//     setConfirmAccountNumber('');
//     setIfscCode('');
//     setBankName('');
//     setAccountType('savings');
//     setIsDefault(true);
//   };

//   // --- Form Validation ---
//   const validateBankForm = () => {
//     if (
//       !accountHolderName.trim() ||
//       !accountNumber.trim() ||
//       !ifscCode.trim() ||
//       !bankName.trim()
//     ) {
//       Alert.alert('Error', 'Please fill all required bank fields.');
//       return false;
//     }
//     if (accountNumber !== confirmAccountNumber) {
//       Alert.alert('Error', 'Account numbers do not match.');
//       return false;
//     }
//     return true;
//   };

//   const validateTaxForm = () => {
//     const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
//     const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
//     if (!panRegex.test(panNumber)) {
//       Alert.alert('Error', 'Please enter a valid PAN number.');
//       return false;
//     }
//     if (isGstRegistered && !gstRegex.test(gstNumber)) {
//       Alert.alert('Error', 'Please enter a valid GST number.');
//       return false;
//     }
//     return true;
//   };

//   // --- Handlers ---
//   const handleAddBankAccount = async () => {
//     if (!validateBankForm()) return;

//     setIsSaving(true);
//     try {
//       const bankAccountData = {
//         accountHolderName,
//         accountNumber,
//         ifscCode,
//         bankName,
//         accountType,
//         isDefault,
//       };

//       await httpClient.post('/professionals/bank-details', bankAccountData);
//       resetBankForm();
//       refreshBankDetails(); // Refresh the bank details
//       Alert.alert('Success', 'Bank account added successfully.');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to add bank account. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteBankAccount = async (accountId: string) => {
//     Alert.alert('Delete Account', 'Are you sure you want to delete this bank account?', [
//       { text: 'Cancel', style: 'cancel' },
//       {
//         text: 'Delete',
//         style: 'destructive',
//         onPress: async () => {
//           try {
//             await httpClient.delete(`/professionals/bank-details/${accountId}`);
//             refreshBankDetails();
//             Alert.alert('Success', 'Bank account deleted successfully.');
//           } catch (error) {
//             Alert.alert('Error', 'Failed to delete bank account. Please try again.');
//           }
//         },
//       },
//     ]);
//   };

//   const handleSetDefaultAccount = async (accountId: string) => {
//     try {
//       await httpClient.patch(`/professionals/bank-details/${accountId}/set-default`);
//       refreshBankDetails();
//       Alert.alert('Success', 'Default account updated successfully.');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update default account. Please try again.');
//     }
//   };

//   const handleSaveTaxInfo = async () => {
//     if (!validateTaxForm()) return;

//     setIsSaving(true);
//     try {
//       const taxData = {
//         panNumber,
//         gstNumber: isGstRegistered ? gstNumber : '',
//         isGstRegistered,
//       };

//       await httpClient.patch('/professionals/tax-info', taxData);
//       refreshBankDetails(); // Refresh to get updated tax info
//       Alert.alert('Success', 'Tax information updated successfully.');
//     } catch (error) {
//       Alert.alert('Error', 'Failed to update tax information. Please try again.');
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // --- Render Functions ---
//   const renderLoading = () => (
//     <View style={styles.centeredScreen}>
//       <ActivityIndicator size="large" color={colors.primary} />
//       <Text style={styles.loadingText}>Loading payment details...</Text>
//     </View>
//   );

//   const renderBankAccounts = () => (
//     <View style={styles.contentContainer}>
//       {bankAccounts.length > 0 && (
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Your Bank Accounts</Text>
//           {bankAccounts.map((account) => (
//             <View key={account.id} style={styles.accountCard}>
//               <View style={styles.accountCardContent}>
//                 <View style={styles.flex1}>
//                   <Text style={styles.bankName}>{account.bankName}</Text>
//                   <Text style={styles.accountDetail}>{account.accountHolderName}</Text>
//                   <Text style={styles.accountDetail}>
//                     A/C: {account.accountNumber.replace(/\d(?=\d{4})/g, '*')}
//                   </Text>
//                   <Text style={styles.accountDetail}>IFSC: {account.ifscCode}</Text>
//                   <Text style={[styles.accountDetail, styles.capitalize]}>
//                     Type: {account.accountType}
//                   </Text>
//                   <View style={styles.tagRow}>
//                     {account.isDefault && (
//                       <View style={[styles.tag, styles.defaultTag]}>
//                         <Text style={styles.defaultTagText}>Default</Text>
//                       </View>
//                     )}
//                     <View
//                       style={[
//                         styles.tag,
//                         account.isVerified ? styles.verifiedTag : styles.pendingTag,
//                       ]}>
//                       <Text
//                         style={account.isVerified ? styles.verifiedTagText : styles.pendingTagText}>
//                         {account.isVerified ? 'Verified' : 'Pending'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//                 <View style={styles.iconButtonRow}>
//                   {!account.isDefault && (
//                     <TouchableOpacity
//                       style={[styles.iconButton, styles.iconButtonGray]}
//                       onPress={() => handleSetDefaultAccount(account.id)}>
//                       <MaterialIcons name="star-outline" size={18} color={colors.gray600} />
//                     </TouchableOpacity>
//                   )}
//                   <TouchableOpacity
//                     style={[styles.iconButton, styles.iconButtonRed]}
//                     onPress={() => handleDeleteBankAccount(account.id)}>
//                     <MaterialIcons name="delete-outline" size={18} color={colors.red500} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>
//       )}

//       {/* Add New Bank Account Form */}
//       <View style={styles.formCard}>
//         <Text style={styles.sectionTitle}>
//           {bankAccounts.length > 0 ? 'Add Another Account' : 'Add Bank Account'}
//         </Text>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Account Holder Name</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter full name"
//             value={accountHolderName}
//             onChangeText={setAccountHolderName}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Account Number</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter account number"
//             value={accountNumber}
//             onChangeText={setAccountNumber}
//             keyboardType="number-pad"
//             maxLength={18}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Confirm Account Number</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Re-enter account number"
//             value={confirmAccountNumber}
//             onChangeText={setConfirmAccountNumber}
//             keyboardType="number-pad"
//             maxLength={18}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>IFSC Code</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter IFSC code"
//             value={ifscCode}
//             onChangeText={(text) => setIfscCode(text.toUpperCase())}
//             autoCapitalize="characters"
//             maxLength={11}
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Bank Name</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter bank name"
//             value={bankName}
//             onChangeText={setBankName}
//           />
//         </View>

//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Account Type</Text>
//           <View style={styles.radioGroup}>
//             <TouchableOpacity
//               style={[
//                 styles.radioButtonContainer,
//                 accountType === 'savings' && styles.radioSelected,
//               ]}
//               onPress={() => setAccountType('savings')}>
//               <View
//                 style={[styles.radioOuter, accountType === 'savings' && styles.radioOuterSelected]}>
//                 <View style={accountType === 'savings' && styles.radioInner} />
//               </View>
//               <Text
//                 style={[styles.radioLabel, accountType === 'savings' && styles.radioLabelSelected]}>
//                 Savings
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[
//                 styles.radioButtonContainer,
//                 accountType === 'current' && styles.radioSelected,
//               ]}
//               onPress={() => setAccountType('current')}>
//               <View
//                 style={[styles.radioOuter, accountType === 'current' && styles.radioOuterSelected]}>
//                 <View style={accountType === 'current' && styles.radioInner} />
//               </View>
//               <Text
//                 style={[styles.radioLabel, accountType === 'current' && styles.radioLabelSelected]}>
//                 Current
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {bankAccounts.length > 0 && (
//           <View style={styles.switchRow}>
//             <Switch
//               value={isDefault}
//               onValueChange={setIsDefault}
//               trackColor={{ false: colors.gray300, true: colors.primaryLight }}
//               thumbColor={isDefault ? colors.primary : colors.gray100}
//             />
//             <Text style={styles.switchLabel}>Set as default account</Text>
//           </View>
//         )}

//         <TouchableOpacity
//           style={[styles.button, isSaving && styles.buttonDisabled]}
//           onPress={handleAddBankAccount}
//           disabled={isSaving}>
//           {isSaving ? (
//             <ActivityIndicator color={colors.white} size="small" />
//           ) : (
//             <Text style={styles.buttonText}>Add Bank Account</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Info Card */}
//       <View style={styles.infoCard}>
//         <Ionicons name="information-circle" size={24} color={colors.primary} />
//         <View style={styles.infoCardContent}>
//           <Text style={styles.infoCardTitle}>Important Information</Text>
//           <Text style={styles.infoCardText}>• Verification may take 2-3 business days.</Text>
//           <Text style={styles.infoCardText}>• Payments are processed to your default account.</Text>
//           <Text style={styles.infoCardText}>• You can add up to 3 bank accounts.</Text>
//         </View>
//       </View>
//     </View>
//   );

//   const renderTaxInfo = () => (
//     <View style={styles.contentContainer}>
//       <View style={styles.formCard}>
//         <Text style={styles.sectionTitle}>Tax Information</Text>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>PAN Number</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter PAN number"
//             value={panNumber}
//             onChangeText={(text) => setPanNumber(text.toUpperCase())}
//             autoCapitalize="characters"
//             maxLength={10}
//           />
//           <Text style={styles.inputHelperText}>Format: ABCDE1234F</Text>
//         </View>
//         <View style={styles.switchRow}>
//           <Switch
//             value={isGstRegistered}
//             onValueChange={setIsGstRegistered}
//             trackColor={{ false: colors.gray300, true: colors.primaryLight }}
//             thumbColor={isGstRegistered ? colors.primary : colors.gray100}
//           />
//           <Text style={styles.switchLabel}>I have a GST Registration</Text>
//         </View>
//         {isGstRegistered && (
//           <View style={styles.inputGroup}>
//             <Text style={styles.label}>GST Number</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter GST number"
//               value={gstNumber}
//               onChangeText={(text) => setGstNumber(text.toUpperCase())}
//               autoCapitalize="characters"
//               maxLength={15}
//             />
//             <Text style={styles.inputHelperText}>Format: 22AAAAA0000A1Z5</Text>
//           </View>
//         )}
//         <TouchableOpacity
//           style={[styles.button, isSaving && styles.buttonDisabled]}
//           onPress={handleSaveTaxInfo}
//           disabled={isSaving}>
//           {isSaving ? (
//             <ActivityIndicator color={colors.white} size="small" />
//           ) : (
//             <Text style={styles.buttonText}>Save Tax Information</Text>
//           )}
//         </TouchableOpacity>
//       </View>

//       {/* Tax Info Card */}
//       <View style={[styles.infoCard, { backgroundColor: colors.blue50 }]}>
//         <FontAwesome5 name="file-invoice" size={20} color={colors.primary} />
//         <View style={styles.infoCardContent}>
//           <Text style={styles.infoCardTitle}>Why We Need This</Text>
//           <Text style={styles.infoCardText}>• PAN is required for income tax purposes.</Text>
//           <Text style={styles.infoCardText}>
//             • GST number helps in generating proper tax invoices.
//           </Text>
//           <Text style={styles.infoCardText}>• Your information is stored securely.</Text>
//         </View>
//       </View>
//     </View>
//   );

//   if (isLoading) {
//     return renderLoading();
//   }

//   return (
//     <KeyboardAvoidingView
//       style={styles.flex1}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={20} color={colors.white} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Payment Details</Text>
//       </View>

//       {/* Tabs */}
//       <View style={styles.tabContainer}>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'bank' && styles.activeTab]}
//           onPress={() => setActiveTab('bank')}>
//           <Text style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>
//             Bank Accounts
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.tab, activeTab === 'tax' && styles.activeTab]}
//           onPress={() => setActiveTab('tax')}>
//           <Text style={[styles.tabText, activeTab === 'tax' && styles.activeTabText]}>
//             Tax Information
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <ScrollView style={styles.flex1}>
//         {activeTab === 'bank' ? renderBankAccounts() : renderTaxInfo()}
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// // Color palette for consistency
// const colors = {
//   primary: '#2563EB',
//   primaryLight: '#93C5FD',
//   white: '#FFFFFF',
//   gray50: '#F9FAFB',
//   gray100: '#F3F4F6',
//   gray200: '#E5E7EB',
//   gray300: '#D1D5DB',
//   gray400: '#9CA3AF',
//   gray500: '#6B7280',
//   gray600: '#4B5563',
//   gray700: '#374151',
//   gray800: '#1F2937',
//   red100: '#FEE2E2',
//   red500: '#EF4444',
//   green100: '#D1FAE5',
//   green700: '#047857',
//   blue50: '#EFF6FF',
//   blue100: '#DBEAFE',
//   blue700: '#1D4ED8',
//   amber100: '#FEF3C7',
//   amber700: '#B45309',
// };

// // StyleSheet for all the component's styles
// const styles = StyleSheet.create({
//   flex1: { flex: 1, backgroundColor: colors.gray50 },
//   centeredScreen: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: colors.white,
//   },
//   loadingText: { color: colors.gray600, marginTop: 16 },
//   contentContainer: { padding: 16 },
//   header: {
//     backgroundColor: colors.primary,
//     paddingTop: 48,
//     paddingBottom: 16,
//     paddingHorizontal: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   headerButton: {
//     width: 40,
//     height: 40,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
//   tabContainer: {
//     flexDirection: 'row',
//     backgroundColor: colors.white,
//     borderBottomWidth: 1,
//     borderBottomColor: colors.gray200,
//   },
//   tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
//   activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
//   tabText: { fontWeight: '500', color: colors.gray600 },
//   activeTabText: { color: colors.primary },
//   section: { marginBottom: 24 },
//   sectionTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
//   accountCard: {
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderLeftWidth: 4,
//     borderLeftColor: colors.primary,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   accountCardContent: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   bankName: { color: colors.gray800, fontWeight: 'bold' },
//   accountDetail: { color: colors.gray600, marginTop: 2 },
//   capitalize: { textTransform: 'capitalize' },
//   tagRow: { flexDirection: 'row', marginTop: 8 },
//   tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, marginRight: 8 },
//   defaultTag: { backgroundColor: colors.green100 },
//   defaultTagText: { color: colors.green700, fontSize: 12 },
//   verifiedTag: { backgroundColor: colors.blue100 },
//   verifiedTagText: { color: colors.blue700, fontSize: 12 },
//   pendingTag: { backgroundColor: colors.amber100 },
//   pendingTagText: { color: colors.amber700, fontSize: 12 },
//   iconButtonRow: { flexDirection: 'row' },
//   iconButton: {
//     width: 32,
//     height: 32,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 16,
//   },
//   iconButtonGray: { backgroundColor: colors.gray100, marginRight: 8 },
//   iconButtonRed: { backgroundColor: colors.red100 },
//   formCard: {
//     backgroundColor: colors.white,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   inputGroup: { marginBottom: 16 },
//   label: { color: colors.gray700, marginBottom: 4 },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.gray300,
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: colors.white,
//     fontSize: 16,
//   },
//   inputHelperText: { color: colors.gray500, fontSize: 12, marginTop: 4 },
//   radioGroup: { flexDirection: 'row', marginTop: 4 },
//   radioButtonContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//     padding: 8,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: colors.gray300,
//   },
//   radioSelected: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: colors.primary },
//   radioOuter: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: colors.gray400,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   radioOuterSelected: { borderColor: colors.primary },
//   radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
//   radioLabel: { marginLeft: 8, color: colors.gray700 },
//   radioLabelSelected: { color: colors.primary },
//   switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
//   switchLabel: { color: colors.gray700, marginLeft: 8 },
//   button: {
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     backgroundColor: colors.primary,
//   },
//   buttonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
//   buttonText: { color: colors.white, fontWeight: '500' },
//   infoCard: {
//     backgroundColor: colors.blue50,
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 16,
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   infoCardContent: { marginLeft: 12, flex: 1 },
//   infoCardTitle: { color: colors.gray800, fontWeight: 'bold' },
//   infoCardText: { color: colors.gray600, marginTop: 4 },
// });

// export default ProBankDetailsScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ProBankDetailsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'bank' | 'tax'>('bank');

  const [isSaving, setIsSaving] = useState(false);

  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
  const [isDefault, setIsDefault] = useState(true);

  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isGstRegistered, setIsGstRegistered] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F5F7FA' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerTabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'bank' && styles.tabButtonActive]}
          onPress={() => setActiveTab('bank')}>
          <Text style={[styles.tabText, activeTab === 'bank' && styles.tabTextActive]}>
            Bank Details
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tax' && styles.tabButtonActive]}
          onPress={() => setActiveTab('tax')}>
          <Text style={[styles.tabText, activeTab === 'tax' && styles.tabTextActive]}>
            Tax Info
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {activeTab === 'bank' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add Bank Account</Text>

              <Input
                label="Account Holder Name"
                value={accountHolderName}
                onChange={setAccountHolderName}
              />

              <Input
                label="Account Number"
                value={accountNumber}
                onChange={setAccountNumber}
                keyboardType="number-pad"
              />

              <Input
                label="Confirm Account Number"
                value={confirmAccountNumber}
                onChange={setConfirmAccountNumber}
                keyboardType="number-pad"
              />

              <Input
                label="IFSC Code"
                value={ifscCode}
                onChange={(val) => setIfscCode(val.toUpperCase())}
                autoCapitalize="characters"
              />

              <Input label="Bank Name" value={bankName} onChange={setBankName} />

              <Text style={styles.subLabel}>Account Type</Text>
              <View style={styles.radioRow}>
                <RadioOption
                  label="Savings"
                  selected={accountType === 'savings'}
                  onPress={() => setAccountType('savings')}
                />
                <RadioOption
                  label="Current"
                  selected={accountType === 'current'}
                  onPress={() => setAccountType('current')}
                />
              </View>

              <View style={styles.switchRow}>
                <Switch value={isDefault} onValueChange={setIsDefault} />
                <Text style={styles.switchLabel}>Set as default account</Text>
              </View>

              <Button label="Add Bank Account" loading={isSaving} />
            </View>

            <InfoCard
              icon={<Ionicons name="information-circle" size={22} color="#1F6FEB" />}
              title="Important"
              items={[
                'Verification may take 2-3 business days.',
                'Payments go to your default account.',
                'You can add up to 3 accounts.',
              ]}
            />
          </View>
        )}

        {activeTab === 'tax' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Tax Information</Text>

              <Input
                label="PAN Number"
                value={panNumber}
                onChange={(val) => setPanNumber(val.toUpperCase())}
                maxLength={10}
              />

              <View style={styles.switchRow}>
                <Switch value={isGstRegistered} onValueChange={setIsGstRegistered} />
                <Text style={styles.switchLabel}>I have GST registration</Text>
              </View>

              {isGstRegistered && (
                <Input
                  label="GST Number"
                  value={gstNumber}
                  onChange={(val) => setGstNumber(val.toUpperCase())}
                  maxLength={15}
                />
              )}

              <Button label="Save Tax Information" loading={isSaving} />
            </View>

            <InfoCard
              icon={<FontAwesome5 name="file-invoice" size={18} color="#1F6FEB" />}
              title="Why we need this"
              items={[
                'PAN is required for tax purposes.',
                'GST helps generate proper invoices.',
                'Your information is stored securely.',
              ]}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ---------- Components ----------
const Input = ({ label, value, onChange, ...props }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={styles.inputField}
      value={value}
      onChangeText={onChange}
      placeholder={`Enter ${label}`}
      {...props}
    />
  </View>
);

const RadioOption = ({ label, selected, onPress }) => (
  <TouchableOpacity style={styles.radioOption} onPress={onPress}>
    <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={[styles.radioLabel, selected && styles.radioLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

const Button = ({ label, loading }) => (
  <TouchableOpacity style={styles.button} disabled={loading}>
    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{label}</Text>}
  </TouchableOpacity>
);

const InfoCard = ({ icon, title, items }) => (
  <View style={styles.infoCard}>
    {icon}
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.infoTitle}>{title}</Text>
      {items.map((item, i) => (
        <Text key={i} style={styles.infoLine}>
          • {item}
        </Text>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    elevation: 2,
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  tabButtonActive: {
    backgroundColor: '#1F6FEB15',
  },

  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },

  tabTextActive: {
    color: '#1F6FEB',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#444',
  },

  inputField: {
    backgroundColor: '#F0F2F5',
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
  },

  subLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },

  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  radioOuterActive: {
    borderColor: '#1F6FEB',
  },

  radioInner: {
    width: 10,
    height: 10,
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
  },

  radioLabel: {
    fontSize: 15,
    color: '#333',
  },

  radioLabelActive: {
    color: '#1F6FEB',
    fontWeight: '600',
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },

  switchLabel: {
    marginLeft: 10,
    fontSize: 15,
    color: '#333',
  },

  button: {
    backgroundColor: '#1F6FEB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EAF2FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },

  infoLine: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
});

export default ProBankDetailsScreen;

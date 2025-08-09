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
  KeyboardAvoidingView,
  Platform,
  StyleSheet, // Import StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Mock types for navigation to make the component self-contained
type ProStackParamList = {
  BankDetails: undefined;
};

type ProBankDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

// Interface for a single bank account
interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountType: 'savings' | 'current';
  isDefault: boolean;
  isVerified: boolean;
}

// Interface for tax information
interface TaxInformation {
  panNumber: string;
  gstNumber?: string;
  isGstRegistered: boolean;
}

const ProBankDetailsScreen = () => {
  const navigation = useNavigation<ProBankDetailsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'bank' | 'tax'>('bank');

  // Bank account form state
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState<'savings' | 'current'>('savings');
  const [isDefault, setIsDefault] = useState(true);

  // Tax information form state
  const [panNumber, setPanNumber] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [isGstRegistered, setIsGstRegistered] = useState(false);

  // Mock data for existing bank accounts and tax info
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [taxInfo, setTaxInfo] = useState<TaxInformation | null>(null);

  // Effect to simulate fetching initial data
  useEffect(() => {
    setTimeout(() => {
      const mockAccounts: BankAccount[] = [{
        id: '1',
        accountHolderName: 'Rahul Sharma',
        accountNumber: '1234567890',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        accountType: 'savings',
        isDefault: true,
        isVerified: true
      }];
      const mockTaxInfo: TaxInformation = {
        panNumber: 'ABCDE1234F',
        gstNumber: '',
        isGstRegistered: false
      };

      setBankAccounts(mockAccounts);
      setTaxInfo(mockTaxInfo);

      // Pre-fill tax information form
      setPanNumber(mockTaxInfo.panNumber);
      setGstNumber(mockTaxInfo.gstNumber || '');
      setIsGstRegistered(mockTaxInfo.isGstRegistered);

      setIsLoading(false);
    }, 1000);
  }, []);

  // Helper function to reset the bank form fields
  const resetBankForm = () => {
    setAccountHolderName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setBankName('');
    setAccountType('savings');
    setIsDefault(bankAccounts.length === 0);
  };

  // --- Form Validation ---
  const validateBankForm = () => {
    if (!accountHolderName.trim() || !accountNumber.trim() || !ifscCode.trim() || !bankName.trim()) {
      Alert.alert('Error', 'Please fill all required bank fields.');
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match.');
      return false;
    }
    return true;
  };

  const validateTaxForm = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      Alert.alert('Error', 'Please enter a valid PAN number.');
      return false;
    }
    if (isGstRegistered && !gstRegex.test(gstNumber)) {
      Alert.alert('Error', 'Please enter a valid GST number.');
      return false;
    }
    return true;
  };

  // --- Handlers ---
  const handleAddBankAccount = () => {
    if (!validateBankForm()) return;
    setIsSaving(true);
    setTimeout(() => {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        accountHolderName, accountNumber, ifscCode, bankName, accountType, isDefault,
        isVerified: false
      };
      let updatedAccounts = [...bankAccounts];
      if (isDefault) {
        updatedAccounts = updatedAccounts.map(acc => ({ ...acc, isDefault: false }));
      }
      setBankAccounts([...updatedAccounts, newAccount]);
      resetBankForm();
      setIsSaving(false);
      Alert.alert('Success', 'Bank account added successfully.');
    }, 1500);
  };

  const handleDeleteBankAccount = (accountId: string) => {
    Alert.alert('Delete Account', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: () => {
          const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
          if (updatedAccounts.length > 0 && bankAccounts.find(acc => acc.id === accountId)?.isDefault) {
            updatedAccounts[0].isDefault = true;
          }
          setBankAccounts(updatedAccounts);
          Alert.alert('Success', 'Bank account deleted.');
        }
      }
    ]);
  };

  const handleSetDefaultAccount = (accountId: string) => {
    const updatedAccounts = bankAccounts.map(acc => ({ ...acc, isDefault: acc.id === accountId }));
    setBankAccounts(updatedAccounts);
    Alert.alert('Success', 'Default account updated.');
  };

  const handleSaveTaxInfo = () => {
    if (!validateTaxForm()) return;
    setIsSaving(true);
    setTimeout(() => {
      const updatedTaxInfo: TaxInformation = {
        panNumber,
        gstNumber: isGstRegistered ? gstNumber : undefined,
        isGstRegistered
      };
      setTaxInfo(updatedTaxInfo);
      setIsSaving(false);
      Alert.alert('Success', 'Tax information updated.');
    }, 1500);
  };

  // --- Render Functions ---
  const renderLoading = () => (
    <View style={styles.centeredScreen}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading payment details...</Text>
    </View>
  );

  const renderBankAccounts = () => (
    <View style={styles.contentContainer}>
      {bankAccounts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Bank Accounts</Text>
          {bankAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountCardContent}>
                <View style={styles.flex1}>
                  <Text style={styles.bankName}>{account.bankName}</Text>
                  <Text style={styles.accountDetail}>{account.accountHolderName}</Text>
                  <Text style={styles.accountDetail}>A/C: {account.accountNumber.replace(/\d(?=\d{4})/g, "*")}</Text>
                  <Text style={styles.accountDetail}>IFSC: {account.ifscCode}</Text>
                  <Text style={[styles.accountDetail, styles.capitalize]}>Type: {account.accountType}</Text>
                  <View style={styles.tagRow}>
                    {account.isDefault && <View style={[styles.tag, styles.defaultTag]}><Text style={styles.defaultTagText}>Default</Text></View>}
                    <View style={[styles.tag, account.isVerified ? styles.verifiedTag : styles.pendingTag]}>
                      <Text style={account.isVerified ? styles.verifiedTagText : styles.pendingTagText}>
                        {account.isVerified ? 'Verified' : 'Pending'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.iconButtonRow}>
                  {!account.isDefault && (
                    <TouchableOpacity style={[styles.iconButton, styles.iconButtonGray]} onPress={() => handleSetDefaultAccount(account.id)}>
                      <MaterialIcons name="star-outline" size={18} color={colors.gray600} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={[styles.iconButton, styles.iconButtonRed]} onPress={() => handleDeleteBankAccount(account.id)}>
                    <MaterialIcons name="delete-outline" size={18} color={colors.red500} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add New Bank Account Form */}
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>{bankAccounts.length > 0 ? 'Add Another Account' : 'Add Bank Account'}</Text>
        <View style={styles.inputGroup}><Text style={styles.label}>Account Holder Name</Text><TextInput style={styles.input} placeholder="Enter full name" value={accountHolderName} onChangeText={setAccountHolderName} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Account Number</Text><TextInput style={styles.input} placeholder="Enter account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="number-pad" maxLength={18} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Confirm Account Number</Text><TextInput style={styles.input} placeholder="Re-enter account number" value={confirmAccountNumber} onChangeText={setConfirmAccountNumber} keyboardType="number-pad" maxLength={18} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>IFSC Code</Text><TextInput style={styles.input} placeholder="Enter IFSC code" value={ifscCode} onChangeText={text => setIfscCode(text.toUpperCase())} autoCapitalize="characters" maxLength={11} /></View>
        <View style={styles.inputGroup}><Text style={styles.label}>Bank Name</Text><TextInput style={styles.input} placeholder="Enter bank name" value={bankName} onChangeText={setBankName} /></View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Account Type</Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity style={[styles.radioButtonContainer, accountType === 'savings' && styles.radioSelected]} onPress={() => setAccountType('savings')}>
              <View style={[styles.radioOuter, accountType === 'savings' && styles.radioOuterSelected]}><View style={accountType === 'savings' && styles.radioInner} /></View>
              <Text style={[styles.radioLabel, accountType === 'savings' && styles.radioLabelSelected]}>Savings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.radioButtonContainer, accountType === 'current' && styles.radioSelected]} onPress={() => setAccountType('current')}>
              <View style={[styles.radioOuter, accountType === 'current' && styles.radioOuterSelected]}><View style={accountType === 'current' && styles.radioInner} /></View>
              <Text style={[styles.radioLabel, accountType === 'current' && styles.radioLabelSelected]}>Current</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {bankAccounts.length > 0 && (
          <View style={styles.switchRow}><Switch value={isDefault} onValueChange={setIsDefault} trackColor={{ false: colors.gray300, true: colors.primaryLight }} thumbColor={isDefault ? colors.primary : colors.gray100} /><Text style={styles.switchLabel}>Set as default account</Text></View>
        )}
        
        <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} onPress={handleAddBankAccount} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.buttonText}>Add Bank Account</Text>}
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={colors.primary} />
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>Important Information</Text>
          <Text style={styles.infoCardText}>• Verification may take 2-3 business days.</Text>
          <Text style={styles.infoCardText}>• Payments are processed to your default account.</Text>
          <Text style={styles.infoCardText}>• You can add up to 3 bank accounts.</Text>
        </View>
      </View>
    </View>
  );

  const renderTaxInfo = () => (
    <View style={styles.contentContainer}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Tax Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>PAN Number</Text>
          <TextInput style={styles.input} placeholder="Enter PAN number" value={panNumber} onChangeText={text => setPanNumber(text.toUpperCase())} autoCapitalize="characters" maxLength={10} />
          <Text style={styles.inputHelperText}>Format: ABCDE1234F</Text>
        </View>
        <View style={styles.switchRow}>
          <Switch value={isGstRegistered} onValueChange={setIsGstRegistered} trackColor={{ false: colors.gray300, true: colors.primaryLight }} thumbColor={isGstRegistered ? colors.primary : colors.gray100} />
          <Text style={styles.switchLabel}>I have a GST Registration</Text>
        </View>
        {isGstRegistered && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>GST Number</Text>
            <TextInput style={styles.input} placeholder="Enter GST number" value={gstNumber} onChangeText={text => setGstNumber(text.toUpperCase())} autoCapitalize="characters" maxLength={15} />
            <Text style={styles.inputHelperText}>Format: 22AAAAA0000A1Z5</Text>
          </View>
        )}
        <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} onPress={handleSaveTaxInfo} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color={colors.white} size="small" /> : <Text style={styles.buttonText}>Save Tax Information</Text>}
        </TouchableOpacity>
      </View>

      {/* Tax Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.blue50 }]}>
        <FontAwesome5 name="file-invoice" size={20} color={colors.primary} />
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>Why We Need This</Text>
          <Text style={styles.infoCardText}>• PAN is required for income tax purposes.</Text>
          <Text style={styles.infoCardText}>• GST number helps in generating proper tax invoices.</Text>
          <Text style={styles.infoCardText}>• Your information is stored securely.</Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return renderLoading();
  }

  return (
    <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Details</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'bank' && styles.activeTab]} onPress={() => setActiveTab('bank')}>
          <Text style={[styles.tabText, activeTab === 'bank' && styles.activeTabText]}>Bank Accounts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'tax' && styles.activeTab]} onPress={() => setActiveTab('tax')}>
          <Text style={[styles.tabText, activeTab === 'tax' && styles.activeTabText]}>Tax Information</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.flex1}>
        {activeTab === 'bank' ? renderBankAccounts() : renderTaxInfo()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Color palette for consistency
const colors = {
  primary: '#2563EB',
  primaryLight: '#93C5FD',
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
  red100: '#FEE2E2',
  red500: '#EF4444',
  green100: '#D1FAE5',
  green700: '#047857',
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue700: '#1D4ED8',
  amber100: '#FEF3C7',
  amber700: '#B45309',
};

// StyleSheet for all the component's styles
const styles = StyleSheet.create({
  flex1: { flex: 1, backgroundColor: colors.gray50 },
  centeredScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  loadingText: { color: colors.gray600, marginTop: 16 },
  contentContainer: { padding: 16 },
  header: { backgroundColor: colors.primary, paddingTop: 48, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  headerButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
  headerTitle: { color: colors.white, fontSize: 20, fontWeight: 'bold', marginLeft: 16 },
  tabContainer: { flexDirection: 'row', backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray200 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { fontWeight: '500', color: colors.gray600 },
  activeTabText: { color: colors.primary },
  section: { marginBottom: 24 },
  sectionTitle: { color: colors.gray800, fontWeight: 'bold', fontSize: 18, marginBottom: 12 },
  accountCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  accountCardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bankName: { color: colors.gray800, fontWeight: 'bold' },
  accountDetail: { color: colors.gray600, marginTop: 2 },
  capitalize: { textTransform: 'capitalize' },
  tagRow: { flexDirection: 'row', marginTop: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9999, marginRight: 8 },
  defaultTag: { backgroundColor: colors.green100 },
  defaultTagText: { color: colors.green700, fontSize: 12 },
  verifiedTag: { backgroundColor: colors.blue100 },
  verifiedTagText: { color: colors.blue700, fontSize: 12 },
  pendingTag: { backgroundColor: colors.amber100 },
  pendingTagText: { color: colors.amber700, fontSize: 12 },
  iconButtonRow: { flexDirection: 'row' },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  iconButtonGray: { backgroundColor: colors.gray100, marginRight: 8 },
  iconButtonRed: { backgroundColor: colors.red100 },
  formCard: { backgroundColor: colors.white, borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  inputGroup: { marginBottom: 16 },
  label: { color: colors.gray700, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: colors.gray300, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.white, fontSize: 16 },
  inputHelperText: { color: colors.gray500, fontSize: 12, marginTop: 4 },
  radioGroup: { flexDirection: 'row', marginTop: 4 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', marginRight: 16, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.gray300 },
  radioSelected: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: colors.primary },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.gray400, alignItems: 'center', justifyContent: 'center' },
  radioOuterSelected: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  radioLabel: { marginLeft: 8, color: colors.gray700 },
  radioLabelSelected: { color: colors.primary },
  switchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  switchLabel: { color: colors.gray700, marginLeft: 8 },
  button: { paddingVertical: 12, borderRadius: 8, alignItems: 'center', backgroundColor: colors.primary },
  buttonDisabled: { backgroundColor: 'rgba(37, 99, 235, 0.7)' },
  buttonText: { color: colors.white, fontWeight: '500' },
  infoCard: { backgroundColor: colors.blue50, borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'flex-start' },
  infoCardContent: { marginLeft: 12, flex: 1 },
  infoCardTitle: { color: colors.gray800, fontWeight: 'bold' },
  infoCardText: { color: colors.gray600, marginTop: 4 },
});

export default ProBankDetailsScreen;
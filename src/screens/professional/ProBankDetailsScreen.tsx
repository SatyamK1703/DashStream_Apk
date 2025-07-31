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
  Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { ProStackParamList } from '../../../app/routes/ProNavigator';

type ProBankDetailsScreenNavigationProp = NativeStackNavigationProp<ProStackParamList>;

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

interface TaxInformation {
  panNumber: string;
  gstNumber?: string;
  isGstRegistered: boolean;
}

const ProBankDetailsScreen = () => {
  const navigation = useNavigation<ProBankDetailsScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Mock bank accounts data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      accountHolderName: 'Rahul Sharma',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountType: 'savings',
      isDefault: true,
      isVerified: true
    }
  ]);
  
  // Mock tax information
  const [taxInfo, setTaxInfo] = useState<TaxInformation>({
    panNumber: 'ABCDE1234F',
    gstNumber: '',
    isGstRegistered: false
  });
  
  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      
      // Pre-fill tax information
      setPanNumber(taxInfo.panNumber);
      setGstNumber(taxInfo.gstNumber || '');
      setIsGstRegistered(taxInfo.isGstRegistered);
    }, 1000);
  }, []);
  
  const resetBankForm = () => {
    setAccountHolderName('');
    setAccountNumber('');
    setConfirmAccountNumber('');
    setIfscCode('');
    setBankName('');
    setAccountType('savings');
    setIsDefault(bankAccounts.length === 0);
  };
  
  const validateBankForm = () => {
    if (!accountHolderName.trim()) {
      Alert.alert('Error', 'Please enter account holder name');
      return false;
    }
    
    if (!accountNumber.trim()) {
      Alert.alert('Error', 'Please enter account number');
      return false;
    }
    
    if (accountNumber !== confirmAccountNumber) {
      Alert.alert('Error', 'Account numbers do not match');
      return false;
    }
    
    if (!ifscCode.trim()) {
      Alert.alert('Error', 'Please enter IFSC code');
      return false;
    }
    
    if (!bankName.trim()) {
      Alert.alert('Error', 'Please enter bank name');
      return false;
    }
    
    return true;
  };
  
  const validateTaxForm = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    
    if (!panNumber.trim()) {
      Alert.alert('Error', 'Please enter PAN number');
      return false;
    }
    
    if (!panRegex.test(panNumber)) {
      Alert.alert('Error', 'Please enter a valid PAN number (e.g., ABCDE1234F)');
      return false;
    }
    
    if (isGstRegistered && !gstNumber.trim()) {
      Alert.alert('Error', 'Please enter GST number');
      return false;
    }
    
    if (isGstRegistered && !gstRegex.test(gstNumber)) {
      Alert.alert('Error', 'Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)');
      return false;
    }
    
    return true;
  };
  
  const handleAddBankAccount = () => {
    if (!validateBankForm()) return;
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName,
        accountType,
        isDefault,
        isVerified: false
      };
      
      // If new account is set as default, update other accounts
      let updatedAccounts = [...bankAccounts];
      if (isDefault) {
        updatedAccounts = updatedAccounts.map(account => ({
          ...account,
          isDefault: false
        }));
      }
      
      setBankAccounts([...updatedAccounts, newAccount]);
      resetBankForm();
      setIsSaving(false);
      
      Alert.alert(
        'Success',
        'Bank account added successfully. Verification may take 2-3 business days.',
        [{ text: 'OK' }]
      );
    }, 1500);
  };
  
  const handleDeleteBankAccount = (accountId: string) => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete this bank account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const accountToDelete = bankAccounts.find(acc => acc.id === accountId);
            const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
            
            // If deleted account was default, set another account as default
            if (accountToDelete?.isDefault && updatedAccounts.length > 0) {
              updatedAccounts[0].isDefault = true;
            }
            
            setBankAccounts(updatedAccounts);
            
            Alert.alert('Success', 'Bank account deleted successfully');
          }
        }
      ]
    );
  };
  
  const handleSetDefaultAccount = (accountId: string) => {
    const updatedAccounts = bankAccounts.map(account => ({
      ...account,
      isDefault: account.id === accountId
    }));
    
    setBankAccounts(updatedAccounts);
    Alert.alert('Success', 'Default account updated successfully');
  };
  
  const handleSaveTaxInfo = () => {
    if (!validateTaxForm()) return;
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedTaxInfo: TaxInformation = {
        panNumber,
        gstNumber: isGstRegistered ? gstNumber : undefined,
        isGstRegistered
      };
      
      setTaxInfo(updatedTaxInfo);
      setIsSaving(false);
      
      Alert.alert(
        'Success',
        'Tax information updated successfully',
        [{ text: 'OK' }]
      );
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading payment details...</Text>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-4">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">Payment Details</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'bank' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('bank')}
        >
          <Text className={`font-medium ${activeTab === 'bank' ? 'text-primary' : 'text-gray-600'}`}>
            Bank Accounts
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-4 items-center ${activeTab === 'tax' ? 'border-b-2 border-primary' : ''}`}
          onPress={() => setActiveTab('tax')}
        >
          <Text className={`font-medium ${activeTab === 'tax' ? 'text-primary' : 'text-gray-600'}`}>
            Tax Information
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView className="flex-1">
        {activeTab === 'bank' ? (
          <View className="p-4">
            {/* Existing Bank Accounts */}
            {bankAccounts.length > 0 && (
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mb-3">Your Bank Accounts</Text>
                
                {bankAccounts.map((account) => (
                  <View 
                    key={account.id}
                    className="bg-white rounded-xl shadow-sm p-4 mb-3 border-l-4 border-primary"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text className="text-gray-800 font-bold">{account.bankName}</Text>
                        <Text className="text-gray-600 mt-1">{account.accountHolderName}</Text>
                        <Text className="text-gray-600">
                          A/C: {account.accountNumber.replace(/\d(?=\d{4})/g, "*")}
                        </Text>
                        <Text className="text-gray-600">IFSC: {account.ifscCode}</Text>
                        <Text className="text-gray-600 capitalize">
                          Type: {account.accountType}
                        </Text>
                        
                        <View className="flex-row mt-2">
                          {account.isDefault && (
                            <View className="bg-green-100 px-2 py-1 rounded-full mr-2">
                              <Text className="text-green-700 text-xs">Default</Text>
                            </View>
                          )}
                          
                          <View className={`px-2 py-1 rounded-full ${account.isVerified ? 'bg-blue-100' : 'bg-amber-100'}`}>
                            <Text className={`text-xs ${account.isVerified ? 'text-blue-700' : 'text-amber-700'}`}>
                              {account.isVerified ? 'Verified' : 'Pending Verification'}
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      <View className="flex-row">
                        {!account.isDefault && (
                          <TouchableOpacity 
                            className="w-8 h-8 items-center justify-center rounded-full bg-gray-100 mr-2"
                            onPress={() => handleSetDefaultAccount(account.id)}
                          >
                            <MaterialIcons name="star-outline" size={18} color="#4B5563" />
                          </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                          className="w-8 h-8 items-center justify-center rounded-full bg-red-100"
                          onPress={() => handleDeleteBankAccount(account.id)}
                        >
                          <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Add New Bank Account Form */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">
                {bankAccounts.length > 0 ? 'Add Another Bank Account' : 'Add Bank Account'}
              </Text>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Account Holder Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Enter full name as per bank records"
                  value={accountHolderName}
                  onChangeText={setAccountHolderName}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Account Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                  maxLength={18}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Confirm Account Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Re-enter account number"
                  value={confirmAccountNumber}
                  onChangeText={setConfirmAccountNumber}
                  keyboardType="number-pad"
                  maxLength={18}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">IFSC Code</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Enter IFSC code"
                  value={ifscCode}
                  onChangeText={text => setIfscCode(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={11}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Bank Name</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChangeText={setBankName}
                />
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">Account Type</Text>
                <View className="flex-row mt-1">
                  <TouchableOpacity 
                    className={`flex-row items-center mr-4 px-3 py-2 rounded-lg ${accountType === 'savings' ? 'bg-primary/10 border border-primary' : 'border border-gray-300'}`}
                    onPress={() => setAccountType('savings')}
                  >
                    <View className={`w-5 h-5 rounded-full border items-center justify-center ${accountType === 'savings' ? 'border-primary' : 'border-gray-400'}`}>
                      {accountType === 'savings' && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <Text className={`ml-2 ${accountType === 'savings' ? 'text-primary' : 'text-gray-700'}`}>
                      Savings
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    className={`flex-row items-center px-3 py-2 rounded-lg ${accountType === 'current' ? 'bg-primary/10 border border-primary' : 'border border-gray-300'}`}
                    onPress={() => setAccountType('current')}
                  >
                    <View className={`w-5 h-5 rounded-full border items-center justify-center ${accountType === 'current' ? 'border-primary' : 'border-gray-400'}`}>
                      {accountType === 'current' && (
                        <View className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </View>
                    <Text className={`ml-2 ${accountType === 'current' ? 'text-primary' : 'text-gray-700'}`}>
                      Current
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {bankAccounts.length > 0 && (
                <View className="flex-row items-center mb-4">
                  <Switch
                    value={isDefault}
                    onValueChange={setIsDefault}
                    trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                    thumbColor={isDefault ? '#2563EB' : '#F3F4F6'}
                  />
                  <Text className="text-gray-700 ml-2">
                    Set as default account for payments
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                className={`py-3 rounded-lg items-center ${isSaving ? 'bg-primary/70' : 'bg-primary'}`}
                onPress={handleAddBankAccount}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-medium">Add Bank Account</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Information Card */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#2563EB" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-bold">Important Information</Text>
                  <Text className="text-gray-600 mt-1">
                    • Bank account verification may take 2-3 business days.
                  </Text>
                  <Text className="text-gray-600">
                    • Payments will be processed to your default account.
                  </Text>
                  <Text className="text-gray-600">
                    • You can add up to 3 bank accounts.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View className="p-4">
            {/* Tax Information Form */}
            <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <Text className="text-gray-800 font-bold text-lg mb-3">Tax Information</Text>
              
              <View className="mb-4">
                <Text className="text-gray-700 mb-1">PAN Number</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  placeholder="Enter PAN number"
                  value={panNumber}
                  onChangeText={text => setPanNumber(text.toUpperCase())}
                  autoCapitalize="characters"
                  maxLength={10}
                />
                <Text className="text-gray-500 text-xs mt-1">
                  Format: ABCDE1234F (10 characters)
                </Text>
              </View>
              
              <View className="flex-row items-center mb-4">
                <Switch
                  value={isGstRegistered}
                  onValueChange={setIsGstRegistered}
                  trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                  thumbColor={isGstRegistered ? '#2563EB' : '#F3F4F6'}
                />
                <Text className="text-gray-700 ml-2">
                  I have a GST Registration
                </Text>
              </View>
              
              {isGstRegistered && (
                <View className="mb-4">
                  <Text className="text-gray-700 mb-1">GST Number</Text>
                  <TextInput
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    placeholder="Enter GST number"
                    value={gstNumber}
                    onChangeText={text => setGstNumber(text.toUpperCase())}
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                  <Text className="text-gray-500 text-xs mt-1">
                    Format: 22AAAAA0000A1Z5 (15 characters)
                  </Text>
                </View>
              )}
              
              <TouchableOpacity 
                className={`py-3 rounded-lg items-center ${isSaving ? 'bg-primary/70' : 'bg-primary'}`}
                onPress={handleSaveTaxInfo}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-medium">Save Tax Information</Text>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Tax Information */}
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <View className="flex-row items-start">
                <FontAwesome5 name="file-invoice" size={20} color="#2563EB" />
                <View className="ml-3 flex-1">
                  <Text className="text-gray-800 font-bold">Why We Need Tax Information</Text>
                  <Text className="text-gray-600 mt-1">
                    • PAN is required for income tax purposes and to generate Form 16A.
                  </Text>
                  <Text className="text-gray-600">
                    • If you're GST registered, providing your GST number allows us to generate proper tax invoices.
                  </Text>
                  <Text className="text-gray-600">
                    • All tax information is securely stored and only used for legal compliance.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProBankDetailsScreen;
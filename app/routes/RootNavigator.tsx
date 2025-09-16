import React from 'react';
import { ActivityIndicator, View, Platform,StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import navigators for different user roles
import CustomerNavigator from './CustomerNavigator';
import ProNavigator from './ProNavigator';
import AdminNavigator from './AdminNavigator';

// Import auth screens
import LoginScreen from '../../src/screens/LoginScreen';
import OtpVerificationScreen from '../../src/screens/customer/OtpVerificationScreen';

// Import auth context
import { useAuth } from '../../src/context/AuthContext';

// Define the root stack param list
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  OtpVerification: { phone: string };
  CustomerApp: undefined;
  ProfessionalApp: undefined;
  AdminApp: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user, isLoading, isBooting } = useAuth() as any;

  // ⬇️ Show splash/loader ONLY while restoring session at launch
  if (isBooting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {user ? (
        user.role === 'customer' ? (
          <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
        ) : user.role === 'professional' ? (
          <Stack.Screen name="ProfessionalApp" component={ProNavigator} />
        ) : (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        )
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};


export default RootNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
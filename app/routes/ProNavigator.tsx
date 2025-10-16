import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import professional screens
import ProDashboardScreen from '../../src/screens/professional/ProDashboardScreen';
import ProJobsScreen from '../../src/screens/professional/ProJobsScreen';
import ProJobDetailsScreen from '../../src/screens/professional/ProJobDetailsScreen';
import RouteTrackingScreen from '../../src/screens/professional/RouteTrackingScreen';
import ProEarningsScreen from '../../src/screens/professional/ProEarningsScreen';
import ProProfileScreen from '../../src/screens/professional/ProProfileScreen';
import ProEditProfileScreen from '../../src/screens/professional/ProEditProfileScreen';
import ProNotificationsScreen from '../../src/screens/professional/ProNotificationsScreen';
import ProSettingsScreen from '../../src/screens/professional/ProSettingsScreen';
import ProBankDetailsScreen from '../../src/screens/professional/ProBankDetailsScreen';
import ProServiceAreaScreen from '../../src/screens/professional/ProServiceAreaScreen';
import ProSkillsScreen from '../../src/screens/professional/ProSkillsScreen';
import ProVerificationScreen from '../../src/screens/professional/ProVerificationScreen';

// Define the professional stack param list
export type ProStackParamList = {
  ProTabs: undefined;
  JobDetails: { jobId: string };
  RouteTracking: { jobId: string; destination: { latitude: number; longitude: number } };
  EditProfile: undefined;
  Notifications: undefined;
  Settings: undefined;
  BankDetails: undefined;
  ServiceArea: undefined;
  Skills: undefined;
  Verification: undefined;
  ProNotifications: undefined;
};

// Define the professional tab param list
export type ProTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  Earnings: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<ProStackParamList>();
const Tab = createBottomTabNavigator<ProTabParamList>();

// Professional Tab Navigator
const ProTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ProDashboardScreen} />
      <Tab.Screen name="Jobs" component={ProJobsScreen} />
      <Tab.Screen name="Earnings" component={ProEarningsScreen} />
      <Tab.Screen name="Profile" component={ProProfileScreen} />
    </Tab.Navigator>
  );
};

// Main Professional Navigator
const ProNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProTabs" component={ProTabNavigator} />
      <Stack.Screen name="JobDetails" component={ProJobDetailsScreen} />
      <Stack.Screen name="RouteTracking" component={RouteTrackingScreen} />
      <Stack.Screen name="EditProfile" component={ProEditProfileScreen} />
      <Stack.Screen name="Notifications" component={ProNotificationsScreen} />
      <Stack.Screen name="Settings" component={ProSettingsScreen} />
      <Stack.Screen name="BankDetails" component={ProBankDetailsScreen} />
      <Stack.Screen name="ServiceArea" component={ProServiceAreaScreen} />
      <Stack.Screen name="Skills" component={ProSkillsScreen} />
      <Stack.Screen name="Verification" component={ProVerificationScreen} />
      <Stack.Screen name="ProNotifications" component={ProNotificationsScreen}  />
    </Stack.Navigator>
  );
};

export default ProNavigator;
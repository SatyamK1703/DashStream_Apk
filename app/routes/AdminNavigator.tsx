import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SmartIcon from '../../src/components/common/IconFallback';

// Import admin screens
import AdminDashboardScreen from '../../src/screens/admin/AdminDashboardScreen';
import AdminBookingsScreen from '../../src/screens/admin/AdminBookingsScreen';
import AdminBookingDetailsScreen from '../../src/screens/admin/AdminBookingDetailsScreen';
import AdminProfessionalsScreen from '../../src/screens/admin/AdminProfessionalsScreen';
import AdminProfessionalDetailsScreen from '../../src/screens/admin/AdminProfessionalDetailsScreen';
import AdminProfessionalEditScreen from '../../src/screens/admin/AdminProfessionalEditScreen';
import AdminCustomersScreen from '../../src/screens/admin/AdminCustomersScreen';
import AdminCustomerDetailsScreen from '../../src/screens/admin/AdminCustomerDetailsScreen';
import AdminCustomerListScreen from '../../src/screens/admin/AdminCustomerListScreen';
import AdminCreateCustomerScreen from '../../src/screens/admin/AdminCreateCustomerScreen';
import AdminCreateProfessionalScreen from '../../src/screens/admin/AdminCreateProfessionalScreen';
import AdminServicesScreen from '../../src/screens/admin/AdminServicesScreen';
import AdminSettingsScreen from '../../src/screens/admin/AdminSettingsScreen';
import AdminProfileScreen from '../../src/screens/admin/AdminProfileScreen';
import AdminNotificationsScreen from '../../src/screens/admin/AdminNotificationsScreen';
import TrackBookingScreen from '../../src/screens/customer/TrackBookingScreen';

// Define the admin stack param list
export type AdminStackParamList = {
  AdminTabs: undefined;
  AdminDashboard: undefined;
  AdminBookings: undefined;
  AdminBookingDetails: { bookingId: string };
  AdminProfessionals: undefined;
  AdminProfessionalDetails: { professionalId: string };
  AdminProfessionalEdit: { professionalId: string };
  AdminCreateProfessional: undefined;
  AdminCustomers: undefined;
  AdminCustomerList: undefined;
  AdminCustomerDetails: { customerId: string };
  AdminCreateCustomer: undefined;
  AdminServices: undefined;
  AdminSettings: undefined;
  AdminProfile: undefined;
  AdminNotifications: undefined;
  TrackBooking: { bookingId: string };
};

// Define the admin tab param list
export type AdminTabParamList = {
  Dashboard: undefined;
  Bookings: undefined;
  Professionals: undefined;
  Customers: undefined;
  Services: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();
const Tab = createBottomTabNavigator<AdminTabParamList>();

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Professionals') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Services') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <SmartIcon name={iconName} size={size} color={color} />;
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
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Bookings" component={AdminBookingsScreen} />
      <Tab.Screen name="Professionals" component={AdminProfessionalsScreen} />
      <Tab.Screen name="Customers" component={AdminCustomersScreen} />
      <Tab.Screen name="Services" component={AdminServicesScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
};

// Main Admin Navigator
const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminBookings" component={AdminBookingsScreen} />
      <Stack.Screen name="AdminBookingDetails" component={AdminBookingDetailsScreen} />
      <Stack.Screen name="AdminProfessionals" component={AdminProfessionalsScreen} />
      <Stack.Screen name="AdminProfessionalDetails" component={AdminProfessionalDetailsScreen} />
      <Stack.Screen name="AdminProfessionalEdit" component={AdminProfessionalEditScreen} />
      <Stack.Screen name="AdminCreateProfessional" component={AdminCreateProfessionalScreen} />
      <Stack.Screen name="AdminCustomers" component={AdminCustomersScreen} />
      <Stack.Screen name="AdminCustomerList" component={AdminCustomerListScreen} />
      <Stack.Screen name="AdminCustomerDetails" component={AdminCustomerDetailsScreen} />
      <Stack.Screen name="AdminCreateCustomer" component={AdminCreateCustomerScreen} />
      <Stack.Screen name="AdminServices" component={AdminServicesScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="AdminProfile" component={AdminProfileScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Stack.Screen name="TrackBooking" component={TrackBookingScreen} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
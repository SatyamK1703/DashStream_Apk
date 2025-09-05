import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ServiceDetailsScreen from '../screens/customer/ServiceDetailsScreen';
import BookingsScreen from '../screens/customer/BookingsScreen';
import OrderDetailsScreen from '../screens/customer/OrderDetailsScreen';
import TrackBookingScreen from '../screens/customer/TrackBookingScreen';
import NearbyProfessionalsScreen from '../screens/customer/NearbyProfessionalsScreen';
import ProfessionalLocationScreen from '../screens/customer/ProfessionalLocationScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import PaymentHistoryScreen from '../screens/customer/PaymentHistoryScreen';
import PaymentDetailsScreen from '../screens/customer/PaymentDetailsScreen';

// Professional Screens
import ProDashboardScreen from '../screens/professional/ProDashboardScreen';
import ProJobsScreen from '../screens/professional/ProJobsScreen';
import ProProfileScreen from '../screens/professional/ProProfileScreen';
import LocationTrackingScreen from '../screens/professional/LocationTrackingScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminProfessionalsScreen from '../screens/admin/AdminProfessionalsScreen';
import LocationManagementScreen from '../screens/admin/LocationManagementScreen';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import OtpVerificationScreen from '../screens/customer/OtpVerificationScreen';

// Context
import { useAuth } from '../contexts/AuthContext';
import { PaymentProvider } from '../contexts/PaymentContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Nearby') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Bookings" component={BookingsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Nearby" component={NearbyProfessionalsScreen} options={{ headerTitle: 'Nearby Professionals' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Professional Tab Navigator
const ProfessionalTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Jobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Location') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={ProDashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Jobs" component={ProJobsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Location" component={LocationTrackingScreen} options={{ headerTitle: 'Location Tracking' }} />
      <Tab.Screen name="Profile" component={ProProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
};

// Admin Tab Navigator
const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Professionals') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Locations') {
            iconName = focused ? 'map' : 'map-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Professionals" component={AdminProfessionalsScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Locations" component={LocationManagementScreen} options={{ headerTitle: 'Location Management' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { authState } = useAuth();
  
  return (
    <PaymentProvider>
      <NavigationContainer>
        <Stack.Navigator>
        {!authState.isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ headerTitle: 'Verify OTP' }} />
          </>
        ) : authState.userRole === 'customer' ? (
          // Customer Stack
          <>
            <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} options={{ headerTitle: 'Service Details' }} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerTitle: 'Order Details' }} />
            <Stack.Screen name="TrackBooking" component={TrackBookingScreen} options={{ headerTitle: 'Track Booking' }} />
            <Stack.Screen name="ProfessionalLocation" component={ProfessionalLocationScreen} options={{ headerTitle: 'Professional Location' }} />
            <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerTitle: 'Payment' }} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ headerTitle: 'Payment History' }} />
            <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} options={{ headerTitle: 'Payment Details' }} />
          </>
        ) : authState.userRole === 'professional' ? (
          // Professional Stack
          <>
            <Stack.Screen name="ProfessionalTabs" component={ProfessionalTabNavigator} options={{ headerShown: false }} />
          </>
        ) : (
          // Admin Stack
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
          </>
        )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaymentProvider>
  );
};

export default AppNavigator;
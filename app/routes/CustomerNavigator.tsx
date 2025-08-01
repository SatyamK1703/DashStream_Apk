import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// Import customer screens
import HomeScreen from '../../src/screens/customer/HomeScreen';
import BookingsScreen from '../../src/screens/customer/BookingsScreen';
import ServiceDetailsScreen from '../../src/screens/customer/ServiceDetailsScreen';
import CartScreen from '../../src/screens/customer/CartScreen';
import CheckoutScreen from '../../src/screens/customer/CheckoutScreen';
import BookingConfirmationScreen from '../../src/screens/customer/BookingConfirmationScreen';
import TrackBookingScreen from '../../src/screens/customer/TrackBookingScreen';
import OrderHistoryScreen from '../../src/screens/customer/OrderHistoryScreen';
import OrderDetailsScreen from '../../src/screens/customer/OrderDetailsScreen';
import ProfileScreen from '../../src/screens/customer/ProfileScreen';
import EditProfileScreen from '../../src/screens/customer/EditProfileScreen';
import SupportScreen from '../../src/screens/customer/SupportScreen';
import AboutUsScreen from '~/screens/customer/AboutUsScreen';
import FAQScreen from '../../src/screens/customer/FAQScreen';
import NotificationsScreen from '../../src/screens/customer/NotificationsScreen';
import LocationPickerScreen from '../../src/screens/customer/LocationPickerScreen';
import AllServicesScreen from '~/screens/customer/AllServiceScreen';

// Define the customer stack param list
export type CustomerStackParamList = {
  CustomerTabs: undefined;
  ServiceDetails: { serviceId: string };
  Cart: undefined;
  Checkout: undefined;
  BookingConfirmation: { bookingId: string };
  TrackBooking: { bookingId: string };
  OrderDetails: { orderId: string };
  EditProfile: undefined;
  Support: undefined;
  FAQ: undefined;
  Notifications: undefined;
  AddAddress: undefined;
  AddVehicle: undefined;
  Membership: undefined;
  PaymentMethods: undefined;
  AboutUs :undefined;
  LocationPicker :undefined;
  AllServices:undefined;
};

// Define the customer tab param list
export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  History: undefined;
  Profile: undefined;
  Support:undefined;
};

const Stack = createNativeStackNavigator<CustomerStackParamList>();
const Tab = createBottomTabNavigator<CustomerTabParamList>();

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Bookings') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'History') {
              iconName = focused ? 'time' : 'time-outline';
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
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Bookings" 
        component={BookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name="History" 
        component={OrderHistoryScreen}
        options={{ tabBarLabel: 'Support' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Customer Navigator
const CustomerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
      <Stack.Screen name="TrackBooking" component={TrackBookingScreen} />
      <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="AddAddress" component={require('../../src/screens/customer/AddAddressScreen').default} />
      <Stack.Screen name="AddVehicle" component={require('../../src/screens/customer/AddVehicleScreen').default} />
      <Stack.Screen name="Membership" component={require('../../src/screens/customer/MembershipScreen').default} />
      <Stack.Screen name="PaymentMethods" component={require('../../src/screens/customer/PaymentMethodsScreen').default} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen}/>
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />

    </Stack.Navigator>
  );
};

export default CustomerNavigator;
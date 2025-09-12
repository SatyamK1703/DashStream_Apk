import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SmartIcon from '../../src/components/common/IconFallback';
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
import AboutUsScreen from '../../src/screens/customer/AboutUsScreen';
import FAQScreen from '../../src/screens/customer/FAQScreen';
import NotificationsScreen from '../../src/screens/customer/NotificationsScreen';
import LocationPickerScreen from '../../src/screens/customer/LocationPickerScreen';
import AllServicesScreen from '../../src/screens/customer/AllServiceScreen';
import TermsAndConditions from '../../src/screens/customer/TermsAndConditions';
import MembershipScreen from '../../src/screens/customer/MembershipScreen';
import VehicleListScreen from '../../src/screens/customer/VehicleListScreen';
import AddressListScreen from '../../src/screens/customer/AddressListScreen';
import NearbyProfessionalsScreen from '../../src/screens/customer/NearbyProfessionalsScreen';
import ProfessionalLocationScreen from '../../src/screens/customer/ProfessionalLocationScreen';
import PaymentScreen from '../../src/screens/customer/PaymentScreen';
import PaymentHistoryScreen from '../../src/screens/customer/PaymentHistoryScreen';
import PaymentDetailsScreen from '../../src/screens/customer/PaymentDetailsScreen';
import TestNotificationScreen from '../../src/screens/customer/TestNotificationScreen';

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
  OrderHistory:undefined;
  TermsAndConditions:undefined;
  VehicleList:undefined;
  AddressList:undefined;
  TestNotification:undefined;
  NearbyProfessionals: undefined;
  ProfessionalLocation: { professionalId: string };
  Payment: { bookingId: string };
  PaymentHistory: undefined;
  PaymentDetails: { paymentId: string };
};

// Define the customer tab param list
export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Nearby: undefined;
  Support: undefined;
  Membership: undefined;
  Profile: undefined;
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

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Nearby':
              iconName = focused ? 'location' : 'location-outline';
              break;
            case 'Support':
              iconName = focused ? 'help-buoy' : 'help-buoy-outline';
              break;
            case 'Membership':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
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
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen 
        name="Nearby" 
        component={NearbyProfessionalsScreen}
        options={{ tabBarLabel: 'Nearby' }}
      />
      <Tab.Screen 
        name="Support" 
        component={SupportScreen}
        options={{ tabBarLabel: 'Support' }}
      />
      <Tab.Screen 
        name="Membership" 
        component={MembershipScreen}
        options={{ tabBarLabel: 'Membership' }}
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
      <Stack.Screen name="PaymentMethods" component={require('../../src/screens/customer/PaymentMethodsScreen').default} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen}/>
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />
      <Stack.Screen name='OrderHistory' component={OrderHistoryScreen}/>
      <Stack.Screen name='TermsAndConditions' component={TermsAndConditions}/>
      <Stack.Screen name='VehicleList' component={VehicleListScreen}/>
      <Stack.Screen name='AddressList' component={AddressListScreen}/>
      <Stack.Screen name='NearbyProfessionals' component={NearbyProfessionalsScreen}/>
      <Stack.Screen name='ProfessionalLocation' component={ProfessionalLocationScreen}/>
      <Stack.Screen name='Payment' component={PaymentScreen}/>
      <Stack.Screen name='PaymentHistory' component={PaymentHistoryScreen}/>
      <Stack.Screen name='PaymentDetails' component={PaymentDetailsScreen}/>
      <Stack.Screen name='TestNotification' component={TestNotificationScreen}/>

    </Stack.Navigator>
  );
};

export default CustomerNavigator;
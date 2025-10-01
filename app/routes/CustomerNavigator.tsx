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
import TermsAndConditions from '~/screens/customer/TermsAndConditions';
import MembershipScreen from '~/screens/customer/MembershipScreen';
import VehicleListScreen from '~/screens/customer/VehicleListScreen';
import AddressListScreen from '~/screens/customer/AddressListScreen';
import ReferAndEarnScreen from '~/screens/customer/ReferAndEarnScreen';
import PrivacyPolicyScreen from '~/screens/customer/PrivacyPolicyScreen';
import AddVehicleScreen from '~/screens/customer/AddVehicleScreen';
import AddAddressScreen from '~/screens/customer/AddAddressScreen';
import PaymentMethodsScreen from '~/screens/customer/PaymentMethodsScreen';

// Define the customer stack param list
export type CustomerStackParamList = {
  CustomerTabs: undefined;
  ServiceDetails: { serviceId: string };
  Cart: undefined;
  Checkout: { selectedAddressId?: string | null } | undefined;
  BookingConfirmation: { bookingId: string };
  TrackBooking: { bookingId: string };
  OrderDetails: { orderId: string };
  EditProfile: undefined;
  Support: undefined;
  FAQ: undefined;
  Notifications: undefined;
  AddAddress: { addressId?: string; addressData?: any } | undefined;
  AddVehicle: { vehicleId?: string; vehicleData?: any } | undefined;
  VehicleDetails: { vehicleId: string; vehicleData?: any } | undefined;
  Membership: undefined;
  PaymentMethods: undefined;
  AboutUs :undefined;
  LocationPicker :undefined;
  AllServices:undefined;
  OrderHistory:undefined;
  TermsAndConditions:undefined;
  VehicleList:undefined;
  AddressList: {
    currentAddressId?: string | null;
  } | undefined;
  ReferAndEarn:undefined;
  PrivacyPolicy:undefined;
};

// Define the customer tab param list
export type CustomerTabParamList = {
  Home: undefined;
  Bookings: undefined;
  History: undefined;
  Profile: undefined;
  Support:undefined;
  Membership:undefined;
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
          } 
          else if (route.name === 'History') {
              iconName = focused ? 'help-buoy' : 'help-buoy-outline';
          }else if (route.name ==='Membership'){
            iconName = focused ? 'card' :'card-outline';
          }
           else if (route.name === 'Profile') {
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
        component={SupportScreen}
        options={{ tabBarLabel: 'Support' }}
      />
      <Tab.Screen name="Membership" 
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
      <Stack.Screen name="AddAddress" component={AddAddressScreen} />
      <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
      <Stack.Screen name="Membership" component={MembershipScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen}/>
      <Stack.Screen name="LocationPicker" component={LocationPickerScreen} />
      <Stack.Screen name="AllServices" component={AllServicesScreen} />
      <Stack.Screen name='OrderHistory' component={OrderHistoryScreen}/>
      <Stack.Screen name='TermsAndConditions' component={TermsAndConditions}/>
      <Stack.Screen name='VehicleList' component={VehicleListScreen}/>
      <Stack.Screen name='AddressList' component={AddressListScreen}/>
      <Stack.Screen name='ReferAndEarn' component={ReferAndEarnScreen}/>
      <Stack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen}/>

    </Stack.Navigator>
  );
};

export default CustomerNavigator;
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './routes/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';

// Import contexts
import { AuthProvider } from '../src/contexts/AuthContext';
import { FirebaseAuthProvider } from '../src/contexts/FirebaseAuthContext';
import { LocationProvider } from '../src/contexts/LocationContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { BookingProvider } from '../src/contexts/BookingContext';
import { ServiceProvider } from '../src/contexts/ServiceContext';
import NotificationHandler from '../src/components/NotificationHandler';
const ios = Platform.OS === 'ios';
const App = () => {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <AuthProvider>
          <FirebaseAuthProvider>
            <LocationProvider>
              <ServiceProvider>
                <BookingProvider>
                  <NotificationProvider>
                    <NavigationContainer>
                      <RootNavigator />
                      <NotificationHandler />
                    </NavigationContainer>
                  </NotificationProvider>
                </BookingProvider>
              </ServiceProvider>
            </LocationProvider>
          </FirebaseAuthProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
};

export default App;
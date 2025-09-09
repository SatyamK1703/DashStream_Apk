import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import contexts
import { AuthProvider } from '../src/contexts/AuthContext';
import { DataProvider } from '../src/contexts/DataContext';
import { LocationProvider } from '../src/contexts/LocationContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { BookingProvider } from '../src/contexts/BookingContext';

// Navigation
import RootNavigator from './routes/RootNavigator';

import { ServiceProvider } from '../src/contexts/ServiceContext';
import NotificationHandler from '../src/components/NotificationHandler';

const App = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <AuthProvider>
            <DataProvider>
              <LocationProvider>
                <ServiceProvider>
                  <BookingProvider>
                    <NotificationProvider>
                      <NavigationContainer>
                        <RootNavigator />
                      </NavigationContainer>
                      <NotificationHandler />
                    </NotificationProvider>
                  </BookingProvider>
                </ServiceProvider>
              </LocationProvider>
            </DataProvider>
          </AuthProvider>
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;


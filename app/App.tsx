import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import Zustand store initialization
import { useInitializeStores } from '../src/store';

// Navigation
import RootNavigator from './routes/RootNavigator';

// Components
import NotificationHandler from '../src/components/NotificationHandler';

const App = () => {
  const { initializeApp } = useInitializeStores();

  useEffect(() => {
    // Initialize all Zustand stores when app starts
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <StatusBar style="auto" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <NotificationHandler />
        </View>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;


import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './routes/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { useInitializeStores } from '../src/store';
import AlertProvider from '../src/components/AlertProvider';

const App = () => {
  const { initializeApp } = useInitializeStores();

  useEffect(() => {
    // Initialize all stores on app launch
    initializeApp().catch(console.error);
  }, [initializeApp]);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <NavigationContainer>
          <AlertProvider>
            <RootNavigator />
          </AlertProvider>
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
};

export default App;
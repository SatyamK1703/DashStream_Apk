import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './routes/RootNavigator';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/AuthContext';
import { CartProvider } from '../src/context/CartContext';
import { View } from 'react-native';
const App = () => {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <AuthProvider>
          <CartProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </CartProvider>
        </AuthProvider>
      </View>
    </SafeAreaProvider>
  );
};

export default App;
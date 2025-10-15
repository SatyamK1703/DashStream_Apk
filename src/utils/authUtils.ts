import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Storage keys (matching those in httpClient.ts)
const STORAGE_KEYS = {
  ACCESS_TOKEN: '@DashStream:access_token',
  REFRESH_TOKEN: '@DashStream:refresh_token',
  USER_DATA: '@DashStream:user_data',
};

// SecureStore keys must be alphanumeric, '.', '-', or '_'. Avoid ':' and '@'
const SECURE_KEYS = {
  ACCESS_TOKEN: 'dashstream_access_token',
  REFRESH_TOKEN: 'dashstream_refresh_token',
};

/**
 * Get the current authentication token from storage
 * First tries SecureStore, then falls back to AsyncStorage
 */
export const getToken = async (): Promise<string | null> => {
  try {
    // Try to get token from SecureStore first
    const secureToken = await SecureStore.getItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    if (secureToken) {
      return secureToken;
    }
    
    // Fall back to AsyncStorage
    const asyncToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return asyncToken;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Get the refresh token from storage
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    // Try to get token from SecureStore first
    const secureToken = await SecureStore.getItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    if (secureToken) {
      return secureToken;
    }
    
    // Fall back to AsyncStorage
    const asyncToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return asyncToken;
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Save authentication tokens to both AsyncStorage and SecureStore
 */
export const saveTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  try {
    // Save to AsyncStorage
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
      [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
    ]);
    
    // Save to SecureStore
    await SecureStore.setItemAsync(SECURE_KEYS.ACCESS_TOKEN, accessToken);
    await SecureStore.setItemAsync(SECURE_KEYS.REFRESH_TOKEN, refreshToken);
    
    console.log('Auth tokens saved successfully');
  } catch (error) {
    console.error('Error saving auth tokens:', error);
  }
};

/**
 * Clear all authentication tokens and user data
 */
export const clearTokens = async (): Promise<void> => {
  try {
    // Clear from AsyncStorage
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER_DATA,
    ]);
    
    // Clear from SecureStore
    await SecureStore.deleteItemAsync(SECURE_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(SECURE_KEYS.REFRESH_TOKEN);
    
    console.log('Auth tokens cleared successfully');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};

/**
 * Check if user is authenticated by verifying token existence
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getToken();
  return !!token;
};
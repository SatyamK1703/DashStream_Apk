// src/utils/expoGoCompat.ts
// Utility to check if running in Expo Go environment

import Constants from 'expo-constants';

export const isExpoGo = (): boolean => {
  return Constants.executionEnvironment === 'storeClient';
};
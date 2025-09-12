// src/utils/expoGoCompat.ts
// Compatibility layer for Expo Go - provides mock implementations for unsupported modules
import React from 'react';
import { View, Text } from 'react-native';
import Constants from 'expo-constants';

// Check if we're running in Expo Go
export const isExpoGo = Constants.appOwnership === 'expo';

// Mock DeviceInfo for Expo Go
export const MockDeviceInfo = {
  getUniqueId: () => Promise.resolve('expo-go-mock-id'),
  getDeviceId: () => 'expo-go-mock-device',
  getSystemName: () => 'mock-system',
  getSystemVersion: () => 'mock-version',
  getBrand: () => 'mock-brand',
  getModel: () => 'mock-model',
  getBundleId: () => 'com.expo.mock',
  getVersion: () => '1.0.0',
  getBuildNumber: () => '1',
  isEmulator: () => Promise.resolve(true),
  getDeviceType: () => 'unknown',
  hasNotch: () => false,
  isTablet: () => false,
  getApiLevel: () => Promise.resolve(30),
};

// Mock Notifications for Expo Go
export const MockNotifications = {
  addNotificationReceivedListener: () => ({ remove: () => {} }),
  addNotificationResponseReceivedListener: () => ({ remove: () => {} }),
  removeNotificationSubscription: () => {},
  requestPermissionsAsync: () => Promise.resolve({ status: 'denied', canAskAgain: false }),
  getPermissionsAsync: () => Promise.resolve({ status: 'denied', canAskAgain: false }),
  getExpoPushTokenAsync: () => Promise.reject(new Error('Push notifications not supported in Expo Go')),
  setNotificationHandler: () => {},
  scheduleNotificationAsync: () => Promise.reject(new Error('Notifications not supported in Expo Go')),
  cancelAllScheduledNotificationsAsync: () => Promise.resolve(),
  presentNotificationAsync: () => Promise.reject(new Error('Notifications not supported in Expo Go')),
};

// Dynamic import function for DeviceInfo
export const getDeviceInfo = async () => {
  if (isExpoGo) {
    console.warn('Using mock DeviceInfo in Expo Go');
    return MockDeviceInfo;
  }
  
  try {
    const DeviceInfo = require('react-native-device-info').default;
    return DeviceInfo;
  } catch (error) {
    console.warn('Failed to load react-native-device-info, using mock:', error);
    return MockDeviceInfo;
  }
};

// Mock Video component for expo-av deprecation
export const MockVideo = (props: any) => {
  console.warn('Video playback not supported in Expo Go or expo-av is deprecated');
  // Return a placeholder view that matches the style
  return React.createElement(
    View,
    {
      style: [
        props.style,
        { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }
      ]
    },
    React.createElement(
      Text,
      { 
        style: { color: '#666', fontSize: 12, textAlign: 'center' } 
      },
      'Video not available\nin Expo Go'
    )
  );
};

// Dynamic import function for Notifications
export const getNotifications = async () => {
  if (isExpoGo) {
    console.warn('Using mock Notifications in Expo Go');
    return MockNotifications;
  }
  
  try {
    const Notifications = require('expo-notifications');
    return Notifications;
  } catch (error) {
    console.warn('Failed to load expo-notifications, using mock:', error);
    return MockNotifications;
  }
};

// Synchronous function to get Video component (avoids async loading issues)
export const getVideoComponent = () => {
  // In Expo Go, return mock immediately
  if (isExpoGo) {
    console.warn('Video playback not supported in Expo Go, using mock');
    return MockVideo;
  }
  
  try {
    // Try to use expo-av (still the current standard)
    const expoAv = require('expo-av');
    if (expoAv && expoAv.Video) {
      console.log('Using expo-av Video component');
      return expoAv.Video;
    }
    
    console.warn('Video component not found in expo-av, using mock');
    return MockVideo;
  } catch (error) {
    console.warn('expo-av not available, using mock:', error);
    return MockVideo;
  }
};

// Keep the async version for backward compatibility
export const getVideo = async () => {
  return { Video: getVideoComponent() };
};

// Note: Mock icon system removed - SVG icons now work properly with fixed Metro config
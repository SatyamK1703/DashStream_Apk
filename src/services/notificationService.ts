// src/services/notificationService.ts
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export const registerForPushNotificationsAsync = async () => {
  let token;
  
  // Check if this is a physical device (not a simulator/emulator)
  if (Device.isDevice) {
    // Check if we have permission to send notifications
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // If we don't have permission, ask for it
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // If we still don't have permission, return null
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get the token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    })).data;
    
    console.log('Push token:', token);
  } else {
    console.log('Must use physical device for push notifications');
    return null;
  }

  // Set up special notification channel for Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
};


export const sendLocalNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Send immediately
  });
  
  return { success: true };
};


export const sendNotification = async (to: string, title: string, body: string) => {
  // This function would typically call a backend API to send a push notification
  // For now, we'll just log the request and return success
  console.log(`Would send notification to ${to}: ${title} - ${body}`);
  return Promise.resolve({ success: true });
};
import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useNotifications } from '../contexts/NotificationContext';

/**
 * Component to handle push notification listeners
 * This component doesn't render anything, it just sets up notification listeners
 * Note: Push notifications don't work in Expo Go with SDK 53+, only in development builds
 */
const NotificationHandler: React.FC = () => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();
  const { fetchNotifications } = useNotifications();

  // Check if we're running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (isExpoGo) {
      console.warn('Push notifications are not supported in Expo Go. Use a development build instead.');
      return;
    }

    // Set up notification handlers
    registerNotificationHandlers();

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerNotificationHandlers = () => {
    try {
      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received in foreground:', notification);
        // Refresh notifications list when a new notification is received
        fetchNotifications();
      });

      // This listener is fired whenever a user taps on or interacts with a notification
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification response received:', response);
        const { notification } = response;
        const data = notification.request.content.data;

        // Handle notification tap based on data
        handleNotificationResponse(data);
      });
    } catch (error) {
      console.warn('Failed to set up notification handlers:', error);
    }
  };

  const handleNotificationResponse = (data: any) => {
    // Handle different notification types based on data
    // For example, navigate to specific screens
    console.log('Handling notification response with data:', data);

    // Example: Navigate to booking details if notification is about a booking
    // if (data.type === 'booking' && data.bookingId) {
    //   navigation.navigate('BookingDetails', { bookingId: data.bookingId });
    // }
  };

  // This component doesn't render anything
  return null;
};

export default NotificationHandler;
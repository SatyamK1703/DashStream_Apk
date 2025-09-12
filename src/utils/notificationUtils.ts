import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';


export const configureNotifications = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('payment-notifications', {
      name: 'Payment Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3498db',
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const showSuccessNotification = async (title: string, message: string) => {
  try {
    // Show in-app alert
    Alert.alert(title, message);
    
    if (!isExpoGo) {
      // Also send a system notification if app is in background
      const Notifications = await getNotifications();
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { type: 'success' },
          sound: true,
        },
        trigger: null, // Show immediately
      });
    }
  } catch (error) {
    console.error('Error showing success notification:', error);
  }
};

export const showErrorNotification = async (
  title: string,
  message: string,
  error?: any
) => {
  try {
    // Log the error for debugging
    if (error) {
      console.error('Error details:', error);
    }

    // Show in-app alert
    Alert.alert(title, message);
    
    if (!isExpoGo) {
      // Also send a system notification if app is in background
      const Notifications = await getNotifications();
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: { type: 'error' },
          sound: true,
        },
        trigger: null, // Show immediately
      });
    }
  } catch (err) {
    console.error('Error showing error notification:', err);
  }
};

export const showPaymentSuccessNotification = async (amount: number, paymentId: string) => {
  const title = 'Payment Successful';
  const message = `Your payment of ₹${amount.toFixed(2)} was successful. Payment ID: ${paymentId.substring(0, 8)}...`;
  
  await showSuccessNotification(title, message);
};

export const showPaymentFailureNotification = async (amount: number, error: any) => {
  const title = 'Payment Failed';
  const message = `Your payment of ₹${amount.toFixed(2)} could not be processed. ${error.message || 'Please try again later.'}`;
  
  await showErrorNotification(title, message, error);
};
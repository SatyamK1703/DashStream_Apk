// src/utils/notificationUtils.ts
import { Alert } from 'react-native';

export const showErrorNotification = (message: string, title?: string) => {
  Alert.alert(title || 'Error', message);
};

export const showSuccessNotification = (message: string, title?: string) => {
  Alert.alert(title || 'Success', message);
};

export const showInfoNotification = (message: string, title?: string) => {
  Alert.alert(title || 'Info', message);
};

export const showConfirmationDialog = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title?: string
) => {
  Alert.alert(
    title || 'Confirm',
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'OK',
        onPress: onConfirm,
      },
    ]
  );
};
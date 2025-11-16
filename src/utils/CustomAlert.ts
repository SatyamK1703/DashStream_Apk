import { alertManager } from '../components/CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
}

class CustomAlertAPI {
  static alert(
    title: string,
    message?: string,
    buttons?: AlertButton[],
    options?: AlertOptions
  ) {
    // Map the buttons to our format
    const mappedButtons: AlertButton[] = buttons?.map(button => ({
      text: button.text,
      onPress: button.onPress,
      style: button.style === 'destructive' ? 'destructive' :
             button.style === 'cancel' ? 'cancel' : 'default'
    })) || [{ text: 'OK' }];

    // Determine alert type based on title/content
    let type: 'default' | 'success' | 'error' | 'warning' | 'info' = 'default';
    const lowerTitle = title.toLowerCase();
    const lowerMessage = message?.toLowerCase() || '';

    if (lowerTitle.includes('success') || lowerTitle.includes('completed') ||
        lowerMessage.includes('success') || lowerMessage.includes('completed')) {
      type = 'success';
    } else if (lowerTitle.includes('error') || lowerTitle.includes('failed') ||
               lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      type = 'error';
    } else if (lowerTitle.includes('warning') || lowerTitle.includes('caution') ||
               lowerMessage.includes('warning') || lowerMessage.includes('caution')) {
      type = 'warning';
    } else if (lowerTitle.includes('info') || lowerTitle.includes('information') ||
               lowerMessage.includes('info') || lowerMessage.includes('information')) {
      type = 'info';
    }

    alertManager.alert(title, message, mappedButtons, type);
  }
}

export default CustomAlertAPI;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  buttons = [{ text: 'OK' }],
  onDismiss,
  type = 'default',
}) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim]);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'alert-circle';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.green800;
      case 'error':
        return colors.red800;
      case 'warning':
        return colors.amber800;
      case 'info':
        return colors.primary;
      default:
        return colors.gray500;
    }
  };

  const getButtonStyle = (buttonStyle?: string) => {
    switch (buttonStyle) {
      case 'cancel':
        return styles.cancelButton;
      case 'destructive':
        return styles.destructiveButton;
      default:
        return styles.defaultButton;
    }
  };

  const handleButtonPress = (button: AlertButton) => {
    button.onPress?.();
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={getIconName()} size={48} color={getIconColor()} />
          </View>

          <Text style={styles.title}>{title}</Text>

          {message && <Text style={styles.message}>{message}</Text>}

          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length === 1 && styles.singleButton,
                  buttons.length === 2 && index === 0 && styles.leftButton,
                  buttons.length === 2 && index === 1 && styles.rightButton,
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructiveButtonText,
                    button.style === 'cancel' && styles.cancelButtonText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Alert Manager for easy usage
class AlertManager {
  private static instance: AlertManager;
  private alertQueue: Array<{
    id: string;
    props: CustomAlertProps;
  }> = [];
  private currentAlert: string | null = null;
  private listeners: Array<(alert: CustomAlertProps | null) => void> = [];

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  subscribe(listener: (alert: CustomAlertProps | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(alert: CustomAlertProps | null) {
    this.listeners.forEach(listener => listener(alert));
  }

  alert(title: string, message?: string, buttons?: AlertButton[], type?: CustomAlertProps['type']) {
    const id = Date.now().toString();
    const alertProps: CustomAlertProps = {
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
      type,
      onDismiss: () => this.dismiss(id),
    };

    this.alertQueue.push({ id, props: alertProps });
    this.showNextAlert();
  }

  private showNextAlert() {
    if (this.currentAlert || this.alertQueue.length === 0) return;

    const nextAlert = this.alertQueue.shift()!;
    this.currentAlert = nextAlert.id;
    this.notifyListeners(nextAlert.props);
  }

  private dismiss(id: string) {
    if (this.currentAlert === id) {
      this.currentAlert = null;
      this.notifyListeners(null);
      // Show next alert after a small delay
      setTimeout(() => this.showNextAlert(), 300);
    }
  }
}

export const alertManager = AlertManager.getInstance();

// Hook to use the alert manager
export const useCustomAlert = () => {
  const [currentAlert, setCurrentAlert] = useState<CustomAlertProps | null>(null);

  useEffect(() => {
    const unsubscribe = alertManager.subscribe(setCurrentAlert);
    return unsubscribe;
  }, []);

  return {
    alert: (title: string, message?: string, buttons?: AlertButton[], type?: CustomAlertProps['type']) => {
      alertManager.alert(title, message, buttons, type);
    },
    currentAlert,
  };
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  singleButton: {
    backgroundColor: colors.primary,
  },
  leftButton: {
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  rightButton: {
    backgroundColor: colors.primary,
    marginLeft: 8,
  },
  defaultButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: colors.gray100,
  },
  destructiveButton: {
    backgroundColor: colors.red800,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButtonText: {
    color: colors.gray700,
  },
  destructiveButtonText: {
    color: colors.white,
  },
});

export default CustomAlert;
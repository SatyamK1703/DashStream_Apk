import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ErrorType } from '../../utils/errorHandlingUtils';

interface ErrorMessageProps {
  message: string;
  type?: ErrorType;
  onRetry?: () => void;
  onDismiss?: () => void;
  showIcon?: boolean;
  showRetry?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  type = ErrorType.UNKNOWN,
  onRetry,
  onDismiss,
  showIcon = true,
  showRetry = false,
}) => {
  // Get icon and color based on error type
  const getIconAndColor = () => {
    switch (type) {
      case ErrorType.NETWORK:
        return { icon: 'wifi-outline', color: '#E67E22' };
      case ErrorType.AUTHENTICATION:
        return { icon: 'lock-closed-outline', color: '#E74C3C' };
      case ErrorType.AUTHORIZATION:
        return { icon: 'shield-outline', color: '#E74C3C' };
      case ErrorType.VALIDATION:
        return { icon: 'alert-circle-outline', color: '#F39C12' };
      case ErrorType.SERVER:
        return { icon: 'server-outline', color: '#E74C3C' };
      case ErrorType.NOT_FOUND:
        return { icon: 'search-outline', color: '#3498DB' };
      case ErrorType.TIMEOUT:
        return { icon: 'time-outline', color: '#F39C12' };
      default:
        return { icon: 'alert-outline', color: '#E74C3C' };
    }
  };

  const { icon, color } = getIconAndColor();

  return (
    <View style={styles.container}>
      {showIcon && (
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="#FFFFFF" />
        </View>
      )}
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{message}</Text>
        {showRetry && onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Ionicons name="close-outline" size={20} color="#777777" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFEEEE',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  messageContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#555555',
    fontWeight: '500',
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ErrorMessage;
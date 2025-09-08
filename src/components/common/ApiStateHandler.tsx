import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ErrorMessage from './ErrorMessage';
import { ErrorType } from '../../utils/errorHandlingUtils';

interface ApiStateHandlerProps {
  isLoading: boolean;
  error: any | null;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
}

/**
 * Component to handle API loading states, errors, and empty states
 * Wraps content and shows appropriate UI based on API state
 */
const ApiStateHandler: React.FC<ApiStateHandlerProps> = ({
  isLoading,
  error,
  onRetry,
  loadingMessage = 'Loading...',
  emptyMessage = 'No data available',
  isEmpty = false,
  children,
}) => {
  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{loadingMessage}</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    const errorMessage = error.message || 'Something went wrong';
    const errorType = error.type || ErrorType.UNKNOWN;

    return (
      <View style={styles.centerContainer}>
        <ErrorMessage 
          message={errorMessage} 
          type={errorType} 
          onRetry={onRetry}
          showRetry={!!onRetry}
        />
      </View>
    );
  }

  // Show empty state
  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="document-outline" size={48} color="#CCCCCC" />
        <Text style={styles.emptyText}>{emptyMessage}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Show content
  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555555',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#555555',
    fontWeight: '500',
  },
});

export default ApiStateHandler;
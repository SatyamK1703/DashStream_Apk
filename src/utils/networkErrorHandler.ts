import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { showErrorNotification } from './notificationUtils';

// Network connection states
export enum NetworkState {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  UNKNOWN = 'unknown'
}

// Network connection types
export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown',
  NONE = 'none'
}

// Network info interface
export interface NetworkInfo {
  state: NetworkState;
  isConnected: boolean;
  type: ConnectionType;
  isInternetReachable: boolean | null;
  details: any;
}

// Default network info
const defaultNetworkInfo: NetworkInfo = {
  state: NetworkState.UNKNOWN,
  isConnected: false,
  type: ConnectionType.UNKNOWN,
  isInternetReachable: null,
  details: null
};

// Current network state
let currentNetworkInfo: NetworkInfo = { ...defaultNetworkInfo };

// Network state change listeners
const listeners: Set<(info: NetworkInfo) => void> = new Set();

/**
 * Initialize network monitoring
 */
export const initNetworkMonitoring = (): void => {
  // Subscribe to network state changes
  NetInfo.addEventListener(handleNetworkChange);
  
  // Get initial network state
  NetInfo.fetch().then(handleNetworkChange);
};

/**
 * Handle network state changes
 */
const handleNetworkChange = (state: NetInfoState): void => {
  // Update current network info
  currentNetworkInfo = {
    state: state.isConnected ? NetworkState.CONNECTED : NetworkState.DISCONNECTED,
    isConnected: !!state.isConnected,
    type: (state.type as ConnectionType) || ConnectionType.UNKNOWN,
    isInternetReachable: state.isInternetReachable,
    details: state.details
  };
  
  // Notify listeners
  listeners.forEach(listener => listener(currentNetworkInfo));
};

/**
 * Add network state change listener
 */
export const addNetworkListener = (listener: (info: NetworkInfo) => void): () => void => {
  listeners.add(listener);
  
  // Call listener with current state immediately
  listener(currentNetworkInfo);
  
  // Return function to remove listener
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Get current network info
 */
export const getNetworkInfo = async (): Promise<NetworkInfo> => {
  // If we already have network info, return it
  if (currentNetworkInfo.state !== NetworkState.UNKNOWN) {
    return currentNetworkInfo;
  }
  
  // Otherwise fetch current state
  try {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return currentNetworkInfo;
  } catch (error) {
    console.error('Error fetching network info:', error);
    return { ...defaultNetworkInfo };
  }
};

/**
 * Check if device is connected to the internet
 */
export const isConnected = async (): Promise<boolean> => {
  const networkInfo = await getNetworkInfo();
  return networkInfo.isConnected && networkInfo.isInternetReachable !== false;
};

/**
 * Handle network errors in API requests
 */
export const handleNetworkError = async (error: any, retryCallback?: () => Promise<any>): Promise<void> => {
  // Check if error is due to network connectivity
  const networkInfo = await getNetworkInfo();
  
  if (!networkInfo.isConnected) {
    // Show offline notification
    await showErrorNotification(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      error
    );
  } else if (networkInfo.isInternetReachable === false) {
    // Connected but no internet
    await showErrorNotification(
      'Internet Unavailable',
      'You\'re connected to a network, but the internet is not accessible.',
      error
    );
  } else {
    // Other network-related error
    await showErrorNotification(
      'Network Error',
      'Unable to connect to the server. Please try again later.',
      error
    );
  }
  
  // If retry callback is provided, offer retry option
  if (retryCallback) {
    // Implement retry logic here if needed
  }
};

/**
 * Clean up network monitoring
 */
export const cleanupNetworkMonitoring = (): void => {
  // Clear all listeners
  listeners.clear();
  
  // Unsubscribe from NetInfo events
  // Note: NetInfo.removeEventListener() is not needed in newer versions
};
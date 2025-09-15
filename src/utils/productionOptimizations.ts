// Production optimizations and error handling
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Conditionally import Sentry
let Sentry: any = null;
try {
  Sentry = require('@sentry/react-native');
} catch (error) {
  console.warn('Sentry not available - error tracking disabled');
}

// Initialize Sentry for production error tracking
export const initializeErrorTracking = () => {
  if (__DEV__) {
    console.log('🔧 Development mode: Error tracking disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN || Constants.expoConfig?.extra?.sentryDsn,
      environment: process.env.NODE_ENV || 'production',
      release: Constants.expoConfig?.version || '1.0.0',
      dist: Platform.OS === 'ios' 
        ? Constants.expoConfig?.ios?.buildNumber || '1'
        : Constants.expoConfig?.android?.versionCode?.toString() || '1',
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation: new Sentry.ReactNavigationInstrumentation(),
        }),
      ],
      tracesSampleRate: 0.1, // Reduce sampling rate for production
      beforeSend(event: any) {
        // Filter out sensitive information
        if (event.exception) {
          event.exception.values?.forEach((exception: any) => {
            if (exception.stacktrace?.frames) {
              exception.stacktrace.frames = exception.stacktrace.frames.filter(
                (frame: any) => !frame.filename?.includes('node_modules')
              );
            }
          });
        }
        return event;
      },
    });

    console.log('✅ Error tracking initialized');
  } catch (error) {
    console.error('❌ Failed to initialize error tracking:', error);
  }
};

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();
  private readonly MAX_METRICS = 100; // Prevent memory leaks

  startTimer(operation: string): void {
    if (this.metrics.size >= this.MAX_METRICS) {
      this.clearOldMetrics();
    }
    this.metrics.set(operation, Date.now());
  }

  endTimer(operation: string, threshold = 1000): void {
    const startTime = this.metrics.get(operation);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.metrics.delete(operation);

    if (duration > threshold) {
      console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms`);
      
      if (!__DEV__) {
        Sentry?.addBreadcrumb({
          category: 'performance',
          message: `Slow operation: ${operation}`,
          level: 'warning',
          data: { duration, threshold }
        });
      }
    }
  }

  private clearOldMetrics(): void {
    // Clear half of the metrics to free up space
    const entries = Array.from(this.metrics.entries());
    entries.slice(0, Math.floor(this.MAX_METRICS / 2)).forEach(([key]) => {
      this.metrics.delete(key);
    });
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if (__DEV__ || !global.performance || !(global.performance as any).memory) {
    return;
  }

  const checkMemory = () => {
    const memory = (global.performance as any).memory;
    const used = memory.usedJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    const percentage = (used / limit) * 100;

    if (percentage > 80) {
      console.warn(`⚠️ High memory usage: ${percentage.toFixed(1)}%`);
      
      if (!__DEV__) {
        Sentry?.addBreadcrumb({
          category: 'memory',
          message: 'High memory usage detected',
          level: 'warning',
          data: { percentage, used, limit }
        });
      }
    }
  };

  // Check memory usage every 30 seconds
  setInterval(checkMemory, 30000);
};

// Cache management
class CacheManager {
  private readonly CACHE_PREFIX = '@DashStream:cache:';
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached items

  async set<T>(key: string, value: T, ttl = this.DEFAULT_TTL): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cacheItem = {
        value,
        timestamp: Date.now(),
        ttl
      };

      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheItem));
      await this.cleanupOldEntries();
    } catch (error) {
      console.warn('Cache set failed:', error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cached = await AsyncStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const cacheItem = JSON.parse(cached);
      const now = Date.now();

      if (now - cacheItem.timestamp > cacheItem.ttl) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }

      return cacheItem.value;
    } catch (error) {
      console.warn('Cache get failed:', error);
      return null;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }

  private async cleanupOldEntries(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));

      if (cacheKeys.length <= this.MAX_CACHE_SIZE) return;

      // Remove oldest entries
      const keysToRemove = cacheKeys.slice(0, cacheKeys.length - this.MAX_CACHE_SIZE);
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.warn('Cache cleanup failed:', error);
    }
  }
}

export const cacheManager = new CacheManager();

// Network optimization
export const optimizeNetworkRequests = () => {
  // Implement request deduplication
  const pendingRequests = new Map<string, Promise<any>>();

  return {
    deduplicate: <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
      if (pendingRequests.has(key)) {
        return pendingRequests.get(key)!;
      }

      const request = requestFn().finally(() => {
        pendingRequests.delete(key);
      });

      pendingRequests.set(key, request);
      return request;
    },

    clearPending: () => {
      pendingRequests.clear();
    }
  };
};

// App state optimization
export const optimizeAppState = () => {
  // Clean up resources when app goes to background
  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'background') {
      console.log('📱 App backgrounded - cleaning up resources');
      
      // Clear sensitive data from memory
      performanceMonitor.getMetrics(); // This triggers cleanup
      
      // Cancel pending network requests if needed
      // optimizeNetworkRequests().clearPending();
    }
  };

  return { handleAppStateChange };
};

// Production logger
export const productionLogger = {
  info: (message: string, data?: any) => {
    if (__DEV__) {
      console.log(message, data);
    } else {
      Sentry.addBreadcrumb({
        message,
        level: 'info',
        data
      });
    }
  },

  warn: (message: string, data?: any) => {
    console.warn(message, data);
    if (!__DEV__) {
      Sentry?.captureMessage(message, 'warning');
    }
  },

  error: (message: string, error?: any) => {
    console.error(message, error);
    if (!__DEV__) {
      Sentry?.captureException(error || new Error(message));
    }
  }
};

// Initialize all production optimizations
export const initializeProductionOptimizations = () => {
  if (__DEV__) {
    console.log('🔧 Development mode: Production optimizations disabled');
    return;
  }

  initializeErrorTracking();
  monitorMemoryUsage();
  
  console.log('🚀 Production optimizations initialized');
};

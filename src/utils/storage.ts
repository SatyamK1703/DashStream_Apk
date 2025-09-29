import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_CONFIG } from '../config/config';

// Storage utility functions
export class StorageManager {
  // Secure storage (for sensitive data like tokens)
  static async setSecureItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('Error setting secure item:', error);
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.setItem(key, value);
    }
  }

  static async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Error getting secure item:', error);
      // Fallback to AsyncStorage if SecureStore fails
      return await AsyncStorage.getItem(key);
    }
  }

  static async removeSecureItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      // Fallback to AsyncStorage if SecureStore fails
      await AsyncStorage.removeItem(key);
    }
  }

  // Regular storage (for non-sensitive data)
  static async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error('Error setting item:', error);
      throw error;
    }
  }

  static async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Error getting item:', error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item:', error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.isArray(keys) ? [...keys] : [];
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      const result = await AsyncStorage.multiGet(keys as readonly string[]);
      return result.map(([k, v]) => [k, v]);
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return [];
    }
  }

  static async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await AsyncStorage.multiSet(keyValuePairs as [string, string][]);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  static async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items:', error);
      throw error;
    }
  }
}

// Authentication token management
export class TokenManager {
  static async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await StorageManager.setSecureItem(API_CONFIG.AUTH.TOKEN_KEY, accessToken);
    if (refreshToken) {
      await StorageManager.setSecureItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static async getAccessToken(): Promise<string | null> {
    return await StorageManager.getSecureItem(API_CONFIG.AUTH.TOKEN_KEY);
  }

  static async getRefreshToken(): Promise<string | null> {
    return await StorageManager.getSecureItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  }

  static async clearTokens(): Promise<void> {
    await StorageManager.removeSecureItem(API_CONFIG.AUTH.TOKEN_KEY);
    await StorageManager.removeSecureItem(API_CONFIG.AUTH.REFRESH_TOKEN_KEY);
  }

  static async hasValidToken(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null && token.length > 0;
  }
}

// User data management
export class UserManager {
  static async setUser(user: any): Promise<void> {
    await StorageManager.setItem(API_CONFIG.AUTH.USER_KEY, user);
  }

  static async getUser(): Promise<any | null> {
    return await StorageManager.getItem(API_CONFIG.AUTH.USER_KEY);
  }

  static async updateUser(updates: Partial<any>): Promise<void> {
    const currentUser = await this.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      await this.setUser(updatedUser);
    }
  }

  static async clearUser(): Promise<void> {
    await StorageManager.removeItem(API_CONFIG.AUTH.USER_KEY);
  }
}

// Cache management with TTL (Time To Live)
interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private static getCacheKey(key: string): string {
    return `@cache_${key}`;
  }

  static async set<T>(
    key: string, 
    data: T, 
    ttl: number = API_CONFIG.CACHE.DEFAULT_TTL
  ): Promise<void> {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    await StorageManager.setItem(this.getCacheKey(key), cacheItem);
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const cacheItem: CacheItem<T> | null = await StorageManager.getItem(this.getCacheKey(key));
      
      if (!cacheItem) return null;
      
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;
      
      if (isExpired) {
        await this.remove(key);
        return null;
      }
      
      return cacheItem.data;
    } catch (error) {
      console.error('Error getting cached item:', error);
      return null;
    }
  }

  static async remove(key: string): Promise<void> {
    await StorageManager.removeItem(this.getCacheKey(key));
  }

  static async clear(): Promise<void> {
    const keys = await StorageManager.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
    await StorageManager.multiRemove(cacheKeys);
  }

  static async isExpired(key: string): Promise<boolean> {
    try {
      const cacheItem: CacheItem | null = await StorageManager.getItem(this.getCacheKey(key));
      if (!cacheItem) return true;
      
      return Date.now() - cacheItem.timestamp > cacheItem.ttl;
    } catch (error) {
      console.error('Error checking expiration:', error);
      return true;
    }
  }

  static async getWithFallback<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttl: number = API_CONFIG.CACHE.DEFAULT_TTL
  ): Promise<T> {
    let cached = await this.get<T>(key);
    
    if (cached === null) {
      cached = await fallbackFn();
      await this.set(key, cached, ttl);
    }
    
    return cached;
  }
}

// App settings management
export class SettingsManager {
  private static readonly SETTINGS_KEY = '@app_settings';
  // AppSettings is defined at module level (see above)
  private static defaultSettings: AppSettings = {
    theme: 'auto',
    language: 'en',
    notifications: {
      push: true,
      email: true,
      sms: false,
    },
    location: {
      enabled: true,
      precision: 'high',
    },
    privacy: {
      analytics: true,
      crashReporting: true,
    },
    developer: {
      debugMode: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
      showLogs: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
    },
  };

  static async getSettings(): Promise<AppSettings> {
    const settings = await StorageManager.getItem<AppSettings>(this.SETTINGS_KEY);
    return settings ? { ...this.defaultSettings, ...settings } : this.defaultSettings;
  }

  static async updateSettings(updates: Partial<AppSettings>): Promise<void> {
    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...updates };
    await StorageManager.setItem(this.SETTINGS_KEY, newSettings);
  }

  static async resetSettings(): Promise<void> {
    await StorageManager.setItem(this.SETTINGS_KEY, this.defaultSettings);
  }

  static async getSetting<K extends keyof AppSettings>(key: K): Promise<AppSettings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  static async setSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<void> {
    const currentSettings = await this.getSettings();
    // mutate then persist
    (currentSettings as any)[key] = value;
    await StorageManager.setItem(this.SETTINGS_KEY, currentSettings);
  }
}

// Define AppSettings at module scope so it can be referenced by the SettingsManager
interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  location: {
    enabled: boolean;
    precision: 'high' | 'medium' | 'low';
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
  developer: {
    debugMode: boolean;
    showLogs: boolean;
  };
}

// Data migration utilities
export class MigrationManager {
  private static readonly MIGRATION_KEY = '@migration_version';
  private static readonly CURRENT_VERSION = 1;

  static async runMigrations(): Promise<void> {
    const currentVersion = await StorageManager.getItem<number>(this.MIGRATION_KEY) || 0;
    
    if (currentVersion < this.CURRENT_VERSION) {
      console.log(`Running migrations from version ${currentVersion} to ${this.CURRENT_VERSION}`);
      
      // Run migrations sequentially
      for (let version = currentVersion + 1; version <= this.CURRENT_VERSION; version++) {
        await this.runMigration(version);
      }
      
      await StorageManager.setItem(this.MIGRATION_KEY, this.CURRENT_VERSION);
      console.log('Migrations completed');
    }
  }

  private static async runMigration(version: number): Promise<void> {
    console.log(`Running migration for version ${version}`);
    
    switch (version) {
      case 1:
        // Example migration: Clear old cache format
        await this.migrationV1();
        break;
      
      // Add more migrations as needed
      default:
        console.warn(`No migration defined for version ${version}`);
    }
  }

  private static async migrationV1(): Promise<void> {
    // Example: Clear old cache data
    const keys = await StorageManager.getAllKeys();
    const oldCacheKeys = keys.filter(key => key.startsWith('cache_'));
    if (oldCacheKeys.length > 0) {
      await StorageManager.multiRemove(oldCacheKeys);
    }
  }
}

// Storage size monitoring
export class StorageMonitor {
  static async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number;
    cacheKeys: number;
    secureKeys: number;
  }> {
    const keys = await StorageManager.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
    const secureKeys = keys.filter(key => 
      key === API_CONFIG.AUTH.TOKEN_KEY || 
      key === API_CONFIG.AUTH.REFRESH_TOKEN_KEY
    );
    
    // Estimate storage size (approximate)
    let estimatedSize = 0;
    const sampleData = await StorageManager.multiGet(keys.slice(0, 10));
    
    for (const [, value] of sampleData) {
      if (value) {
        estimatedSize += value.length * 2; // Rough estimate (UTF-16)
      }
    }
    
    // Extrapolate to all keys
    const averageSize = estimatedSize / Math.min(keys.length, 10);
    const totalEstimatedSize = averageSize * keys.length;
    
    return {
      totalKeys: keys.length,
      estimatedSize: Math.round(totalEstimatedSize),
      cacheKeys: cacheKeys.length,
      secureKeys: secureKeys.length,
    };
  }

  static async cleanupExpiredCache(): Promise<number> {
    const keys = await StorageManager.getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cache_'));
    
    let cleanedCount = 0;
    
    for (const cacheKey of cacheKeys) {
      const key = cacheKey.replace('@cache_', '');
      const isExpired = await CacheManager.isExpired(key);
      
      if (isExpired) {
        await CacheManager.remove(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
}

// Export all managers
export {
  StorageManager as Storage,
  TokenManager as Token,
  UserManager as User,
  CacheManager as Cache,
  SettingsManager as Settings,
  MigrationManager as Migration,
  StorageMonitor as Monitor,
};
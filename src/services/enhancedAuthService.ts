// Enhanced Authentication Service with advanced security
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import enhancedApiService from './enhancedApiService';
import { API_CONFIG } from '../constants/config';
import { connectionHealthMonitor } from './connectionHealthMonitor';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'crypto-js';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  profileImage?: string;
  profileComplete: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreferences;
  securitySettings?: SecuritySettings;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareProfile: boolean;
    analytics: boolean;
  };
  app: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  trustedDevices: string[];
  lastPasswordChange: string;
  loginAttempts: number;
  lockedUntil?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  deviceTrusted: boolean;
  sessionExpiry: string | null;
  lastActivity: string;
}

export interface LoginCredentials {
  phone: string;
  otp: string;
  deviceInfo?: DeviceInfo;
  rememberDevice?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
    expiresAt: string;
  };
  message: string;
  requiresVerification?: boolean;
  securityAlert?: string;
}

class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private authState: AuthState;
  private listeners: ((state: AuthState) => void)[] = [];
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly ENCRYPTION_KEY = 'DashStream_SecureKey_2024';
  private readonly SESSION_CHECK_INTERVAL = 60000; // 1 minute

  private constructor() {
    this.authState = {
      isAuthenticated: false,
      isLoading: true,
      user: null,
      token: null,
      refreshToken: null,
      deviceTrusted: false,
      sessionExpiry: null,
      lastActivity: new Date().toISOString()
    };

    this.initializeAuth();
  }

  public static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService();
    }
    return EnhancedAuthService.instance;
  }

  private async initializeAuth() {
    try {
      // Load stored authentication data
      await this.loadStoredAuthData();
      
      // Check device trust status
      await this.checkDeviceTrustStatus();
      
      // Validate current session
      await this.validateCurrentSession();
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      console.log('✅ Enhanced Auth Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Enhanced Auth Service:', error);
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  private async loadStoredAuthData() {
    try {
      const [
        encryptedToken,
        encryptedRefreshToken,
        encryptedUser,
        sessionExpiry,
        lastActivity
      ] = await AsyncStorage.multiGet([
        'secure_token',
        'secure_refresh_token',
        'secure_user_data',
        'session_expiry',
        'last_activity'
      ]);

      // Decrypt and load tokens
      if (encryptedToken[1]) {
        this.authState.token = this.decrypt(encryptedToken[1]);
        await enhancedApiService.setAuthToken(this.authState.token);
      }

      if (encryptedRefreshToken[1]) {
        this.authState.refreshToken = this.decrypt(encryptedRefreshToken[1]);
      }

      // Decrypt and load user data
      if (encryptedUser[1]) {
        this.authState.user = JSON.parse(this.decrypt(encryptedUser[1]));
      }

      // Load session info
      this.authState.sessionExpiry = sessionExpiry[1];
      this.authState.lastActivity = lastActivity[1] || new Date().toISOString();

      // Determine if authenticated
      this.authState.isAuthenticated = !!(this.authState.token && this.authState.user);

    } catch (error) {
      console.error('Failed to load stored auth data:', error);
      await this.clearStoredAuthData();
    }
  }

  private async saveAuthData() {
    try {
      const dataToSave: [string, string][] = [];

      if (this.authState.token) {
        dataToSave.push(['secure_token', this.encrypt(this.authState.token)]);
      }

      if (this.authState.refreshToken) {
        dataToSave.push(['secure_refresh_token', this.encrypt(this.authState.refreshToken)]);
      }

      if (this.authState.user) {
        dataToSave.push(['secure_user_data', this.encrypt(JSON.stringify(this.authState.user))]);
      }

      if (this.authState.sessionExpiry) {
        dataToSave.push(['session_expiry', this.authState.sessionExpiry]);
      }

      dataToSave.push(['last_activity', this.authState.lastActivity]);

      await AsyncStorage.multiSet(dataToSave);
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  private async clearStoredAuthData() {
    try {
      await AsyncStorage.multiRemove([
        'secure_token',
        'secure_refresh_token',
        'secure_user_data',
        'session_expiry',
        'last_activity',
        'device_trust'
      ]);
    } catch (error) {
      console.error('Failed to clear stored auth data:', error);
    }
  }

  private encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private async checkDeviceTrustStatus() {
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const trustedDevices = await AsyncStorage.getItem('device_trust');
      
      if (trustedDevices) {
        const trusted = JSON.parse(trustedDevices);
        this.authState.deviceTrusted = trusted.includes(deviceId);
      }
    } catch (error) {
      console.error('Failed to check device trust status:', error);
      this.authState.deviceTrusted = false;
    }
  }

  private async validateCurrentSession() {
    if (!this.authState.token || !this.authState.user) {
      return;
    }

    // Check if session has expired
    if (this.authState.sessionExpiry) {
      const expiryTime = new Date(this.authState.sessionExpiry);
      if (new Date() > expiryTime) {
        console.log('Session expired, attempting refresh');
        await this.refreshTokens();
        return;
      }
    }

    try {
      // Validate with backend
      const response = await enhancedApiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      if (response.success && response.data?.user) {
        this.authState.user = response.data.user;
        this.authState.isAuthenticated = true;
        await this.saveAuthData();
      } else {
        throw new Error('Invalid session');
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      if (this.authState.refreshToken) {
        await this.refreshTokens();
      } else {
        await this.logout();
      }
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      await this.logout();
      return false;
    }

    try {
      const response = await enhancedApiService.post('/auth/refresh', {
        refreshToken: this.authState.refreshToken,
        deviceInfo: await this.getDeviceInfo()
      });

      if (response.success && response.data) {
        const { token, refreshToken, user, expiresAt } = response.data;
        
        this.authState.token = token;
        this.authState.refreshToken = refreshToken;
        this.authState.user = user;
        this.authState.sessionExpiry = expiresAt;
        this.authState.isAuthenticated = true;

        await enhancedApiService.setAuthToken(token, refreshToken);
        await this.saveAuthData();
        
        console.log('✅ Tokens refreshed successfully');
        return true;
      } else {
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  private startSessionMonitoring() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      if (this.authState.isAuthenticated) {
        this.updateLastActivity();
        await this.validateCurrentSession();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private updateLastActivity() {
    this.authState.lastActivity = new Date().toISOString();
    AsyncStorage.setItem('last_activity', this.authState.lastActivity);
  }

  private async getDeviceInfo() {
    try {
      const [
        deviceId,
        brand,
        model,
        systemVersion,
        appVersion,
        isEmulator
      ] = await Promise.all([
        DeviceInfo.getUniqueId(),
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
        DeviceInfo.isEmulator()
      ]);

      return {
        deviceId,
        brand,
        model,
        systemVersion,
        appVersion,
        isEmulator,
        platform: DeviceInfo.getSystemName()
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return null;
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener({ ...this.authState });
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Public methods
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public addListener(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    
    // Immediately notify with current state
    listener({ ...this.authState });

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async sendOtp(phone: string): Promise<AuthResponse> {
    try {
      // Check connection health
      if (!connectionHealthMonitor.canMakeRequests()) {
        return {
          success: false,
          message: 'No internet connection. Please check your network and try again.'
        };
      }

      const deviceInfo = await this.getDeviceInfo();
      const response = await enhancedApiService.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
        phone: this.formatPhoneNumber(phone),
        deviceInfo
      });

      return {
        success: response.success,
        message: response.message || (response.success ? 'OTP sent successfully' : 'Failed to send OTP')
      };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.'
      };
    }
  }

  public async verifyOtp(phone: string, otp: string, rememberDevice = true): Promise<AuthResponse> {
    try {
      const deviceInfo = await this.getDeviceInfo();
      const response = await enhancedApiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
        phone: this.formatPhoneNumber(phone),
        otp: otp.trim(),
        deviceInfo,
        rememberDevice
      });

      if (response.success && response.data) {
        const { token, refreshToken, user, expiresAt } = response.data;
        
        // Update auth state
        this.authState.token = token;
        this.authState.refreshToken = refreshToken;
        this.authState.user = user;
        this.authState.sessionExpiry = expiresAt;
        this.authState.isAuthenticated = true;
        this.updateLastActivity();

        // Trust device if requested
        if (rememberDevice && deviceInfo?.deviceId) {
          await this.trustDevice(deviceInfo.deviceId);
        }

        // Save tokens to API service
        await enhancedApiService.setAuthToken(token, refreshToken);
        
        // Save encrypted data
        await this.saveAuthData();

        this.notifyListeners();

        return {
          success: true,
          data: response.data,
          message: response.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Invalid OTP. Please try again.'
        };
      }
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed. Please try again.'
      };
    }
  }

  public async logout(showConfirmation = false): Promise<void> {
    if (showConfirmation) {
      return new Promise((resolve) => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
            { 
              text: 'Logout', 
              style: 'destructive',
              onPress: async () => {
                await this.performLogout();
                resolve();
              }
            }
          ]
        );
      });
    }

    await this.performLogout();
  }

  private async performLogout() {
    try {
      // Notify backend
      if (this.authState.token && connectionHealthMonitor.canMakeRequests()) {
        await enhancedApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      // Clear local state regardless of backend response
      this.authState = {
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        refreshToken: null,
        deviceTrusted: false,
        sessionExpiry: null,
        lastActivity: new Date().toISOString()
      };

      // Clear stored data
      await this.clearStoredAuthData();
      await enhancedApiService.clearTokens();

      // Stop session monitoring
      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      this.notifyListeners();
      console.log('✅ User logged out successfully');
    }
  }

  public async updateUserProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await enhancedApiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, updates);
      
      if (response.success && response.data?.user) {
        this.authState.user = response.data.user;
        await this.saveAuthData();
        this.notifyListeners();
      }

      return {
        success: response.success,
        data: response.data,
        message: response.message || (response.success ? 'Profile updated successfully' : 'Failed to update profile')
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  public async trustDevice(deviceId?: string): Promise<void> {
    try {
      const id = deviceId || await DeviceInfo.getUniqueId();
      const trustedDevices = await AsyncStorage.getItem('device_trust');
      let trusted = trustedDevices ? JSON.parse(trustedDevices) : [];
      
      if (!trusted.includes(id)) {
        trusted.push(id);
        await AsyncStorage.setItem('device_trust', JSON.stringify(trusted));
        this.authState.deviceTrusted = true;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to trust device:', error);
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters except +
    let formatted = phone.replace(/[^\d+]/g, '');
    
    // Add country code if not present
    if (!formatted.startsWith('+')) {
      // Default to India (+91) if no country code
      if (formatted.length === 10) {
        formatted = `+91${formatted}`;
      } else {
        formatted = `+${formatted}`;
      }
    }
    
    return formatted;
  }

  // Utility methods
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public getUser(): User | null {
    return this.authState.user;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public isSessionValid(): boolean {
    if (!this.authState.sessionExpiry) return this.authState.isAuthenticated;
    return new Date() < new Date(this.authState.sessionExpiry);
  }

  public isDeviceTrusted(): boolean {
    return this.authState.deviceTrusted;
  }

  public getSessionTimeRemaining(): number {
    if (!this.authState.sessionExpiry) return 0;
    return Math.max(0, new Date(this.authState.sessionExpiry).getTime() - Date.now());
  }

  public destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance();
export default enhancedAuthService;
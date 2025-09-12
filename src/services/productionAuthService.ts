// Production Authentication Service
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDeviceInfo } from '../utils/expoGoCompat';
import unifiedApiService from './unifiedApiService';
import { API_CONFIG } from '../constants/apiConfig';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  profileImage?: string;
  profileComplete: boolean;
  isPhoneVerified: boolean;
  lastActive?: string;
  addresses?: any[];
  isGuest?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  sessionValid: boolean;
  lastTokenCheck: string | null;
  deviceTrusted: boolean;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
    refreshToken?: string;
    expiresAt?: string;
  };
  message: string;
  statusCode?: number;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  phone?: string;
}

class ProductionAuthService {
  private static instance: ProductionAuthService;
  private authState: AuthState;
  private listeners: ((state: AuthState) => void)[] = [];
  private sessionCheckTimer: NodeJS.Timeout | null = null;
  private readonly SESSION_CHECK_INTERVAL = 60000; // 1 minute
  private readonly TOKEN_CHECK_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.authState = {
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      user: null,
      token: null,
      refreshToken: null,
      sessionValid: false,
      lastTokenCheck: null,
      deviceTrusted: false
    };

    this.initialize();
  }

  public static getInstance(): ProductionAuthService {
    if (!ProductionAuthService.instance) {
      ProductionAuthService.instance = new ProductionAuthService();
    }
    return ProductionAuthService.instance;
  }

  private async initialize() {
    try {
      console.log('🔧 Initializing Production Auth Service...');
      
      // Load stored auth data
      await this.loadStoredAuthData();
      
      // Validate session if we have tokens
      if (this.authState.token) {
        await this.validateSession();
      }
      
      // Start session monitoring
      this.startSessionMonitoring();
      
      // Mark as initialized
      this.authState.isInitialized = true;
      
      console.log('✅ Production Auth Service initialized', {
        authenticated: this.authState.isAuthenticated,
        hasUser: !!this.authState.user,
        hasToken: !!this.authState.token
      });
    } catch (error) {
      console.error('❌ Failed to initialize auth service:', error);
      await this.clearAuthData();
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  private async loadStoredAuthData() {
    try {
      const [authToken, refreshToken, userData, lastCheck] = await AsyncStorage.multiGet([
        'auth_token',
        'refresh_token', 
        'user_data',
        'last_token_check'
      ]);

      if (authToken[1]) {
        this.authState.token = authToken[1];
        await unifiedApiService.setTokens({ 
          token: authToken[1], 
          refreshToken: refreshToken[1] || undefined 
        });
      }

      if (refreshToken[1]) {
        this.authState.refreshToken = refreshToken[1];
      }

      if (userData[1]) {
        try {
          this.authState.user = JSON.parse(userData[1]);
        } catch (error) {
          console.warn('Failed to parse stored user data:', error);
        }
      }

      if (lastCheck[1]) {
        this.authState.lastTokenCheck = lastCheck[1];
      }

      // Update authentication state
      this.authState.isAuthenticated = !!(this.authState.token && this.authState.user);
    } catch (error) {
      console.error('Failed to load stored auth data:', error);
      await this.clearAuthData();
    }
  }

  private async saveAuthData() {
    try {
      const dataToSave: [string, string][] = [];

      if (this.authState.token) {
        dataToSave.push(['auth_token', this.authState.token]);
      }

      if (this.authState.refreshToken) {
        dataToSave.push(['refresh_token', this.authState.refreshToken]);
      }

      if (this.authState.user) {
        dataToSave.push(['user_data', JSON.stringify(this.authState.user)]);
      }

      dataToSave.push(['last_token_check', new Date().toISOString()]);

      await AsyncStorage.multiSet(dataToSave);
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }

  private async clearAuthData() {
    try {
      // Clear local state
      this.authState.isAuthenticated = false;
      this.authState.user = null;
      this.authState.token = null;
      this.authState.refreshToken = null;
      this.authState.sessionValid = false;
      this.authState.lastTokenCheck = null;

      // Clear unified API service tokens
      await unifiedApiService.clearTokens();

      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        'auth_token',
        'refresh_token',
        'user_data',
        'last_token_check',
        'device_trust'
      ]);

      console.log('🧹 Auth data cleared');
    } catch (error) {
      console.error('Failed to clear auth data:', error);
    }
  }

  private async validateSession(): Promise<boolean> {
    if (!this.authState.token) {
      return false;
    }

    // Check if we've validated recently
    if (this.authState.lastTokenCheck) {
      const lastCheck = new Date(this.authState.lastTokenCheck);
      const now = new Date();
      const timeDiff = now.getTime() - lastCheck.getTime();
      
      // If we checked recently and session was valid, skip validation
      if (timeDiff < this.TOKEN_CHECK_THRESHOLD && this.authState.sessionValid) {
        return true;
      }
    }

    try {
      console.log('🔍 Validating session...');
      
      const response = await unifiedApiService.get(API_CONFIG.ENDPOINTS.AUTH.ME);
      
      if (response.success && response.data) {
        this.authState.user = response.data;
        this.authState.sessionValid = true;
        this.authState.isAuthenticated = true;
        this.authState.lastTokenCheck = new Date().toISOString();
        
        await this.saveAuthData();
        
        console.log('✅ Session validated successfully');
        return true;
      } else {
        throw new Error('Invalid session response');
      }
    } catch (error: any) {
      console.warn('⚠️ Session validation failed:', error.message);
      
      // If we have a refresh token, try to refresh
      if (this.authState.refreshToken) {
        console.log('🔄 Attempting token refresh...');
        return await this.refreshTokens();
      }
      
      // Clear invalid session
      await this.clearAuthData();
      return false;
    }
  }

  private async refreshTokens(): Promise<boolean> {
    if (!this.authState.refreshToken) {
      return false;
    }

    try {
      const response = await unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN, {
        refreshToken: this.authState.refreshToken
      });

      if (response.success && response.data) {
        const { token, refreshToken, user, expiresAt } = response.data;
        
        // Update tokens
        this.authState.token = token;
        if (refreshToken) {
          this.authState.refreshToken = refreshToken;
        }
        if (user) {
          this.authState.user = user;
        }
        
        this.authState.sessionValid = true;
        this.authState.isAuthenticated = true;
        this.authState.lastTokenCheck = new Date().toISOString();

        // Update unified API service
        await unifiedApiService.setTokens({
          token,
          refreshToken,
          expiresAt
        });

        await this.saveAuthData();
        
        console.log('✅ Tokens refreshed successfully');
        return true;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      await this.clearAuthData();
      return false;
    }
  }

  private startSessionMonitoring() {
    // Clear existing timer
    if (this.sessionCheckTimer) {
      clearInterval(this.sessionCheckTimer);
    }

    // Start new timer
    this.sessionCheckTimer = setInterval(async () => {
      if (this.authState.isAuthenticated && this.authState.token) {
        await this.validateSession();
        this.notifyListeners();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  private notifyListeners() {
    const currentState = { ...this.authState };
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Public Methods

  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  public addListener(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    
    // Immediately notify with current state if initialized
    if (this.authState.isInitialized) {
      listener({ ...this.authState });
    }

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public async sendOtp(phone: string): Promise<OtpResponse> {
    try {
      // Format phone number
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      console.log('📱 Sending OTP to:', formattedPhone);
      
      const response = await unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
        phone: formattedPhone
      });

      if (response.success) {
        return {
          success: true,
          message: response.message || 'OTP sent successfully',
          phone: formattedPhone
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to send OTP'
        };
      }
    } catch (error: any) {
      console.error('❌ Send OTP failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP. Please try again.'
      };
    }
  }

  public async verifyOtp(phone: string, otp: string): Promise<AuthResponse> {
    try {
      // Format phone number
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      
      console.log('✅ Verifying OTP for:', formattedPhone);
      
      const response = await unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, {
        phone: formattedPhone,
        otp: otp
      });

      if (response.success && response.data) {
        const { user, token, refreshToken, expiresAt } = response.data;
        
        // Update auth state
        this.authState.user = user;
        this.authState.token = token;
        this.authState.refreshToken = refreshToken;
        this.authState.isAuthenticated = true;
        this.authState.sessionValid = true;
        this.authState.lastTokenCheck = new Date().toISOString();

        // Update unified API service
        await unifiedApiService.setTokens({
          token,
          refreshToken,
          expiresAt
        });

        // Save to storage
        await this.saveAuthData();
        
        // Notify listeners
        this.notifyListeners();
        
        console.log('✅ OTP verification successful');
        
        return {
          success: true,
          data: { user, token, refreshToken, expiresAt },
          message: response.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Invalid OTP'
        };
      }
    } catch (error: any) {
      console.error('❌ OTP verification failed:', error);
      return {
        success: false,
        message: error.message || 'OTP verification failed. Please try again.'
      };
    }
  }

  public async loginAsGuest(): Promise<AuthResponse> {
    try {
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        name: 'Guest User',
        email: '',
        phone: '',
        role: 'customer',
        profileComplete: false,
        isPhoneVerified: false,
        isGuest: true,
        createdAt: new Date().toISOString()
      };

      // Update auth state for guest
      this.authState.user = guestUser;
      this.authState.isAuthenticated = true;
      this.authState.sessionValid = true;
      
      // Save guest data (no token for guest users)
      await AsyncStorage.setItem('user_data', JSON.stringify(guestUser));
      
      // Notify listeners
      this.notifyListeners();
      
      console.log('👤 Guest login successful');
      
      return {
        success: true,
        data: { user: guestUser, token: '', refreshToken: '' },
        message: 'Logged in as guest'
      };
    } catch (error: any) {
      console.error('❌ Guest login failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to login as guest'
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log('👋 Logging out...');
      
      // Call backend logout if we have a token
      if (this.authState.token && !this.authState.user?.isGuest) {
        try {
          await unifiedApiService.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
          console.warn('Logout API call failed, proceeding with local cleanup:', error);
        }
      }
      
      // Clear session timer
      if (this.sessionCheckTimer) {
        clearInterval(this.sessionCheckTimer);
        this.sessionCheckTimer = null;
      }
      
      // Clear all auth data
      await this.clearAuthData();
      
      // Notify listeners
      this.notifyListeners();
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Still clear local data even if API call fails
      await this.clearAuthData();
      this.notifyListeners();
    }
  }

  public async updateUserProfile(userData: Partial<User>): Promise<AuthResponse> {
    try {
      if (!this.authState.user) {
        return {
          success: false,
          message: 'No user logged in'
        };
      }

      // Handle guest users
      if (this.authState.user.isGuest) {
        const updatedUser = { 
          ...this.authState.user, 
          ...userData,
          updatedAt: new Date().toISOString()
        };
        
        this.authState.user = updatedUser;
        await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        this.notifyListeners();
        
        return {
          success: true,
          data: { user: updatedUser, token: '', refreshToken: '' },
          message: 'Profile updated'
        };
      }

      // Handle authenticated users
      const response = await unifiedApiService.put(API_CONFIG.ENDPOINTS.USERS.UPDATE_PROFILE, userData);
      
      if (response.success && response.data) {
        this.authState.user = { ...this.authState.user, ...response.data };
        await this.saveAuthData();
        this.notifyListeners();
        
        return {
          success: true,
          data: { user: this.authState.user, token: this.authState.token!, refreshToken: this.authState.refreshToken },
          message: response.message || 'Profile updated successfully'
        };
      } else {
        return {
          success: false,
          message: response.message || 'Failed to update profile'
        };
      }
    } catch (error: any) {
      console.error('❌ Update profile failed:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public isGuest(): boolean {
    return this.authState.user?.isGuest === true;
  }

  public getUser(): User | null {
    return this.authState.user;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  // Check if we need to prompt for authentication
  public shouldPromptForAuth(): boolean {
    return !this.authState.isAuthenticated || (!this.authState.token && !this.isGuest());
  }

  // Force session validation (useful for app foreground events)
  public async forceSessionValidation(): Promise<boolean> {
    if (!this.authState.token || this.isGuest()) {
      return this.authState.isAuthenticated;
    }
    
    this.authState.lastTokenCheck = null; // Force validation
    const isValid = await this.validateSession();
    this.notifyListeners();
    return isValid;
  }
}

// Export singleton instance
export default ProductionAuthService.getInstance();
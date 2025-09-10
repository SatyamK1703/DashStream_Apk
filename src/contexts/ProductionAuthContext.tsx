// Production Auth Context - Uses the new production auth service
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import productionAuthService, { User, AuthState, AuthResponse, OtpResponse } from '../services/productionAuthService';

// Auth Context Type
interface AuthContextType {
  // State
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isGuest: boolean;
  sessionValid: boolean;
  
  // Auth Methods
  sendOtp: (phone: string) => Promise<OtpResponse>;
  verifyOtp: (phone: string, otp: string) => Promise<AuthResponse>;
  loginAsGuest: () => Promise<AuthResponse>;
  logout: () => Promise<void>;
  
  // User Methods
  updateUserProfile: (userData: Partial<User>) => Promise<AuthResponse>;
  getCurrentUser: () => User | null;
  
  // Session Methods
  forceSessionValidation: () => Promise<boolean>;
  shouldPromptForAuth: () => boolean;
  
  // Utility Methods
  getToken: () => string | null;
  refreshSession: () => Promise<boolean>;
}

// Create Context
const ProductionAuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const ProductionAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    isInitialized: false,
    user: null,
    token: null,
    refreshToken: null,
    sessionValid: false,
    lastTokenCheck: null,
    deviceTrusted: false
  });

  // Initialize auth service and subscribe to state changes
  useEffect(() => {
    console.log('🔧 Setting up Production Auth Context...');

    // Subscribe to auth service state changes
    const unsubscribe = productionAuthService.addListener((newState: AuthState) => {
      console.log('📱 Auth state updated:', {
        authenticated: newState.isAuthenticated,
        initialized: newState.isInitialized,
        hasUser: !!newState.user,
        isGuest: newState.user?.isGuest || false,
        loading: newState.isLoading
      });
      
      setAuthState(newState);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up auth context subscription');
      unsubscribe();
    };
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && authState.isAuthenticated && !authState.user?.isGuest) {
        // App came to foreground, validate session
        productionAuthService.forceSessionValidation().catch(error => {
          console.warn('Session validation on app foreground failed:', error);
        });
      }
    };

    // Note: You might want to use AppState from react-native here
    // AppState.addEventListener('change', handleAppStateChange);
    // return () => AppState.removeEventListener('change', handleAppStateChange);
  }, [authState.isAuthenticated, authState.user?.isGuest]);

  // Auth Methods
  const sendOtp = async (phone: string): Promise<OtpResponse> => {
    try {
      console.log('📱 Sending OTP via Production Auth Context:', phone);
      const result = await productionAuthService.sendOtp(phone);
      return result;
    } catch (error: any) {
      console.error('❌ Send OTP failed in context:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP'
      };
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<AuthResponse> => {
    try {
      console.log('✅ Verifying OTP via Production Auth Context:', phone);
      const result = await productionAuthService.verifyOtp(phone, otp);
      return result;
    } catch (error: any) {
      console.error('❌ Verify OTP failed in context:', error);
      return {
        success: false,
        message: error.message || 'Failed to verify OTP'
      };
    }
  };

  const loginAsGuest = async (): Promise<AuthResponse> => {
    try {
      console.log('👤 Logging in as guest via Production Auth Context');
      const result = await productionAuthService.loginAsGuest();
      return result;
    } catch (error: any) {
      console.error('❌ Guest login failed in context:', error);
      return {
        success: false,
        message: error.message || 'Failed to login as guest'
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('👋 Logging out via Production Auth Context');
      await productionAuthService.logout();
    } catch (error) {
      console.error('❌ Logout failed in context:', error);
      throw error;
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<AuthResponse> => {
    try {
      console.log('👤 Updating user profile via Production Auth Context');
      const result = await productionAuthService.updateUserProfile(userData);
      return result;
    } catch (error: any) {
      console.error('❌ Update profile failed in context:', error);
      return {
        success: false,
        message: error.message || 'Failed to update profile'
      };
    }
  };

  // Utility Methods
  const getCurrentUser = (): User | null => {
    return productionAuthService.getUser();
  };

  const getToken = (): string | null => {
    return productionAuthService.getToken();
  };

  const shouldPromptForAuth = (): boolean => {
    return productionAuthService.shouldPromptForAuth();
  };

  const forceSessionValidation = async (): Promise<boolean> => {
    try {
      return await productionAuthService.forceSessionValidation();
    } catch (error) {
      console.error('❌ Force session validation failed:', error);
      return false;
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    try {
      return await productionAuthService.forceSessionValidation();
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      return false;
    }
  };

  // Computed values
  const isGuest = authState.user?.isGuest === true;

  // Context value
  const contextValue: AuthContextType = {
    // State
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    isInitialized: authState.isInitialized,
    isGuest,
    sessionValid: authState.sessionValid,
    
    // Auth Methods
    sendOtp,
    verifyOtp,
    loginAsGuest,
    logout,
    
    // User Methods
    updateUserProfile,
    getCurrentUser,
    
    // Session Methods
    forceSessionValidation,
    shouldPromptForAuth,
    
    // Utility Methods
    getToken,
    refreshSession
  };

  return (
    <ProductionAuthContext.Provider value={contextValue}>
      {children}
    </ProductionAuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useProductionAuth = (): AuthContextType => {
  const context = useContext(ProductionAuthContext);
  if (context === undefined) {
    throw new Error('useProductionAuth must be used within a ProductionAuthProvider');
  }
  return context;
};

// Hook for auth state only (lighter alternative)
export const useAuthState = () => {
  const { user, isLoading, isAuthenticated, isInitialized, isGuest, sessionValid } = useProductionAuth();
  return { user, isLoading, isAuthenticated, isInitialized, isGuest, sessionValid };
};

// Hook for auth actions only
export const useAuthActions = () => {
  const { 
    sendOtp, 
    verifyOtp, 
    loginAsGuest, 
    logout, 
    updateUserProfile,
    forceSessionValidation,
    refreshSession 
  } = useProductionAuth();
  
  return { 
    sendOtp, 
    verifyOtp, 
    loginAsGuest, 
    logout, 
    updateUserProfile,
    forceSessionValidation,
    refreshSession 
  };
};

// Export default context
export default ProductionAuthContext;

// Type exports
export type { AuthContextType, User, AuthState, AuthResponse, OtpResponse };
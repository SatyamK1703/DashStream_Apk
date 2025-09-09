import React, { createContext, useState, useEffect, useContext } from 'react';

// Simple user type
export interface SimpleUser {
  id: string;
  name: string;
  phone: string;
  role: 'customer' | 'professional' | 'admin';
  isGuest?: boolean;
}

// Define auth context state
type SimpleAuthContextType = {
  user: SimpleUser | null;
  setUser: React.Dispatch<React.SetStateAction<SimpleUser | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean;
  sendOtp: (phone: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginAsGuest: () => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (userData: Partial<SimpleUser>) => Promise<{ success: boolean; error?: string }>;
};

// Create context with default values
const SimpleAuthContext = createContext<SimpleAuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  isAuthenticated: false,
  isGuest: false,
  sendOtp: async () => ({ success: false }),
  verifyOtp: async () => ({ success: false }),
  logout: async () => {},
  loginAsGuest: async () => ({ success: false }),
  updateUserProfile: async () => ({ success: false }),
});

// Auth provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Initialize with guest user and set loading to false
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set a guest user for testing
        setUser({
          id: 'guest-1',
          name: 'Guest User',
          phone: '',
          role: 'customer',
          isGuest: true
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Computed values
  const isAuthenticated = user !== null;
  const isGuest = user?.isGuest === true;

  // Auth methods (simplified implementations)
  const sendOtp = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user after verification
      const newUser: SimpleUser = {
        id: `user-${Date.now()}`,
        name: `User ${phone}`,
        phone,
        role: 'customer',
        isGuest: false
      };
      
      setUser(newUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid OTP' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const loginAsGuest = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const guestUser: SimpleUser = {
        id: 'guest-1',
        name: 'Guest User',
        phone: '',
        role: 'customer',
        isGuest: true
      };
      
      setUser(guestUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to login as guest' };
    }
  };

  const updateUserProfile = async (userData: Partial<SimpleUser>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (user) {
        setUser({ ...user, ...userData });
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  };

  return (
    <SimpleAuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        isAuthenticated,
        isGuest,
        sendOtp,
        verifyOtp,
        logout,
        loginAsGuest,
        updateUserProfile,
      }}
    >
      {children}
    </SimpleAuthContext.Provider>
  );
};

export const useSimpleAuth = () => useContext(SimpleAuthContext);
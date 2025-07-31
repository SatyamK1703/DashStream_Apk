import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';

// Define user types
export type UserRole = 'customer' | 'professional' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>; // <-- update signature
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // ⬇️ Used for network spinners on screens (buttons, etc.)
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ⬇️ Used ONLY while restoring session at app launch
  const [isBooting, setIsBooting] = useState<boolean>(true);

  useEffect(() => {
    // simulate restore token
    const timer = setTimeout(() => setIsBooting(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const login = async (phone: string) => {
    try {
      setIsLoading(true);
      console.log(`Sending OTP to ${phone}`);
      await new Promise(r => setTimeout(r, 1000));
      console.log('[AuthContext] OTP simulated and ready.');
    } catch (e) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      if (otp !== '1234') {
        Alert.alert('Verification Failed', 'The OTP you entered is incorrect. Please try again.');
        return false;
      }
      await new Promise(r => setTimeout(r, 1000));
      setUser({
        id: '123456',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone,
        role: 'customer',
        profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      });
      return true;
    } catch (e) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,   // per-action spinner
        login,
        verifyOtp,
        logout: () => setUser(null),
        updateUserProfile: async (u) => { /* unchanged */ },
        setUser,
        // ⬇️ expose if you need it in RootNavigator
        // @ts-ignore
        isBooting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

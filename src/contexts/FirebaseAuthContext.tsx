// src/contexts/FirebaseAuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail,
  updateProfile,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../constants/config';
import { useAuth } from './AuthContext';

// Define Firebase auth context state
type FirebaseAuthContextType = {
  firebaseUser: FirebaseUser | null;
  isFirebaseLoading: boolean;
  isFirebaseAuthenticated: boolean;
  registerWithEmailAndPassword: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithEmailAndPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  updateUserEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateUserPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  firebaseLogout: () => Promise<void>;
};

// Create context with default values
const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  firebaseUser: null,
  isFirebaseLoading: true,
  isFirebaseAuthenticated: false,
  registerWithEmailAndPassword: async () => ({ success: false }),
  loginWithEmailAndPassword: async () => ({ success: false }),
  resetPassword: async () => ({ success: false }),
  updateUserProfile: async () => ({ success: false }),
  updateUserEmail: async () => ({ success: false }),
  updateUserPassword: async () => ({ success: false }),
  firebaseLogout: async () => {},
});

// Firebase Auth provider component
export const FirebaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState<boolean>(true);
  const { user } = useAuth(); // Get user from main auth context

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsFirebaseLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Link Firebase user with main app user if professional
  useEffect(() => {
    const linkUserAccounts = async () => {
      if (user && user.role === 'professional' && firebaseUser) {
        // Store the link between Firebase UID and app user ID
        await AsyncStorage.setItem(
          APP_CONFIG.STORAGE_KEYS.FIREBASE_USER_LINK,
          JSON.stringify({ appUserId: user.id, firebaseUid: firebaseUser.uid })
        );
      }
    };

    if (user && firebaseUser) {
      linkUserAccounts();
    }
  }, [user, firebaseUser]);

  // Register with email and password
  const registerWithEmailAndPassword = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error registering with Firebase:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to register. Please try again.' 
      };
    }
  };

  // Login with email and password
  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.error('Error logging in with Firebase:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to login. Please try again.' 
      };
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to reset password. Please try again.' 
      };
    }
  };

  // Update user profile
  const updateUserProfile = async (displayName: string) => {
    try {
      if (firebaseUser) {
        await updateProfile(firebaseUser, { displayName });
        return { success: true };
      }
      return { success: false, error: 'User not authenticated' };
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to update profile. Please try again.' 
      };
    }
  };

  // Update user email
  const updateUserEmail = async (email: string) => {
    try {
      if (firebaseUser) {
        await updateEmail(firebaseUser, email);
        return { success: true };
      }
      return { success: false, error: 'User not authenticated' };
    } catch (error: any) {
      console.error('Error updating email:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to update email. Please try again.' 
      };
    }
  };

  // Update user password
  const updateUserPassword = async (password: string) => {
    try {
      if (firebaseUser) {
        await updatePassword(firebaseUser, password);
        return { success: true };
      }
      return { success: false, error: 'User not authenticated' };
    } catch (error: any) {
      console.error('Error updating password:', error.message);
      return { 
        success: false, 
        error: error.message || 'Failed to update password. Please try again.' 
      };
    }
  };

  // Logout from Firebase
  const firebaseLogout = async () => {
    try {
      await signOut(auth);
      // Remove the link between Firebase UID and app user ID
      await AsyncStorage.removeItem(APP_CONFIG.STORAGE_KEYS.FIREBASE_USER_LINK);
    } catch (error) {
      console.error('Error logging out from Firebase:', error);
    }
  };

  // Provide auth context value
  const value = {
    firebaseUser,
    isFirebaseLoading,
    isFirebaseAuthenticated: !!firebaseUser,
    registerWithEmailAndPassword,
    loginWithEmailAndPassword,
    resetPassword,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
    firebaseLogout,
  };

  return <FirebaseAuthContext.Provider value={value}>{children}</FirebaseAuthContext.Provider>;
};

// Custom hook to use Firebase auth context
export const useFirebaseAuth = () => useContext(FirebaseAuthContext);

export default FirebaseAuthContext;
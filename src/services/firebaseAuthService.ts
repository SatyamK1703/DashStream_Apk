import { 
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import httpClient, { ApiResponse } from './httpClient';
import { ENDPOINTS } from '../config/env';
import { User } from '../types/api';

/**
 * Firebase Authentication Service for React Native
 * Uses backend-generated verification codes instead of direct Firebase phone auth
 * to avoid reCAPTCHA issues in React Native
 */
class FirebaseAuthService {
  private currentVerificationId: string | null = null;

  /**
   * Send OTP using Firebase (via backend)
   * The backend handles Firebase Admin SDK phone verification
   */
  async sendOtp(phone: string): Promise<ApiResponse<{ verificationId?: string }>> {
    try {
      console.log('Requesting OTP via Firebase backend...');

      // First, sync user with backend
      await this.syncUserWithBackend(phone);

      // Request verification code from backend using Firebase Admin SDK
      const response = await httpClient.post('/auth/firebase/send-verification', { phone });

      if (response.success && response.data?.verificationId) {
        this.currentVerificationId = response.data.verificationId;
        console.log('OTP sent successfully via Firebase');

        return {
          success: true,
          data: { verificationId: response.data.verificationId },
          message: 'OTP sent successfully'
        };
      } else {
        throw new Error('Failed to get verification ID from backend');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      throw {
        success: false,
        message: this.getErrorMessage(error),
        error
      };
    }
  }

  /**
   * Verify OTP using Firebase credential
   */
  async verifyOtp(phone: string, otp: string): Promise<ApiResponse<{ user: User }>> {
    try {
      if (!this.currentVerificationId) {
        throw new Error('No verification ID found. Please request OTP first.');
      }

      console.log('Verifying OTP with Firebase...');

      // Create credential with verification ID and OTP
      const credential = PhoneAuthProvider.credential(this.currentVerificationId, otp);
      
      // Sign in with credential
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      console.log('OTP verified successfully with Firebase');

      // Get user data from backend using Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      const userData = await this.getUserFromBackend(idToken);

      // Clear verification ID
      this.currentVerificationId = null;

      return {
        success: true,
        data: { user: userData },
        message: 'OTP verified successfully'
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      // Clear verification ID on error
      this.currentVerificationId = null;

      throw {
        success: false,
        message: this.getErrorMessage(error),
        error
      };
    }
  }

  /**
   * Sync user with backend database
   */
  private async syncUserWithBackend(phone: string): Promise<void> {
    try {
      await httpClient.post('/auth/sync-user', { phone });
      console.log('User synced with backend successfully');
    } catch (error) {
      console.warn('Failed to sync user with backend:', error);
      // Don't throw here as it's not critical for OTP flow
    }
  }

  /**
   * Get user data from backend using Firebase ID token
   */
  private async getUserFromBackend(idToken: string): Promise<User> {
    try {
      // Temporarily set token for this request
      const originalToken = httpClient.defaults.headers.common['Authorization'];
      httpClient.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

      const response = await httpClient.get<{ user: User }>(ENDPOINTS.AUTH.ME);

      // Restore original token
      if (originalToken) {
        httpClient.defaults.headers.common['Authorization'] = originalToken;
      } else {
        delete httpClient.defaults.headers.common['Authorization'];
      }

      if (response.success && response.data?.user) {
        return response.data.user;
      } else {
        throw new Error('Failed to get user data from backend');
      }
    } catch (error) {
      console.error('Failed to get user from backend:', error);
      throw error;
    }
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(error: any): string {
    if (error?.code) {
      switch (error.code) {
        case 'auth/invalid-phone-number':
          return 'Invalid phone number format';
        case 'auth/missing-phone-number':
          return 'Phone number is required';
        case 'auth/quota-exceeded':
          return 'SMS quota exceeded. Try again later';
        case 'auth/invalid-verification-code':
          return 'Invalid OTP code';
        case 'auth/code-expired':
          return 'OTP code has expired. Please request a new one';
        case 'auth/too-many-requests':
          return 'Too many requests. Please try again later';
        case 'auth/app-not-authorized':
          return 'App not authorized for Firebase Auth';
        case 'auth/invalid-verification-id':
          return 'Invalid verification ID';
        default:
          return error.message || 'Authentication error occurred';
      }
    }
    return error?.message || 'An unknown error occurred';
  }

  /**
   * Get current Firebase ID token
   */
  async getIdToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  /**
   * Get current user data from backend using Firebase token
   */
  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      return await httpClient.get(ENDPOINTS.AUTH.ME);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout (to handle any server-side cleanup)
      await httpClient.post('/auth/logout');
    } catch (error) {
      console.warn('Backend logout error:', error);
    } finally {
      // Sign out from Firebase
      await signOut(auth);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(!!user);
      });
    });
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  /**
   * Refresh Firebase ID token
   */
  async refreshToken(): Promise<string | null> {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        return await currentUser.getIdToken(true); // Force refresh
      }
      return null;
    } catch (error) {
      console.error('Token refresh error:', error);
      return null;
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
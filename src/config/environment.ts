// src/config/environment.ts
import Constants from 'expo-constants';

interface EnvironmentConfig {
  API_BASE_URL: string;
  ENVIRONMENT: 'development' | 'staging' | 'production';
  TIMEOUT: number;
  DEBUG: boolean;
  GOOGLE_MAPS_API_KEY?: string;
  RAZORPAY_KEY_ID?: string;
  FIREBASE_CONFIG?: any;
  TWILIO_CONFIG?: any;
  CLOUDINARY_CONFIG?: any;
}

// Get environment variables from Expo constants
const getEnvVar = (key: string): string | undefined => {
  return Constants.expoConfig?.extra?.[key] || process.env[key];
};

// Development environment (local)
const DEV_CONFIG: EnvironmentConfig = {
  API_BASE_URL: getEnvVar('API_URL') || 'http://localhost:5000/api',
  ENVIRONMENT: 'development',
  TIMEOUT: 10000,
  DEBUG: true,
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY'),
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID'),
  FIREBASE_CONFIG: Constants.expoConfig?.extra?.firebaseConfig,
  TWILIO_CONFIG: Constants.expoConfig?.extra?.twilioConfig,
  CLOUDINARY_CONFIG: Constants.expoConfig?.extra?.cloudinaryConfig,
};

// Staging environment
const STAGING_CONFIG: EnvironmentConfig = {
  API_BASE_URL: getEnvVar('API_URL') || 'https://dash-stream-apk-backend-staging.vercel.app/api',
  ENVIRONMENT: 'staging',
  TIMEOUT: 20000,
  DEBUG: false,
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY'),
  RAZORPAY_KEY_ID: getEnvVar('RAZORPAY_KEY_ID'),
  FIREBASE_CONFIG: Constants.expoConfig?.extra?.firebaseConfig,
  TWILIO_CONFIG: Constants.expoConfig?.extra?.twilioConfig,
  CLOUDINARY_CONFIG: Constants.expoConfig?.extra?.cloudinaryConfig,
};

// Production environment
const PROD_CONFIG: EnvironmentConfig = {
  API_BASE_URL: 'https://dash-stream-apk-backend.vercel.app/api',
  ENVIRONMENT: 'production',
  TIMEOUT: 30000,
  DEBUG: false,
  GOOGLE_MAPS_API_KEY: getEnvVar('GOOGLE_MAPS_API_KEY'),
  RAZORPAY_KEY_ID: 'rzp_live_REERfmRqrw93oG',
  FIREBASE_CONFIG: Constants.expoConfig?.extra?.firebaseConfig,
  TWILIO_CONFIG: Constants.expoConfig?.extra?.twilioConfig,
  CLOUDINARY_CONFIG: Constants.expoConfig?.extra?.cloudinaryConfig,
};

// Determine which environment to use
const getEnvironmentConfig = (): EnvironmentConfig => {
  try {
    const env = getEnvVar('NODE_ENV') || Constants.expoConfig?.extra?.environment || 'production';
    
    switch (env) {
      case 'development':
        return DEV_CONFIG;
      case 'staging':
        return STAGING_CONFIG;
      case 'production':
      default:
        return PROD_CONFIG;
    }
  } catch (error) {
    console.warn('Error determining environment config, defaulting to production:', error);
    return PROD_CONFIG;
  }
};

export const ENV_CONFIG: EnvironmentConfig = getEnvironmentConfig();

export const isDev = () => ENV_CONFIG.ENVIRONMENT === 'development';
export const isStaging = () => ENV_CONFIG.ENVIRONMENT === 'staging';
export const isProd = () => ENV_CONFIG.ENVIRONMENT === 'production';

// Export individual config values for easy access
export const API_BASE_URL = ENV_CONFIG.API_BASE_URL;
export const API_TIMEOUT = ENV_CONFIG.TIMEOUT;
export const DEBUG_MODE = ENV_CONFIG.DEBUG;
export const GOOGLE_MAPS_API_KEY = ENV_CONFIG.GOOGLE_MAPS_API_KEY;
export const RAZORPAY_KEY_ID = ENV_CONFIG.RAZORPAY_KEY_ID;
export const FIREBASE_CONFIG = ENV_CONFIG.FIREBASE_CONFIG;
export const TWILIO_CONFIG = ENV_CONFIG.TWILIO_CONFIG;
export const CLOUDINARY_CONFIG = ENV_CONFIG.CLOUDINARY_CONFIG;

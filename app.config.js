import 'dotenv/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

export default {
  expo: {
    name: IS_DEV ? 'DashSteam (Dev)' : IS_STAGING ? 'DashSteam (Staging)' : 'DashSteam',
    slug: 'dashsteam-app',
    version: '0.1.6',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    plugins: ['expo-video', 'expo-build-properties', 'expo-secure-store', 'expo-web-browser'],
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],

    // 👇 ADD THESE LINES HERE 👇
    updates: {
      url: 'https://u.expo.dev/f1a076b7-0687-4639-8076-5f62f9c5a0bd',
    },
    runtimeVersion: '0.1.9',
    // 👆 END ADDITION 👆

    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV
        ? 'com.dashsteam.app.dev'
        : IS_STAGING
          ? 'com.dashsteam.app.staging'
          : 'com.dashsteam.app',
      buildNumber: '1.0.0',
      config: {
        googleMapsApiKey:
          process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
      },
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSLocationWhenInUseUsageDescription:
          'DashStream needs location access to find nearby service providers and provide accurate service delivery.',
        // ... your other permissions
      },
    },

    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: IS_DEV
        ? 'com.dashsteam.app.dev'
        : IS_STAGING
          ? 'com.dashsteam.app.staging'
          : 'com.dashsteam.app',
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'your API key',
        },
      },
    },

    extra: {
      eas: { projectId: 'f1a076b7-0687-4639-8076-5f62f9c5a0bd' },
      apiUrl: IS_DEV
        ? 'http://localhost:5000/api'
        : IS_STAGING
          ? 'https://dashstream-staging.vercel.app/api'
          : 'https://dash-stream-apk-backend.vercel.app/api',
      googleMapsApiKey:
        process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_live_REERfmRqrw93oG',
      environment: IS_DEV ? 'development' : IS_STAGING ? 'staging' : 'production',
    },

    owner: 'satyam1703',
  },
};

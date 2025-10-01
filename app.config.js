import 'dotenv/config';

const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_STAGING = process.env.APP_VARIANT === 'staging';

export default {
  expo: {
    name: IS_DEV ? 'DashStream (Dev)' : IS_STAGING ? 'DashStream (Staging)' : 'DashStream',
    slug: 'dashstream-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: IS_DEV
        ? 'com.dashstream.app.dev'
        : IS_STAGING
          ? 'com.dashstream.app.staging'
          : 'com.dashstream.app',
      buildNumber: '1.0.0',
      config: {
        googleMapsApiKey:
          process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          'DashStream needs location access to find nearby service providers and provide accurate service delivery.',
        NSLocationAlwaysAndWhenInUseUsageDescription:
          'DashStream needs location access to find nearby service providers and provide accurate service delivery.',
        NSCameraUsageDescription:
          'DashStream needs camera access to take photos for service documentation and profile pictures.',
        NSPhotoLibraryUsageDescription:
          'DashStream needs photo library access to select images for service documentation and profile pictures.',
        NSMicrophoneUsageDescription:
          'DashStream needs microphone access for voice notes and support calls.',
        NSContactsUsageDescription:
          'DashStream needs contacts access to help you refer friends and family.',
        NSCalendarsUsageDescription:
          'DashStream needs calendar access to schedule service appointments.',
        NSRemindersUsageDescription:
          'DashStream needs reminders access to set up service reminders.',
        NSFaceIDUsageDescription: 'DashStream uses Face ID for secure authentication.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFFFFF',
      },
      package: IS_DEV
        ? 'com.dashstream.app.dev'
        : IS_STAGING
          ? 'com.dashstream.app.staging'
          : 'com.dashstream.app',
      versionCode: 1,
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyDnvD-g_1JwFU6d4AExl70f_h9FICdeons',
        },
      },
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'RECORD_AUDIO',
        'READ_CONTACTS',
        'READ_CALENDAR',
        'WRITE_CALENDAR',
        'VIBRATE',
        'USE_FINGERPRINT',
        'USE_BIOMETRIC',
      ],
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-location',
      'expo-image-picker',
      'expo-secure-store',
      'expo-web-browser',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0',
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#ffffff',
          defaultChannel: 'default',
        },
      ],
    ],
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
    scheme: 'dashstream',
    owner: 'satyam1703',
  },
};

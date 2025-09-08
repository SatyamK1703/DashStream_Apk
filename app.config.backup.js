import 'dotenv/config';

export default {
  expo: {
    name: 'DashStream',
    slug: 'dashstream',
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
      bundleIdentifier: 'com.dashstream.app',
      buildNumber: '1.0.0',
      infoPlist: {
        NSLocationWhenInUseUsageDescription: 'This app needs access to location to find nearby service professionals.',
        NSLocationAlwaysAndWhenInUseUsageDescription: 'This app needs access to location to track service professionals and provide real-time updates.',
        NSCameraUsageDescription: 'This app needs access to camera to take photos for service requests.',
        NSPhotoLibraryUsageDescription: 'This app needs access to photo library to select images for service requests.',
        NSMicrophoneUsageDescription: 'This app needs access to microphone for voice notes in service requests.',
        NSContactsUsageDescription: 'This app needs access to contacts to invite friends and family.',
        NSFaceIDUsageDescription: 'This app uses Face ID for secure authentication.',
        NSUserNotificationsUsageDescription: 'This app sends notifications for booking updates and service reminders.',
      },
      associatedDomains: ['applinks:dashstream.com'],
      entitlements: {
        'com.apple.developer.associated-domains': ['applinks:dashstream.com'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.dashstream.app',
      versionCode: 1,
      softwareKeyboardLayoutMode: 'resize',
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE',
        'android.permission.ACCESS_WIFI_STATE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_CONTACTS',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.FOREGROUND_SERVICE',
        'android.permission.FOREGROUND_SERVICE_LOCATION',
        'com.google.android.c2dm.permission.RECEIVE',
      ],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'https',
              host: 'dashstream.com',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission: 'Allow DashStream to use your location to find nearby service professionals and provide real-time updates.',
          locationAlwaysPermission: 'Allow DashStream to use your location in the background to track service professionals.',
          locationWhenInUsePermission: 'Allow DashStream to use your location to find nearby service professionals.',
          isIosBackgroundLocationEnabled: true,
          isAndroidBackgroundLocationEnabled: true,
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#2563eb',
          defaultChannel: 'default',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'The app accesses your photos to let you share them with service professionals.',
          cameraPermission: 'The app accesses your camera to let you take photos for service requests.',
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: 'Allow DashStream to access your camera to take photos for service requests.',
          microphonePermission: 'Allow DashStream to access your microphone for voice notes.',
        },
      ],
      [
        'expo-contacts',
        {
          contactsPermission: 'Allow DashStream to access your contacts to invite friends and family.',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission: 'Allow DashStream to access your microphone for voice notes and calls.',
        },
      ],
      [
        'expo-device',
        {
          deviceIdPermission: 'Allow DashStream to access your device ID for secure authentication.',
        },
      ],
      [
        'expo-battery',
        {
          batteryPermission: 'Allow DashStream to access battery information for location tracking optimization.',
        },
      ],
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || 'your-expo-project-id',
      },
      apiUrl: process.env.API_URL || 'https://dash-stream-apk-backend.vercel.app/api',
      environment: process.env.NODE_ENV || 'production',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      twilioConfig: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
      cloudinaryConfig: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
      // Production optimization flags
      enablePerformanceMonitoring: true,
      enableCrashReporting: true,
      enableAnalytics: true,
      cacheImages: true,
      cacheTimeout: 86400000, // 24 hours in milliseconds
    },
    owner: process.env.EXPO_USERNAME || 'your-expo-username',
    updates: {
      url: `https://u.expo.dev/${process.env.EXPO_PROJECT_ID || 'your-expo-project-id'}`,
      fallbackToCacheTimeout: 0,
      checkAutomatically: 'ON_LOAD',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
    hooks: {
      postPublish: [
        {
          file: 'sentry-expo/upload-sourcemaps',
          config: {
            organization: process.env.SENTRY_ORG || 'your-sentry-org',
            project: 'dashstream',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          },
        },
      ],
    },
    // Production optimization settings
    jsEngine: 'hermes',
  },
};
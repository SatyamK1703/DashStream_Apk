export default ({ config }) => ({
  ...config,
  name: 'DashSteam',
  slug: 'dashsteam',
  owner: 'satyam1703',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    jsEngine: 'hermes',
    bundleIdentifier: 'com.satyam1703.dashsteam',
    buildNumber: '1',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'This app needs access to your location to show nearby services and provide accurate delivery.',
      NSCameraUsageDescription: 'This app needs access to your camera to take photos for service verification.',
      NSMicrophoneUsageDescription: 'This app needs access to your microphone for video calls with service providers.',
      NSPhotoLibraryUsageDescription: 'This app needs access to your photo library to upload service photos.'
    }
  },
  android: {
    package: 'com.satyam1703.dashstream',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    jsEngine: 'hermes',
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'CAMERA',
      'RECORD_AUDIO',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'INTERNET',
      'ACCESS_NETWORK_STATE',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED'
    ]
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro'
  },
  experiments: {
    tsconfigPaths: true
  },
  jsEngine: 'hermes',
  plugins: [
    'expo-router',
    'expo-dev-client',
    [
      'expo-notifications',
      {
        icon: './assets/icon.png',
        color: '#ffffff',
        defaultChannel: 'default'
      }
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Allow $(PRODUCT_NAME) to use your location.'
      }
    ]
  ],
  extra: {
    eas: {
      projectId: '78e1fdc0-fd9a-4669-b102-abd0ee095813'
    },
    environment: 'development',
    apiUrl: 'https://dash-stream-apk-backend.vercel.app/api',
    apiTimeout: 30000,
    debugMode: false
  }
});

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
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.dashstream.app',
      versionCode: 1,
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
    },
    plugins: [
      // Essential plugins only
      'expo-location',
    ],
    extra: {
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || 'your-expo-project-id',
      },
      apiUrl: process.env.API_URL || 'https://dash-stream-apk-backend.vercel.app/api',
      environment: process.env.NODE_ENV || 'development',
    },
    owner: process.env.EXPO_USERNAME || 'your-expo-username',
    jsEngine: 'hermes',
  },
};
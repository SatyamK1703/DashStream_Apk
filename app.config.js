export default {
  expo: {
    name: 'DashStream',
    slug: 'dashstream',
    version: '1.0.0',
    ios: {
      jsEngine: 'hermes', // Use Hermes for iOS
      bundleIdentifier: 'com.dashstream.app',
    },
    android: {
      jsEngine: 'hermes', // Use Hermes for Android
      package: 'com.dashstream.app',
    },
    jsEngine: 'hermes', // Global setting
  },
};

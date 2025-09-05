module.exports = {
  expo: {
    name: 'DashSteam',
    slug: 'DashSteam',
    owner: 'satyamk1078',
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
      bundleIdentifier: 'com.satyamk1078.dashsteam'
    },
    android: {
      package: 'com.satyamk1078.dashsteam',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      }
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      eas: {
        projectId: 'af6129b4-010e-4b50-b3b4-f011c253a1bc'
      }
    }
  }
};

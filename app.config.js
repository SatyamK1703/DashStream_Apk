export default ({ config }) => ({
  ...config,
  name: 'DashSteam',
  slug: 'dashsteam',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  extra: {
    eas: {
      projectId: "f9fcaac4-a064-4b57-98c3-a429f15eedc1"
    }
  },
  android: {
    package: 'com.satyamk1078.dashstream',
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF'
    }
  }
});

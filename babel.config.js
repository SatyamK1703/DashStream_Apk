module.exports = function(api) {
  api.cache(true);
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript'
    ],
    plugins: [
      // Essential plugins that should always be present
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blacklist: null,
        whitelist: null,
        safe: false,
        allowUndefined: true,
      }],
      // Enable module resolver for cleaner imports
      ['module-resolver', {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '~': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@utils': './src/utils',
          '@services': './src/services',
          '@contexts': './src/contexts',
          '@assets': './src/assets',
        },
      }],
      'react-native-reanimated/plugin',
      // Conditional plugins based on environment
      ...(isProduction ? [
        ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
      ] : []),
    ].filter(Boolean)
  };
};

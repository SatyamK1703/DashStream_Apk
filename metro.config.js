const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Hermes-specific fixes
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;

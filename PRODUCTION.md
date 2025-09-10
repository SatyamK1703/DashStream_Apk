# DashStream Production Deployment Guide

## Optimization Steps Implemented

The following optimizations have been implemented to prepare the application for production deployment:

### 1. Environment Configuration

- Updated `app.config.js` with production-specific settings:
  - Added performance monitoring flags
  - Configured caching for images
  - Set up proper environment variable handling
  - Enabled Hermes JavaScript engine for better performance
  - Configured Android build optimizations (ProGuard, resource shrinking)

### 2. Babel Configuration

- Enhanced `babel.config.js` for production builds:
  - Added console removal in production builds
  - Configured module resolver for cleaner imports
  - Set up path aliases for better code organization

### 3. Metro Configuration

- Optimized `metro.config.js` for faster builds:
  - Added path aliases matching babel configuration
  - Configured minifier settings for smaller bundle size
  - Limited worker count in production for better stability
  - Added cache versioning

### 4. Build Scripts

- Added production optimization scripts:
  - Created `scripts/optimize-for-production.js` for automated optimization
  - Added npm scripts: `build:prod` and `optimize`

## How to Build for Production

### Option 1: Using the Optimization Script

Run the following command to optimize and prepare for production:

```bash
npm run optimize
```

This script will:
- Clean build caches
- Set production environment variables
- Run the production export process

### Option 2: Manual Build Process

1. Clean the project:
   ```bash
   npm run clean
   ```

2. Build for specific platforms:
   ```bash
   # For Android
   npm run build:android
   
   # For iOS
   npm run build:ios
   
   # For all platforms
   npm run build:all
   ```

3. Submit to app stores:
   ```bash
   # For Android
   npm run submit:android
   
   # For iOS
   npm run submit:ios
   ```

## Environment Variables

Ensure the following environment variables are set for production:

- `NODE_ENV=production`
- `EXPO_PROJECT_ID` - Your Expo project ID
- `EXPO_USERNAME` - Your Expo username
- `API_URL` - Backend API URL
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `FIREBASE_*` - Firebase configuration variables
- `SENTRY_*` - Sentry configuration variables

## Performance Monitoring

The application is configured with the following performance monitoring features:

- Performance monitoring enabled
- Crash reporting enabled
- Analytics tracking enabled
- Image caching with 24-hour timeout

## Troubleshooting

If you encounter issues during the production build:

1. Verify all environment variables are correctly set
2. Check that all dependencies are installed: `npm install`
3. Clear the cache and node_modules: `npm run install:clean`
4. Ensure you have the latest EAS CLI: `npm install -g eas-cli`

## Additional Resources

- [Expo Production Builds Documentation](https://docs.expo.dev/build/setup/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
---
description: Repository Information Overview
alwaysApply: true
---

# DashStream APK Information

## Summary
DashStream is a React Native mobile application built with Expo for service booking and management. The app connects customers with service providers, offering features like location tracking, notifications, and payment processing. It has three user roles: customers, professionals (service providers), and administrators.

## Structure
- **app/**: Contains the main App.tsx and navigation routes
- **src/**: Core application code with components, screens, services, and utilities
- **assets/**: Application images and resources
- **android/**: Android-specific configuration and build files

## Language & Runtime
**Language**: TypeScript/JavaScript
**Version**: TypeScript 5.8.3, React 19.0.0, React Native 0.79.5
**Build System**: Expo EAS Build
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- expo: ^54.0.0 (React Native framework)
- expo-router: ~5.1.6 (Navigation)
- react-navigation: ^7.x.x (Navigation components)
- axios: ^1.11.0 (API requests)
- nativewind: latest (Tailwind CSS for React Native)
- expo-location: ~18.1.6 (Location services)
- expo-notifications: ^0.31.4 (Push notifications)
- react-native-maps: 1.20.1 (Maps integration)

**Development Dependencies**:
- typescript: ~5.8.3
- eslint: ^9.25.1
- prettier: ^3.2.5
- tailwindcss: ^3.4.0
- jest: ^29.7.0 (Testing)

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Build Android APK (development)
npm run build:dev

# Build Android APK (production)
npm run build:android
```

## Environment Configuration
The application uses different environment configurations:
- **Development**: Uses development API endpoints with debugging enabled
- **Preview**: Uses staging API endpoints for testing
- **Production**: Uses production API endpoints with optimizations

## Android Configuration
**Package**: com.satyam1703.dashstream
**Version**: 1.0.0 (versionCode: 1)
**Build Types**:
- Debug: `:app:assembleDebug`
- Release: `:app:assembleRelease`

## Main Files & Resources
**Entry Point**: App.js (with expo-router)
**Navigation**: app/routes/ (RootNavigator, CustomerNavigator, AdminNavigator, ProNavigator)
**API Services**: src/services/ (apiService, authService, bookingService, etc.)
**State Management**: src/contexts/ (AuthContext, BookingContext, etc.)

## Features
- User authentication and role-based access
- Location-based service discovery
- Real-time notifications
- Payment processing
- Service booking and management
- Admin dashboard for service oversight
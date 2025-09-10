# DashStream Mobile App

A comprehensive React Native mobile application for the DashStream service platform, built with Expo and TypeScript.

## 🚀 Features

- **Multi-Role Support**: Customer, Professional, and Admin interfaces
- **Authentication**: OTP-based phone authentication with guest mode
- **Service Management**: Browse, search, and book services
- **Real-time Booking**: Complete booking lifecycle management
- **Payment Integration**: Razorpay payment gateway integration
- **Location Services**: Real-time location tracking and nearby professional finding
- **Push Notifications**: Firebase push notifications for updates
- **Image Upload**: Cloudinary integration for service images
- **Offline Support**: Local data caching and offline functionality
- **Dark/Light Theme**: Adaptive theming support
- **Multi-language**: Internationalization support

## 📱 Screenshots

<!-- Add screenshots here -->

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Maps**: React Native Maps
- **Notifications**: Expo Notifications
- **Image Picker**: Expo Image Picker
- **Location**: Expo Location
- **Payment**: Razorpay React Native SDK

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DashStream_Apk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# API Configuration
API_URL=https://dash-stream-apk-backend.vercel.app/api/api
NODE_ENV=development

# Google Maps
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id

# Firebase
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
```

### 4. Start Development Server

```bash
npm start
```

### 5. Run on Device/Simulator

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── home/           # Home screen components
│   ├── service/        # Service-related components
│   └── paymentscreen/  # Payment components
├── contexts/           # React Context providers
│   ├── AuthContext.tsx
│   ├── BookingContext.tsx
│   ├── DataContext.tsx
│   ├── LocationContext.tsx
│   ├── NotificationContext.tsx
│   └── ServiceContext.tsx
├── screens/            # Screen components
│   ├── admin/          # Admin screens
│   ├── customer/       # Customer screens
│   ├── professional/   # Professional screens
│   └── LoginScreen.tsx
├── services/           # API and external services
│   ├── apiService.ts
│   ├── dataService.ts
│   ├── paymentService.ts
│   ├── notificationService.ts
│   └── locationService.ts
├── types/              # TypeScript type definitions
│   ├── auth.ts
│   ├── BookingType.ts
│   ├── PaymentType.ts
│   ├── ServiceType.ts
│   └── UserType.ts
├── utils/              # Utility functions
│   ├── apiResponseFormatter.ts
│   └── notificationUtils.ts
├── config/             # Configuration files
│   ├── constants.ts
│   └── environment.ts
└── assets/             # Static assets
    └── images/
```

## 🔧 Configuration

### App Configuration

The app configuration is managed in `app.config.js`:

```javascript
export default {
  expo: {
    name: 'DashStream',
    slug: 'dashstream',
    version: '1.0.0',
    // ... configuration
  },
};
```

### Environment Configuration

Environment-specific settings are in `src/config/environment.ts`:

```typescript
const DEV_CONFIG = {
  API_BASE_URL: 'https://dash-stream-apk-backend.vercel.app/api/api',
  ENVIRONMENT: 'development',
  TIMEOUT: 10000,
  DEBUG: true,
};
```

## 🎨 Theming

The app uses NativeWind for styling with a custom theme:

```typescript
// tailwind.config.js
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        // ... custom colors
      },
    },
  },
};
```

## 🔐 Authentication

The app supports multiple authentication methods:

### Phone Authentication
```typescript
const { sendOtp, verifyOtp } = useAuth();

// Send OTP
await sendOtp('+1234567890');

// Verify OTP
await verifyOtp('+1234567890', '123456');
```

### Guest Mode
```typescript
const { loginAsGuest } = useAuth();
await loginAsGuest();
```

## 📍 Location Services

Real-time location tracking and nearby professional finding:

```typescript
import locationService from '../services/locationService';

// Get current location
const location = await locationService.getCurrentLocation();

// Find nearby professionals
const professionals = await locationService.findNearbyProfessionals({
  latitude: location.latitude,
  longitude: location.longitude,
  maxDistance: 10000, // 10km
});
```

## 💳 Payment Integration

Razorpay payment integration:

```typescript
import { createPaymentOrder, verifyPayment } from '../services/paymentService';

// Create payment order
const order = await createPaymentOrder(bookingId, amount);

// Verify payment
const result = await verifyPayment(paymentResponse);
```

## 🔔 Push Notifications

Firebase push notifications:

```typescript
import notificationService from '../services/notificationService';

// Initialize notifications
await notificationService.initialize();

// Register device token
await notificationService.registerDeviceToken(token);
```

## 📊 State Management

The app uses React Context for state management:

### Auth Context
```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Booking Context
```typescript
const { bookings, createBooking, updateBooking } = useBooking();
```

### Service Context
```typescript
const { services, categories, searchServices } = useService();
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Component Testing
```bash
npm run test:components
```

## 📱 Building for Production

### Development Build
```bash
eas build --profile development
```

### Preview Build
```bash
eas build --profile preview
```

### Production Build
```bash
eas build --profile production
```

## 🚀 Deployment

### App Store Submission
```bash
eas submit --platform ios --profile production
```

### Google Play Submission
```bash
eas submit --platform android --profile production
```

## 🔧 Development Tools

### Debugging
- React Native Debugger
- Flipper
- Expo Dev Tools

### Code Quality
- ESLint
- Prettier
- TypeScript

### Performance
- React Native Performance
- Flipper Performance Plugin

## 📚 API Integration

The app integrates with the DashStream backend API:

### Base Configuration
```typescript
// src/services/apiService.ts
const apiService = axios.create({
  baseURL: ENV_CONFIG.API_BASE_URL,
  timeout: ENV_CONFIG.TIMEOUT,
});
```

### Authentication Headers
```typescript
apiService.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🎯 Key Features Implementation

### Service Booking Flow
1. Browse services by category
2. Select service and professional
3. Choose date and time
4. Add service details
5. Make payment
6. Track booking status

### Professional Dashboard
1. View assigned jobs
2. Update job status
3. Track earnings
4. Manage availability
5. Update location

### Admin Panel
1. Manage users
2. Monitor bookings
3. Manage services
4. View analytics
5. Handle payments

## 🔒 Security

### Data Protection
- Secure token storage
- API request encryption
- Input validation
- XSS protection

### Privacy
- Location permission handling
- Data minimization
- User consent management

## 📈 Performance Optimization

### Image Optimization
- Lazy loading
- Image compression
- Caching strategies

### Network Optimization
- Request caching
- Offline support
- Background sync

### Memory Management
- Component optimization
- Memory leak prevention
- Efficient state updates

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

### Debug Commands
```bash
# Check Expo status
expo doctor

# Clear cache
expo start --clear

# Check dependencies
npm audit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔄 Updates

### Version 1.0.0
- Initial release
- Core functionality
- Multi-role support
- Payment integration

### Upcoming Features
- Video calling
- In-app chat
- Advanced analytics
- Multi-language support

---

**Happy Coding! 🚀**

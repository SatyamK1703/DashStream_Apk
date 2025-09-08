# DashStream Deployment Guide

This guide covers the complete deployment process for the DashStream application, including both frontend and backend components.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- Vercel CLI (`npm install -g vercel`)
- MongoDB Atlas account
- Cloudinary account
- Razorpay account
- Twilio account
- Firebase project

## 📱 Frontend Deployment (React Native)

### 1. Environment Setup

Create a `.env` file in the frontend root directory:

```env
# API Configuration
API_URL=https://your-backend-url.vercel.app/api
NODE_ENV=production

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

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Sentry (Optional)
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### 2. Expo Configuration

Update `app.config.js` with your project details:

```javascript
export default {
  expo: {
    name: 'DashStream',
    slug: 'dashstream',
    owner: 'your-expo-username', // Replace with your Expo username
    // ... rest of configuration
  },
};
```

### 3. EAS Build Setup

1. **Login to Expo**
   ```bash
   eas login
   ```

2. **Initialize EAS**
   ```bash
   eas build:configure
   ```

3. **Update eas.json** with your project details:
   - Replace `your-expo-project-id` with your actual project ID
   - Update Apple ID and Google Play Console credentials

### 4. Build for Development

```bash
# Build development client
eas build --profile development --platform all

# Build preview version
eas build --profile preview --platform all
```

### 5. Build for Production

```bash
# Build production version
eas build --profile production --platform all
```

### 6. Submit to App Stores

```bash
# Submit to App Store and Google Play
eas submit --profile production --platform all
```

## 🖥️ Backend Deployment (Node.js)

### 1. Environment Setup

Create a `.env` file in the backend root directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dashstream

# Server
PORT=5000
NODE_ENV=production
HOST=0.0.0.0

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Firebase Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=DashStream <noreply@dashstream.com>
```

### 2. Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard
   - Navigate to your project
   - Go to Settings > Environment Variables
   - Add all environment variables from your `.env` file

### 3. Database Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Get connection string

2. **Seed Database**
   ```bash
   # Run seed script
   node src/utils/seedData.js
   ```

### 4. Test Deployment

```bash
# Test API endpoints
node src/utils/testApi.js
```

## 🔧 Third-Party Service Setup

### 1. MongoDB Atlas

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Create database user
4. Whitelist IP addresses
5. Get connection string

### 2. Cloudinary

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get cloud name, API key, and API secret
3. Configure upload presets

### 3. Razorpay

1. Create account at [Razorpay](https://razorpay.com)
2. Get API keys from dashboard
3. Set up webhooks
4. Configure payment methods

### 4. Twilio

1. Create account at [Twilio](https://twilio.com)
2. Get account SID and auth token
3. Purchase phone number
4. Configure SMS templates

### 5. Firebase

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Cloud Messaging
3. Generate service account key
4. Configure push notifications

### 6. Google Maps

1. Create project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps API
3. Create API key
4. Restrict API key to your domains

## 📊 Monitoring and Analytics

### 1. Sentry (Error Tracking)

1. Create account at [Sentry](https://sentry.io)
2. Create new project
3. Get DSN and auth token
4. Configure in app.config.js

### 2. Analytics

- **Firebase Analytics**: Built-in with Firebase
- **Google Analytics**: Configure in Firebase
- **Custom Analytics**: Implement using your preferred service

## 🔒 Security Checklist

### Backend Security

- [ ] Environment variables properly set
- [ ] JWT secrets are strong and unique
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] HTTPS enabled
- [ ] Security headers configured

### Frontend Security

- [ ] API keys properly configured
- [ ] Sensitive data not exposed
- [ ] Secure storage for tokens
- [ ] Certificate pinning (optional)
- [ ] Code obfuscation enabled
- [ ] Root detection (optional)

## 🚀 Deployment Commands

### Frontend

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for development
eas build --profile development

# Build for production
eas build --profile production

# Submit to app stores
eas submit --profile production
```

### Backend

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Deploy to Vercel
vercel --prod

# Seed database
node src/utils/seedData.js

# Test API
node src/utils/testApi.js
```

## 📱 App Store Submission

### iOS App Store

1. **Prepare App Store Connect**
   - Create app in App Store Connect
   - Fill app information
   - Upload screenshots
   - Set pricing

2. **Submit via EAS**
   ```bash
   eas submit --platform ios --profile production
   ```

3. **Review Process**
   - Wait for Apple review
   - Address any issues
   - App goes live

### Google Play Store

1. **Prepare Google Play Console**
   - Create app in Play Console
   - Fill store listing
   - Upload screenshots
   - Set pricing

2. **Submit via EAS**
   ```bash
   eas submit --platform android --profile production
   ```

3. **Review Process**
   - Wait for Google review
   - Address any issues
   - App goes live

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build and submit
        run: eas build --profile production --non-interactive
        env:
          EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

## 🐛 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables
   - Verify dependencies
   - Check build logs

2. **API Connection Issues**
   - Verify CORS settings
   - Check API URL configuration
   - Test endpoints manually

3. **Database Connection Issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Verify database permissions

4. **Push Notification Issues**
   - Check Firebase configuration
   - Verify device tokens
   - Test notification sending

### Debug Commands

```bash
# Check Expo status
expo doctor

# Check EAS status
eas build:list

# Check Vercel status
vercel ls

# Test API endpoints
curl https://your-api-url.vercel.app/api/health
```

## 📞 Support

For deployment issues:

1. Check the logs in respective platforms
2. Review this deployment guide
3. Check GitHub issues
4. Contact support teams

---

**Happy Deploying! 🚀**

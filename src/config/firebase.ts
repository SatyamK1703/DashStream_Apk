import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCEaEMoHyuy9hA-c2MsTkMA9nH4190DZfg",
  authDomain: "dashsteam-9c39b.firebaseapp.com", 
  projectId: "dashsteam-9c39b",
  storageBucket: "dashsteam-9c39b.firebasestorage.app",
  messagingSenderId: "288888418685",
  appId: "1:288888418685:web:ffa578114358d30210dc14",
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
export default app;
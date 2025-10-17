import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEaEMoHyuy9hA-c2MsTkMA9nH4190DZfg",
  authDomain: "dashsteam-9c39b.firebaseapp.com",
  databaseURL: "https://dashsteam-9c39b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dashsteam-9c39b",
  storageBucket: "dashsteam-9c39b.firebasestorage.app",
  messagingSenderId: "288888418685",
  appId: "1:288888418685:web:ffa578114358d30210dc14",
  measurementId: "G-E98JRPEYKW"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export default app;
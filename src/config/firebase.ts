// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJjJUZJrihUVGT_QxZUdTADGZ9ULbpvuI", // Using the project ID from the backend config
  authDomain: "dashsteam-9c39b.firebaseapp.com",
  projectId: "dashsteam-9c39b", // From the backend config
  storageBucket: "dashsteam-9c39b.appspot.com",
  messagingSenderId: "114740557805754154794", // From the client_id in backend config
  appId: "1:114740557805754154794:web:a1b2c3d4e5f6a7b8c9d0e1", // This is a placeholder, you'll need the actual App ID
  databaseURL: "https://dashsteam-9c39b-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);
const database = getDatabase(app);

export { app, auth, firestore, database };
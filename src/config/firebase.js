// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyA1LK57wwKRdwvlH-6x233misn4NzzErL4",
    authDomain: "telemed-app-471a2.firebaseapp.com",
    projectId: "telemed-app-471a2",
    storageBucket: "telemed-app-471a2.firebasestorage.app",
    messagingSenderId: "1090550111364",
    appId: "1:1090550111364:web:ad8e8c87cdfdb4af2e76d1"
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize Auth with Persistence (ให้จำสถานะ Login ได้ใน React Native)
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// 3. Initialize Firestore & Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
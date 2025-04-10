// firebaseSetup.ts
import { initializeApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Directly hardcode config for troubleshooting
const firebaseConfig = {
  apiKey: "AIzaSyAseQdbjnB5cJrJi-mMuUu4mbtpNDHWQ00",
  authDomain: "photo-hunt-9b1da.firebaseapp.com",
  projectId: "photo-hunt-9b1da",
  storageBucket: "photo-hunt-9b1da.firebasestorage.app",
  messagingSenderId: "1038253365648",
  appId: "1:1038253365648:web:6544227fe296587715fb15"
};

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
export const db = getFirestore(app);
export const storage = getStorage(app);

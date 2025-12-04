// firebaseSetup.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getAuth, getReactNativePersistence, Auth } from 'firebase/auth';
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


let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize auth for React Native
// In React Native, we must use initializeAuth instead of getAuth
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
} catch (error: any) {
  // If auth is already initialized, get the existing instance
  if (error?.code === 'auth/already-initialized' || 
      error?.message?.includes('already been initialized') ||
      error?.message?.includes('already initialized')) {
    auth = getAuth(app);
  } else {
    // For other errors, try getAuth as fallback
    try {
      auth = getAuth(app);
    } catch (fallbackError) {
      // If both fail, re-throw the original error
      throw error;
    }
  }
}

// 配置 Firestore 设置
const db = getFirestore(app);
// 启用离线持久化（可选，有助于在网络不稳定时工作）
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code == 'failed-precondition') {
//     console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//   } else if (err.code == 'unimplemented') {
//     console.log('The current browser does not support all of the features required for persistence.');
//   }
// });

const storage = getStorage(app);

export { auth, db, storage };

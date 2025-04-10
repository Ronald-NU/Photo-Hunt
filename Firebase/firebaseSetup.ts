// firebaseSetup.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
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

let auth;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
}

const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

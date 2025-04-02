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
  storageBucket: "photo-hunt-9b1da.appspot.com",
  messagingSenderId: "1038253365648",
  appId: "1:1038253365648:web:6544227fe296587715fb15"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
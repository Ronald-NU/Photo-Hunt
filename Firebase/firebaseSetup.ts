// firebaseSetup.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Directly hardcode config for troubleshooting
const firebaseConfig = {
  apiKey: "AIzaSyAseQdbjnB5cJrJi-mMuUu4mbtpNDHWQ00",
  authDomain: "photo-hunt-9b1da.firebaseapp.com",
  projectId: "photo-hunt-9b1da",
  storageBucket: "photo-hunt-9b1da.firebasestorage.app",
  messagingSenderId: "1038253365648",
  appId: "1:1038253365648:web:6544227fe296587715fb15"
};

// Lazy initialization variables
let _app: ReturnType<typeof getApp> | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;
let _initialized = false;

function ensureInitialized() {
  if (_initialized) return;
  
  if (getApps().length === 0) {
    _app = initializeApp(firebaseConfig);
  } else {
    _app = getApp();
  }

  // Initialize auth for React Native
  try {
    // Check if auth is already initialized
    try {
      _auth = getAuth(_app);
    } catch {
      // If not initialized, initialize it
      // In React Native, persistence is handled automatically
      _auth = initializeAuth(_app);
    }
  } catch (error: any) {
    // If auth is already initialized, get the existing instance
    if (error?.code === 'auth/already-initialized' || 
        error?.message?.includes('already been initialized') ||
        error?.message?.includes('already initialized')) {
      _auth = getAuth(_app);
    } else {
      // For other errors, try getAuth as fallback
      try {
        _auth = getAuth(_app);
      } catch (fallbackError) {
        // If both fail, re-throw the original error
        console.error("Firebase Auth initialization failed:", error);
        throw error;
      }
    }
  }

  // Configure Firestore settings
  _db = getFirestore(_app);
  _storage = getStorage(_app);
  _initialized = true;
}

// Lazy getters that initialize on first access
export const auth: Auth = (() => {
  ensureInitialized();
  return _auth!;
})() as Auth;

export const db: Firestore = (() => {
  ensureInitialized();
  return _db!;
})() as Firestore;

export const storage: FirebaseStorage = (() => {
  ensureInitialized();
  return _storage!;
})() as FirebaseStorage;

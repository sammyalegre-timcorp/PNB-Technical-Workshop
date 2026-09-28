import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import defaultConfig from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  firestoreDatabaseId:
    import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultConfig.firestoreDatabaseId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

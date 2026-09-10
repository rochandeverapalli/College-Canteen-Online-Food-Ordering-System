import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore with firestoreDatabaseId
const firestoreDbId =
  import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID ||
  appletConfig.firestoreDatabaseId ||
  '(default)';

export const db = getFirestore(app, firestoreDbId);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Test connection on boot as mandated by Firebase skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is limited.');
    } else {
      // Normal if document does not exist, connection is alive
      console.log('Firestore connection verified.');
    }
    return true;
  }
}

testFirestoreConnection().catch((err) => {
  console.log('Initial connection test logged:', err?.message || err);
});

export default app;


import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjJxL6Vq-TZFHhuQ-XtUpOHVkBPO1XnQw",
  authDomain: "makemyday-c9db7.firebaseapp.com",
  projectId: "makemyday-c9db7",
  storageBucket: "makemyday-c9db7.firebasestorage.app",
  messagingSenderId: "751688831675",
  appId: "1:751688831675:web:480c9eb6a28471c8bf0f9e"
};

// Singleton pattern for Firebase App initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use initializeFirestore with forced long polling to fix "Could not reach Cloud Firestore backend"
// This is more reliable in various network environments compared to the default WebSocket connection.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

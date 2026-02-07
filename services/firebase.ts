
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCjJxL6Vq-TZFHhuQ-XtUpOHVkBPO1XnQw",
  authDomain: "makemyday-c9db7.firebaseapp.com",
  projectId: "makemyday-c9db7",
  storageBucket: "makemyday-c9db7.firebasestorage.app",
  messagingSenderId: "751688831675",
  appId: "1:751688831675:web:480c9eb6a28471c8bf0f9e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

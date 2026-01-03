import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// NEW (Firebase Config - Updated with project specific keys)
const firebaseConfig = {
  apiKey: "AIzaSyBHCt4AiGPNAOJLV2yHACIxv6fhkHktrAA",
  authDomain: "club18.firebaseapp.com",
  projectId: "club18",
  storageBucket: "club18.firebasestorage.app",
  messagingSenderId: "179096912838",
  appId: "1:179096912838:web:860bbae500d45d5f77e8c7",
  measurementId: "G-HXFP1TF5F3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// REMOVED (Firebase Storage)
// export const storage = getStorage(app);

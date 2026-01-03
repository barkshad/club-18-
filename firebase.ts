import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBHCt4AiGPNAOJLV2yHACIxv6fhkHktrAA",
  authDomain: "club18.firebaseapp.com",
  projectId: "club18",
  storageBucket: "club18.firebasestorage.app",
  messagingSenderId: "179096912838",
  appId: "1:179096912838:web:860bbae500d45d5f77e8c7",
  measurementId: "G-HXFP1TF5F3"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Explicitly link Auth and Firestore to the app instance to avoid registration errors
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize analytics conditionally
if (typeof window !== 'undefined') {
  isSupported().then(supported => {
    if (supported) getAnalytics(app);
  });
}

export { app, auth, db };
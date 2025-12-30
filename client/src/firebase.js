// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

if (!firebaseConfig.apiKey && import.meta.env.PROD) {
  console.error("❌ CRITICAL: Firebase API Key is missing in production! Auth will fail.");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

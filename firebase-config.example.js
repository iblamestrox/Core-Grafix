// firebase-config.example.js
// Copy this file to firebase-config.js and fill your Firebase project config.
// Do NOT commit real credentials to public repos. Use environment variables or secret stores in CI.

window.CG_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// In production you should initialize Firebase in a secure way and set strict Firestore rules.

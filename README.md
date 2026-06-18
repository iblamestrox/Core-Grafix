# Core Grafix — Frontend Scaffold

This repository contains a client-side scaffold for the Core Grafix marketing and intake site.
It is intentionally built with vanilla HTML/CSS/JavaScript to keep the bundle tiny and fast.

What I added
- index.html — landing page, portfolio, chat intake widget, QR payment modal, client dashboard & admin feed (demo)
- css/styles.css — cinematic theme (Inter font, deep blacks, electric cyan accent)
- js/app.js — frontend interactions: chat intake flow, mocked login, 60s UPI QR flow demo, dashboard & simple admin feed demo
- firebase-config.example.js — placeholder config (DO NOT COMMIT REAL KEYS)
- emailjs-config.example.js — placeholder EmailJS config

Branch: feature/core-grafix-site

Local dev
1. Clone your repo and checkout the branch:
   git checkout -b feature/core-grafix-site
2. Open index.html in a browser. For best results serve via a static server:
   npx serve .

Firebase & Firestore (integration notes)
- This scaffold is client-side only and contains placeholders for Firebase config.
- Create a Firebase project, enable Authentication (Email/Password & Google) and Firestore.
- Add your config to a file named `firebase-config.js` with the same shape as `firebase-config.example.js`.

Recommended Firestore rules (starter):

/*
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users on their own documents only
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    // Admin access should be gated by Firebase custom claims or a separate admin collection
  }
}
*/

Security
- DO NOT publish your Firebase API keys without locking Firestore rules.
- EmailJS keys must remain private — use environment variables for server-side calls.

Admin mode (demo)
- This scaffold contains a simple demo admin toggle (enter the code `iamadmin` in the login prompt) to reveal the Global Order Feed. Replace with a proper admin check (Firebase Custom Claims) in production.

Next steps to production
1. Wire up Firebase Auth + Firestore to persist orders and users.
2. Replace the UPI payment demo with a server-side verification webhook or a payment gateway for production.
3. Implement EmailJS server-side notifications or Cloud Functions to avoid exposing keys.
4. Add image optimization, caching, and real portfolio assets.


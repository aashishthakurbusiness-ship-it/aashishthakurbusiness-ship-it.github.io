import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log("Firebase Config", firebaseConfig);
console.log("Project ID", firebaseConfig.projectId);

// Initialize Firebase only if there are no existing initialized apps
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

console.log("Initialized Apps:", getApps());
console.log("Current App Options:", getApp().options);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore
import { getFirestore } from "firebase/firestore";
const db = getFirestore(app);


console.log("Firestore Instance:", db);


// Initialize Analytics if needed (ensure it runs only on the client)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

console.log("Auth App:", auth.app.options.projectId);
console.log("Firestore App:", db.app.options.projectId);
console.log("DB Object:", (db as any).toJSON?.() ?? db);

export { app, auth, db, analytics };

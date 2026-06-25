import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHWVOTCSmTCxJV6A7RK_1akz-wPF9YRXQ",
  authDomain: "multispace-1d70a.firebaseapp.com",
  projectId: "multispace-1d70a",
  storageBucket: "multispace-1d70a.firebasestorage.app",
  messagingSenderId: "1039961932645",
  appId: "1:1039961932645:web:c2da1045bd41ce320fd78c",
  measurementId: "G-DRSY9ZK1WQ",
};

// Lazy/safe init — only initialize fully in the browser.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensure() {
  if (typeof window === "undefined") return;
  if (!_app) _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  if (!_auth) _auth = getAuth(_app);
  if (!_db) _db = getFirestore(_app);
}

export function getFirebaseAuth(): Auth {
  ensure();
  if (!_auth) throw new Error("Firebase auth only available in the browser");
  return _auth;
}

export function getDb(): Firestore {
  ensure();
  if (!_db) throw new Error("Firestore only available in the browser");
  return _db;
}

export const googleProvider = new GoogleAuthProvider();

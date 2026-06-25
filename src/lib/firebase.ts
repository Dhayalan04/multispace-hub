import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHWVOTCSmTCxJV6A7RK_1akz-wPF9YRXQ",
  authDomain: "multispace-1d70a.firebaseapp.com",
  projectId: "multispace-1d70a",
  storageBucket: "multispace-1d70a.firebasestorage.app",
  messagingSenderId: "1039961932645",
  appId: "1:1039961932645:web:c2da1045bd41ce320fd78c",
  measurementId: "G-DRSY9ZK1WQ",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

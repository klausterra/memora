import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { isAdminEmail } from "@memora/shared";

export const firebaseConfig = {
  apiKey: "AIzaSyBr-QoJasxWE15yBPXOHCEvEkb25lNU9Oo",
  authDomain: "hipercube-dev-train.firebaseapp.com",
  projectId: "hipercube-dev-train",
  storageBucket: "hipercube-dev-train.firebasestorage.app",
  messagingSenderId: "488155064180",
  appId: "1:488155064180:web:1f40f7fd3b8ed5c4692e21",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export function isAdminUser(user: User | null): boolean {
  return isAdminEmail(user?.email);
}

export async function loginWithGoogle(): Promise<User> {
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged, type User };

"use client";

import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type NextOrObserver,
  type User
} from "firebase/auth";
import { deleteApp, initializeApp } from "firebase/app";
import { doc, getDoc } from "firebase/firestore";
import { getFirebaseApp, getFirebaseClientConfig, isFirebaseConfigured } from "@/lib/firebase";
import { getFirestoreDb } from "@/lib/firestore";
import type { AppRoleKey, FirebaseUserProfile } from "@/types/firebase";

let persistenceInitialized = false;

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return getAuth(getFirebaseApp());
}

export async function ensureFirebaseAuthPersistence() {
  const auth = getFirebaseAuth();
  if (!auth || persistenceInitialized) {
    return;
  }

  await setPersistence(auth, browserLocalPersistence);
  persistenceInitialized = true;
}

export async function registerCustomer(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Auth is not configured yet. Add env values before enabling live auth.");
  }

  await ensureFirebaseAuthPersistence();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function registerSecondaryEmailPasswordUser(email: string, password: string) {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase Auth is not configured yet. Add env values before enabling live auth.");
  }

  const secondaryApp = initializeApp(getFirebaseClientConfig(), `berry-admin-${Date.now()}`);
  const secondaryAuth = initializeAuth(secondaryApp);

  try {
    const credentials = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await signOut(secondaryAuth);
    return credentials.user.uid;
  } finally {
    await deleteApp(secondaryApp);
  }
}

export async function loginWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Auth is not configured yet. Add env values before enabling live auth.");
  }

  await ensureFirebaseAuthPersistence();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logoutFirebaseUser() {
  const auth = getFirebaseAuth();
  if (!auth) {
    return;
  }

  return signOut(auth);
}

export function onFirebaseAuthChanged(nextOrObserver: NextOrObserver<User>) {
  const auth = getFirebaseAuth();
  if (!auth) {
    return () => undefined;
  }

  return onAuthStateChanged(auth, nextOrObserver);
}

export async function getUserProfileByUid(uid: string) {
  const db = getFirestoreDb();
  if (!db) {
    return null;
  }

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as FirebaseUserProfile;
}

export async function userHasRole(uid: string, allowedRoles: AppRoleKey[]) {
  const profile = await getUserProfileByUid(uid);
  if (!profile) {
    return false;
  }

  return allowedRoles.includes(profile.primaryRole);
}

export async function isAdminUser(uid: string) {
  return userHasRole(uid, ["super-admin", "admin", "staff", "order-staff", "inventory-staff", "marketing-staff"]);
}

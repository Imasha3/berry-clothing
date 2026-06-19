import { FirebaseError, getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";

const requiredFirebaseEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID"
] as const;

const optionalFirebaseEnvKeys = [
  "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
] as const;

const firebaseEnvKeys = [...requiredFirebaseEnvKeys, ...optionalFirebaseEnvKeys] as const;

export type FirebaseEnvKey = (typeof firebaseEnvKeys)[number];

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

function readFirebaseEnv(key: FirebaseEnvKey) {
  return process.env[key]?.trim() ?? "";
}

function isPlaceholderFirebaseValue(value: string) {
  if (!value) {
    return true;
  }

  return (
    value.includes("your_firebase") ||
    value.includes("your-project-id") ||
    value.includes("your_messaging_sender_id") ||
    value.includes("your_measurement_id") ||
    value.includes("your_")
  );
}

export function getFirebaseClientConfig(): FirebaseClientConfig {
  return {
    apiKey: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: readFirebaseEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")
  };
}

export function getMissingFirebaseEnvVars() {
  return requiredFirebaseEnvKeys.filter((key) => isPlaceholderFirebaseValue(readFirebaseEnv(key)));
}

export function isFirebaseConfigured() {
  return getMissingFirebaseEnvVars().length === 0;
}

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new FirebaseError(
      "app/missing-config",
      `Firebase environment variables are missing: ${getMissingFirebaseEnvVars().join(", ")}`
    );
  }

  return getApps().length > 0 ? getApp() : initializeApp(getFirebaseClientConfig());
}

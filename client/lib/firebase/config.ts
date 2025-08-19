import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check for missing environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}`)

if (missingVars.length > 0) {
  console.error("[v0] Missing Firebase environment variables:", missingVars)
  throw new Error(
    `Missing Firebase environment variables: ${missingVars.join(", ")}. Please add them to your .env.local file.`,
  )
}

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey!,
  authDomain: requiredEnvVars.authDomain!,
  projectId: requiredEnvVars.projectId!,
  storageBucket: requiredEnvVars.storageBucket!,
  messagingSenderId: requiredEnvVars.messagingSenderId!,
  appId: requiredEnvVars.appId!,
}

console.log("[v0] Firebase config loaded successfully for project:", firebaseConfig.projectId)

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

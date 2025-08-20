import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)

const firebaseAdminConfig = {
  credential: cert(serviceAccount),
}

// Initialize Firebase Admin
const adminApp = getApps().length === 0 ? initializeApp(firebaseAdminConfig, "admin") : getApps()[0]

// Initialize Firebase Admin services
export const adminDb = getFirestore(adminApp)
export const adminAuth = getAuth(adminApp)

export default adminApp

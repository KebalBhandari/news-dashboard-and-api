import * as admin from "firebase-admin"

// This is the JSON credentials for your service account.
// It's recommended to store this in an environment variable.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY

if (!serviceAccount) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.")
}

const serviceAccountJson = JSON.parse(serviceAccount)

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This is safe to call multiple times.
 */
function initializeAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    })
  }
}

initializeAdmin()

export const adminAuth = admin.auth()
export const getAdminFirestore = () => admin.firestore()
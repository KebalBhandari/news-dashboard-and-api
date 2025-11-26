import type { ApiKey, ApiUsageLog } from "./types"
import { getAdminFirestore } from "./firebase-admin"
import { createHash, randomUUID } from "crypto"
import { FieldValue } from "firebase-admin/firestore"

function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length)
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(array)
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export function generateApiKey(): string {
  const prefix = "nf_live_"
  const randomBytes = generateRandomBytes(32)
  return `${prefix}${randomBytes}`
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex")
}

function getApiKeysCollection() {
  const db = getAdminFirestore()
  return db.collection("apiKeys")
}

export async function createApiKey(
  userId: string,
  userEmail: string,
  name: string,
  description: string,
  options: {
    expiresInDays?: number
    rateLimit?: number
    allowedEndpoints?: string[]
    ipWhitelist?: string[]
  } = {},
): Promise<{ apiKey: ApiKey; rawKey: string }> {
  const rawKey = generateApiKey()
  const keyHash = hashApiKey(rawKey)

  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + (options.expiresInDays || 365))

  const apiKey: ApiKey = {
    id: randomUUID(),
    keyHash,
    userId,
    userEmail,
    name,
    description,
    createdAt: now.toISOString(),
    startDate: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    isActive: true,
    requestCount: 0,
    rateLimit: options.rateLimit || 1000,
    allowedEndpoints: options.allowedEndpoints || ["/api/news", "/api/news/search"],
    ipWhitelist: options.ipWhitelist,
  }

  const db = getAdminFirestore()
  await db.collection("apiKeys").doc(apiKey.id).set(apiKey)

  return { apiKey, rawKey }
}

export async function validateApiKey(rawKey: string): Promise<ApiKey | null> {
  const keyHash = hashApiKey(rawKey)
  const apiKeysRef = getApiKeysCollection()
  const snapshot = await apiKeysRef.where("keyHash", "==", keyHash).limit(1).get()

  if (snapshot.empty) {
    return null
  }

  const apiKey = snapshot.docs[0].data() as ApiKey

  // Check if key is active
  if (!apiKey.isActive) {
    return null
  }

  const now = new Date()
  // Check expiration
  if (new Date(apiKey.expiresAt) < now) {
    return null
  }

  // Check start date
  if (new Date(apiKey.startDate) > now) {
    return null
  }

  return apiKey
}

export async function updateApiKeyUsage(apiKeyId: string): Promise<void> {
  const apiKeyRef = getApiKeysCollection().doc(apiKeyId)
  await apiKeyRef.update({
    requestCount: FieldValue.increment(1),
    lastUsedAt: new Date().toISOString(),
  })
}

export async function logApiUsage(log: Omit<ApiUsageLog, "id">): Promise<void> {
  const db = getAdminFirestore()
  const usageLog: ApiUsageLog = {
    ...log,
    id: randomUUID(),
  }
  await db.collection("usageLogs").doc(usageLog.id).set(usageLog)
}

export async function getApiKeysByUser(userId: string): Promise<ApiKey[]> {
  const snapshot = await getApiKeysCollection().where("userId", "==", userId).get()
  return snapshot.docs.map((doc) => doc.data() as ApiKey)
}

export async function getApiKeyUsageLogs(apiKeyId: string): Promise<ApiUsageLog[]> {
  const db = getAdminFirestore()
  const snapshot = await db.collection("usageLogs").where("apiKeyId", "==", apiKeyId).get()
  return snapshot.docs.map((doc) => doc.data() as ApiUsageLog)
}

export async function revokeApiKey(apiKeyId: string): Promise<boolean> {
  const apiKeyRef = getApiKeysCollection().doc(apiKeyId)
  await apiKeyRef.update({ isActive: false })
  return true
}

export async function deleteApiKey(apiKeyId: string): Promise<boolean> {
  await getApiKeysCollection().doc(apiKeyId).delete()
  return true
}

export function checkRateLimit(apiKey: ApiKey): boolean {
  // This logic can be enhanced (e.g., using a daily reset mechanism)
  return apiKey.requestCount < apiKey.rateLimit
}

"use client"

import { ApiKeyManager } from "@/components/api-key-manager"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

function ApiKeysContent() {
  const { user } = useAuth()
  return (
    // This main container provides full-width with padding
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <ApiKeyManager userId={user?.uid || ""} userEmail={user?.email || ""} />
    </main>
  )
}

export default function ApiKeysPage() {
  return (
    <ProtectedRoute>
      <ApiKeysContent />
    </ProtectedRoute>
  )
}

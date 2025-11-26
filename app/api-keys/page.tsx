"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { ApiKeyManager } from "@/components/api-key-manager"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"

function ApiKeysContent() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container py-8">
        <ApiKeyManager userId={user?.uid || ""} userEmail={user?.email || ""} />
      </main>
    </div>
  )
}

export default function ApiKeysPage() {
  return (
    <ProtectedRoute>
      <ApiKeysContent />
    </ProtectedRoute>
  )
}

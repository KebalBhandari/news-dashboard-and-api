"use client"

import { DashboardNav } from "@/components/dashboard-nav"
import { ApiDocs } from "@/components/api-docs"
import { ProtectedRoute } from "@/components/protected-route"

function DocsContent() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />

      <main className="container py-8">
        <ApiDocs />
      </main>
    </div>
  )
}

export default function DocsPage() {
  return (
    <ProtectedRoute>
      <DocsContent />
    </ProtectedRoute>
  )
}

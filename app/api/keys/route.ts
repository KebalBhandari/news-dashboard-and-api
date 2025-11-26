import { type NextRequest, NextResponse } from "next/server"
import { createApiKey, getApiKeysByUser, revokeApiKey, deleteApiKey } from "@/lib/api-key-manager"

// Create a new API key
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userEmail, name, description, expiresInDays, rateLimit, allowedEndpoints } = body

    if (!userId || !userEmail || !name) {
      return NextResponse.json({ error: "Missing required fields: userId, userEmail, name" }, { status: 400 })
    }

    const { apiKey, rawKey } = await createApiKey(userId, userEmail, name, description || "", {
      expiresInDays,
      rateLimit,
      allowedEndpoints,
    })

    return NextResponse.json({
      success: true,
      data: {
        // Exclude sensitive keyHash from the response
        apiKey: { ...apiKey, keyHash: undefined },
        rawKey, // Only returned once at creation
      },
      message: "API key created successfully. Save the raw key - it will not be shown again.",
    })
  } catch (error) {
    console.error("Error creating API key:", error)
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 })
  }
}

// Get API keys for a user
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  const keys = await getApiKeysByUser(userId)

  return NextResponse.json({
    success: true,
    data: keys.map((k) => ({ ...k, keyHash: undefined })), // Don't expose hashed keys
  })
}

// Revoke or delete an API key
export async function DELETE(request: NextRequest) {
  const keyId = request.nextUrl.searchParams.get("keyId")
  const action = request.nextUrl.searchParams.get("action") || "revoke"

  if (!keyId) {
    return NextResponse.json({ error: "keyId required" }, { status: 400 })
  }

  let success = false
  if (action === "delete") {
    success = await deleteApiKey(keyId)
  } else {
    success = await revokeApiKey(keyId)
  }

  if (success) {
    return NextResponse.json({
      success: true,
      message: `API key ${action === "delete" ? "deleted" : "revoked"} successfully`,
    })
  }

  return NextResponse.json({ error: "API key not found" }, { status: 404 })
}

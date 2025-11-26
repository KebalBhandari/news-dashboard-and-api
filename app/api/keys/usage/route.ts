import { type NextRequest, NextResponse } from "next/server"
import { getApiKeyUsageLogs } from "@/lib/api-key-manager"

export async function GET(request: NextRequest) {
  const apiKeyId = request.nextUrl.searchParams.get("apiKeyId")

  if (!apiKeyId) {
    return NextResponse.json({ error: "apiKeyId required" }, { status: 400 })
  }

  const logs = getApiKeyUsageLogs(apiKeyId)

  return NextResponse.json({
    success: true,
    data: logs,
    meta: {
      totalRequests: logs.length,
    },
  })
}

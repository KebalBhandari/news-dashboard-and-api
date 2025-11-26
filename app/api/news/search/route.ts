import { type NextRequest, NextResponse } from "next/server"
import { scrapeNews } from "@/lib/news-scraper"
import { validateApiKey, updateApiKeyUsage, logApiUsage, checkRateLimit } from "@/lib/api-key-manager"
import type { NewsFilter } from "@/lib/types"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("api_key")
  const isInternalRequest = request.headers.get("x-internal-request") === "true"

  let validatedKey = null

  if (!isInternalRequest) {
    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 })
    }

    validatedKey = validateApiKey(apiKey)

    if (!validatedKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 })
    }

    if (!checkRateLimit(validatedKey)) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query) {
    return NextResponse.json(
      { error: "Search query required", message: "Please provide a search query via the q parameter" },
      { status: 400 },
    )
  }

  const filter: NewsFilter = {
    search: query,
    country: searchParams.get("country") || undefined,
    category: (searchParams.get("category") as NewsFilter["category"]) || undefined,
    language: searchParams.get("language") || "en",
    fromDate: searchParams.get("from") || undefined,
    toDate: searchParams.get("to") || undefined,
  }

  try {
    const articles = await scrapeNews(filter)
    const responseTime = Date.now() - startTime

    if (validatedKey) {
      updateApiKeyUsage(validatedKey.id)
      logApiUsage({
        apiKeyId: validatedKey.id,
        endpoint: "/api/news/search",
        method: "GET",
        statusCode: 200,
        responseTime,
        timestamp: new Date().toISOString(),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        queryParams: Object.fromEntries(searchParams.entries()),
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        articles,
        totalResults: articles.length,
        query,
        filter,
      },
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error searching news:", error)
    return NextResponse.json({ error: "Failed to search news" }, { status: 500 })
  }
}

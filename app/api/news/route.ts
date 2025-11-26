import { type NextRequest, NextResponse } from "next/server"
import { scrapeNews } from "@/lib/news-scraper"
import { validateApiKey, updateApiKeyUsage, logApiUsage, checkRateLimit } from "@/lib/api-key-manager"
import type { NewsFilter } from "@/lib/types"

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  console.log("[v0] API route /api/news called")

  try {
    // Get API key from header
    const apiKey = request.headers.get("x-api-key") || request.nextUrl.searchParams.get("api_key")

    // For internal dashboard requests without API key
    const isInternalRequest = request.headers.get("x-internal-request") === "true"

    console.log("[v0] isInternalRequest:", isInternalRequest)
    console.log("[v0] apiKey provided:", !!apiKey)

    let validatedKey = null

    if (!isInternalRequest) {
      if (!apiKey) {
        console.log("[v0] No API key and not internal request - returning 401")
        return NextResponse.json(
          {
            error: "API key required",
            message: "Please provide an API key via x-api-key header or api_key query parameter",
          },
          { status: 401 },
        )
      }

      validatedKey = validateApiKey(apiKey)

      if (!validatedKey) {
        console.log("[v0] Invalid API key - returning 403")
        return NextResponse.json(
          {
            error: "Invalid API key",
            message: "The provided API key is invalid, expired, or has been revoked",
          },
          { status: 403 },
        )
      }

      // Check rate limit
      if (!checkRateLimit(validatedKey)) {
        console.log("[v0] Rate limit exceeded - returning 429")
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            message: "You have exceeded your daily API request limit",
          },
          { status: 429 },
        )
      }
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const filter: NewsFilter = {
      country: searchParams.get("country") || undefined,
      category: (searchParams.get("category") as NewsFilter["category"]) || undefined,
      language: searchParams.get("language") || "en",
      search: searchParams.get("q") || searchParams.get("search") || undefined,
      fromDate: searchParams.get("from") || undefined,
      toDate: searchParams.get("to") || undefined,
      source: searchParams.get("source") || undefined,
    }

    console.log("[v0] Fetching news with filter:", filter)

    let articles
    try {
      articles = await scrapeNews(filter)
      console.log("[v0] Scraped articles count:", articles.length)
    } catch (scrapeError) {
      console.error("[v0] Scrape error:", scrapeError)
      articles = []
    }

    const responseTime = Date.now() - startTime

    // Log usage for external requests
    if (validatedKey) {
      updateApiKeyUsage(validatedKey.id)
      logApiUsage({
        apiKeyId: validatedKey.id,
        endpoint: "/api/news",
        method: "GET",
        statusCode: 200,
        responseTime,
        timestamp: new Date().toISOString(),
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
        queryParams: Object.fromEntries(searchParams.entries()),
      })
    }

    console.log("[v0] Returning successful response with", articles.length, "articles")

    return NextResponse.json({
      success: true,
      data: {
        articles,
        totalResults: articles.length,
        filter,
      },
      meta: {
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("[v0] Unhandled error in /api/news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news",
        message: error instanceof Error ? error.message : "An error occurred while fetching news articles",
      },
      { status: 500 },
    )
  }
}

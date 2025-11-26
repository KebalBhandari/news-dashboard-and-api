"use client"

import { useState, useEffect, useCallback } from "react"
import type { NewsArticle, NewsFilter } from "@/lib/types"
import { NewsCard } from "@/components/news-card"
import { NewsFilters } from "@/components/news-filters"
import { NewsStats } from "@/components/news-stats"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Newspaper } from "lucide-react"

function DashboardContent() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<NewsFilter>({ language: "en" })

  const fetchNews = useCallback(
    async (filterParams?: NewsFilter) => {
      const activeFilters = filterParams || filters
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        if (activeFilters.country) params.set("country", activeFilters.country)
        if (activeFilters.category) params.set("category", activeFilters.category)
        if (activeFilters.language) params.set("language", activeFilters.language)
        if (activeFilters.search) params.set("q", activeFilters.search)

        const response = await fetch(`/api/news?${params.toString()}`, {
          headers: {
            "x-internal-request": "true",
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("API error response:", errorText)
          setError("Failed to fetch news")
          setArticles([])
          return
        }

        const data = await response.json()

        if (data.success) {
          setArticles(data.data.articles)
        } else {
          setError(data.message || "Failed to fetch news")
          setArticles([])
        }
      } catch (error) {
        console.error("Error fetching news:", error)
        setError("Failed to connect to the server")
        setArticles([])
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  useEffect(() => {
    fetchNews()
  }, [])

  const handleFilterChange = (newFilters: NewsFilter) => {
    setFilters(newFilters)
    fetchNews(newFilters)
  }

  return (
    <main className="container px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Main content wrapper with flex column layout */}
      <div className="flex flex-col min-h-[calc(100vh-10rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">News Dashboard</h1>
            <p className="text-muted-foreground mt-1.5">Real-time news from around the world</p>
          </div>
          <Button onClick={() => fetchNews()} disabled={loading} className="h-11 px-5">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <NewsStats articles={articles} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Content */}
        <div className="flex-grow grid lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <NewsFilters onFilterChange={handleFilterChange} currentFilters={filters} isLoading={loading} />
            </div>
          </aside>

          {/* News Grid */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border border-border/40">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading news...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-muted/30 rounded-2xl border border-border/40">
                <div className="rounded-2xl bg-muted p-4 mb-4">
                  <Newspaper className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Articles Found</h3>
                <p className="text-muted-foreground text-center max-w-md px-4">
                  Try adjusting your filters or search terms to find news articles.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
                {articles.map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - it will be pushed to the bottom by the flex-grow on the content above */}
      <footer className="border-t border-border/40 mt-12 pt-8 bg-muted/30">
        <div className="py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5 justify-center">
              <div className="rounded-lg bg-primary p-1.5">
                <Newspaper className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-sm">NewsFlow</span>
            </div>
            <p className="text-sm text-muted-foreground text-center sm:text-right">
              Global news aggregator with powerful API access
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

export default function HomePage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}

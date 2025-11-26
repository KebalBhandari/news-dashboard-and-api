"use client"

import type { NewsArticle } from "@/lib/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Clock, User, Globe } from "lucide-react"
import Image from "next/image"

interface NewsCardProps {
  article: NewsArticle
}

export function NewsCard({ article }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: "bg-chart-1/20 text-chart-1 border-chart-1/30",
      business: "bg-chart-2/20 text-chart-2 border-chart-2/30",
      science: "bg-chart-3/20 text-chart-3 border-chart-3/30",
      health: "bg-success/20 text-success border-success/30",
      sports: "bg-chart-4/20 text-chart-4 border-chart-4/30",
      entertainment: "bg-chart-5/20 text-chart-5 border-chart-5/30",
      politics: "bg-destructive/20 text-destructive border-destructive/30",
      general: "bg-muted text-muted-foreground border-border",
    }
    return colors[category] || colors.general
  }

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === "positive") return "text-success"
    if (sentiment === "negative") return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
      <div className="relative h-48 overflow-hidden">
        <Image
          src={article.imageUrl || "/placeholder.svg"}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="outline" className={getCategoryColor(article.category)}>
            {article.category}
          </Badge>
          {article.sentiment && (
            <span className={`text-xs font-medium ${getSentimentColor(article.sentiment)}`}>{article.sentiment}</span>
          )}
        </div>
      </div>

      <CardHeader className="space-y-2 pb-2">
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{article.description}</p>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <span>{article.source}</span>
          </div>
          {article.author && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{article.author}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full group/btn"
          onClick={() => window.open(article.url, "_blank")}
        >
          Read Full Article
          <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}
